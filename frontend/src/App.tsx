import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import Login from './components/Login';
import Register from './components/Register'
import Cookies from "js-cookie";
import './App.css';
import ResetPassword from './components/ResetPassword';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const currentPath = window.location.pathname;
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get("token");

  useEffect(() => {
    const validateUser = async () => {
      const token = Cookies.get("token");

      if (token) {
        try {
          const res = await fetch("http://localhost:8000/validate-token", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!res.ok) throw new Error("Invalid user");

          await res.json();
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Error validating user:", err);
          setIsAuthenticated(false);
        }
      }
    };

    validateUser();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const email = Cookies.get("email");
      const userId = Cookies.get("userId");

      if (!email || !userId) {
        console.log("Sesión expirada o cerrada desde otra pestaña");
        setIsAuthenticated(false);
      }
    }, 2000); // check cada 2 segundos

    return () => clearInterval(interval); // limpiar el intervalo al desmontar
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = async () => {
    const token = Cookies.get("token");
    if (token) {
      try {
        await fetch("http://localhost:8000/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
    Cookies.remove("email");
    Cookies.remove("name");
    Cookies.remove("token");
    setIsAuthenticated(false);
  };

  if (currentPath === "/password-reset" && token) {
    // Mostrar formulario para resetear contraseña con token
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="w-full max-w-[600px] bg-white rounded-[10px] shadow-md p-8">
          <ResetPassword />
        </div>
      </div>
    );
  }

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
                <button className="ml-[2px] text-[#27887d] hover:underline" onClick={() => setShowRegister(false)}>
                  Login here
                </button>
              </p>
            </>
          ) : (
            <>
              <Login onLoginSuccess={handleLogin} />
              <p className="mt-4 text-sm text-center text-[#2a9d8f]">
                Don't have an account?{" "}
                <button className="ml-[2px] text-[#27887d] hover:underline" onClick={() => setShowRegister(true)}>
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
