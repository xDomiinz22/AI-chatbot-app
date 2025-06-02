import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import Login from './components/Login';
import Register from './components/Register'
import Cookies from "js-cookie";
import './App.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const email = Cookies.get("email");
    const password = Cookies.get("password");

    // Validar en backend
    if (email && password) {
      setIsAuthenticated(true)
    }
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    Cookies.remove("email");
    Cookies.remove("password");
    setIsAuthenticated(false);
  };

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center">
          <div className="w-full max-w-[600px] bg-white rounded-[10px] shadow-md p-8">
            <h1 className="font-bold text-4xl text-[#2a9d8f] mb-6 text-center">
              Mini-AI-Chatbot
            </h1>
            {showRegister ? (
              <>
                <Register onRegisterSuccess={handleLogin} />
                <p className="mt-4 text-sm text-center text-[#2a9d8f]">
                  Already have an account?{" "}
                  <button className="ml-[2px] text-[#27887d]" onClick={() => setShowRegister(false)}>
                    Login here
                  </button>
                </p>
              </>
            ) : (
              <>
                <Login onLoginSuccess={handleLogin} />
                <p className="mt-4 text-sm text-center text-[#2a9d8f]">
                  Don't have an account?{" "}
                  <button className="ml-[2px] text-[#27887d]" onClick={() => setShowRegister(true)}>
                    Register here
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-screen bg-gray-200">
        {/* Sidebar izquierda */}
        <aside className="fixed top-0 left-0 h-screen w-[20%] bg-white shadow-md z-10 flex flex-col items-center py-4">
          <h1 className="font-bold text-2xl text-[#2a9d8f] mb-6 text-center">Menu</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition mt-auto"
          >
            Logout
          </button>
        </aside>

        {/* Contenido principal */}
        <main className="flex items-center justify-center p-4 w-full">
          <div className="w-[800px] bg-white rounded-[10px] shadow-md p-8">
            <h1 className="font-bold text-4xl text-[#2a9d8f] mb-6 text-center">
              Mini-AI-Chatbot
            </h1>
            <Chat />
          </div>
        </main>
      </div>
    );
  };


  export default App;
