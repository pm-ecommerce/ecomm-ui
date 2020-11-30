import React, {useState} from 'react';
import './VendorRegister.css';
import {CardElement, useStripe, useElements} from '@stripe/react-stripe-js';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import config from '../../../Config';
import Loader from '../../Common/Loading';
import Button from '@material-ui/core/Button';

const amount = config.registrationPaymentAmount;

function Alert(props) {
    return <MuiAlert elevation={ 6 } variant="filled" { ...props } />;
}

const CARD_ELEMENT_OPTIONS = {
    iconStyle : 'solid',
    hidePostalCode : true,
    style : {
        base : {
            iconColor : 'rgb(240, 57, 122)',
            color : 'rgb(240, 57, 122)',
            fontSize : '16px',
            fontFamily : '"Open Sans", sans-serif',
            fontSmoothing : 'antialiased',
            '::placeholder' : {
                color : '#CFD7DF',
            },
        },
        invalid : {
            color : '#e5424d',
            ':focus' : {
                color : '#303238',
            },
        },
    },
};

function CardSection() {
    return <CardElement options={ CARD_ELEMENT_OPTIONS }/>;
}

const VendorRegister = (props) => {
    const [cursor, setCursor] = useState('');
    const [open, setOpen] = useState(false);
    const [popUpMsg, setPopUpMsg] = useState({
        isError : false,
        message : '',
    });

    const stripe = useStripe();
    const elements = useElements();
    const [inputError, setInputError] = useState({
        name : {error : false, text : ''},
        businessName : {error : false, text : ''},
        email : {error : false, text : ''},
        address1 : {error : false, text : ''},
        address2 : {error : false, text : ''},
        city : {error : false, text : ''},
        zipcode : {error : false, text : ''},
        card : {error : false, text : ''},
        password : {error : false, text : ''},
        passwordConfirmation : {error : false, text : ''},
    });

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const [vendor, setVendor] = useState({
        name : '',
        businessName : '',
        email : '',
        address1 : '',
        address2 : '',
        city : '',
        zipcode : '',
        state : '',
        password : '',
        passwordConfirmation : '',
    });

    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        const inputName = e.target.name;
        const value =
            inputName === 'zipcode'
                ? e.target.value.replace(/[^0-9.]/g, '')
                : e.target.value;
        console.log(inputName, value);
        setVendor((prevState) => {
            return {...prevState, [inputName] : value};
        });

        setInputError((prevState) => {
            return {...prevState, [inputName] : {error : false, text : ''}};
        });

        setInputError((prevState) => {
            return {...prevState, card : {error : false, text : ''}};
        });
    };

    const validateInput = (prop, errorText, type) => {
        let error = false;
        if (type === 'isEmpty' && vendor[prop] === '') error = true;
        if (type === 'isValidEmail' && validateEmail(vendor[prop]) === false)
            error = true;
        if (type === 'isPasswordMatch' && vendor[prop] !== vendor['password'])
            error = true;
        if (error)
            setInputError((prevState) => {
                return {...prevState, [prop] : {error : true, text : errorText}};
            });

        return {error : error};
    };

    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSubmit = async (e) => {
        if (!stripe || !elements) return;
        setCursor('progress');
        let err = false;
        if (validateInput('name', 'Name can\'t be Empty!', 'isEmpty').error) {
            err = true;
            console.log(1);
        }

        if (validateInput('businessName', 'Business Name can\'t be Empty!', 'isEmpty').error) {
            err = true;
            console.log(2);
        }

        if (validateInput('email', 'Not Valid Email Address!', 'isValidEmail').error) {
            err = true;
            console.log(3);
        }

        if (validateInput('address1', 'Address can\'t be Empty!', 'isEmpty').error) {
            err = true;
            console.log(4);
        }

        if (validateInput('city', 'City can\'t be Empty!', 'isEmpty').error) {
            err = true;
            console.log(5);
        }

        if (validateInput('zipcode', 'Zip Code can\'t be Empty!', 'isEmpty').error) {
            err = true;
            console.log(6);
        }

        if (validateInput('password', 'Password can\'t be Empty!', 'isEmpty').error) {
            err = true;
            console.log(7);
        }

        if (
            validateInput(
                'passwordConfirmation',
                'Password doesn\'t Match!',
                'isPasswordMatch'
            ).error
        ) {
            err = true;
            console.log(8);
        }

        if (err) {
            console.log(err);
            return;
        }

        setLoading(true);

        const cardElement = elements.getElement(CardElement);
        const {error, token} = await stripe.createToken(cardElement);
        if (error) {
            console.log(error);
            setInputError((prevState) => {
                return {...prevState, card : {error : true, text : error.message}};
            });
            setPopUpMsg({isError : true, message : error.message});
            setOpen(true);
            setLoading(false);
            return;
        }

        let accountId = null;
        let cardId = null;
        fetch(`${ config.authUrl }/api/vendors`, {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
            },
            body : JSON.stringify(vendor),
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error(response.message);
                }

                accountId = response.data.id;
                return fetch(`${ config.cartUrl }/api/card/${ response.data.id }`, {
                    method : 'POST',
                    headers : {
                        'Content-Type' : 'application/json',
                    },
                    body : JSON.stringify({
                        token : token.id,
                        brand : token.card.brand,
                        expMonth : token.card.exp_month,
                        expYear : token.card.exp_year,
                        cardId : token.card.id, // card id
                        last4 : token.card.last4,
                        livemode : false,
                    }),
                });
            })
            .then((response) => response.json())
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error(response.message);
                }
                cardId = response.data.id;
                return fetch(
                    `${ config.cartUrl }/api/card/${ accountId }/${ cardId }/${ amount }`,
                    {
                        method : 'GET',
                        headers : {
                            'Content-Type' : 'application/json',
                        },
                    }
                );
            })
            .then((response) => response.json())
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error(response.message);
                }

                return fetch(
                    `${ config.authUrl }/api/vendors/${ accountId }/send-for-approval?transactionId=${ response.data.id }`,
                    {
                        method : 'PATCH',
                    }
                );
            })
            .then((response) => {
                if (response.status === 200) {
                    setCursor('');
                    props.history.push({
                        pathname : '/payment-success',
                    });
                } else {
                    throw new Error(response.message);
                }
                setLoading(false);
            })
            .catch((error) => {
                setPopUpMsg({isError : true, message : error.message});
                setOpen(true);
                setCursor('');
                setLoading(false);
            });
    };

    //account
    return (
        <div id="vendor-register" style={ {cursor : cursor} }>
            <Loader loading={ loading }/>
            <h2>Register Account</h2>
            <p>
                If you already have an account with us, please login at the login page.
            </p>
            <fieldset id="account">
                <legend>Vendor Details</legend>
                <div className="form-group">
                    <label className="control-label">Name</label>
                    <div className="form-text-input">
                        <input
                            className={ `form-control ${
                                inputError.name.error ? 'error-border' : ''
                            }` }
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={ vendor.name }
                            onChange={ onChange }
                        />
                        <span
                            className="error-span"
                            style={ {display : inputError.name.error ? 'inline' : 'none'} }
                        >
              { inputError.name.text }
            </span>
                    </div>
                </div>
                <div className="form-group">
                    <label className="control-label">Business Name</label>
                    <div className="form-text-input">
                        <input
                            className={ `form-control ${
                                inputError.businessName.error ? 'error-border' : ''
                            }` }
                            type="text"
                            name="businessName"
                            placeholder="Business Name"
                            value={ vendor.businessName }
                            onChange={ onChange }
                        />
                        <span
                            className="error-span"
                            style={ {
                                display : inputError.businessName.error ? 'inline' : 'none',
                            } }
                        >
              { inputError.businessName.text }
            </span>
                    </div>
                </div>
                <div className="form-group">
                    <label className="control-label">Email</label>
                    <div className="form-text-input">
                        <input
                            className={ `form-control ${
                                inputError.email.error ? 'error-border' : ''
                            }` }
                            type="text"
                            name="email"
                            placeholder="Email"
                            value={ vendor.email }
                            onChange={ onChange }
                        />
                        <span
                            className="error-span"
                            style={ {display : inputError.email.error ? 'inline' : 'none'} }
                        >
              { inputError.email.text }
            </span>
                    </div>
                </div>
            </fieldset>
            <fieldset id="account">
                <legend>Vendor Address</legend>
                <div className="form-group">
                    <label className="control-label">Address 1</label>
                    <div className="form-text-input">
                        <input
                            className={ `form-control ${
                                inputError.address1.error ? 'error-border' : ''
                            }` }
                            type="text"
                            name="address1"
                            placeholder="Address 1"
                            value={ vendor.address1 }
                            onChange={ onChange }
                        />
                        <span
                            className="error-span"
                            style={ {display : inputError.address1.error ? 'inline' : 'none'} }
                        >
              { inputError.address1.text }
            </span>
                    </div>
                </div>
                <div className="form-group">
                    <label className="control-label optional">Address 2</label>
                    <div className="form-text-input">
                        <input
                            className="form-control"
                            type="text"
                            name="address2"
                            placeholder="Address2"
                            value={ vendor.address2 }
                            onChange={ onChange }
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="control-label">City</label>
                    <div className="form-text-input">
                        <input
                            className={ `form-control ${
                                inputError.city.error ? 'error-border' : ''
                            }` }
                            type="text"
                            name="city"
                            placeholder="City"
                            value={ vendor.city }
                            onChange={ onChange }
                        />
                        <span
                            className="error-span"
                            style={ {display : inputError.city.error ? 'inline' : 'none'} }
                        >
              { inputError.city.text }
            </span>
                    </div>
                </div>
                <div className="form-group">
                    <label className="control-label">Zip code</label>
                    <div className="form-text-input">
                        <input
                            className={ `form-control ${
                                inputError.zipcode.error ? 'error-border' : ''
                            }` }
                            type="text"
                            name="zipcode"
                            placeholder="Zip code"
                            value={ vendor.zipcode }
                            onChange={ onChange }
                        />
                        <span
                            className="error-span"
                            style={ {display : inputError.zipcode.error ? 'inline' : 'none'} }
                        >
              { inputError.zipcode.text }
            </span>
                    </div>
                </div>
                <div className="form-group">
                    <label className="control-label">State</label>
                    <div className="form-text-input">
                        <select onChange={ onChange } name="state" className="form-control">
                            <option value="AL">Alabama</option>
                            <option value="AK">Alaska</option>
                            <option value="AZ">Arizona</option>
                            <option value="AR">Arkansas</option>
                            <option value="CA">California</option>
                            <option value="CO">Colorado</option>
                            <option value="CT">Connecticut</option>
                            <option value="DE">Delaware</option>
                            <option value="DC">District Of Columbia</option>
                            <option value="FL">Florida</option>
                            <option value="GA">Georgia</option>
                            <option value="HI">Hawaii</option>
                            <option value="ID">Idaho</option>
                            <option value="IL">Illinois</option>
                            <option value="IN">Indiana</option>
                            <option value="IA">Iowa</option>
                            <option value="KS">Kansas</option>
                            <option value="KY">Kentucky</option>
                            <option value="LA">Louisiana</option>
                            <option value="ME">Maine</option>
                            <option value="MD">Maryland</option>
                            <option value="MA">Massachusetts</option>
                            <option value="MI">Michigan</option>
                            <option value="MN">Minnesota</option>
                            <option value="MS">Mississippi</option>
                            <option value="MO">Missouri</option>
                            <option value="MT">Montana</option>
                            <option value="NE">Nebraska</option>
                            <option value="NV">Nevada</option>
                            <option value="NH">New Hampshire</option>
                            <option value="NJ">New Jersey</option>
                            <option value="NM">New Mexico</option>
                            <option value="NY">New York</option>
                            <option value="NC">North Carolina</option>
                            <option value="ND">North Dakota</option>
                            <option value="OH">Ohio</option>
                            <option value="OK">Oklahoma</option>
                            <option value="OR">Oregon</option>
                            <option value="PA">Pennsylvania</option>
                            <option value="RI">Rhode Island</option>
                            <option value="SC">South Carolina</option>
                            <option value="SD">South Dakota</option>
                            <option value="TN">Tennessee</option>
                            <option value="TX">Texas</option>
                            <option value="UT">Utah</option>
                            <option value="VT">Vermont</option>
                            <option value="VA">Virginia</option>
                            <option value="WA">Washington</option>
                            <option value="WV">West Virginia</option>
                            <option value="WI">Wisconsin</option>
                            <option value="WY">Wyoming</option>
                        </select>
                    </div>
                </div>
            </fieldset>
            <fieldset id="account">
                <legend>Payment</legend>
                <div className="form-group">
                    <label
                        className={ `control-label ${
                            inputError.card.error ? 'error-border' : ''
                        }` }
                    >
                        Card Information
                    </label>
                    <div className="stripe-input-container">
                        <CardSection/>
                    </div>
                </div>
            </fieldset>
            <fieldset id="account">
                <legend>Your Password</legend>
                <div className="form-group">
                    <label className="control-label">Password</label>
                    <div className="form-text-input">
                        <input
                            className={ `form-control ${
                                inputError.password.error ? 'error-border' : ''
                            }` }
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={ vendor.password }
                            onChange={ onChange }
                        />
                        <span
                            className="error-span"
                            style={ {display : inputError.password.error ? 'inline' : 'none'} }
                        >
              { inputError.password.text }
            </span>
                    </div>
                </div>
                <div className="form-group">
                    <label className="control-label">Password Confirm</label>
                    <div className="form-text-input">
                        <input
                            className={ `form-control ${
                                inputError.passwordConfirmation.error ? 'error-border' : ''
                            }` }
                            type="password"
                            name="passwordConfirmation"
                            placeholder="Password Confirm"
                            value={ vendor.passwordConfirmation }
                            onChange={ onChange }
                        />
                        <span
                            className="error-span"
                            style={ {
                                display : inputError.passwordConfirmation.error
                                    ? 'inline'
                                    : 'none',
                            } }
                        >
              { inputError.passwordConfirmation.text }
            </span>
                    </div>
                </div>
            </fieldset>
            <div className="col-md-12 text-right">
                <Button
                    variant="outlined"
                    disabled={ !stripe }
                    style={ {
                        backgroundColor : '#ff3c20',
                        color : 'white',
                        border : 'none',
                        fontSize : 14,
                        position : 'relative',
                        bottom : 3,
                        float : 'right',
                    } }
                    onClick={ handleSubmit }
                >
                    Register
                </Button>
            </div>
            <Snackbar open={ open } autoHideDuration={ 6000 } onClose={ handleClose }>
                <Alert
                    severity={ popUpMsg.isError ? 'error' : 'success' }
                    onClose={ handleClose }
                >
                    { popUpMsg.message }
                </Alert>
            </Snackbar>
        </div>
    );
};

export default VendorRegister;
