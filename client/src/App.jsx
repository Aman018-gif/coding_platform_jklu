import React, { useContext, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ContestsListPage from "./pages/ContestsListPage";
import ContestPage from "./pages/ContestPage";
import ProblemPage from "./pages/ProblemPage";
import PracticePage from "./pages/PracticePage";
import ChallengesPage from "./pages/ChallengesPage";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ContestArchivePage from "./pages/ContestArchivePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Context } from "./main";
import OtpVerification from "./pages/OtpVerification";
import CreateContestPage from "./pages/CreateContestPage";
import TADashboard from "./pages/TADashboard";
import ManageContestPage from "./pages/ManageContestPage";
import ProfilePage from "./pages/ProfilePage";

const API_BASE = "http://localhost:4000/api/v1";

const App = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);

  useEffect(() => {
    const getUser = async () => {
      await axios
        .get(`${API_BASE}/user/me`, { withCredentials: true })
        .then((res) => {
          setUser(res.data.user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          setUser(null);
          setIsAuthenticated(false);
        });
    };
    getUser();
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contests" element={<ContestsListPage />} />
          <Route path="/contests/:id" element={<ContestPage />} />
          <Route path="/problems/:id" element={<ProblemPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/otp-verification/:email"
            element={<OtpVerification />}
          />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<ResetPassword />} />
          <Route path="/contests/archive" element={<ContestArchivePage />} />
          <Route path="/ta-dashboard" element={<TADashboard />} />
          <Route path="/manage-contest/:id" element={<ManageContestPage />} />
          <Route path="/create-contest" element={<CreateContestPage />} />
        </Routes>
        <ToastContainer theme="colored" />
      </Router>
    </>
  );
};

export default App;
