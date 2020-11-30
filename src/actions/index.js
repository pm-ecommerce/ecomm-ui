import config from "../Config";

import {useDispatch} from "react-redux";

export const getCategories = () => async (dispatch) => {
    // const response = await fetch("http://localhost:8083/api/categories/");
    // dispatch({ type: "CATEGORIES_RECOVERED", data: response.data });
};

export const saveUserInfo = (userInfo) => {
    return {
        type: "SAVE_USER_INFO",
        data: {userInfo: userInfo, isOnline: true},
    };
};

export const logOut = () => {
    return {
        type: "LOG_OUT",
        data: {isOnline: false},
    };
};

export const isUserOnline = () => {
    return {type: 'IS_USER_ONLINE'}
};

export const getCartInfo = () => {
    return {
        type: "GET_CART_INFO",
    };
};

export const clearCart = () => {
    return {type: 'CLEAR_CART', data: {}}
}

export const updateCartState = (data, dispatch) => {
    if(data && data.sessionId)
        fetch(`${config.cartUrl}/api/cart/${data.sessionId}`)
            .then((res) => res.json())
            .then((res) => {
                const cart = res.data;
                dispatch({type: 'UPDATE_CART_STATE', data: cart});
            })
            .catch((err) => console.log(err));
};
