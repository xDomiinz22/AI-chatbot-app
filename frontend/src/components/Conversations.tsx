import React, { useEffect, useRef, useState } from 'react';
import { MessageType } from './Message';
import Cookies from 'js-cookie';
import SettingsConversations from './SettingsConversations';

interface Conversation {
  id: number;
  title: string;
}

interface ConversationsProps {
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
}

const Conversations: React.FC<ConversationsProps> = ({ messages, setMessages }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [onConversation, setOnConversation] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const justClosedRef = useRef(false);
  const ignoreNextToggle = useRef(false);

  // Refs para sincronización
  const isSavingRef = useRef(false);
  const lastSavedIndexRef = useRef(0);
  const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  const setButtonRef = (id: number, el: HTMLButtonElement | null) => {
    buttonRefs.current[id] = el;
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = Cookies.get("token");

        if (!token) return;

        const res = await fetch(`http://localhost:8000/get_conversations?token=${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error fetching conversations");

        const data: Conversation[] = await res.json();
        setConversations(data);

        // Selecciona la conversación más reciente
        if (data.length > 0) {
          setSelectedId(data[0].id);
          setConversationId(data[0].id);
          setOnConversation(true);
        }

      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!messages.length) return;

    if (messages.length === 2 && !onConversation) {
      addConversationFirstMessage();
    } else if (conversationId && messages.length > 1) {
      if (!onConversation || isSavingRef.current) return;
      if (messages.length <= lastSavedIndexRef.current) return;

      const newMessages = messages.slice(lastSavedIndexRef.current);

      const saveNewMessages = async () => {
        isSavingRef.current = true;
        try {
          for (const msg of newMessages) {
            await saveMessage(msg.text, msg.sender, conversationId);
          }
          lastSavedIndexRef.current = messages.length;
        } catch (error) {
          console.error("Error saving messages:", error);
        } finally {
          isSavingRef.current = false;
        }
      };

      saveNewMessages();
    }
  }, [messages]);

  const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (ignoreNextToggle.current) {
      // Ignoramos este clic porque acabamos de cerrar el menú
      return;
    }

    if (openMenu === id) {
      // Cerramos menú y bloqueamos la apertura inmediatamente siguiente
      setOpenMenu(null);
      ignoreNextToggle.current = true;
      setTimeout(() => {
        ignoreNextToggle.current = false;
      }, 300);
      return;
    }

    // Abrimos el menú normalmente
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorRect(rect);
    setOpenMenu(id);
  };

  useEffect(() => {
    if (openMenu === null && justClosedRef.current) {
      const timer = setTimeout(() => {
        justClosedRef.current = false;
      }, 250); // 250 ms, un poco más por si acaso
      return () => clearTimeout(timer);
    }
  }, [openMenu]);

  const addConversationFirstMessage = async () => {
    try {
      const token = Cookies.get("token");
      const email = Cookies.get("email");
      const title = messages[0].text.substring(0, 40) + "...";

      const res = await fetch("http://localhost:8000/add_conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, email }),
      });

      if (!res.ok) throw new Error("Error creating conversation");

      const data = await res.json();

      const newConversation: Conversation = {
        id: data.id,
        title,
      };

      setConversations((prev) => [...prev, newConversation]);
      setSelectedId(data.id);
      setConversationId(data.id);
      setOnConversation(true);
      lastSavedIndexRef.current = 1;
      await saveMessage(messages[0].text, "user", data.id);
      console.log(messages[1].text)
      await saveMessage(messages[1].text, "bot", data.id)
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setOnConversation(false);
    lastSavedIndexRef.current = 0;
  };

  const saveMessage = async (text: string, sender: string, conversation_id: number) => {
    try {
      const token = Cookies.get("token");
      await fetch("http://localhost:8000/add_messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversation_id, text, sender }),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleConversationSelect = async (convId: number) => {
    try {
      setSelectedId(convId);
      setConversationId(convId);
      setOnConversation(true);

      const token = Cookies.get("token");

      const res = await fetch(`http://localhost:8000/get_messages/${convId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Error fetching messages");

      const data = await res.json();
      setMessages(data); // Carga mensajes en el componente Chat
      lastSavedIndexRef.current = data.length;

    } catch (error) {
      console.error("Error loading messages for conversation:", error);
    }
  };

  const handleDownload = async (convId: number) => {
    try {
      const token = Cookies.get("token");
      const res = await fetch(`http://localhost:8000/get_messages/${convId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Error fetching messages");

      const messages = await res.json();
      const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `conversation_${convId}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading conversation:", err);
    }
  };

  const handleDelete = async (convId: number) => {
    try {
      const token = Cookies.get("token");
      const res = await fetch(`http://localhost:8000/delete_conversation/${convId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error deleting conversation");

      setConversations((prev) => prev.filter((conv) => conv.id !== convId));
      if (selectedId === convId) {
        setMessages([]);
        setSelectedId(null);
        setOnConversation(false);
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
  };

  const handleRename = async (convId: number) => {
    const newTitle = prompt("Nuevo título de la conversación:");
    if (!newTitle) return;

    try {
      const token = Cookies.get("token");
      const res = await fetch(`http://localhost:8000/rename_conversation`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: convId, title: newTitle }),
      });

      if (!res.ok) throw new Error("Error renaming conversation");

      setConversations((prev) =>
        prev.map((conv) => (conv.id === convId ? { ...conv, title: newTitle } : conv))
      );
    } catch (err) {
      console.error("Error renaming conversation:", err);
    }
  };

  return (
    <div className="w-full px-2">
      <button
        onClick={handleNewChat}
        disabled={!onConversation}
        className="mb-4 w-full text-left bg-[#2a9d8f] hover:bg-[#238075] text-white py-2 px-4 rounded transition"
      >
        + New Chat
      </button>
      <ul className="max-w-[100%] space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
        {conversations.map((conv) => (
          <li
            key={conv.id}
            onClick={() => handleConversationSelect(conv.id)}
            className={`flex p-2 rounded justify-between cursor-pointer text-sm transition ${selectedId === conv.id ? 'bg-[#27857a] font-semibold' : 'hover:bg-[#238075] bg-[#2b9c8f]'}`}
          >
            {conv.title}
            <div className="relative h-full">
              <button
                ref={(el) => setButtonRef(conv.id, el)}
                className="text-white px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenMenu(e, conv.id);
                }}
              >
                ···
              </button>

              {openMenu === conv.id && anchorRect && (
                <SettingsConversations
                  conversationId={conv.id}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  onRename={handleRename}
                  onClose={() => setOpenMenu(null)}
                  anchorRect={anchorRect}
                  buttonRef={buttonRefs[conv.id]}
                />
              )}
            </div>

          </li>
        ))}
      </ul>
    </div>
  );
};

export default Conversations;
