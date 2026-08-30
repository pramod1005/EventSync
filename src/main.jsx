import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Footer from './Components/Footer.jsx';
import App from './App.jsx';  
import App2 from './App2.jsx';  

const root = ReactDOM.createRoot(document.getElementById('root'));

const id = localStorage.getItem('userId');

root.render(
  <React.StrictMode>
    <App/>
    {id ? <Footer /> : null}
  </React.StrictMode>
);