"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./About.module.css";
import aboutGraphic from "@/assets/graphics/about-component.webp";

export default function AboutClient() {
  return (
    <div className={styles.container}>
      <motion.div
        className={styles.imageWrapper}
        initial={{ opacity: 0, x: -30, scale: 0.9 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.15 }} // amount ~ top 85% analogue
      >
        <Image
          src={aboutGraphic}
          alt="MRUHacks Event Highlights"
          className={`${styles.aboutGraphic} aboutGraphic`}
          quality={100}
        />
      </motion.div>

      <motion.div
        className={`${styles.textContent} textContent`}
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
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
      </motion.div>
    </div>
  );
}
