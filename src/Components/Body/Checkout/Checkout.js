import React, {useState, useEffect, Fragment} from 'react';
import './Checkout.css';
import {CardElement, useStripe, useElements} from '@stripe/react-stripe-js';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import {useDispatch} from 'react-redux';
import {updateCartState} from '../../../actions/index';

import config from '../../../Config';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import utils from '../../Common/Utils';
import emptyCartImg from './cart.png';
import Loader from '../../Common/Loading';

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

function Alert(props) {
    return <MuiAlert elevation={ 6 } variant="filled" { ...props } />;
}

const Checkout = (props) => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);

    const [popUpMsg, setPopUpMsg] = useState({
        isError : false,
        message : '',
    });

    const getCurrentUser = () => {
        try {
            return JSON.parse(localStorage.getItem('cart'));
        } catch (e) {
            return {};
        }
    };

    const [inputError, setInputError] = useState({
        name : {error : false, text : ''},
        phone : {error : false, text : ''},
        address1 : {error : false, text : ''},
        city : {error : false, text : ''},
        zipcode : {error : false, text : ''},
    });

    const stripe = useStripe();
    const elements = useElements();
    const [items, setItems] = useState([]);
    const [cards, setCards] = useState([]);
    const [address, setAddress] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [user, setUser] = useState(getCurrentUser());
    const [selectedCards, setSelectedCards] = useState({});
    const [guest, setGuest] = useState({});

    const [newAddress, setNewAddress] = useState({
        name : '',
        phone : '',
        address1 : '',
        city : '',
        zipcode : '',
        state : '',
    });
    const [addNewCard, setAddNewCard] = useState(false);
    const [changeAddress, setChangeAddress] = useState(false);
    const [changeSelectedAddress, setChangeSelectedAddress] = useState();
    const [addNewAddress, setAddNewAddress] = useState(false);

    const [loading, setLoading] = useState(false);

    const onBack = () => {
        setAddNewAddress(false);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const handlePaymentAmount = (e, cardId) => {
        let amount = e.target.value;
        const newAmount = cards.map((card) => {
            if (card.id === cardId) return {...card, amount : amount};
            return card;
        });
        setCards(newAmount);
    };

    const getSubTotal = () => {
        return items
            .map((item) => item.rate * item.quantity)
            .reduce((sum, row) => sum + row, 0);
    };

    const getTax = () => {
        return (getSubTotal() * 7) / 100;
    };

    const getShipping = () => {
        return 0.0;
    };

    const getCartTotal = () => {
        return (getSubTotal() + getTax()).toFixed(2);
    };

    const onChange = (e, card) => {
        const checked = e.target.checked;
        card.isSelected = checked;
        if (checked === true) {
            setSelectedCards({...selectedCards, [card.id] : true});
        } else {
            setSelectedCards({...selectedCards, [card.id] : false});
        }
    };

    const placeOrder = async (e) => {
        if (items.length === 0) {
            setOpen(true);
            setPopUpMsg({
                isError : true,
                message : 'Cart is empty',
            });
            return;
        }
        const payload = {};
        payload.charges = Object.entries(selectedCards).map((selectedCard) => {
            if (selectedCard[1]) {
                return {
                    amount : parseFloat(
                        cards.find((card) => Number(card.id) === Number(selectedCard[0]))
                            .amount
                    ),
                    cardId : selectedCard[0],
                };
            }
        });

        if (
            payload.charges.length === 0 ||
            (+getCartTotal()).toFixed(2) !==
            payload.charges.reduce((acc, cur) => acc + +cur.amount, 0).toFixed(2)
        ) {
            setOpen(true);
            setPopUpMsg({
                isError : true,
                message : 'Sub total doesn\'t match with the payment amount',
            });
            return;
        }

        payload.billingAddressId = changeSelectedAddress;
        payload.shippingAddressId = changeSelectedAddress;
        payload.sessionId = user.sessionId;

        setLoading(true);
        fetch(`${ config.orderUrl }/api/orders`, {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
            },
            body : JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.status === 200) {
                    // obtain a new session;
                    localStorage.removeItem('cart');
                    fetch(`${ config.cartUrl }/api/cart`, {
                        method : 'POST',
                        headers : {'Content-Type' : 'application/json'},
                        body : JSON.stringify({userId : user.userId}),
                    })
                        .then((result) => result.json())
                        .then((result) => {
                            localStorage.setItem('cart', JSON.stringify(result.data));
                            updateCartState(
                                JSON.parse(localStorage.getItem('cart')),
                                dispatch
                            );
                            props.history.push('/checkout-success');
                            setLoading(false);
                        })
                        .catch(err => {
                            setPopUpMsg({isError : true, message : err.message});
                            setLoading(false);
                        });
                } else {
                    setLoading(false);
                }
            })
            .catch((err) => {
                setPopUpMsg({isError : true, message : err.message});
                setLoading(false);
            });
    };

    const addANewCard = () => {
        setAddNewCard(true);
    };

    const onAddNewAddress = () => {
        setAddNewAddress(true);
    };

    const onAddAddressChange = (event) => {
        const {name, value} = event.target;
        newAddress[name] = value;
        setNewAddress(newAddress);

        setInputError((prevState) => {
            return {...prevState, [name] : {error : false, text : ''}};
        });
    };

    const validateInput = (prop, errorText, type) => {
        let error = false;
        console.log(newAddress, newAddress[prop], 'Validate');
        if (type === 'isEmpty' && newAddress[prop] === '') error = true;
        if (error)
            setInputError((prevState) => {
                return {...prevState, [prop] : {error : true, text : errorText}};
            });

        return {error : error};
    };

    const onChangeAddress = (e) => {
        setChangeAddress(true);
    };

    const onChangeAddressSelected = (event) => {
        const {value} = event.target;
        setChangeSelectedAddress(Number(value));
        setAddress(addresses.find((address) => address.id === Number(value)));
    };

    const onSaveAddress = async () => {
        try {
            let err = false;
            if (
                validateInput('name', 'Name can\'t be Empty!', 'isEmpty').error === true
            )
                err = true;
            if (
                validateInput('phone', 'Phone number can\'t be Empty!', 'isEmpty')
                    .error === true
            )
                err = true;
            if (
                validateInput('address1', 'Address can\'t be Empty!', 'isEmpty')
                    .error === true
            )
                err = true;
            if (
                validateInput('city', 'City can\'t be Empty!', 'isEmpty').error === true
            )
                err = true;
            if (
                validateInput('zipcode', 'Zipcode can\'t be Empty!', 'isEmpty').error ===
                true
            )
                err = true;

            if (err === true) return;
            console.log('Adding addressess');
            const res = await fetch(
                `${ config.cartUrl }/api/addresses/${ user.userId }`,
                {
                    method : 'POST',
                    headers : {
                        'Content-Type' : 'application/json',
                    },
                    body : JSON.stringify(newAddress),
                }
            );
            const response = await res.json();
            if (response.status !== 200) {
                throw new Error(response.message);
            }

            addresses.push(response.data);
            setAddresses(addresses);

            setAddNewAddress(false);
            setChangeAddress(false);

            if (!address || !address.id) {
                setAddress(response.data);
            }

            setNewAddress({});
        } catch (e) {
            console.log(e);
        }
    };

    const saveCard = async () => {
        try {
            const cardElement = elements.getElement(CardElement);
            const {error, token} = await stripe.createToken(cardElement);
            if (error) {
                //show some error message here
                throw new Error(error.message);
            }

            const res = await fetch(`${ config.cartUrl }/api/card/${ user.userId }`, {
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
            const response = await res.json();
            if (response.status !== 200) {
                throw new Error(response.message);
            }

            const card = response.data;
            const currentCards = cards;
            currentCards.unshift(card);
            setCards(currentCards);

            setAddNewCard(false);
        } catch (e) {
            setAddNewCard(false);
        }
    };

    const getImage = (cartItem) => {
        if (!cartItem || !cartItem.image) {
            return 'https://place-hold.it/80x80';
        }

        return `${ config.imageUrl }${ cartItem.image.name }`;
    };

    const onGuestInformationChange = (event) => {
        const {name, value} = event.target;
        guest[name] = value;
        setGuest(guest);
    };

    const updateCurrentCart = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const updateCartOwner = async (userDetails) => {
        const url = `${ config.cartUrl }/api/cart/${ user.sessionId }/user`;
        const res = await fetch(url, {
            method : 'PATCH',
            headers : {
                'Content-Type' : 'application/json',
            },
            body : JSON.stringify({userId : userDetails.id}),
        });
        const result = await res.json();
        if (result.status === 200) {
            updateCurrentCart(result.data);
        }

        localStorage.setItem('cart', JSON.stringify(result.data));
        setUser(result.data);
    };

    const saveGuest = async () => {
        try {
            if (!guest.name) {
                throw new Error('Please enter your name');
            }
            if (!guest.email) {
                throw new Error('Please enter your email');
            }
            const res = await fetch(`${ config.authUrl }/api/users/guests`, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                },
                body : JSON.stringify(guest),
            });
            const response = await res.json();
            console.log(response);
            if (response.status !== 200) {
                throw new Error(response.message);
            }

            //change the ownership of the cart to new userId
            await updateCartOwner(response.data);
            response.data.isGuest = 1;
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (e) {
            setPopUpMsg({isError : true, message : e.message});
            setOpen(true);
            console.log(e);
        }
    };

    const fetchCards = () => {
        return fetch(`${ config.cartUrl }/api/card/${ user.userId }`)
            .then((res) => res.json())
            .then((res) => {
                console.log(res);
                const cardList = res.data.map((card) => ({...card, amount : 0}));

                setCards(cardList);
                return cardList;
            })
            .catch((err) => console.log(err));
    };

    const fetchAddresses = () => {
        fetch(`${ config.cartUrl }/api/addresses/${ user.userId }`)
            .then((res) => res.json())
            .then((res) => {
                setAddresses(res.data);
                if (res.data.length > 0) {
                    setAddress(res.data[0]);
                    setChangeSelectedAddress(res.data[0].id);
                    console.log(res.data, 'address');
                } else {
                    // show add address form
                    onAddNewAddress();
                }
            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        if (
            JSON.parse(localStorage.getItem('cart')) !== null &&
            JSON.parse(localStorage.getItem('cart')) !== 'null'
        ) {
            (async () => {
                const {sessionId} = JSON.parse(localStorage.getItem('cart'));

                let cardList = [];
                if (user.userId) {
                    cardList = await fetchCards();
                    fetchAddresses();
                }

                return fetch(`${ config.cartUrl }/api/cart/${ sessionId }`)
                    .then((res) => res.json())
                    .then((res) => {
                        setItems(res.data);

                        if (cardList.length > 0) {
                            const first = cardList[0];
                            first.isSelected = true;
                            const total = res.data.reduce(
                                (sum, row) => sum + row.quantity * row.rate,
                                0
                            );
                            first.amount = (total + total * 0.07).toFixed(2);

                            const selected = {};
                            selected[first.id] = true;

                            setSelectedCards(selected);
                        }
                        return res;
                    })
                    .catch((err) => console.log(err));
            })();
        }
    }, []);

    return !items || items.length === 0 ? (
        <div className="success-page-container">
            <div className="success-card">
                <div className="success-logo">
                    <img src={ emptyCartImg } alt="success"/>
                </div>
                <div className="scard-text-container">
                    <h3>OOPS!</h3>
                    <p>Your cart is empty. Please add something to cart first.</p>
                </div>
            </div>
        </div>
    ) : !user.userId ? (
        <Fragment>
            <div>
                <fieldset id="account" style={ {marginTop : 100} }>
                    <div className="form-group">
                        <label className="control-label">Name</label>
                        <div className="form-text-input">
                            <input
                                className={ `form-control` }
                                type="text"
                                name="name"
                                placeholder="Full name"
                                onChange={ onGuestInformationChange }
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label">Email</label>
                        <div className="form-text-input">
                            <input
                                className={ `form-control` }
                                type="text"
                                name="email"
                                placeholder="Email"
                                onChange={ onGuestInformationChange }
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <Button
                            variant="outlined"
                            style={ {
                                backgroundColor : '#ff3c20',
                                color : 'white',
                                border : 'none',
                                fontSize : 14,
                                position : 'relative',
                                bottom : 3,
                                float : 'right',
                            } }
                            onClick={ saveGuest }
                        >
                            Checkout as a guest
                        </Button>
                    </div>
                </fieldset>
            </div>
            <Snackbar open={ open } autoHideDuration={ 6000 } onClose={ handleClose }>
                <Alert
                    severity={ popUpMsg.isError ? 'error' : 'success' }
                    onClose={ handleClose }
                    style={ {fontSize : 16} }
                >
                    { popUpMsg.message }
                </Alert>
            </Snackbar>
        </Fragment>
    ) : (
        <Fragment>
            <div id="user-register">
                <Loader loading={ loading }/>
                <div className="col-md-9">
                    <h2>Check out</h2>
                    <p>Please check your order information.</p>
                    <fieldset id="address">
                        <legend>Address</legend>
                        { !addNewAddress ? (
                            address !== null ? (
                                !changeAddress ? (
                                    <div className="form-group" style={ {paddingLeft : 15} }>
                                        <div className="form-text-input" style={ {width : '100%'} }>
                                            { address.address1 }, { address.address2 } <br/>
                                            { address.city }, { address.zipcode } <br/>
                                            { address.state }, { address.country }
                                            <br/>
                                            { addresses.length === 0 ? null : (
                                                <Button
                                                    variant="outlined"
                                                    style={ {
                                                        backgroundColor : '#ff3c20',
                                                        color : 'white',
                                                        border : 'none',
                                                        fontSize : 14,
                                                        float : 'left',
                                                        marginTop : 30,
                                                    } }
                                                    onClick={ onChangeAddress }
                                                >
                                                    Change Address
                                                </Button>
                                            ) }
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {
                                            <RadioGroup
                                                name="address"
                                                value={ changeSelectedAddress }
                                                onChange={ onChangeAddressSelected }
                                            >
                                                { addresses.map((addr) => (
                                                    <FormControlLabel
                                                        key={ addr.id }
                                                        value={ addr.id }
                                                        control={ <Radio/> }
                                                        label={
                                                            <div
                                                                className="form-group"
                                                                style={ {paddingLeft : 15, fontSize : 16} }
                                                            >
                                                                <div className="form-text-input">
                                                                    { addr.address1 }, { addr.address2 } <br/>
                                                                    { addr.city }, { addr.zipcode } <br/>
                                                                    { addr.state }, { addr.country }
                                                                    <hr/>
                                                                </div>
                                                            </div>
                                                        }
                                                    />
                                                )) }
                                            </RadioGroup>
                                        }
                                        <Button
                                            variant="outlined"
                                            style={ {
                                                backgroundColor : '#ff3c20',
                                                color : 'white',
                                                border : 'none',
                                                fontSize : 14,
                                                position : 'relative',
                                                bottom : 3,
                                                float : 'left',
                                            } }
                                            onClick={ (e) => setChangeAddress(false) }
                                        >
                                            Done
                                        </Button>
                                    </div>
                                )
                            ) : null
                        ) : (
                            <fieldset id="account">
                                <legend>Address information</legend>
                                <div className="form-group">
                                    <label className="control-label">Name</label>
                                    <div className="form-text-input">
                                        <input
                                            className={ `form-control ${
                                                inputError.name.error ? 'error-border' : ''
                                            }` }
                                            type="text"
                                            name="name"
                                            placeholder="Full name"
                                            value={ newAddress.name }
                                            onChange={ onAddAddressChange }
                                        />
                                        <span
                                            className="error-span"
                                            style={ {
                                                display : inputError.name.error ? 'inline' : 'none',
                                            } }
                                        >
                    { inputError.name.text }
                  </span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="control-label">Phone</label>
                                    <div className="form-text-input">
                                        <input
                                            className={ `form-control ${
                                                inputError.phone.error ? 'error-border' : ''
                                            }` }
                                            type="text"
                                            name="phone"
                                            placeholder="Phone number"
                                            value={ newAddress.phone }
                                            onChange={ onAddAddressChange }
                                        />
                                        <span
                                            className="error-span"
                                            style={ {
                                                display : inputError.phone.error ? 'inline' : 'none',
                                            } }
                                        >
                    { inputError.phone.text }
                  </span>
                                    </div>
                                </div>
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
                                            value={ newAddress.address1 }
                                            onChange={ onAddAddressChange }
                                        />
                                        <span
                                            className="error-span"
                                            style={ {
                                                display : inputError.address1.error ? 'inline' : 'none',
                                            } }
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
                                            value={ newAddress.address2 }
                                            onChange={ onAddAddressChange }
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
                                            value={ newAddress.city }
                                            onChange={ onAddAddressChange }
                                        />
                                        <span
                                            className="error-span"
                                            style={ {
                                                display : inputError.city.error ? 'inline' : 'none',
                                            } }
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
                                            value={ newAddress.zipcode }
                                            onChange={ onAddAddressChange }
                                        />
                                        <span
                                            className="error-span"
                                            style={ {
                                                display : inputError.zipcode.error ? 'inline' : 'none',
                                            } }
                                        >
                    { inputError.zipcode.text }
                  </span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="control-label">State</label>
                                    <div className="form-text-input">
                                        <select
                                            onChange={ onAddAddressChange }
                                            name="state"
                                            className="form-control"
                                        >
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
                                <p className="changeAddress" onClick={ onBack }>
                                    { '< ' } Back
                                </p>
                                <div className="form-group">
                                    <Button
                                        variant="outlined"
                                        style={ {
                                            backgroundColor : '#ff3c20',
                                            color : 'white',
                                            border : 'none',
                                            fontSize : 14,
                                            position : 'relative',
                                            bottom : 3,
                                            float : 'right',
                                        } }
                                        onClick={ onSaveAddress }
                                    >
                                        Save address
                                    </Button>
                                </div>
                            </fieldset>
                        ) }
                        { addNewAddress ? null : (
                            <Button
                                variant="outlined"
                                style={ {
                                    backgroundColor : '#ff3c20',
                                    color : 'white',
                                    border : 'none',
                                    fontSize : 14,
                                    position : 'relative',
                                    bottom : 3,
                                    float : 'right',
                                } }
                                onClick={ onAddNewAddress }
                            >
                                Add a new address
                            </Button>
                        ) }
                    </fieldset>
                    <fieldset id="payment" style={ {marginBottom : 30} }>
                        <legend>Payment methods</legend>
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Card information</th>
                                <th>Use card for payment</th>
                                <th>Payment amount</th>
                            </tr>
                            </thead>
                            <tbody>
                            { cards.map((card) => (
                                <tr key={ card.id }>
                                    <td>
                                        { card.last4 } - expires on { card.expMonth }/{ card.expYear }
                                    </td>
                                    <td>
                                        <div className="form-group">
                                            <label className="control-label optional">
                                                <Checkbox
                                                    onChange={ (e) => onChange(e, card) }
                                                    value={ card.id }
                                                />
                                            </label>
                                        </div>
                                    </td>
                                    <td>
                                        { !card.isSelected ? null : (
                                            <div className="form-text-input">
                                                <input
                                                    className={ `form-control ` }
                                                    type="text"
                                                    name="card"
                                                    placeholder="Enter an amount to charge"
                                                    value={ card.amount }
                                                    onChange={ (e) => handlePaymentAmount(e, card.id) }
                                                />
                                            </div>
                                        ) }
                                    </td>
                                </tr>
                            )) }
                            { !addNewCard ? null : (
                                <tr>
                                    <td colSpan="3">
                                        <div
                                            className="stripe-input-container"
                                            style={ {width : '100%'} }
                                        >
                                            <CardSection/>
                                        </div>
                                    </td>
                                </tr>
                            ) }
                            <tr>
                                <td colSpan="3">
                                    { addNewCard ? (
                                        <Button
                                            variant="outlined"
                                            style={ {
                                                backgroundColor : '#ff3c20',
                                                color : 'white',
                                                border : 'none',
                                                fontSize : 14,
                                                position : 'relative',
                                                bottom : 3,
                                                float : 'right',
                                            } }
                                            onClick={ saveCard }
                                        >
                                            Save card
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            style={ {
                                                backgroundColor : '#ff3c20',
                                                color : 'white',
                                                border : 'none',
                                                fontSize : 14,
                                                position : 'relative',
                                                bottom : 3,
                                                float : 'right',
                                            } }
                                            onClick={ addANewCard }
                                        >
                                            Add a new card
                                        </Button>
                                    ) }
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </fieldset>
                    <fieldset id="payment">
                        <legend>Delivery items</legend>
                        <div className="row">
                            <div className="col-md-12">
                                <table className={ 'table' }>
                                    <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Product Name</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total Price</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    { items.map((item) => (
                                        <tr key={ item.id }>
                                            <td className="text-center">
                                                <img
                                                    src={ getImage(item) }
                                                    className="cart-item-img"
                                                    style={ {width : 80} }
                                                />
                                            </td>
                                            <td className="text-field-left">
                                                <p>{ item.name }</p>
                                                <p>{ utils.getCustomization(item.cartItemAttributes) }</p>
                                            </td>
                                            <td className="text-field-right">{ item.quantity }</td>
                                            <td className="text-field-right">${ item.rate }</td>
                                            <td className="text-field-right">
                                                ${ item.rate * item.quantity }
                                            </td>
                                        </tr>
                                    )) }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </fieldset>
                </div>
                <div className="col-md-3">
                    <table className="table" style={ {marginTop : 120} }>
                        <tbody>
                        <tr>
                            <td colSpan={ 4 } className={ 'text-right' }>
                                Sub total
                            </td>
                            <td className={ 'text-right' }>${ getSubTotal() }</td>
                        </tr>
                        <tr>
                            <td colSpan={ 4 } className={ 'text-right' }>
                                Tax
                            </td>
                            <td className={ 'text-right' }>${ getTax() }</td>
                        </tr>
                        <tr>
                            <td colSpan={ 4 } className={ 'text-right' }>
                                Shipping (free)
                            </td>
                            <td className={ 'text-right' }>${ getShipping() }</td>
                        </tr>
                        <tr>
                            <td colSpan={ 4 } className={ 'text-right' }>
                                Order total
                            </td>
                            <td className={ 'text-right' }>{ getCartTotal() }</td>
                        </tr>
                        </tbody>
                    </table>
                    <div className="form-btn-container">
                        <Button
                            variant="outlined"
                            style={ {
                                backgroundColor : '#ff3c20',
                                color : 'white',
                                border : 'none',
                                fontSize : 14,
                                position : 'relative',
                                bottom : 3,
                                float : 'right',
                            } }
                            onClick={ placeOrder }
                        >
                            Place order
                        </Button>
                    </div>
                </div>
            </div>
            <Snackbar open={ open } autoHideDuration={ 6000 } onClose={ handleClose }>
                <Alert
                    severity={ popUpMsg.isError ? 'error' : 'success' }
                    onClose={ handleClose }
                    style={ {fontSize : 16} }
                >
                    { popUpMsg.message }
                </Alert>
            </Snackbar>
        </Fragment>
    );
};

export default Checkout;
