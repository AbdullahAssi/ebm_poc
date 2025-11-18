"use client";

import { useState, useRef, useEffect } from "react";
import {
  HiMenu,
  HiChatAlt2,
  HiLightBulb,
  HiUser,
  HiPaperAirplane,
  HiExclamationCircle,
} from "react-icons/hi";
import { chatbotService } from "@/lib/api/chatbot";
import { DocumentReference } from "@/lib/types";
import { ConnectionStatus } from "@/components/chat/connection-status";

interface ChatAreaProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  relatedDocuments?: DocumentReference[];
  error?: boolean;
  isTyping?: boolean;
}

export default function ChatArea({
  isSidebarOpen,
  onToggleSidebar,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const animateTyping = (
    fullText: string,
    messageId: number,
    relatedDocs?: DocumentReference[]
  ) => {
    let currentIndex = 0;

    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      currentIndex++;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: fullText.slice(0, currentIndex),
                isTyping: currentIndex < fullText.length,
              }
            : msg
        )
      );

      if (currentIndex >= fullText.length) {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        // Add related documents after typing completes
        if (relatedDocs && relatedDocs.length > 0) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    relatedDocuments: relatedDocs,
                    isTyping: false,
                  }
                : msg
            )
          );
        }
      }
    }, 20); // Typing speed: 20ms per character
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const queryText = input;
    setInput("");
    setIsLoading(true);

    try {
      // Call actual chatbot API
      const response = await chatbotService.sendQuery(queryText);

      const messageId = Date.now() + 1;
      const assistantMessage: Message = {
        id: messageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isTyping: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      // Animate typing effect
      animateTyping(response.response, messageId, response.related_documents);
    } catch (error) {
      // Handle error - no typing animation for errors
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Failed to get response. Please try again.",
        timestamp: new Date(),
        error: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#212121]">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <HiMenu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open sidebar"
          >
            <HiMenu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        )}
        <div className="flex-1 text-center">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Chat Assistant
          </h1>
        </div>
        <div className="w-9"></div>
      </div>

      {/* Connection Status */}
      {/* <ConnectionStatus /> */}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 bg-white dark:bg-[#212121]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
              <HiChatAlt2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              How can I help you today?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md">
              Start a conversation by typing a message below
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-3 md:gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                      message.error
                        ? "bg-red-500"
                        : "bg-gradient-to-br from-blue-500 to-purple-600"
                    } flex items-center justify-center flex-shrink-0`}
                  >
                    {message.error ? (
                      <HiExclamationCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <HiLightBulb className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-2 max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
                  <div
                    className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : message.error
                        ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                      {message.isTyping && (
                        <span className="inline-block w-0.5 sm:w-1 h-3 sm:h-4 ml-1 bg-blue-500 animate-pulse" />
                      )}
                    </p>
                  </div>

                  {/* Related Documents */}
                  {message.relatedDocuments &&
                    message.relatedDocuments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Related Documents:
                        </p>
                        {message.relatedDocuments.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-xs sm:text-sm"
                          >
                            <HiChatAlt2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                            <span className="flex-1 text-gray-700 dark:text-gray-300 truncate">
                              {doc.documentName}
                            </span>
                            <span className="text-xs text-gray-500 hidden sm:inline">
                              Download
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                </div>
                {message.role === "user" && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <HiUser className="w-3 h-3 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 sm:gap-3 md:gap-4 justify-start">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <HiLightBulb className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                  <div className="flex space-x-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 bg-white dark:bg-[#212121]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              className="flex-1 bg-transparent px-3 sm:px-4 py-2 sm:py-3 outline-none resize-none text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="m-1.5 sm:m-2 p-2 sm:p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              <HiPaperAirplane className="w-4 h-4 sm:w-5 sm:h-5 rotate-90" />
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2 hidden sm:block">
            Press Enter to send, Shift + Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
