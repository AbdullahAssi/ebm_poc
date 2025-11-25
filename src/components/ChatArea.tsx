"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  HiMenu,
  HiChatAlt2,
  HiLightBulb,
  HiUser,
  HiPaperAirplane,
  HiExclamationCircle,
  HiDocumentText,
  HiX,
  HiEye,
  HiDownload,
  HiUpload,
} from "react-icons/hi";
import { chatbotService } from "@/lib/api/chatbot";
import { formatBotResponse } from "@/lib/validations";
import { Message } from "@/lib/types";
import { ConnectionStatus } from "@/components/chat/connection-status";
import { LeadForm } from "@/components/chat/lead-form";
import { FileUpload } from "@/components/chat/file-upload";

interface ChatAreaProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function ChatArea({
  isSidebarOpen,
  onToggleSidebar,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
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
    docUrls?: string[] | null,
    leadFlag?: boolean
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
        // Update message with final data after typing completes
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  docUrls,
                  leadFlag,
                  isTyping: false,
                }
              : msg
          )
        );

        // Show lead form if lead_flag is true
        if (leadFlag) {
          setShowLeadForm(true);
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

    // Reset textarea height
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.style.height = "auto";
    }

    setIsLoading(true);

    try {
      // Call actual chatbot API
      const response = await chatbotService.sendQuery(queryText);

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        userId: response.user_id,
        docUrls: response.doc_urls,
        leadFlag: response.lead_flag,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      // Show lead form if lead_flag is true
      if (response.lead_flag) {
        setShowLeadForm(true);
      }
    } catch (error) {
      // Generate helpful error message based on error type and user query
      let errorContent = "";
      const errorObj = error instanceof Error ? error : null;
      const lowerQuery = queryText.toLowerCase();

      // Contact information
      const contactInfo = `\n\n📞 **Direct Contact:**\nPhone: +051-8778770\nEmail: info@cymax.com.pk`;

      // Determine error type and provide specific guidance
      if (errorObj?.message.includes("timeout")) {
        errorContent =
          "⏰ The server is taking longer than usual to respond. Please try again or contact us directly for immediate assistance." +
          contactInfo;
      } else if (
        errorObj?.message.includes("Network") ||
        errorObj?.message.includes("Failed to fetch")
      ) {
        errorContent =
          "🌐 Unable to connect to our AI assistant. Please check your internet connection or contact us directly." +
          contactInfo;
      } else if (errorObj?.message.includes("500")) {
        errorContent =
          "⚠️ Our AI assistant is temporarily unavailable. For immediate assistance, please contact us directly." +
          contactInfo;
      } else {
        // Provide context-aware fallback based on user query
        if (
          lowerQuery.includes("hello") ||
          lowerQuery.includes("hi") ||
          lowerQuery.includes("hey") ||
          lowerQuery.includes("greetings")
        ) {
          errorContent = `Hello! I'm having trouble connecting to our AI assistant right now, but I'm here to help.\n\n⚠️ Our AI assistant is temporarily unavailable. For immediate assistance, please contact us directly.${contactInfo}`;
        } else if (
          lowerQuery.includes("contact") ||
          lowerQuery.includes("phone") ||
          lowerQuery.includes("email") ||
          lowerQuery.includes("reach")
        ) {
          errorContent = `📞 **Contact Information:**\nPhone: +051-8778770\nEmail: info@cymax.com.pk\nAddress: CyMax Technologies\n\nFeel free to reach out through any of these channels. We're here to help!`;
        } else if (
          lowerQuery.includes("product") ||
          lowerQuery.includes("solution") ||
          lowerQuery.includes("service") ||
          lowerQuery.includes("offer")
        ) {
          errorContent = `🚀 CyMax Technologies specializes in AI, Cybersecurity, ICT, and ERP solutions.\n\n⚠️ Our AI assistant is temporarily unavailable, but you can learn more about our offerings by contacting our sales team directly.${contactInfo}`;
        } else if (
          lowerQuery.includes("price") ||
          lowerQuery.includes("cost") ||
          lowerQuery.includes("quote")
        ) {
          errorContent = `💰 For pricing information and custom quotes, please contact our sales team directly.${contactInfo}\n\nWe'll be happy to discuss your requirements and provide a tailored solution.`;
        } else if (
          lowerQuery.includes("demo") ||
          lowerQuery.includes("trial") ||
          lowerQuery.includes("presentation")
        ) {
          errorContent = `🎯 We'd love to show you a demo of our solutions!\n\n⚠️ Our AI assistant is temporarily unavailable. Please contact us directly to schedule a demonstration.${contactInfo}`;
        } else {
          errorContent = `⚠️ Our AI assistant is temporarily unavailable. For immediate assistance, please contact us directly.${contactInfo}`;
        }
      }

      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: errorContent,
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
        {/* Left Side - Menu Button & Smart Assist Title */}
        <div className="flex items-center gap-3">
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
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Smart Assist
          </h1>
        </div>

        {/* Right Side - Logo */}
        <div className="flex items-center md:mr-10">
          {/* Light Mode Logo */}
          <Image
            src="/logolight.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-8 sm:h-10 w-auto dark:hidden"
            priority
          />
          {/* Dark Mode Logo */}
          <Image
            src="/logodark.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-8 sm:h-10 w-auto hidden dark:block"
            priority
          />
        </div>
      </div>

      {/* Connection Status */}
      {/* <ConnectionStatus /> */}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 bg-white dark:bg-[#212121] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
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
                className={`flex flex-col ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Avatar and Role Badge */}
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${
                        message.error
                          ? "bg-red-500"
                          : "bg-linear-to-br from-blue-500 to-purple-600"
                      } flex items-center justify-center shrink-0`}
                    >
                      {message.error ? (
                        <HiExclamationCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      ) : (
                        <HiLightBulb className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Smart Assist
                    </span>
                  </div>
                )}

                {message.role === "user" && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      You
                    </span>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      <HiUser className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  </div>
                )}

                <div
                  className={`flex flex-col gap-3 w-full max-w-full sm:max-w-[85%] md:max-w-[80%] ${
                    message.role === "user" ? "items-end" : ""
                  }`}
                >
                  <div
                    className={`rounded-lg px-3 sm:px-4 py-2 sm:py-3 max-w-fit ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : message.error
                        ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                        {message.content}
                      </p>
                    ) : (
                      <div
                        className="text-xs sm:text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: formatBotResponse(message.content),
                        }}
                      />
                    )}
                  </div>

                  {/* Document URLs Preview */}
                  {message.docUrls && message.docUrls.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 mb-2">
                        <HiDocumentText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          Related Documents
                        </p>
                      </div>
                      <div className="space-y-2">
                        {message.docUrls.map((url, idx) => {
                          const fileName =
                            url.split("/").pop() || `Document ${idx + 1}`;
                          const proxyUrl = `/api/document?path=${encodeURIComponent(
                            url
                          )}`;
                          return (
                            <div
                              key={idx}
                              className="p-3 sm:p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all text-xs sm:text-sm"
                            >
                              <div className="flex items-start gap-3">
                                <HiDocumentText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-gray-900 dark:text-gray-100 font-medium wrap-break-word mb-2">
                                    {decodeURIComponent(fileName)}
                                  </p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setIsDocLoading(true);
                                        setPreviewDoc({
                                          url: proxyUrl,
                                          name: fileName,
                                        });
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-xs font-medium"
                                    >
                                      <HiEye className="w-3.5 h-3.5" />
                                      Preview
                                    </button>
                                    <a
                                      href={proxyUrl}
                                      target="_blank"
                                      download
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-xs font-medium"
                                    >
                                      <HiDownload className="w-3.5 h-3.5" />
                                      Download
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Inline Lead Form */}
                  {message.leadFlag && showLeadForm && (
                    <div className="w-full">
                      <LeadForm
                        onClose={() => setShowLeadForm(false)}
                        onSuccess={() => {
                          setShowLeadForm(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                    <HiLightBulb className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Smart Assist
                  </span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 sm:px-5 py-3 sm:py-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#212121]">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              {/* <button
                type="button"
                onClick={() => setShowUpload(true)}
                className="m-1.5 sm:m-2 p-2 sm:p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
                aria-label="Upload file"
                title="Upload document"
              >
                <HiUpload className="w-4 h-4 sm:w-5 sm:h-5" />
              </button> */}
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 bg-transparent  px-3 sm:px-4 py-2 sm:py-3 outline-none resize-none text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 max-h-32 overflow-y-auto"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="m-1.5 sm:m-2 p-2 sm:p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Send message"
              >
                <HiPaperAirplane className="w-4 h-4 sm:w-5 sm:h-5 rotate-90" />
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2 hidden sm:block">
              Press Enter to send, Shift + Enter for new line •
              {/* <HiUpload className="inline w-3 h-3" /> to upload documents */}
            </p>
          </form>

          {/* Inline Upload Form */}
          {showUpload && (
            <div className="mt-4">
              <FileUpload
                onUploadSuccess={(files) => {
                  // Add a system message about the uploads
                  const fileNames = files.map((f) => f.name).join(", ");
                  const uploadMessage: Message = {
                    id: Date.now(),
                    role: "assistant",
                    content:
                      files.length === 1
                        ? `✅ Document "${files[0].name}" uploaded successfully! You can now ask me questions about it.`
                        : `✅ ${files.length} documents uploaded successfully: ${fileNames}. You can now ask me questions about them.`,
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, uploadMessage]);
                  setShowUpload(false);
                }}
                onClose={() => setShowUpload(false)}
                allowMultiple={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <HiDocumentText className="w-5 h-5 text-blue-500 shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {decodeURIComponent(previewDoc.name)}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Open in new tab"
                >
                  <HiDownload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close preview"
                >
                  <HiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-gray-800">
              {isDocLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-900 z-10">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Loading Document...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Please wait while we fetch your document
                    </p>
                  </div>
                </div>
              )}
              <iframe
                src={previewDoc.url}
                className="w-full h-full border-0"
                title="Document Preview"
                onLoad={() => setIsDocLoading(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
