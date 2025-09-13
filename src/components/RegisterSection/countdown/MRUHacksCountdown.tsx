"use client";
import React, { useState, useEffect } from "react";
import { differenceInSeconds, format } from "date-fns";
import styles from "./MRUHacksCountdown.module.css";

const MRUHacksCountdown = () => {
  // Date - October 4, 2025
  const hackathonDate = new Date(2025, 9, 4, 0, 0, 0); // months are 0-indexed in JavaScript (9 = October)

  const [countdownTimer, setCountdownTimer] = useState({
    weeks: 0,
    days: 0,
    hours: 0,
  });

  useEffect(() => {
    // Update the countdown every hour
    const timer = setInterval(() => updateCountdown(), 1000 * 60 * 60);

    // Initial update
    updateCountdown();

    // Clean up on unmount
    return () => clearInterval(timer);
  }, []);

  const updateCountdown = () => {
    const now = new Date();
    const diff = differenceInSeconds(hackathonDate, now);

    if (diff > 0) {
      // Calculate weeks, days, and hours
      const weeks = Math.floor(diff / (60 * 60 * 24 * 7));
      const days = Math.floor((diff % (60 * 60 * 24 * 7)) / (60 * 60 * 24));
      const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));

      setCountdownTimer({ weeks, days, hours });
    } else {
      // Hackathon has started
      setCountdownTimer({ weeks: 0, days: 0, hours: 0 });
    }
  };

  // Format the date nicely
  const formattedDate = format(hackathonDate, "EEEE, MMMM do, yyyy");

  return (
    <div className={styles.hackathonCountdown}>
      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <div className={styles.countdownValue}>{countdownTimer.weeks}</div>
          <div className={styles.countdownUnit}>Weeks</div>
        </div>
        <div className={styles.separator}>:</div>
        <div className={styles.card}>
          <div className={styles.countdownValue}>{countdownTimer.days}</div>
          <div className={styles.countdownUnit}>Days</div>
        </div>
        <div className={styles.separator}>:</div>
        <div className={styles.card}>
          <div className={styles.countdownValue}>{countdownTimer.hours}</div>
          <div className={styles.countdownUnit}>Hours</div>
        </div>
      </div>
    </div>
  );
};

export default MRUHacksCountdown;
