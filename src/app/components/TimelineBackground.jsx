'use client';
import { forwardRef } from 'react';

const TimelineBackground = forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      className="absolute inset-0 bg-[#292929] overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 35%, rgba(84, 187, 116, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 75% 44%, rgba(84, 187, 116, 0.05) 0%, transparent 40%),
          linear-gradient(to bottom, #292929, #1a1a1a)
        `
      }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#54bb74]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[#54bb74]/5 rounded-full blur-3xl animate-pulse delay-1000" />
    </div>
  );
});

TimelineBackground.displayName = 'TimelineBackground';

export default TimelineBackground;
