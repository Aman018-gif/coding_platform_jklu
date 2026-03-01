import React from "react";
import "./DailyTracker.css";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function DailyTracker({ streak = 2 }) {
  const dayIndex = (new Date().getDay() + 6) % 7;
  const nextGoal = streak + 1;

  return (
    <div className="daily-tracker">
      <div className="daily-tracker__head">
        <h3 className="daily-tracker__title">Daily Tracker</h3>
        <span className="daily-tracker__streak">{streak} DAY STREAK</span>
      </div>
      <div className="daily-tracker__days">
        {DAYS.map((day, i) => {
          const isDone = i < dayIndex;
          const isToday = i === dayIndex;
          return (
            <div
              key={day}
              className={`daily-tracker__day ${isDone ? "daily-tracker__day--done" : ""} ${isToday ? "daily-tracker__day--today" : ""}`}
            >
              <div className="daily-tracker__circle">
                {isDone && (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="daily-tracker__day-label">{day}</span>
            </div>
          );
        })}
      </div>
      <p className="daily-tracker__hint">
        Consistency is the currency of mastery. Solve one more today to hit {nextGoal} days!
      </p>
    </div>
  );
}
