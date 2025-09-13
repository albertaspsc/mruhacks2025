"use client";

import React, { useState, FunctionComponent, HTMLAttributes } from "react";
import Image from "next/image";
import styles from "./TeamMemberCard.module.css";
import fallbackImage from "@/assets/mascots/crt2.svg";

export type MemberData = {
  name: string;
  title: string;
  pic: string;
};

const TeamMemberCard: FunctionComponent<
  { member: MemberData } & HTMLAttributes<{}>
> = ({ member }) => {
  const [errored, setErrored] = useState(false);
  const primarySrc = `/team/${member.pic}`;
  const srcToUse = errored ? fallbackImage.src : primarySrc;
  const handleImageError = () => {
    if (!errored) {
      console.warn(`Falling back for team member image: ${member.pic}`);
      setErrored(true);
    }
  };

  return (
    <div className={styles.memberCardContainer}>
      <div className={styles.memberCardWrapper}>
        <div className={styles.memberCardInner}>
          <div className={styles.imageContainer}>
            <Image
              src={srcToUse}
              alt={member.name}
              className={styles.memberImage}
              onError={handleImageError}
              width={150}
              height={150}
              style={{ objectFit: "cover" }}
              key={`${member.name}-${member.pic}-${errored ? "fallback" : "primary"}`}
              priority={false}
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
