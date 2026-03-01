import React, { useEffect, useState } from "react";
import "./CountdownTimer.css";

export default function CountdownTimer({ endTime }) {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });
  const [totalMs, setTotalMs] = useState(0);
  const [initialMs, setInitialMs] = useState(0);

  useEffect(() => {
    const end = new Date(endTime);
    const total = end - new Date();
    setInitialMs(Math.max(0, total));
    setTotalMs(Math.max(0, total));
  }, [endTime]);

  useEffect(() => {
    if (totalMs <= 0) return;
    const t = setInterval(() => {
      const end = new Date(endTime);
      const ms = Math.max(0, end - new Date());
      setTotalMs(ms);
      setLeft({
        h: Math.floor(ms / (1000 * 60 * 60)),
        m: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((ms % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(t);
  }, [endTime, totalMs]);

  const pct = initialMs > 0 ? (totalMs / initialMs) * 100 : 0;

  return (
    <div className="countdown-timer">
      <h3 className="countdown-timer__label">REMAINING TIME</h3>
      <div className="countdown-timer__content">
        <div className="countdown-timer__circle">
          <div className="countdown-timer__time">
            {String(left.h).padStart(2, "0")}:{String(left.m).padStart(2, "0")}:{String(left.s).padStart(2, "0")}
          </div>
          <div className="countdown-timer__hint">HOURS : MIN : SEC</div>
        </div>
        <div className="countdown-timer__bar-wrap">
          <div className="countdown-timer__bar" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
