/**
 * Card component
 * Reusable card container with shadow and border — 2010s design system
 */

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#1e293b] p-6 shadow-sm transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`mb-4 border-b border-[#e2e8f0] dark:border-[#334155] pb-4 ${className}`}>{children}</div>;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return <div className={`border-t border-[#e2e8f0] dark:border-[#334155] pt-4 ${className}`}>{children}</div>;
}
