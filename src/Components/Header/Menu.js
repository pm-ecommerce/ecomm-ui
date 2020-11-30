import React from 'react';
import './Menu.css';
import { Link } from 'react-router-dom';

const Menu = () => {


    return(
        <div className="main-menu">
            <ul>
                <li>
                    <Link to="/">
                        <div className="menu-button">Home <b className="caret"></b></div>
                    </Link>
                </li>
                <li>
                    <div className="menu-button">Features <b className="caret"></b></div>
                </li>
                <li>
                    <div className="menu-button">Pages <b className="caret"></b></div>
                </li>
                <li>
                    <div className="menu-button">Categories <b className="caret"></b></div>
                </li>
                <li>
                    <div className="menu-button">Accessories</div>
                </li>
                <li>
                    <div className="menu-button">Blog</div>
                </li>
            </ul>
            {/* <div classN ame="menu-button">Home <b className="caret"></b></div>
            <div className="menu-button">Features <b className="caret"></b></div>
            <div className="menu-button">Pages <b className="caret"></b></div>
            <div className="menu-button">Categories <b className="caret"></b></div>
            <div className="menu-button">Accessories <b className="caret"></b></div>
            <div className="menu-button">Blog <b className="caret"></b></div> */}
        </div>
    )
}

export default Menu;