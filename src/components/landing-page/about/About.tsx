"use client";

import Image from "next/image";
import styles from "./About.module.css";
import { usePrefersReducedMotion } from "@/components/hooks/use-prefers-reduced-motion";
import background from "@/assets/backgrounds/background.webp";
import aboutGraphic from "@/assets/graphics/about-component.webp";

export default function About() {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <section className={styles.aboutSection}>
      <Image
        src={background}
        alt="Decorative Background"
        className={styles.backgroundImage}
      />
      <div className={styles.container}>
        {/* Image wrapper - Slides in from left with fade and scale effect */}
        <div
          className={`${styles.imageWrapper} ${
            !prefersReduced ? styles.imageWrapperAnimated : ""
          }`}
        >
          <Image
            src={aboutGraphic}
            alt="MRUHacks Event Highlights"
            className={styles.aboutGraphic}
            quality={100}
          />
        </div>

        {/* Text content - Slides in from right with fade effect */}
        <div
          className={`${styles.textContent} ${
            !prefersReduced ? styles.textContentAnimated : ""
          }`}
        >
          <h2 className={styles.heading}>About the Competition</h2>
          <p className={styles.description}>
            MRUHacks is Mount Royal University&apos;s annual intercollegiate
            hackathon. Participants will work together in teams as large as 5
            members, developing projects that align with our themes over the
            course of 24 hours. Whether you&apos;re an adept coder or a curious
            beginner, MRUHacks invites you to join a diverse community of
            problem solvers, programmers, and builders this October.
          </p>
        </div>
      </div>
    </section>
  );
}
