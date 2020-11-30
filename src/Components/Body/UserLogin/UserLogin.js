import React, {useState} from 'react';
import './UserLogin.css';
import {Link} from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import config from '../../../Config';
import {useDispatch} from 'react-redux';
import Button from '@material-ui/core/Button';

const url = `${ config.authUrl }/api/users/login`;

function Alert(props) {
    return <MuiAlert elevation={ 6 } variant="filled" { ...props } />;
}

const UserLogin = (props) => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [popUpMsg, setPopUpMsg] = useState({
        isError : false,
        message : '',
    });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const getCurrentCart = () => {
        try {
            const currentCart = localStorage.getItem('cart');
            if (currentCart == null) {
                return currentCart;
            }
            return JSON.parse(currentCart);
        } catch (e) {
            return null;
        }
    };

    const updateCurrentCart = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const obtainSessionId = async (user) => {
        const userDetails = user;
        localStorage.setItem('userInfo', JSON.stringify(userDetails));
        const currentCart = getCurrentCart();
        if (currentCart != null && !currentCart.userId) {
            const url = `${ config.cartUrl }/api/cart/${ currentCart.sessionId }/user`;
            const res = await fetch(url, {
                method : 'PATCH',
                headers : {
                    'Content-Type' : 'application/json',
                },
                body : JSON.stringify({userId : userDetails.id})
            });
            const result = await res.json();
            if (result.status === 200) {
                updateCurrentCart(result.data);
            }
        } else if (currentCart === null) {
            const url = `${ config.cartUrl }/api/cart`;
            const res = await fetch(url, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                },
                body : JSON.stringify({userId : userDetails.id})
            });
            const result = await res.json();
            if (result.status === 200) {
                updateCurrentCart(result.data);
            }
        }

        window.location.href = '/';
    };

    const onSubmit = () => {
        fetch(url, {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
            },
            body : JSON.stringify({
                email : email,
                password : password,
            }),
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.status === 500) {
                    setOpen(true);
                    setPopUpMsg({isError : true, message : response.message});
                } else if (response.status === 200) {
                    setOpen(true);
                    setPopUpMsg({isError : false, message : 'Successful!'});
                    localStorage.setItem('user', JSON.stringify(response.data));
                    obtainSessionId(response.data);
                    props.history.push({
                        pathname : '/',
                    });
                }
            })
            .catch((err) => {
                setOpen(true);
                setPopUpMsg({isError : true, message : err.message});
            });
    };

    return (
        <div className="login-page-container">
            <div className="login-card">
                <div
                    className="lcard-text-container page-login"
                    style={ {marginRight : 30} }
                >
                    <div className="well">
                        <h2>
                            <i className="fa"></i> NEW CUSTOMER
                        </h2>
                        <p>
                            By creating an account you will be able to shop faster, be up to
                            date on an order's status, and keep track of the orders you have
                            previously made.
                        </p>
                    </div>
                    <div className="bottom">
                        <Link className="btn" to="/cregister">
                            Continue
                        </Link>
                    </div>
                </div>
                <div className="lcard-text-container page-login">
                    <div className="well">
                        <h2>
                            <i className="fa"></i> RETURNING CUSTOMER
                        </h2>
                        <div className="form-group">
                            <label
                                className="control-label optional"
                                style={ {width : 97, paddingBottom : 4} }
                            >
                                E-Mail Address
                            </label>
                            <div
                                className="form-text-input-login"
                                style={ {marginBottom : 30} }
                            >
                                <input
                                    className="form-control"
                                    name="email"
                                    value={ email }
                                    onChange={ (e) => setEmail(e.target.value) }
                                ></input>
                            </div>
                        </div>
                        <div className="form-group">
                            <label
                                className="control-label optional"
                                style={ {paddingLeft : 16, paddingBottom : 4, textAlign : 'left'} }
                            >
                                Password
                            </label>
                            <div className="form-text-input-login">
                                <input
                                    className="form-control"
                                    type="password"
                                    name="password"
                                    value={ password }
                                    onChange={ (e) => setPassword(e.target.value) }
                                ></input>
                            </div>
                        </div>
                    </div>
                    <div className="bottom">
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
                            onClick={ onSubmit }
                        >
                            Login
                        </Button>
                    </div>
                </div>
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

export default UserLogin;
