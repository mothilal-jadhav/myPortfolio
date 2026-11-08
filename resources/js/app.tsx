import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
    return(
        <div>
            <h1>Hello!</h1>
            <p>My Laravel application is now using React and TypeScript.</p>
        </div>
    );
}

const container = document.getElementById("app");

if(container){
    createRoot(container).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}