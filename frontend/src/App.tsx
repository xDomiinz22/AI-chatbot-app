import React from 'react';
import Chat from './components/Chat';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="w-full max-w-[600px] bg-white rounded-[10px] shadow-md p-8">
      <h1 className="font-bold text-4xl text-[#2a9d8f] mb-6 text-center">
        Mini-AI-Chatbot
      </h1>
      <Chat />
    </div>
  );
};

export default App;
