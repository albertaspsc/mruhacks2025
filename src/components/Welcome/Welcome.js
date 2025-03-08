"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Welcome.module.css";
import welcomeImage from "@/assets/graphics/welcome-component.png";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import AOS from "aos";
import "aos/dist/aos.css";

const Welcome = () => {
  const [isExpanded, setIsExpanded] = useState(false);

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
            Join <strong>150+ innovators</strong> at the{" "}
            <strong>Riddell Library and Learning Centre</strong>
            on <strong>October 4th-5th</strong> for an{" "}
            <strong>unforgettable hackathon experience</strong>. Whether
            you&apos;re a designer, developer, or tech enthusiast,{" "}
            {!isExpanded ? (
              <>
                you&apos;ll be part of a vibrant...
                <button
                  className={styles.readMoreButton}
                  onClick={() => setIsExpanded(true)}
                >
                  Read More
                </button>
              </>
            ) : (
              <>
                you&apos;ll be part of a vibrant community eager to innovate,
                collaborate, and create. Connect with{" "}
                <strong>
                  industry leaders, top developers, and experienced software
                  engineers
                </strong>
                through hands-on workshops and exciting challenges. Get ready
                for a <strong>high-energy</strong>
                event where you&apos;ll{" "}
                <strong>build something incredible</strong> in just{" "}
                <strong>24 hours</strong>. Enjoy complimentary food, networking
                opportunities, and develop real-world projects with mentors
                guiding you along the way.
                <button
                  className={styles.readMoreButton}
                  onClick={() => setIsExpanded(false)}
                >
                  Read Less
                </button>
              </>
            )}
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
            <span>Apply Now</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
            <div className={styles.glareEffect}></div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
