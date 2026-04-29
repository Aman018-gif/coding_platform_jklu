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
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentClassDashboard from "./pages/StudentClassDashboard";
import ClassDetailsPage from "./pages/ClassDetailsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LabDetailsPage from "./pages/LabDetailsPage";


const API_BASE = "http://localhost:4000/api/v1";

const App = () => {
  const { setIsAuthenticated, setUser, setAuthLoading } = useContext(Context);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(`${API_BASE}/user/me`, { withCredentials: true });
        setUser(res.data.user);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        // Signal that the server check is done — ProtectedRoute can now act.
        setAuthLoading(false);
      }
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
          <Route path="/my-classes" element={<StudentClassDashboard />} />
          <Route path="/class/:id" element={<ClassDetailsPage />} />
          <Route path="/class/:classId/labs/:labId" element={<LabDetailsPage />} />


          {/* ── Role-protected routes ─────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ta-dashboard"
            element={
              <ProtectedRoute allowedRoles={["TA", "Teacher", "Admin"]}>
                <TADashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-contest"
            element={
              <ProtectedRoute allowedRoles={["TA", "Teacher", "Admin"]}>
                <CreateContestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-contest/:id"
            element={
              <ProtectedRoute allowedRoles={["TA", "Teacher", "Admin"]}>
                <ManageContestPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer theme="colored" />
      </Router>
    </>
  );
};

export default App;