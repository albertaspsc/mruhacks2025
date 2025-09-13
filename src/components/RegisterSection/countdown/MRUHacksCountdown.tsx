import { differenceInSeconds } from "date-fns";
import styles from "./MRUHacksCountdown.module.css";

// Target hackathon start date (October 4, 2025 @ 00:00 local time)
const HACKATHON_DATE = new Date(2025, 9, 4, 0, 0, 0);

function computeCountdown() {
  const now = new Date();
  const diff = differenceInSeconds(HACKATHON_DATE, now);
  if (diff <= 0) {
    return { weeks: 0, days: 0, hours: 0 };
  }

  const weeks = Math.floor(diff / (60 * 60 * 24 * 7));
  const remainingAfterWeeks = diff % (60 * 60 * 24 * 7);
  const days = Math.floor(remainingAfterWeeks / (60 * 60 * 24));
  const remainingAfterDays = remainingAfterWeeks % (60 * 60 * 24);
  const hours = Math.floor(remainingAfterDays / (60 * 60));
  return { weeks, days, hours };
}

export default function MRUHacksCountdown() {
  const { weeks, days, hours } = computeCountdown();
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
