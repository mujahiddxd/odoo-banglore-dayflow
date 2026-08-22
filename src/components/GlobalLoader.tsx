"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function GlobalLoader() {
  const [showLoader, setShowLoader] = useState(true);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    // Show loader for 3 seconds on every visit to this page
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !showLoader || pathname !== "/signin") return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--uxsg-paper)] flex flex-col items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        {/* Sketchy Logo Loader */}
        <div className="w-24 h-24 rounded-full bg-[var(--uxsg-teal)] flex items-center justify-center sketchy-border overflow-hidden mb-6 animate-bounce">
          <span className="font-headline text-5xl font-bold text-[var(--uxsg-ink)]">
            D
          </span>
        </div>
        
        {/* Loading Text */}
        <h1 className="font-headline text-4xl font-bold tracking-tight text-[var(--uxsg-ink)] mb-2">
          Dayflow
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
