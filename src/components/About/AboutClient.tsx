"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./About.module.css";
import aboutGraphic from "@/assets/graphics/about-component.webp";

export default function AboutClient() {
  // Refs to track DOM elements for intersection observation
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create intersection observer to trigger animations when elements come into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When element becomes visible, add the 'animate' class to trigger CSS animation
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.animate);
          }
        });
      },
      { threshold: 0.15 }, // Trigger when 15% of the element is visible
    );

    // Start observing both elements for scroll-triggered animations
    if (imageRef.current) observer.observe(imageRef.current);
    if (textRef.current) observer.observe(textRef.current);

    // Cleanup: disconnect observer when component unmounts
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.container}>
      {/* Image wrapper with CSS animation classes - starts hidden and animates in from left */}
      <div
        ref={imageRef}
        className={`${styles.imageWrapper} ${styles.imageWrapperAnimate}`}
      >
        <Image
          src={aboutGraphic}
          alt="MRUHacks Event Highlights"
          className={`${styles.aboutGraphic} aboutGraphic`}
          quality={100}
        />
      </div>

      {/* Text content with CSS animation classes - starts hidden and animates in from right */}
      <div
        ref={textRef}
        className={`${styles.textContent} ${styles.textContentAnimate} textContent`}
      >
        <h2 className={styles.heading}>About the Competition</h2>
        <p className={styles.description}>
          MRUHacks is Mount Royal University&apos;s annual intercollegiate
          hackathon. Participants will work together in teams as large as 5
          members, developing projects that align with our themes over the
          course of 24 hours. Whether you&apos;re an adept coder or a curious
          beginner, MRUHacks invites you to join a diverse community of problem
          solvers, programmers, and builders this October.
        </p>
      </div>
    </div>
  );
}
