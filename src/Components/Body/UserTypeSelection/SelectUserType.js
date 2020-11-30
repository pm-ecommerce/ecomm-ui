import React from "react";
import "./SelectUserType.css";
import { Link,useParams } from "react-router-dom";
import { AiOutlineSolution, AiOutlineUserAdd } from "react-icons/ai";

const SelectUserType = () => {
  const { type } = useParams();
  const page = {
    title:
      type === "Register"
        ? `If you already have an account with us, please login at the login page.`
        : "New here? Please register at the register page.",
    link: {
      customer: type === "Register" ? "/register" : "/login",
      vendor: type === "Register" ? "/vendor-register" : "/vendor-login",
    },
  };
  return (
    <div className="usertype-container">
      <div className="utb-container">
        <div className="usertype-header">
          <h1>{page.title}</h1>
        </div>
        <Link
          to={page.link.customer}
          style={{ marginRight: 50 }}
          className="type-box-container"
        >
          <div className="u-box type-box">
            <AiOutlineUserAdd 
              size={20}
              style={{ marginRight: 10, position: "relative", top: 5 }}
            />
            Customer {type === "Register" ? "Register" : "Login"}
          </div>
        </Link>
        <Link to={page.link.vendor} className="type-box-container">
          <div className="v-b ox type-box">
            <AiOutlineSolution
              size={20}
              style={{ marginRight: 10, position: "relative", top: 5 }}
            />
            Vendor {type === "Register" ? "Register" : "Login"}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SelectUserType;
