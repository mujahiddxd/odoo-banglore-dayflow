"use client";

import { useEffect, useState } from "react";

const EMOJIS = ["💼", "📈", "👩‍💻", "⚙️", "🔧", "🚀", "📄", "👔", "👨‍🔧", "💻"];

export default function FloatingBackground() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<{ id: number; emoji: string; x: number; y: number; duration: number; delay: number; scale: number; opacity: number }[]>([]);

  useEffect(() => {
    // Generate random items only on the client side to avoid hydration mismatch
    const generatedItems = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: Math.random() * 100, // percentage left
      y: Math.random() * 100, // percentage top
      duration: 15 + Math.random() * 25, // 15-40 seconds
      delay: Math.random() * -20, // negative delay so they start immediately at different phases
      scale: 0.8 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.15,
    }));
    setItems(generatedItems);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute text-5xl font-headline"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            opacity: item.opacity,
            animation: `float-anim ${item.duration}s ease-in-out infinite alternate ${item.delay}s`,
          }}
        >
          <div style={{ transform: `scale(${item.scale})` }}>
            {item.emoji}
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes float-anim {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(40px, -60px) rotate(15deg);
          }
          66% {
            transform: translate(-30px, -30px) rotate(-10deg);
          }
          100% {
            transform: translate(20px, 50px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
}
