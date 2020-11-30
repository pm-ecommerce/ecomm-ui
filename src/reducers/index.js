import { combineReducers } from 'redux';
import todo from './todo';
import category from './category';
import userInfo from './userInfo';
import cart from './cart';

export default combineReducers({
    todo,
    category,
    userInfo,
    cart
});