import React from "react";
import styles from "./Sponsor.module.scss";
import crt2 from "@/assets/mascots/crt2.png";
import Image from "next/image";
import acurve from "@/assets/sponsors/arcurve_logo_2024_color_large.webp";
import institute from "@/assets/sponsors/Institute.webp";
import library from "@/assets/sponsors/mrulibrary.webp";
import arrowIcon from "@/assets/icons/arrow_forward_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";

export default function Sponsor() {
  return (
    <>
      <div className={styles.container}>
        <h1>Our Sponsors</h1>
        <p>MRUHacks would be impossible without our fantastic sponsors.</p>
        <div>
          {" "}
          <div className={styles.sponsors}>
            {[acurve, institute, library].map((x, i) => (
              <a key={`sponsor-img-${i}`} href="https://example.com/">
                <Image src={x} alt={`Sponsor ${i + 1} logo`} />
              </a>
            ))}
          </div>
        </div>
        <div className={styles["become-sponsor-container"]}>
          <a href="https://example.com/">
            <span>Become a sponsor</span>
            <Image src={arrowIcon} />
          </a>
          <div className="crt">
            <Image src={crt2} alt="CRT tv mascot" />
          </div>
        </div>
      </div>
    </>
  );
}
