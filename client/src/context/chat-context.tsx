import { createContext, useContext, useState } from "react";
import { ChatMessage } from "@/types/finance";
import { sendChatMessage } from "@/lib/chat-service";

interface ChatContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  toggleChat: () => void;
  closeChat: () => void;
  sendMessage: (message: string) => Promise<void>;
  isTyping: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "bot",
      content: "¡Hola! Soy tu asistente financiero. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Obtener respuesta del bot
      const botResponse = await sendChatMessage(content);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: botResponse,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider value={{ isOpen, messages, toggleChat, closeChat, sendMessage, isTyping }}>
      {children}
    </ChatContext.Provider>
  );
}

// Cambiamos el nombre de la función para evitar problemas con HMR de React
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
