import React from "react";
import styles from "./Stats.module.scss";
import crt from "@/assets/mascots/crt.png";
import Image from "next/image";

export default function Stats() {
  const facts = `80+ Hackers;20+ Projects;24 Hours`;
  return (
    <div className={styles.container}>
      <h1>MRUHacks 2024 Stats:</h1>
      <div className={styles.stats}>
        {facts.split(";").map((x, i) => (
          <div className="stat" key={`statistic-${i}`} style={{ "--x": i + 1 }}>
            {x}
          </div>
        ))}
      </div>
      <span className={styles["big-stat"]}>
        <div>
          <Image src={crt} alt="CRT mascot" />
        </div>
        <span>
          72% of people registered have never joined a hackathon before!
        </span>
      </span>
    </div>
  );
}
