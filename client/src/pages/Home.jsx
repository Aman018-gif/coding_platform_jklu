import React, { useContext } from "react";
import Hero from "../components/Hero";
import Technologies from "../components/Technologies";
import "../styles/Home.css";
import { toast } from "react-toastify";
import api from "../api/client";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import Footer from "../layout/Footer";
import Navbar from "../layout/Navbar";

const Home = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);

  const logout = async () => {
    try {
      const res = await api.get("/user/logout");
      toast.success(res.data.message);
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/auth"} />;
  }

  return (
    <>
      <Navbar />
      <section className="home">
        <Hero />
        <Technologies />
        <Footer />
        <button onClick={logout}>Logout</button>
      </section>
    </>
  );
};

export default Home;
