"use client";
import React from "react";
import Image from "next/image";
import styles from "./Register.module.css";
import logo from "@/assets/logos/black-white-logo.png";
import DynamicGradientBackground from "./DynamicGradientBackground";

const RegisterSection = () => {
  return (
    <section id="register" className={styles.registerSection}>
      <div className={styles.backgroundContainer}>
        <DynamicGradientBackground />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.logoContainer}>
          <Image
            src={logo}
            alt="MRU Hackathon Logo"
            priority
            className={styles.logo}
          />
        </div>
        <div className={styles.buttonContainer}>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSehivEoIQAcrrFkfs0sM6_hHIN1kW1oXcAoTtbwG3kw_7JCng/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.registerButton}
          >
            Pre-Register Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default RegisterSection;
