import React, { useEffect, useRef, useState } from 'react';
import { MessageType } from './Message';
import Cookies from 'js-cookie';

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

  // Refs para sincronización
  const isSavingRef = useRef(false);
  const lastSavedIndexRef = useRef(0);

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

  const addConversationFirstMessage = async () => {
    try {
      const token = Cookies.get("token");
      const email = Cookies.get("email");
      const title = messages[0].text.substring(0, 40) + "...";

      const res = await fetch("http://localhost:8000/conversations", {
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

  const addConversation = async () => {
    try {
      const token = Cookies.get("token");
      const email = Cookies.get("email");
      const title = messages[0]?.text.substring(0, 18) + "..." || "New chat...";

      const res = await fetch("http://localhost:8000/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, email }),
      });

      if (!res.ok) throw new Error("Error creating new conversation");

      const data = await res.json();

      const newConversation: Conversation = {
        id: data.id,
        title,
      };

      setConversations((prev) => [...prev, newConversation]);
      setSelectedId(data.id);
      setConversationId(data.id);
      setOnConversation(false);
      setMessages([]);
      lastSavedIndexRef.current = 0;
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  const saveMessage = async (text: string, sender: string, conversation_id: number) => {
    try {
      const token = Cookies.get("token");
      await fetch("http://localhost:8000/messages", {
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

  return (
    <div className="w-full px-2">
      <button
        onClick={addConversation}
        disabled={!onConversation}
        className="mb-4 w-full text-left bg-[#2a9d8f] hover:bg-[#238075] text-white py-2 px-4 rounded transition"
      >
        + New Chat
      </button>
      <ul className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
        {conversations.map((conv) => (
          <li
            key={conv.id}
            onClick={() => setSelectedId(conv.id)}
            className={`p-2 rounded cursor-pointer text-sm transition ${selectedId === conv.id ? 'bg-[#27857a] font-semibold' : 'hover:bg-[#238075] bg-[#2b9c8f]'}`}
          >
            {conv.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Conversations;
