"use client";

import { useState, useEffect } from "react";
import { chatbotService } from "@/lib/api/chatbot";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConnectionStatus() {
  const [status, setStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const testConnection = async () => {
    setStatus("checking");
    try {
      const isConnected = await chatbotService.testConnection();
      setStatus(isConnected ? "connected" : "disconnected");
      setLastChecked(new Date());
    } catch (error) {
      setStatus("disconnected");
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        {status === "checking" && (
          <>
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 animate-spin flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Checking connection...
            </span>
          </>
        )}
        {status === "connected" && (
          <>
            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span className="hidden sm:inline">Connected to chatbot API</span>
              <span className="sm:hidden">Connected</span>
            </span>
          </>
        )}
        {status === "disconnected" && (
          <>
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span className="hidden sm:inline">
                Disconnected from chatbot API
              </span>
              <span className="sm:hidden">Disconnected</span>
            </span>
          </>
        )}
      </div>

      {lastChecked && (
        <span className="text-xs text-gray-500 dark:text-gray-500">
          Last: {lastChecked.toLocaleTimeString()}
        </span>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={testConnection}
        disabled={status === "checking"}
        className="ml-auto text-xs sm:text-sm"
      >
        <span className="hidden sm:inline">Test Connection</span>
        <span className="sm:hidden">Test</span>
      </Button>
    </div>
  );
}
