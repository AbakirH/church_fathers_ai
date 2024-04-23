// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB4HDjxltSW-M4fNlbdQyHNCCfHKHbd9tA",
    authDomain: "church-fathers-ai.firebaseapp.com",
    projectId: "church-fathers-ai",
    storageBucket: "church-fathers-ai.appspot.com",
    messagingSenderId: "35381141894",
    appId: "1:35381141894:web:0709288324d59488af0c07",
    measurementId: "G-5ZY26G2CCY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);