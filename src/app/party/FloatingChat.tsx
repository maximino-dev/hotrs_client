"use client";

import React, { useRef, useEffect, useState } from "react";

type Message = {
  username: string;
  message: string;
};

type FloatingChatProps = {
  chatMessages: Message[];
  chatInput: string;
  setChatInput: (input: string) => void;
  sendChatMessage: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function FloatingChat({ chatMessages, chatInput, setChatInput, sendChatMessage }: FloatingChatProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-white shadow-lg rounded-lg border border-gray-300 p-4 block z-50 lg:w-96">
      <button
        onClick={toggleChat}
        className="w-full text-left px-4 py-2 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 rounded-t-lg">
        <h3 className="text-md font-semibold">💬 Chat {isOpen ? "▼" : "▲"}</h3>
      </button>
      
      {/* Contenu du chat (affiché seulement si isOpen = true) */}
      {isOpen && (
        <div className="p-4">
          <div className="overflow-y-auto max-h-48 mb-2 pr-1 text-left">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="text-sm mb-1">
                <strong>{msg.username}</strong>: {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendChatMessage} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Écris un message..."
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Envoyer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}