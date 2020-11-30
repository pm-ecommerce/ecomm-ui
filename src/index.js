import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import rootReducer from './reducers';
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';

const store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={ store }>
        <BrowserRouter>
            <Header/>
            <App/>
            <Footer/>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);
