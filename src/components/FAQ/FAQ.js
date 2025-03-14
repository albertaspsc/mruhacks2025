"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./FAQ.module.css";
import faqBackground from "../../assets/backgrounds/faq-background.png";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "What is a Hackathon?",
    answer:
      "A hackathon is best defined as a real-time science fair. Anyone with an interest in technology attends a hackathon to learn, build & share their creations over the course of a weekend, in a relaxed and welcoming atmosphere. You will bring your ideas to life through technology over the course of 24 hours before showcasing them to a team of judges.",
  },
  {
    question: "When is MRUHacks?",
    answer:
      "MRUHacks will be held from <strong>October 4th - 5th 2025</strong> in the Riddell Library and Learning Centre. More details will be released closer to the event..",
  },
  {
    question: "Who can participate?",
    answer:
      "MRUHacks is open to any and all post-secondary students! Graduated recently? No worries, you’re invited too!",
  },
  {
    question: "How many people can be on a team?",
    answer:
      "Hackers can form teams of up to five people. Team up with anyone regardless of degree, school, or experience level. Looking for a team? Come find one on our Discord.",
  },
  {
    question: "How much does it cost to participate?",
    answer:
      "Absolutely nothing! We will provide food for the duration of the event as well as swag items for hackers along the way.",
  },
  {
    question: "What if I've never hackathon'd before?",
    answer:
      "MRUHacks is open to everyone no matter their skill level. This is the place for you, whether you’re new to coding or a seasoned veteran. Still worried? Stay tuned for a series of workshops to help you brush up on your skills.",
  },
  {
    question: "When do applications open?",
    answer:
      "Pre-registration is open right now until April 4th! Visit mruhacks.ca to apply. Act fast, as we only have room for 150 this year!",
  },
  {
    question: "Why should I participate?",
    answer:
      "Attending MRUHacks gives you a platform to collaborate with like-minded individuals, learn new skills, and build a sweet project. It is a great opportunity to solve real-world problems, join a community of hackers, and win prizes.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const faqContainerRef = useRef(null); // Reference to FAQ section

  //  Ensure GSAP only applies animation when elements exist
  useEffect(() => {
    const updateLayout = () => {
      setIsSingleColumn(window.innerWidth <= 900);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    if (!faqContainerRef.current) return;

    const faqItems = faqContainerRef.current.querySelectorAll(".faqItem");
    if (faqItems.length > 0) {
      gsap.fromTo(
        faqItems,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          scrollTrigger: {
            trigger: faqContainerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
            once: true,
          },
        },
      );
    }
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      ref={faqContainerRef}
      className={styles.faqSection}
      style={{ backgroundImage: `url(${faqBackground.src})` }}
    >
      <div className={styles.container}>
        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          FAQ
        </motion.h2>

        <div className={styles.faqList}>
          {faqs
            .slice(0, isSingleColumn && !showAll ? 4 : faqs.length)
            .map((faq, index) => (
              <motion.div
                key={index}
                className={`${styles.faqItem} faqItem ${openIndex === index ? styles.open : ""}`}
                onClick={() => toggleFAQ(index)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className={styles.question}>
                  <span
                    className={styles.singleLine}
                    dangerouslySetInnerHTML={{ __html: faq.question }}
                  ></span>
                  <span className={styles.arrow}>
                    {openIndex === index ? "▲" : "▼"}
                  </span>
                </div>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.p
                      className={styles.answer}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
        </div>

        {isSingleColumn && (
          <motion.button
            className={`${styles.toggleButton} ${styles.glareEffectButton}`}
            onClick={() => setShowAll(!showAll)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showAll ? "Show Less ▲" : "Show More ▼"}
            <div className={styles.glareEffect}></div>
          </motion.button>
        )}
      </div>
    </section>
  );
};

export default FAQ;
