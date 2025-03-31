import { useChat } from "@/context/chat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Bot, User, Send } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ChatBot() {
  const { isOpen, messages, toggleChat, closeChat, sendMessage, isTyping } = useChat();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // Focus input when chat opens
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen]);

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 flex flex-col max-w-md w-full md:w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg transform transition-transform duration-300",
        isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 invisible"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Asistente Financiero</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Disponible ahora</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={closeChat} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start mb-4",
              message.role === "user" ? "justify-end" : ""
            )}
          >
            {message.role === "bot" && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
            )}
            <div
              className={cn(
                "max-w-xs py-2 px-4 rounded-lg",
                message.role === "user"
                  ? "mr-3 bg-primary-600 dark:bg-primary-700 text-white rounded-tr-none"
                  : "ml-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
              )}
            >
              <p className="text-sm">{message.content}</p>
            </div>
            {message.role === "user" && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3 bg-gray-100 dark:bg-gray-700 py-3 px-4 rounded-lg rounded-tl-none">
              <div className="typing-indicator">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 focus:ring-primary focus:border-primary block w-full rounded-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <Button 
            type="submit"
            variant="default"
            size="icon"
            className="inline-flex items-center ml-2 p-2 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
