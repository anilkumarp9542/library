import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline } from '@mui/material';


ReactDOM.createRoot(document.getElementById('root')).render( //renders the App component
  <>
    <CssBaseline /> {/* apply styles across material ui components*/}
    <App />
  </>
);
