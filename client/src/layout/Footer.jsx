import React from "react";
import "../styles/Footer.css";
import { Link } from "react-router-dom";
import fb from "../assets/fb.png";
import yt from "../assets/yt.png";
import git from "../assets/git.png";
import linkedin from "../assets/linkedin.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>CODING HOUR</h2>
          <p>HERE PLACE FOOTER.</p>
        </div>
      
          </div>
      <div className="footer-bottom">
        <p> All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
