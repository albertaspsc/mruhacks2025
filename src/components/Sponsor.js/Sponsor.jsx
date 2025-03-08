import React from "react";
import styles from "./Sponsor.module.scss";
import crt2 from "../../assets/mascots/crt2.png";
import Image from "next/image";
import acurve from "../../assets/sponsors/arcurve_logo_2024_color_large.webp";
import institute from "../../assets/sponsors/Institute.webp";
import library from "../../assets/sponsors/mrulibrary.webp";

export default function Sponsor() {
  return (
    <>
      <div className={styles.container}>
        <h1>Our Sponsors</h1>
        <p>MRUHacks would be impossible without our fantastic sponsors.</p>
        <div className={styles.sponsors}>
          {[acurve, institute, library].map((x, i) => (
            <Image
              src={x}
              key={`sponsor-img-${i}`}
              alt={`Sponsor ${i + 1} logo`}
            />
          ))}
        </div>
        <div className={styles["become-sponsor-container"]}>
          <button>
            Become a sponsor
            {/* TODO add icon */}
          </button>
          <div className="crt">
            <Image src={crt2} alt="CRT tv mascot" />
          </div>
        </div>
      </div>
    </>
  );
}
