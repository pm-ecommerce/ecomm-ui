import React, {Fragment, useState, useEffect} from "react";
import "./Header.css";
import Logo from "./img/logo.png";
import {Link} from "react-router-dom";
import {withRouter} from "react-router-dom";
import config from "../../Config";
import {useDispatch, useSelector} from "react-redux";
import {updateCartState, saveUserInfo, logOut, clearCart} from "../../actions";

const updateBodyClasses = (props) => {
    if (props.location.pathname !== "/") {
        document.body.classList.remove("common-home");
    } else {
        document.body.classList.add("common-home");
    }
};

const Header = (props) => {
    const {isOnline} = useSelector((state) => state.userInfo);

    const cart = useSelector((state) => state.cart || []);
    const totalRate = cart && cart.length > 0 ? cart.reduce((acc, cur) => acc + cur.rate * cur.quantity, 0) : 0;
    const query = new URLSearchParams(props.location.search);
    const catId = query.get("categoryId") || 0;
    const queryStr = query.get("query") || "";

    const dispatch = useDispatch();

    const [categories, setCategories] = useState([]);
    const [searchWord, setSearchWord] = useState(queryStr);
    const [categoryId, setCategoryId] = useState(catId);

    const userLogOut = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('cart');
        dispatch(logOut());
        dispatch(clearCart());
        props.history.push({
            pathname: "/",
        });
    };

    const onClick = () => {
        props.history.push({
            pathname: "/search",
            state: {
                categoryId: categoryId,
                searchWord: searchWord,
            },
        });
    };

    const fetchCategories = () => {
        fetch(`${config.searchUrl}/api/categories/`)
            .then((res) => res.json())
            .then((res) => {
                const obj = res.data.map((category) => ({
                    name: category.name,
                    id: category.id,
                }));
                setCategories(obj);
            })
            .catch((err) => console.log(err));
    };

    const fetchSessionId = (user = {}) => {
        if (localStorage.getItem("cart") === null) {
            fetch(`${config.cartUrl}/api/cart`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({userId: user.id || 0}),
            })
                .then((res) => res.json())
                .then((res) => {
                    localStorage.setItem("cart", JSON.stringify(res.data));
                })
                .catch((err) => console.log(err));
        } else {
            updateCartState(JSON.parse(localStorage.getItem("cart")), dispatch);
        }
    };

    useEffect(() => {
        fetchCategories();
        updateBodyClasses(props);
        if (localStorage.getItem('user') !== null) {
            const user = JSON.parse(localStorage.getItem('user'));
            dispatch(saveUserInfo(user));
            fetchSessionId(user);
        } else {
            fetchSessionId();
        }
    }, [props]);

    return (
        <header id="header" className=" typeheader-1">
            <div className="header-top container">
                <div style={{float: "right"}}>
                    {isOnline ? (
                        <Fragment>
                            <Link to={{pathname: '/dashboard'}}>Dashboard</Link>&nbsp;|&nbsp;
                            <span style={{cursor: 'pointer'}} onClick={userLogOut}>Logout</span>
                        </Fragment>
                    ) : (
                        <Fragment>
                            <Link to={{pathname: "/login"}}>Login</Link>{" "}
                            <Link to={{pathname: "/register"}}>Register</Link>
                        </Fragment>
                    )}
                </div>
                <Link to={{pathname: "/"}}>
                    <div id="logo" className="left">
                        <img src={Logo} title="PM Ecommerce" alt="PM Ecommerce"/>
                    </div>
                </Link>
            </div>
            <div className="header-bottom hidden-compact">
                <div className="container">
                    <div className="row">
                        <div className="bottom1 menu-vertical col-lg-2 col-md-3 col-sm-3">
                            <div className="responsive so-megamenu megamenu-style-dev ">
                                <div className="so-vertical-menu ">
                                    <nav className="navbar-default">
                                        <div className="container-megamenu vertical">
                                            <div id="menuHeading">
                                                <div className="megamenuToogle-wrapper">
                                                    <div className="megamenuToogle-pattern">
                                                        <div className="container">
                                                            <div>
                                                                <span></span>
                                                                <span></span>
                                                                <span></span>
                                                            </div>
                                                            All Categories
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="navbar-header">
                                                <button
                                                    type="button"
                                                    id="show-verticalmenu"
                                                    className="navbar-toggle"
                                                >
                                                    <i className="fa fa-bars"></i>
                                                    <span>All Categories</span>
                                                </button>
                                            </div>
                                            <div className="vertical-wrapper">
                        <span
                            id="remove-verticalmenu"
                            className="fa fa-times"
                        ></span>
                                                <div className="megamenu-pattern">
                                                    <div className="container-mega">
                                                        <ul className="megamenu">
                                                            {categories.map((category) => (
                                                                <li
                                                                    key={category.id}
                                                                    className="item-vertical hover"
                                                                >
                                                                    <p className="close-menu"></p>
                                                                    <Link
                                                                        to={`/category/${category.id}`}
                                                                        className="clearfix"
                                                                    >
                                                                        <span>{category.name}</span>
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </nav>
                                </div>
                            </div>
                        </div>

                        <div className="bottom2 col-lg-7 col-md-6 col-sm-6">
                            <form action="/search" method="get">
                                <div className="search-header-w">
                                    <div className="icon-search hidden-lg hidden-md hidden-sm">
                                        <i className="fa fa-search"></i>
                                    </div>
                                    <div
                                        id="sosearchpro"
                                        className="sosearchpro-wrapper so-search"
                                    >
                                        <div id="search0" className="search input-group form-group">
                                            <div
                                                className="select_category filter_type  icon-select hidden-sm hidden-xs">
                                                <select
                                                    className="no-border"
                                                    name="categoryId"
                                                    onChange={(e) => setCategoryId(e.target.value)}
                                                >
                                                    <option value="">All categories</option>
                                                    {categories.map((category) => (
                                                        <option
                                                            key={category.id}
                                                            id={category.id}
                                                            value={category.id}
                                                        >
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <input
                                                className="autosearch-input form-control"
                                                type="text"
                                                value={searchWord}
                                                onChange={(e) => setSearchWord(e.target.value)}
                                                name="query"
                                            />
                                            <span className="input-group-btn">
                        <button
                            type="submit"
                            className="button-search btn btn-primary"
                            onClick={onClick}
                        >
                          <i className="fa fa-search"></i>
                        </button>
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="bottom3 col-lg-3 col-md-3 col-sm-3">
                            <div className="shopping_cart">
                                <div id="cart" className="btn-shopping-cart">
                                    <Link
                                        className="btn-group top_cart dropdown-toggle"
                                        to={{pathname: "/cart"}}
                                    >
                                        <div className="shopcart">
                      <span className="icon-c">
                        <i className="fa fa-shopping-bag"></i>
                      </span>
                                            <div className="shopcart-inner">
                                                <p className="text-shopping-cart">My cart</p>
                                                <span className="total-shopping-cart cart-total-full">
                          <span className="items_cart">{cart.length}</span>
                          <span className="items_cart2"> item(s)</span>
                          <span className="items_carts"> - ${totalRate} </span>
                        </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default withRouter(Header);
