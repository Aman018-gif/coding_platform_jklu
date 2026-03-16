import React, { useEffect, useState } from "react";

export default function CountdownTimer({ endTime, startTime }) {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });
  const [totalMs, setTotalMs] = useState(0);
  const [initialMs, setInitialMs] = useState(0);

  const calculateTimeLeft = (ms) => ({
    h: Math.floor(ms / (1000 * 60 * 60)),
    m: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
    s: Math.floor((ms % 60000) / 1000),
  });

  useEffect(() => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const remaining = Math.max(0, end - now);
    
    if (startTime) {
      const total = new Date(endTime).getTime() - new Date(startTime).getTime();
      setInitialMs(total);
      setTotalMs(remaining);
      setLeft(calculateTimeLeft(remaining));
    } else {
      const storageKey = `countdown_start_${endTime}`;
      let storedStart = localStorage.getItem(storageKey);
      
      if (!storedStart) {
        storedStart = now.toString();
        localStorage.setItem(storageKey, storedStart);
      }
      
      const total = end - parseInt(storedStart, 10);
      setInitialMs(total);
      setTotalMs(remaining);
      setLeft(calculateTimeLeft(remaining));
    }
  }, [endTime, startTime]);

  useEffect(() => {
    if (totalMs <= 0) return;
    const t = setInterval(() => {
      const end = new Date(endTime).getTime();
      const ms = Math.max(0, end - new Date().getTime());
      setTotalMs(ms);
      setLeft(calculateTimeLeft(ms));
    }, 1000);
    return () => clearInterval(t);
  }, [endTime, totalMs]);

  const pct = initialMs > 0 ? (totalMs / initialMs) * 100 : 0;
  
  const size = 144;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="bg-card-dark border border-white/5 rounded-lg p-5 w-fit">
      <h3 className="text-slate-400 text-sm font-medium mb-3 text-center">REMAINING TIME</h3>
      
      <div className="flex flex-col items-center">
        {/* Relative container to stack SVG and text */}
        <div className="relative flex items-center justify-center w-36 h-36">
          
          {/* Circular SVG */}
          <svg
            className="absolute inset-0 transform -rotate-90"
            width={size}
            height={size}
          >
            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(250, 204, 21, 0.2)" /* Tailwind yellow-400/20 */
              strokeWidth={strokeWidth}
            />
            
            {/* Dynamic Progress Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#facc15" /* Tailwind yellow-400 */
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Center Text overlay */}
          <div className="relative flex flex-col items-center">
            <div className="text-2xl font-bold text-white tabular-nums">
              {String(left.h).padStart(2, "0")}:{String(left.m).padStart(2, "0")}:{String(left.s).padStart(2, "0")}
            </div>
            <div className="text-[10px] tracking-widest text-slate-500 mt-1">
              HOURS : MIN : SEC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}