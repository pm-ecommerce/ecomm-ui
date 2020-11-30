import React from 'react';
import './App.css';
import Header from './Components/Header/Header';
import Body from './Components/Body/Main';

import {loadStripe} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_9PdsQaZ7UkuW3wMtTrUDCdK5');

function App() {
    return (
        <Elements stripe={ stripePromise }>
            <Body/>
        </Elements>
    );
}

export default App;
