"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./TeamMemberCard.module.css";
import fallbackImage from "../../assets/mascots/crt2.png"; // Fallback image

const TeamMemberCard = ({ member }) => {
  const [imgSrc, setImgSrc] = useState(`/team/${member.pic.split("/").pop()}`);
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    setImgError(true);
    setImgSrc(fallbackImage.src); // Use the imported image's src property
  };

  return (
    <div className={styles.memberCardContainer}>
      <div className={styles.memberCardWrapper}>
        <div className={styles.memberCardInner}>
          <div className={styles.imageContainer}>
            <Image
              src={imgSrc}
              alt={member.name}
              className={styles.memberImage}
              onError={handleImageError}
              width={150}
              height={150}
              style={{ objectFit: "cover" }}
              unoptimized={imgError} // Skips optimization for fallback image
            />
          </div>
        </div>
      </div>

      {/* Text outside the card */}
      <div className={styles.textContainer}>
        <p className={styles.memberName}>{member.name}</p>
        <p className={styles.memberTitle}>{member.title}</p>
      </div>
    </div>
  );
};

export default TeamMemberCard;
