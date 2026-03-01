import React from "react";
import CountdownTimer from "./CountdownTimer";
import "./ContestSidebar.css";

export default function ContestSidebar({ contest }) {
  return (
    <div className="contest-sidebar">
      <div className="contest-sidebar__card">
        <h3 className="contest-sidebar__label">CURRENT RANK</h3>
        <div className="contest-sidebar__rank">#14</div>
        <p className="contest-sidebar__rank-change">+2 slots</p>
      </div>
      {contest?.end_time && <CountdownTimer endTime={contest.end_time} />}
      <div className="contest-sidebar__card">
        <h3 className="contest-sidebar__label contest-sidebar__label--icon">🔔 System Status</h3>
        <p className="contest-sidebar__status-text">
          Server performance is optimal. All judge clusters are running without delay. Last submission processed 2 mins ago.
        </p>
        <div className="contest-sidebar__badges">
          <span className="contest-sidebar__badge">JUDGING: 100%</span>
          <span className="contest-sidebar__badge">LATENCY: 12MS</span>
        </div>
      </div>
    </div>
  );
}
