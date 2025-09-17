"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Welcome.module.css";
import welcomeImage from "@/assets/graphics/welcome-component.webp";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import AOS from "aos";
import "aos/dist/aos.css";

const Welcome = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <section className={styles.welcomeSection}>
      <div className={styles.container}>
        {/* Left Text Section */}
        <div className={styles.textContainer} data-aos="fade-right">
          <h1 className={styles.mainHeading}>
            Welcome to <br />
            <span className={styles.highlight}>MRUHacks</span>
          </h1>
          <h2 className={styles.subHeading}>Build. Learn. Innovate.</h2>
          <p className={styles.eventDate}>
            October 4th - 5th, 2025 | Riddell Library
          </p>

          {/* Expandable Text Section */}
          <motion.p
            className={styles.description}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Looking for a hackathon experience like no other? Gather with up to
            150 innovators at the Riddell Library and Learning Centre. Whether
            you&apos;re a designer, developer, or tech enthusiast, you&apos;ll
            be part of a vibrant community ready to innovate and collaborate.
            Connect with experienced software engineers serving as industry
            mentors, dive into engaging hands-on workshops, and enjoy
            complimentary food throughout the event. Your experience comes first
            at MRUHacks–exciting activities, workshops, and plenty of
            opportunities to network with companies and other hackers.
          </motion.p>
        </div>

        {/* Right Side - Image & Full-Width Button */}
        <div className={styles.imageContainer} data-aos="fade-left">
          <Image
            src={welcomeImage}
            alt="Let's do it together!"
            className={clsx(styles.welcomeImage, "shadow-xl")}
            width={802}
            height={592}
            style={{
              width: "100%",
              height: "auto",
              maxWidth: "100%",
              objectFit: "cover",
            }}
            priority
          />
          <a href="#register" className={twMerge(styles.ctaButton, "group")}>
            <span className={styles.buttonText}>Apply Now</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
            <div className={styles.glareEffect}></div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
