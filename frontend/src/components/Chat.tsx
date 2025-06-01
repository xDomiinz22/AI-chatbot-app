import { useState, ChangeEvent, KeyboardEvent, useRef, useEffect } from "react";
import Message from './Message';
import SettingsPanel from './SettingsPanel';
import Cookies from "js-cookie";

type ProviderName = "OpenAI" | "HuggingFace" | "Google";

type Providers = {
  [key in ProviderName]: string[];
};

type Message = {
  sender: "user" | "bot";
  text: string;
};

function Chat() {
  const providers: Providers = {
    OpenAI: ["gpt-3.5-turbo", "gpt-4"],
    HuggingFace: ["distilbert-base", "bert-large"],
    Google: ["gemini-2.0-flash"],
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [provider, setProvider] = useState<ProviderName>("Google");
  const [model, setModel] = useState<string>(providers["Google"][0]);

  const handleProviderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedProvider = e.target.value as ProviderName;
    setProvider(selectedProvider);
    setModel(providers[selectedProvider][0]);

    Cookies.set("provider", selectedProvider, { expires: 7 });
    Cookies.set("model", providers[selectedProvider][0], { expires: 7 });
  };

  const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
    Cookies.set("model", e.target.value, { expires: 7 });
  };

  useEffect(() => {
    const savedProvider = Cookies.get("provider") as ProviderName;
    const savedModel = Cookies.get("model");

    if (savedProvider && providers[savedProvider]?.includes(savedModel || "")) {
      setProvider(savedProvider);
      setModel(savedModel);
    }
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, provider, model }),
      });

      if (!response.ok) throw new Error("Error en la llamada al servidor");

      const data = await response.json();

      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Lo siento, hubo un error al conectar con el servidor.",
        },
      ]);
      console.error(error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // evita el salto de línea
      handleSend();
    }
  };

  const [showSettings, setShowSettings] = useState(false);
  const [renderSettings, setRenderSettings] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cerrar el panel si se hace clic fuera
  const toggleSettings = () => {
    if (showSettings) {
      // Oculta el panel con animación
      setShowSettings(false);
      setTimeout(() => setRenderSettings(false), 300); // espera a que la animación termine
    } else {
      // Muestra el panel con animación
      setRenderSettings(true);
      setTimeout(() => setShowSettings(true), 10); // le das tiempo a que monte antes de animar
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        settingsRef.current &&
        !settingsRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showSettings]);

  return (
    <div className="flex flex-col items-center w-full">

      <div className="flex flex-col border border-gray-300 p-4 h-[500px] overflow-y-auto
      mb-2 w-full max-w-[800px] bg-[#eef2f7] rounded-[10px] shadow-inner shadow-[#cfd8dc]">
        {messages.map((msg, idx) => (
          <Message key={idx} sender={msg.sender} text={msg.text} />
        ))}
      </div>

      <div className="flex flex-col w-full max-w-[800px] mx-auto mt-4 items-center">
        <textarea
          value={input}
          placeholder="Write something..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{ resize: "none", overflow: "hidden" }}
          className="w-full flex-1 outline-none p-2 border border-gray-300 border-b-0 rounded-t text-base 
    focus:outline-2 focus:outline-[#2a9d8f] focus:outline-offset-0 transition duration-300
    bg-white text-gray-500 placeholder-[#999] font-sans"
        />


        <div className="relative flex max-w-[800px] border border-gray-300 text-gray-500 rounded-b-md border-t w-full justify-end">
          <button
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation();
              toggleSettings();
            }}
            className="mr-2 text-xl text-gray-600 hover:text-[#2a9d8f] transition"
            title="Open settings"
          >
            ⚙️
          </button>

          {showSettings && (
            <SettingsPanel
              ref={settingsRef}
              provider={provider}
              model={model}
              providers={providers}
              onProviderChange={handleProviderChange}
              onModelChange={handleModelChange}
              onClose={() => toggleSettings()}
              show={showSettings}
            />
          )}

          <div className="items-end flex max-w-[20%] ml-4">
            <button onClick={handleSend} className="bg-[#2a9d8f] p-2 border rounded-br-md border-[#2a9d8f] 
          text-bold focus:bg-[#238075] focus:outline-0 font-sans transition duration-300
          text-white placeholder-[#999] hover:bg-[#238075] hover:outline-0">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
