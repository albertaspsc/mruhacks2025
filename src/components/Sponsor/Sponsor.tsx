"use client";

import React from "react";
import styles from "./Sponsor.module.scss";
import crt2 from "../../assets/mascots/crt2.svg";
import Image from "next/image";
import acurve from "../../assets/sponsors/arcurve_logo_2024_color_large.webp";
import institute from "../../assets/sponsors/Institute.webp";
import library from "../../assets/sponsors/mrulibrary.webp";
import adx from "../../assets/sponsors/adx_logo.webp";
import cnrl from "../../assets/sponsors/canadian_natural.webp";
import village from "../../assets/sponsors/village_icecream.webp";

interface SponsorItem {
  img: any;
  href: string;
}

export default function Sponsor() {
  const sponsorFormLink: string =
    "https://docs.google.com/forms/d/e/1FAIpQLSdLJibHIC662j9-rTOG31qJ8iaTBgSk-Rk3LXAD0l9TL7MYpQ/viewform?usp=header";

  const sponsors: SponsorItem[] = [
    { img: acurve, href: "https://www.arcurve.com" },
    {
      img: institute,
      href: "https://www.mtroyal.ca/ProgramsCourses/FacultiesSchoolsCentres/Business/Institutes/InstituteInnovationEntrepreneurship/index.htm",
    },
    { img: library, href: "https://library.mtroyal.ca" },

    {
      img: adx,
      href: "https://www.abdiamond.ca/?gad_source=1&gad_campaignid=21486602802&gbraid=0AAAAAocBOJOMK1uXMlxXqUi7Ec0sjwsCv&gclid=CjwKCAjw4efDBhATEiwAaDBpbnF6Hno1EYFTfi94tso6NuHseNyx1TkGy1qJ4buIIP-2VS2SPyi6uxoCLN0QAvD_BwE",
    },
    { img: cnrl, href: "https://www.cnrl.com/" },
    { img: village, href: "https://villageicecream.com/" },
  ];

  return (
    <div className={styles.container}>
      <h1>Our Sponsors</h1>
      <p>MRUHacks would be impossible without our fantastic sponsors.</p>

      <div className={styles.sponsors}>
        {sponsors.map(({ img, href }, i: number) => (
          <a
            key={`sponsor-img-${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src={img} alt={`Sponsor ${i + 1} logo`} />
          </a>
        ))}
      </div>

      <div className={styles["become-sponsor-container"]}>
        <a href={sponsorFormLink} target="_blank" rel="noopener noreferrer">
          <span>Become a sponsor</span>
          <span style={{ marginLeft: "8px" }}>→</span>
        </a>
        <div className="crt">
          <Image src={crt2} alt="CRT tv mascot" />
        </div>
      </div>
    </div>
  );
}
