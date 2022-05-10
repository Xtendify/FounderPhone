import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import firebase from 'firebase/app';
import '@firebase/messaging';
// import "firebase/analytics";

console.log(process.env, JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG));

firebase.initializeApp(process.env.REACT_APP_FIREBASE_CONFIG);
// firebase.analytics();

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister({});
