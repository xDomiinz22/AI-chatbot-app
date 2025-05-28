import { useState } from "react";
import Message from './Message';
import './Chat.css'

function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSend = async () => {
    if (!input.trim()) return;

    // Añadimos el mensaje del usuario a la lista
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Error en la llamada al servidor");
      }

      const data = await response.json();

      // Añadimos la respuesta del bot a la lista de mensajes
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: data.reply },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "bot",
          text: "Lo siento, hubo un error al conectar con el servidor.",
        },
      ]);
      console.error(error);
    }
  };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
        handleSend();
    }
  };

    return (
        <div className="chat-container">
        <div className="chat-box">
            {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender === "user" ? "user" : "bot"}`}>
                {msg.text}
            </div>
            ))}
        </div>

        <div className="input-container">
            <input
            type="text"
            value={input}
            placeholder="Escribe algo..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="chat-input"
            />
            <button onClick={handleSend} className="chat-button">
            Enviar
            </button>
        </div>
        </div>
    );
}

export default Chat;