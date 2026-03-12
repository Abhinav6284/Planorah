import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import axios from 'axios';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import env from './config/env';
import { API_ORIGIN } from './config/api';

const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
axios.defaults.baseURL = API_ORIGIN;

axios.interceptors.request.use((config) => {
  const url = config.url || '';
  if (!url) {
    return config;
  }

  if (/^https?:\/\//i.test(url)) {
    return config;
  }

  const withLeadingSlash = url.startsWith('/') ? url : `/${url}`;
  config.url = (withLeadingSlash === '/api' || withLeadingSlash.startsWith('/api/'))
    ? withLeadingSlash
    : `/api${withLeadingSlash}`;

  return config;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

