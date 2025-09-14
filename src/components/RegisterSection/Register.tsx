"use client";

import Image from "next/image";
import React from "react";
import styles from "./Register.module.css";
import logo from "@/assets/logos/black-white-logo.svg";
import MRUHacksCountdown from "./countdown/MRUHacksCountdown";
import { GradientBackground } from "./background/GradientBackground";

const RegisterSection = () => {
  return (
    <section id="register" className={styles.registerSection}>
      <div className={styles.backgroundContainer}>
        <GradientBackground />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.logoContainer}>
          <Image
            src={logo}
            alt="MRU Hackathon Logo"
            priority={true}
            className={styles.logo}
          />
        </div>

        <div className={styles.dateContainer}>
          <p className={styles.dateText}>October 4 - 5, 2025</p>
        </div>

        <div className={styles.buttonContainer}>
          <a href="/landing" className={styles.registerButton}>
            Register Now
          </a>
        </div>

        <div className={styles.contentContainer}>
          <MRUHacksCountdown />
        </div>
      </div>
    </section>
  );
};

export default RegisterSection;
