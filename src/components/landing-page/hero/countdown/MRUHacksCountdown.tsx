import { useMemo } from "react";
import styles from "./MRUHacksCountdown.module.css";

// Target hackathon start date (October 4, 2025 @ 00:00 local time)
const HACKATHON_DATE = new Date(2025, 9, 4, 0, 0, 0);

// Constants for time calculations (avoid repeated calculations)
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;
const SECONDS_IN_WEEK = SECONDS_IN_DAY * 7;

function computeCountdown() {
  const now = new Date();
  const diff = Math.floor((HACKATHON_DATE.getTime() - now.getTime()) / 1000);

  if (diff <= 0) {
    return { weeks: 0, days: 0, hours: 0 };
  }

  const weeks = Math.floor(diff / SECONDS_IN_WEEK);
  const remainingAfterWeeks = diff % SECONDS_IN_WEEK;
  const days = Math.floor(remainingAfterWeeks / SECONDS_IN_DAY);
  const remainingAfterDays = remainingAfterWeeks % SECONDS_IN_DAY;
  const hours = Math.floor(remainingAfterDays / SECONDS_IN_HOUR);

  return { weeks, days, hours };
}

export default function MRUHacksCountdown() {
  const { weeks, days, hours } = useMemo(() => computeCountdown(), []);
  return (
    <div className={styles.hackathonCountdown}>
      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <div className={styles.countdownValue}>{weeks}</div>
          <div className={styles.countdownUnit}>Weeks</div>
        </div>
        <div className={styles.separator}>:</div>
        <div className={styles.card}>
          <div className={styles.countdownValue}>{days}</div>
          <div className={styles.countdownUnit}>Days</div>
        </div>
        <div className={styles.separator}>:</div>
        <div className={styles.card}>
          <div className={styles.countdownValue}>{hours}</div>
          <div className={styles.countdownUnit}>Hours</div>
        </div>
      </div>
    </div>
  );
}
