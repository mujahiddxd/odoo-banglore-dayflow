"use client";

import { useEffect, useState } from "react";

export default function GlobalLoader() {
  const [showLoader, setShowLoader] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenLoader = sessionStorage.getItem("hasSeenLoader");

    if (hasSeenLoader) {
      setShowLoader(false);
    } else {
      // Set to hide after 3 seconds
      const timer = setTimeout(() => {
        setShowLoader(false);
        sessionStorage.setItem("hasSeenLoader", "true");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted || !showLoader) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--uxsg-paper)] flex flex-col items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        {/* Sketchy Logo Loader */}
        <div className="w-24 h-24 rounded-full bg-[var(--uxsg-teal)] flex items-center justify-center sketchy-border overflow-hidden mb-6 animate-bounce">
          <span className="font-headline text-5xl font-bold text-[var(--uxsg-ink)]">
            O
          </span>
        </div>
        
        {/* Loading Text */}
        <h1 className="font-headline text-4xl font-bold tracking-tight text-[var(--uxsg-ink)] mb-2">
          Odoo
        </h1>
        <p className="font-body text-sm font-semibold opacity-60 uppercase tracking-widest">
          Loading Workspace...
        </p>
        
        {/* Sketchy Progress Bar */}
        <div className="w-64 h-4 mt-8 sketchy-border rounded-full p-1 bg-white relative overflow-hidden">
          <div className="h-full bg-[var(--uxsg-yellow)] rounded-full animate-loader-progress"></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loader-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-loader-progress {
          animation: loader-progress 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
