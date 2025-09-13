import styles from "./Stats.module.scss";
import crt from "@/assets/mascots/crt.svg";
import statBackground from "@/assets/backgrounds/background.webp";
import Image from "next/image";

export default function Stats() {
  const facts = [
    { number: "80+", text: "Hackers" },
    { number: "1000+", text: "Lines of Code" },
    { number: "20+", text: "Projects" },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.statsHeader}>MRUHacks 2024 Stats:</h1>
      <div className={styles.stats}>
        {facts.map((fact, i) => (
          <div
            className={styles.stat}
            key={`statistic-${i}`}
            style={{ "--x": i + 1 } as React.CSSProperties}
          >
            <Image
              src={statBackground}
              alt=""
              fill
              className={styles.bgImage}
              sizes="(max-width: 600px) 130px, 200px"
            />
            <span className={styles.number}>{fact.number}</span>
            <span className={styles.text}>{fact.text}</span>
          </div>
        ))}
      </div>
      <span className={styles["big-stat"]}>
        <div className={styles.crt}>
          <Image src={crt} alt="CRT mascot" />
        </div>
        <span>
          72% of people registered had never joined a hackathon before!
        </span>
      </span>
    </div>
  );
}
