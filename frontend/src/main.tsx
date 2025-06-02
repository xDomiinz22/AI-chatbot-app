import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container missing in index.html');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <div className="flex justify-center min-h-screen min-w-[320px] bg-gray-200 text-white font-sans leading-relaxed">
    <App />
    </div>
  </StrictMode>
);
