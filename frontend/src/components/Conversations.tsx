import React, { useEffect, useState } from 'react';
import { MessageType } from './Message';

interface Conversation {
  id: string;
  title: string;
}

interface ConversationsProps {
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
}

const Conversations: React.FC<ConversationsProps> = ({ messages, setMessages }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [onConversation, setOnConversation] = useState<Boolean>(false);
  
  useEffect(() => {
    if (messages.length == 1 && !onConversation) {
      addConversationFirstMessage();
    }
  });


  const addConversationFirstMessage = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `Conversation ${conversations.length + 1}`,
    };
    setOnConversation(true);
    setConversations((prev) => [...prev, newConversation]);
    setSelectedId(newConversation.id);
  }
  
  const addConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `Conversation ${conversations.length + 1}`,
    };
    setOnConversation(false);
    setConversations((prev) => [...prev, newConversation]);
    setSelectedId(newConversation.id);
    setMessages([])
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
            className={`p-2 rounded cursor-pointer text-sm transition ${selectedId === conv.id ? 'bg-[#27857a] font-semibold' : 'hover:bg-[#238075] bg-[#2b9c8f]'
              }`}
          >
            {conv.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Conversations;
