import React from "react";
import styles from "./Sponsor.module.scss";
import crt2 from "@/assets/mascots/crt2.png";
import Image from "next/image";
import acurve from "@/assets/sponsors/arcurve_logo_2024_color_large.webp";
import institute from "@/assets/sponsors/Institute.webp";
import library from "@/assets/sponsors/mrulibrary.webp";
import arrowIcon from "@/assets/icons/arrow_forward_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";

export default function Sponsor() {
  const sponsors = [
    { img: acurve, href: "https://www.arcurve.com" },
    {
      img: institute,
      href: "https://www.mtroyal.ca/ProgramsCourses/FacultiesSchoolsCentres/Business/Institutes/InstituteInnovationEntrepreneurship/index.htm",
    },
    { img: library, href: "https://library.mtroyal.ca" },
  ];
  return (
    <>
      <div className={styles.container}>
        <h1>Our Sponsors</h1>
        <p>MRUHacks would be impossible without our fantastic sponsors.</p>
        <div>
          {" "}
          <div className={styles.sponsors}>
            {sponsors.map(({ img, href }, i) => (
              <a key={`sponsor-img-${i}`} href={href}>
                <Image src={img} alt={`Sponsor ${i + 1} logo`} />
              </a>
            ))}
          </div>
        </div>
        <div className={styles["become-sponsor-container"]}>
          <a href="mailto:mramz980@mtroyal.ca">
            <span>Become a sponsor</span>
            <Image src={arrowIcon} alt="arrow left" />
          </a>
          <div className="crt">
            <Image src={crt2} alt="CRT tv mascot" />
          </div>
        </div>
      </div>
    </>
  );
}
