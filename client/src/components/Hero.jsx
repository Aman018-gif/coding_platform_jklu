import React, { useContext } from "react";
import "../styles/Hero.css";
import heroImage from "../assets/img1.png";
import { Context } from "../main";

const Hero = () => {
  const { user } = useContext(Context);
  return (
    <>
      <div className="hero-section">
        <img src={heroImage} alt="hero-image" />
        <h4>Hello, {user ? user.name : "Developer"}</h4>
        <h1>Welcome to JKLU CODING HOUR PLATFORM </h1>      
        <p>
          Welcome to JKLU Coding Hour Platform — a space where innovation meets logic. Designed to help students strengthen their programming skills, solve real-world problems, and build confidence through practice, our platform empowers future developers to learn, compete, and grow together. Start coding, start building, and shape your future today.
        </p>
      </div>
    </>
  );
};

export default Hero;
