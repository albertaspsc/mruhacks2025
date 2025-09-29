"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import styles from "./Welcome.module.css";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import welcomeImage from "@/assets/graphics/welcome-component.webp";

const Welcome = () => {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <section className={styles.welcomeSection}>
      <div className={styles.container}>
        {/* Left Text Section - Slides in from left with fade effect */}
        <div
          className={`${styles.textContainer} ${
            !prefersReduced ? styles.textContainerAnimated : ""
          }`}
        >
          <h1 className={styles.mainHeading}>
            Welcome to <br />
            <span className={styles.highlight}>MRUHacks</span>
          </h1>
          <h2 className={styles.subHeading}>Build. Learn. Innovate.</h2>
          <p className={styles.eventDate}>
            October 4th - 5th, 2025 | Riddell Library
          </p>
          {/* Description - Slides up from bottom with fade effect */}
          <p
            className={`${styles.description} ${
              !prefersReduced ? styles.descriptionAnimated : ""
            }`}
          >
            Looking for a hackathon experience like no other? Gather with up to
            150 innovators at the Riddell Library and Learning Centre. Whether
            you&apos;re a designer, developer, or tech enthusiast, you&apos;ll
            be part of a vibrant community ready to innovate and collaborate.
            Connect with experienced software engineers serving as industry
            mentors, dive into engaging hands-on workshops, and enjoy
            complimentary food throughout the event. Your experience comes first
            at MRUHacks - exciting activities, workshops, and plenty of
            opportunities to network with companies and other hackers.
          </p>
        </div>

        {/* Right Side - Image & Full-Width Button - Slides in from right with fade effect */}
        <div
          className={`${styles.imageContainer} ${
            !prefersReduced ? styles.imageContainerAnimated : ""
          }`}
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
          <a href="/login-gateway" className={styles.ctaButton}>
            <span className={styles.buttonText}>Apply Now</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
            <div className={styles.glareEffect}></div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
