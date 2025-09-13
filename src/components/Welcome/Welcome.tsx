"use client";

import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { useEffect, useState, useRef, useCallback } from "react";
// framer-motion will be dynamically imported client-side to trim initial bundle
// import { motion, useReducedMotion } from "framer-motion";
import styles from "./Welcome.module.css";
import welcomeImage from "@/assets/graphics/welcome-component.webp";

// Reusable animation variants (will be passed once framer-motion is loaded)
const fadeRight = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
} as const;
const fadeLeft = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
} as const;

const Welcome = () => {
  const [motionLib, setMotionLib] = useState<
    null | typeof import("framer-motion")
  >(null);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const mounted = useRef(false);

  // Detect reduced motion manually (so we don't have to import framer-motion just for the hook)
  useEffect(() => {
    mounted.current = true;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPrefersReduced(mq.matches);
    apply();
    mq.addEventListener
      ? mq.addEventListener("change", apply)
      : mq.addListener(apply);
    return () => {
      mq.removeEventListener
        ? mq.removeEventListener("change", apply)
        : mq.removeListener(apply);
    };
  }, []);

  // Lazy load framer-motion only if user does NOT prefer reduced motion
  useEffect(() => {
    if (prefersReduced || motionLib) return;
    (async () => {
      const lib = await import("framer-motion");
      if (mounted.current) setMotionLib(lib);
    })();
  }, [prefersReduced, motionLib]);

  const MotionDiv =
    motionLib?.motion?.div ?? ((props: any) => <div {...props} />);
  const MotionP = motionLib?.motion?.p ?? ((props: any) => <p {...props} />);

  return (
    <section className={styles.welcomeSection}>
      <div className={styles.container}>
        {/* Left Text Section */}
        {prefersReduced || !motionLib ? (
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
          <MotionDiv
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
            <MotionP
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
            </MotionP>
          </MotionDiv>
        )}

        {/* Right Side - Image & Full-Width Button */}
        {prefersReduced || !motionLib ? (
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
            />
            <a href="/landing" className={styles.ctaButton}>
              <span className={styles.buttonText}>Apply Now</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
              <div className={styles.glareEffect}></div>
            </a>
          </div>
        ) : (
          <MotionDiv
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
            />
            <a href="/landing" className={styles.ctaButton}>
              <span className={styles.buttonText}>Apply Now</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
              <div className={styles.glareEffect}></div>
            </a>
          </MotionDiv>
        )}
      </div>
    </section>
  );
};

export default Welcome;
