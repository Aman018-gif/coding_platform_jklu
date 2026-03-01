import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../main";
import api from "../api/client";
import Navbar from "../layout/Navbar";
import ActiveNowHero from "../components/dashboard/ActiveNowHero";
import DailyTracker from "../components/dashboard/DailyTracker";
import PickAChallenge from "../components/dashboard/PickAChallenge";
import ChallengeRules from "../components/dashboard/ChallengeRules";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { isAuthenticated } = useContext(Context);
  const [activeContest, setActiveContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loadingContest, setLoadingContest] = useState(true);
  const [loadingProblems, setLoadingProblems] = useState(true);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const { data } = await api.get("/contests/active");
        setActiveContest(data.contest);
      } catch {
        setActiveContest(null);
      } finally {
        setLoadingContest(false);
      }
    };
    fetchActive();
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await api.get("/problems");
        setProblems(data.problems || []);
      } catch {
        setProblems([]);
      } finally {
        setLoadingProblems(false);
      }
    };
    fetchProblems();
  }, []);

  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-page__main">
        <h1 className="dashboard-page__title">
          Coding <span>Challenges</span>
        </h1>
        <p className="dashboard-page__subtitle">
          Master your craft, one line at a time. Compete with the best and level up your coding skills.
        </p>

        <div className="dashboard-page__grid-2">
          <div>
            <ActiveNowHero contest={activeContest} loading={loadingContest} />
          </div>
          <div>
            <DailyTracker streak={2} />
          </div>
        </div>

        <div className="dashboard-page__grid-3">
          <div>
            <div className="dashboard-page__section-head">
              <h3 className="dashboard-page__section-title">Achievements</h3>
              <button type="button" className="dashboard-page__section-link">View All</button>
            </div>
            <div className="dashboard-page__achievements">
              <div className="dashboard-page__achievement" title="Alpha">🥇</div>
              <div className="dashboard-page__achievement" title="Fast-Pace">⏱</div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="dashboard-page__achievement dashboard-page__achievement--locked" title="Locked">🔒</div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="dashboard-page__section-title">Recent Activity</h3>
            <ul className="dashboard-page__activity-list">
              <li>Solved: Binary Search Refactoring — +120 XP</li>
              <li>Earned Badge: Code Ninja — 2h ago</li>
              <li>Resumed Challenge: Heap Sort — 5h ago</li>
            </ul>
          </div>
        </div>

        <div className="dashboard-page__grid-4">
          <div>
            <PickAChallenge problems={problems} loading={loadingProblems} />
          </div>
          <div>
            <ChallengeRules />
          </div>
        </div>
      </main>
    </div>
  );
}
