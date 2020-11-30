import React from "react";
import "./SuccessPage.css";
import Image from "./img/successLogo.svg";

const SuccessPage = () => {
  return (
    <div className="success-page-container">
      <div className="success-card">
        <div className="success-logo">
          <img src={Image} alt="success" />
        </div>
        <div className="scard-text-container">
          <h3>Thank you</h3>
          <p>
            We have received your request to partner with us. We will review
            your information and get back to you in 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
