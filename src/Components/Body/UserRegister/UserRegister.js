import React, {useState} from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import './UserRegister.css';
import Button from '@material-ui/core/Button';
import config from '../../../Config';

const url = `${ config.authUrl }/api/users`;

function Alert(props) {
    return <MuiAlert elevation={ 6 } variant="filled" { ...props } />;
}

const UserRegister = (props) => {
    const [open, setOpen] = React.useState(false);
    const [popUpMsg, setPopUpMsg] = useState({
        isError : false,
        message : ''
    });
    const [inputError, setInputError] = useState({
        name : {error : false, text : ''},
        email : {error : false, text : ''},
        password : {error : false, text : ''},
        passwordConfirmation : {error : false, text : ''},
    });

    const [vendor, setVendor] = useState({
        name : '',
        email : '',
        password : '',
        passwordConfirmation : '',
    });

    const onChange = (e) => {
        const inputName = e.target.name;
        const value =
            inputName === 'zipcode'
                ? e.target.value.replace(/[^0-9.]/g, '')
                : e.target.value;
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

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
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
        let err = false;
        if (validateInput('name', 'Name can\'t be Empty!', 'isEmpty').error)
            err = true;
        if (
            validateInput('email', 'Not Valid Email Address!', 'isValidEmail').error
        )
            err = true;
        if (validateInput('password', 'Password can\'t be Empty!', 'isEmpty').error)
            err = true;
        if (
            validateInput(
                'passwordConfirmation',
                'Password doesn\'t Match!',
                'isPasswordMatch'
            ).error
        )
            err = true;

        if (err) {
            return;
        }

        fetch(url, {
            method : 'POST',
            headers : {
                'Accept' : 'application/json',
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(vendor),
        })
            .then((response) => {
                console.log('Response : ', response);
                if (response.status === 200) {
                    props.history.push({
                        pathname : '/login',
                    });
                } else {
                    setOpen(true);
                    setPopUpMsg({isError : true, message : response.message});
                }
            })
            .catch((error) => {
                setOpen(true);
                setPopUpMsg({isError : true, message : error.message});
            });
    };

    return (
        <div id="user-register">
            <h2>Register Account</h2>
            <p>
                If you already have an account with us, please login at the login page.
            </p>
            <fieldset id="account">
                <legend>User Details</legend>
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
                    onClick={ handleSubmit }
                >
                    Register
                </Button>
            </div>
            <Snackbar open={ open } autoHideDuration={ 6000 } onClose={ handleClose }>
                <Alert severity={ popUpMsg.isError ? 'error' : 'success' } onClose={ handleClose }>
                    { popUpMsg.message }
                </Alert>
            </Snackbar>
        </div>
    );
};

export default UserRegister;
