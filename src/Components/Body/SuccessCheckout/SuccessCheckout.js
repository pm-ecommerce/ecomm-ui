import React from "react";
import "./SuccessCheckout.css";
import Image from "./img/successLogo.svg";
import Button from "@material-ui/core/Button";

const SuccessCheckout = (props) => {
    const onSubmit = () => {
        props.history.push('/dashboard');
    };
    return (
        <div className="success-page-container">
            <div className="success-card">
                <div className="success-logo">
                    <img src={Image} alt="success"/>
                </div>
                <div className="scard-text-container">
                    <h3>Thank you</h3>
                    <p>
                        Your packages are on the way!
                    </p>
                    <p style={{textAlign: 'center', marginTop: 50}}>
                        <Button
                            variant="outlined"
                            style={{
                                backgroundColor: "#ff3c20",
                                color: "white",
                                border: "none",
                                fontSize: 14,
                                position: "relative",
                                bottom: 3,
                            }}
                            onClick={onSubmit}>
                            View your order
                        </Button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuccessCheckout;
