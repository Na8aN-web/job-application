import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import store from './store/store';
import './index.css';

// Polyfill to silence ResizeObserver loop error
const resizeObserverErr = () => {
  let resizeObserverLoopErr = false;
  const resizeObserverLoopErrHandler = () => {
    resizeObserverLoopErr = true;
  };
  window.addEventListener('error', resizeObserverLoopErrHandler);
  const handleResizeObserverError = (entries, observer) => {
    if (resizeObserverLoopErr) {
      resizeObserverLoopErr = false;
      observer.disconnect();
      return;
    }
  };
  return handleResizeObserverError;
};
resizeObserverErr();

// Render your React App
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
