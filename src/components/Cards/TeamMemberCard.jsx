"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./TeamMemberCard.module.css";
import fallbackImage from "../../assets/mascots/crt2.png";

const TeamMemberCard = ({ member }) => {
  const [imgSrc, setImgSrc] = useState("");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Try to determine the correct image path
    const possibleExtensions = ["png", "svg", "jpg", "jpeg", "webp"];
    const baseName = member.pic.split("/").pop().split(".")[0];

    // Function to check if image exists
    const checkImageExists = async (ext) => {
      const testPath = `/team/${baseName}.${ext}`;
      try {
        const response = await fetch(testPath, { method: "HEAD" });
        return response.ok;
      } catch {
        return false;
      }
    };

    // Find the first existing image
    const findValidImage = async () => {
      for (const ext of possibleExtensions) {
        const exists = await checkImageExists(ext);
        if (exists) {
          setImgSrc(`/team/${baseName}.${ext}`);
          return;
        }
      }
      // Fallback if no image found
      setImgSrc(fallbackImage.src);
      setImgError(true);
    };

    findValidImage();
  }, [member.pic]);

  const handleImageError = () => {
    setImgError(true);
    setImgSrc(fallbackImage.src);
  };

  return (
    <div className={styles.memberCardContainer}>
      <div className={styles.memberCardWrapper}>
        <div className={styles.memberCardInner}>
          <div className={styles.imageContainer}>
            {imgSrc && (
              <Image
                src={imgSrc}
                alt={member.name}
                className={styles.memberImage}
                onError={handleImageError}
                width={150}
                height={150}
                style={{ objectFit: "cover" }}
                unoptimized={imgError}
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
