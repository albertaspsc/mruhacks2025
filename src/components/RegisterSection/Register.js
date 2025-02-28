"use client";
import React from "react";
import Image from "next/image";
import styles from "./Register.module.css";
import logo from "@/assets/logos/black-white-logo.png";

const RegisterSection = () => {
  return (
    <section id="register" className={styles.registerSection}>
      <div className={styles.backgroundContainer}>
        {/* Background image is set via CSS */}
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
            href="https://forms.gle/YourRegistrationFormLink"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.registerButton}
          >
            Register Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default RegisterSection;
