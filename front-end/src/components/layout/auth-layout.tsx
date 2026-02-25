import React from 'react';
import { Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#3c50e0] to-indigo-600 items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Welcome to TailAdmin</h2>
          <p className="text-white/80 max-w-md">
            A powerful admin dashboard template built with React and Tailwind CSS. 
            Manage your tasks, projects, and team efficiently.
          </p>
        </div>
      </div>
    </div>
  );
}
