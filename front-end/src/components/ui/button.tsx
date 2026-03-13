import React from 'react';
import { cn } from '../../lib/cn';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const { getButtonClasses } = useThemeClasses();

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-200',
        getButtonClasses(variant, size),
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
