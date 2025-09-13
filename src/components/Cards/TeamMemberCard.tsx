"use client";

import React, {
  useState,
  useEffect,
  FunctionComponent,
  HTMLAttributes,
} from "react";
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
  const [imgSrc, setImgSrc] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset state when member changes
    setIsLoading(true);

    // Use the filename directly from the member data
    const imagePath = `/team/${member.pic}`;

    // Set the image source directly
    setImgSrc(imagePath);
    setIsLoading(false);
  }, [member]);

  const handleImageError = () => {
    console.log(`Failed to load image for ${member.name}: ${member.pic}`);
    setImgSrc(fallbackImage.src);
  };

  return (
    <div className={styles.memberCardContainer}>
      <div className={styles.memberCardWrapper}>
        <div className={styles.memberCardInner}>
          <div className={styles.imageContainer}>
            {!isLoading && (
              <Image
                src={imgSrc}
                alt={member.name}
                className={styles.memberImage}
                onError={handleImageError}
                width={150}
                height={150}
                style={{ objectFit: "cover" }}
                key={`${member.name}-${member.pic}`} // Include pic in key for better uniqueness
              />
            )}
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
