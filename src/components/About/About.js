"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./About.module.css";
import background from "@/assets/backgrounds/horizontal-bkg.png";
import aboutGraphic from "@/assets/graphics/about-component.png";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useEffect(() => {
    gsap.fromTo(
      ".aboutGraphic",
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".aboutGraphic",
          start: "top 85%",
          once: true, // Runs once for smoother effect
        },
      },
    );
  }, []);

  return (
    <section className={styles.aboutSection}>
      {/* Background Image */}
      <Image
        src={background}
        alt="Decorative Background"
        className={styles.backgroundImage}
        quality={100}
      />

      <div className={styles.container}>
        {/* Left Image */}
        <motion.div
          className={styles.imageWrapper}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <Image
            src={aboutGraphic}
            alt="MRUHacks Event Highlights"
            className={`${styles.aboutGraphic} aboutGraphic`}
            quality={100}
          />
        </motion.div>

        {/* Right Text Section - FIXED ANIMATION GLITCH */}
        <motion.div
          className={`${styles.textContent} textContent`}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }} // Ensures no flicker effect
        >
          <h2 className={styles.heading}>About the Competition</h2>
          <p className={styles.description}>
            <strong>
              Sunny Parmar, Matthew Hrehirchuk, and Jaunie Williams
            </strong>{" "}
            established <strong>MRUHacks</strong> in <strong>2023</strong> and
            organized the first event. They hosted one of the most{" "}
            <strong>successful pilot events</strong> in the history of{" "}
            <strong>Mount Royal Computing</strong>, attracting an impressive{" "}
            <strong>60 participants</strong>. This would set the stage for a
            series of <strong>spectacular events</strong>.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
