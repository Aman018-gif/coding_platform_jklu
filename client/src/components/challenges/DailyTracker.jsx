import React from "react";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function DailyTracker({ streak = 2 }) {
  const dayIndex = (new Date().getDay() + 6) % 7;
  const nextGoal = streak + 1;

  return (
    <div className="bg-card-dark border border-card-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Daily Tracker</h3>
        <span className="px-2.5 py-1 rounded-full bg-brand-yellow-muted text-brand-yellow text-xs font-medium">{streak} DAY STREAK</span>
      </div>
      <div className="flex justify-between gap-1 mb-4">
        {DAYS.map((day, i) => {
          const isDone = i < dayIndex;
          const isToday = i === dayIndex;
          return (
            <div
              key={day}
              className={`flex flex-col items-center gap-1 ${isDone ? "text-white/40" : isToday ? "text-brand-yellow" : "text-white/60"}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-transparent ${isDone ? "bg-brand-yellow-muted border-brand-yellow/50 text-brand-yellow" : isToday ? "border-brand-yellow" : "border-card-border"}`}>
                {isDone && (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium">{day}</span>
            </div>
          );
        })}
      </div>
      <p className="text-white/40 text-sm">
        Consistency is the currency of mastery. Solve one more today to hit {nextGoal} days!
      </p>
    </div>
  );
}
