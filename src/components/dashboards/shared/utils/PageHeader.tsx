import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      {actions && <div className="flex space-x-3">{actions}</div>}
    </div>
  );
}

interface ActionButtonProps {
  onClick?: () => void;
  href?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "destructive";
  className?: string;
}

export function ActionButton({
  onClick,
  href,
  icon: Icon,
  children,
  variant = "default",
  className = "",
}: ActionButtonProps) {
  const buttonContent = (
    <Button variant={variant} className={className}>
      <Icon className="w-4 h-4 mr-2" />
      {children}
    </Button>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {buttonContent}
      </a>
    );
  }

  return (
    <button onClick={onClick} className="inline-block">
      {buttonContent}
    </button>
  );
}
