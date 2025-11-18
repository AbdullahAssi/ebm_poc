"use client";

import ThemeToggle from "./ThemeToggle";
import { HiMenu, HiPlus, HiTrash, HiUser } from "react-icons/hi";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const conversations = [
    { id: 1, title: "New conversation", timestamp: "Just now" },
    { id: 2, title: "Previous chat", timestamp: "Yesterday" },
    { id: 3, title: "Another discussion", timestamp: "2 days ago" },
  ];

  return (
    <div
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } fixed lg:relative inset-y-0 left-0 z-40 flex flex-col bg-gray-50 dark:bg-[#171717] text-gray-900 dark:text-white transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-64 lg:w-0"
      } ${!isOpen && "lg:overflow-hidden"}`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <HiMenu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="New chat"
            title="New chat"
          >
            <HiPlus className="w-5 h-5" />
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="group p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors mb-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs text-gray-400 mt-1">{conv.timestamp}</p>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded transition-opacity"
                aria-label="Delete conversation"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <HiUser className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User Account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
