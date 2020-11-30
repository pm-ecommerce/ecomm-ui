import React, {useState} from 'react';
import './VendorLogin.css';
import {Link} from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

const url = 'http://localhost:8080/pm-accounts/api/vendors/login';

function Alert(props) {
    return <MuiAlert elevation={ 6 } variant="filled" { ...props } />;
}

const VendorLogin = () => {
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

    const onSubmit = () => {
        console.log('Sending Request Please Wait...');
        fetch(url, {
            method : 'POST', // *GET, POST, PUT, DELETE, etc.
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
                console.log(response);
                if (response.status === 500) {
                    setOpen(true);
                    setPopUpMsg({isError : true, message : response.message});
                } else if (response.status === 200) {
                    setOpen(true);
                    setPopUpMsg({isError : false, message : 'Successful!'});
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
                            <i className="fa"></i> NEW VENDOR
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
                            <i className="fa"></i> RETURNING VENDOR
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
                        <div className="btn" onClick={ onSubmit }>
                            Login
                        </div>
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

export default VendorLogin;
