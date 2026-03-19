import React from "react";

const CosmicBackground = () => {
  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-foreground/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main glowing orb */}
      <div className="absolute bottom-20 right-1/3 w-40 h-40 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/10 blur-sm animate-float glow-accent" />
      
      {/* Secondary orb */}
      <div className="absolute top-32 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-foreground/30 to-foreground/20 blur-[2px] animate-float-delayed" />
      
      {/* Smallest orb */}
      <div className="absolute top-1/2 right-1/4 w-8 h-8 rounded-full bg-gradient-to-br from-foreground/40 to-foreground/30 animate-pulse-glow" />

      {/* Vertical light beams */}
      <div className="absolute bottom-0 left-1/3 w-[1px] h-2/3 bg-gradient-to-t from-transparent via-foreground/20 to-transparent" />
      <div className="absolute bottom-0 right-1/4 w-[1px] h-1/2 bg-gradient-to-t from-transparent via-foreground/15 to-transparent" />

      {/* Logo */}
      <div className="absolute bottom-8 right-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
          <span className="text-background font-bold text-sm">🎓</span>
        </div>
        <span className="text-foreground/60 font-medium tracking-wide">scholar</span>
      </div>
    </div>
  );
};

export default CosmicBackground;
