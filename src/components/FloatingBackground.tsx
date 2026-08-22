"use client";

import { useEffect, useState } from "react";

const EMOJIS = ["💼", "📈", "👩‍💻", "⚙️", "🔧", "🚀", "📄", "👔", "👨‍🔧", "💻"];

export default function FloatingBackground() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<{ 
    id: number; 
    emoji: string; 
    x: number; 
    y: number; 
    duration: number; 
    delay: number; 
    scale: number; 
    opacity: number;
    blur: number;
  }[]>([]);

  useEffect(() => {
    const generatedItems = Array.from({ length: 25 }).map((_, i) => {
      const scale = 0.6 + Math.random() * 1.5;
      // Elements that are smaller (further away) get a very slight blur
      const blur = Math.max(0, (1 - scale) * 2); 
      
      return {
        id: i,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        x: -10 + Math.random() * 120, // percentage left (allow spawning slightly off-screen)
        y: -10 + Math.random() * 120, // percentage top
        duration: 20 + Math.random() * 40, // 20-60 seconds for very slow, premium movement
        delay: Math.random() * -40, // negative delay so they start immediately at different phases
        scale,
        opacity: 0.15 + Math.random() * 0.3, // Higher opacity to be clearly visible
        blur,
      };
    });
    setItems(generatedItems);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[var(--uxsg-paper)]">
      
      {/* Notebook Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04]" 
        style={{
          backgroundImage: `radial-gradient(var(--uxsg-ink) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          backgroundPosition: 'center center'
        }}
      />

      {/* Floating Items */}
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute text-5xl font-headline transition-transform"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            opacity: item.opacity,
            filter: `blur(${item.blur}px)`,
            animation: `float-anim-${item.id % 3} ${item.duration}s ease-in-out infinite alternate ${item.delay}s`,
          }}
        >
          <div style={{ transform: `scale(${item.scale})` }}>
            {item.emoji}
          </div>
        </div>
      ))}

      {/* Vignette Overlay for focus */}
      <div 
        className="absolute inset-0 z-10" 
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(9,9,7,0.06) 120%)'
        }}
      />

      <style jsx>{`
        /* Three different animation paths for organic, unpredictable movement */
        @keyframes float-anim-0 {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(60px, -80px) rotate(15deg); }
          66% { transform: translate(20px, 40px) rotate(-10deg); }
          100% { transform: translate(-30px, 20px) rotate(5deg); }
        }
        @keyframes float-anim-1 {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-70px, -40px) rotate(-15deg); }
          66% { transform: translate(-20px, 80px) rotate(10deg); }
          100% { transform: translate(50px, 30px) rotate(25deg); }
        }
        @keyframes float-anim-2 {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, 90px) rotate(10deg); }
          66% { transform: translate(-60px, 10px) rotate(-20deg); }
          100% { transform: translate(-20px, -50px) rotate(-5deg); }
        }
      `}</style>
    </div>
  );
}
