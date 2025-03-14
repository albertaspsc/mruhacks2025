"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./FAQ.module.css";
import faqBackground from "@/assets/backgrounds/faq-background.png";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "What is a Hackathon?",
    answer:
      "A <strong>hackathon</strong> is an <strong>invention marathon</strong> where participants <strong>collaborate</strong> to create <strong>tech-based solutions</strong> over a short period.",
  },
  {
    question: "When is MRUHacks?",
    answer:
      "MRUHacks will be held from <strong>October 5th - 6th, 2024</strong>, at the <strong>Riddell Library and Learning Centre</strong>.",
  },
  {
    question: "Who can participate?",
    answer:
      "MRUHacks is <strong>open to all post-secondary students</strong> and <strong>recent graduates</strong>. Attendees must be <strong>18 years or older</strong>.",
  },
  {
    question: "How many people can be on a team?",
    answer:
      "Teams can have <strong>up to five members</strong>. Participants can form teams <strong>on Discord</strong> or at the event.",
  },
  {
    question: "How much does it cost to participate?",
    answer:
      "Participation is <strong>free</strong>, and we provide <strong>food and goodies</strong> for all hackers.",
  },
  {
    question: "What if I've never hackathon'd before?",
    answer:
      "No experience? <strong>No problem!</strong> We offer <strong>beginner-friendly workshops</strong> and <strong>mentorship</strong> throughout the event.",
  },
  {
    question: "When do applications open?",
    answer:
      "Applications are <strong>open now</strong> at <strong>mruhacks.ca</strong>. Spaces are <strong>limited</strong>, so apply <strong>soon</strong>!",
  },
  {
    question: "Why should I participate?",
    answer:
      "MRUHacks is an opportunity to <strong>learn new skills, work with industry mentors</strong>, and <strong>build innovative projects</strong>.",
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
