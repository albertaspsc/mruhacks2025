"use client";
import { AlertTriangle, CheckCircle, Mail, XCircle } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastState {
  type: ToastType;
  title: string;
  description?: string;
}

export const ToastBanner = ({
  toast,
  onClose,
  duration = 5000,
}: {
  toast: ToastState | null;
  onClose: () => void;
  duration?: number;
}) => {
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Mail className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-md shadow-lg z-50 text-sm transition-all duration-300 ${getStyles()} min-w-80 max-w-md`}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <strong className="block">{toast.title}</strong>
          {toast.description && <div className="mt-1">{toast.description}</div>}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
