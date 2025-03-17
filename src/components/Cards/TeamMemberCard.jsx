"use client";

import React from "react";
import styles from "./TeamMemberCard.module.css";

const TeamMemberCard = ({ member }) => {
  return (
    <div className={styles.memberCardContainer}>
      <div className={styles.memberCardWrapper}>
        <div className={styles.memberCardInner}>
          <div className={styles.imageContainer}>
            <img
              src={`/team/${member.pic.split("/").pop()}`}
              alt={member.name}
              className={styles.memberImage}
              onError={(e) => {
                e.target.src = "../../assets/mascots/crt2.png"; // Fallback image
              }}
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
