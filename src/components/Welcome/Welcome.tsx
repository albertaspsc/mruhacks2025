"use client";

import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./Welcome.module.css";
import welcomeImage from "@/assets/graphics/welcome-component.webp";

// Reusable animation variants (viewport-triggered)
const fadeRight = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};

const fadeLeft = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

const Welcome = () => {
  // Respect user reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={styles.welcomeSection}>
      <div className={styles.container}>
        {/* Left Text Section */}
        {prefersReducedMotion ? (
          <div className={styles.textContainer}>
            <h1 className={styles.mainHeading}>
              Welcome to <br />
              <span className={styles.highlight}>MRUHacks</span>
            </h1>
            <h2 className={styles.subHeading}>Build. Learn. Innovate.</h2>
            <p className={styles.eventDate}>
              October 4th - 5th, 2025 | Riddell Library
            </p>
            <p className={styles.description}>
              Looking for a hackathon experience like no other? Gather with up
              to 150 innovators at the Riddell Library and Learning Centre.
              Whether you&apos;re a designer, developer, or tech enthusiast,
              you&apos;ll be part of a vibrant community ready to innovate and
              collaborate. Connect with experienced software engineers serving
              as industry mentors, dive into engaging hands-on workshops, and
              enjoy complimentary food throughout the event. Your experience
              comes first at MRUHacks–exciting activities, workshops, and plenty
              of opportunities to network with companies and other hackers.
            </p>
          </div>
        ) : (
          <motion.div
            className={styles.textContainer}
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.15, ease: "easeOut", delay: 0.3 }}
          >
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
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, ease: "easeOut", delay: 0.65 }}
            >
              Looking for a hackathon experience like no other? Gather with up
              to 150 innovators at the Riddell Library and Learning Centre.
              Whether you&apos;re a designer, developer, or tech enthusiast,
              you&apos;ll be part of a vibrant community ready to innovate and
              collaborate. Connect with experienced software engineers serving
              as industry mentors, dive into engaging hands-on workshops, and
              enjoy complimentary food throughout the event. Your experience
              comes first at MRUHacks–exciting activities, workshops, and plenty
              of opportunities to network with companies and other hackers.
            </motion.p>
          </motion.div>
        )}

        {/* Right Side - Image & Full-Width Button */}
        {prefersReducedMotion ? (
          <div className={styles.imageContainer}>
            <Image
              src={welcomeImage}
              alt="Let's do it together!"
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
            <a href="/landing" className={styles.ctaButton}>
              <span className={styles.buttonText}>Apply Now</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
              <div className={styles.glareEffect}></div>
            </a>
          </div>
        ) : (
          <motion.div
            className={styles.imageContainer}
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.15, ease: "easeOut", delay: 0.45 }}
          >
            <Image
              src={welcomeImage}
              alt="Let's do it together!"
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
            <a href="/landing" className={styles.ctaButton}>
              <span className={styles.buttonText}>Apply Now</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
              <div className={styles.glareEffect}></div>
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Welcome;
