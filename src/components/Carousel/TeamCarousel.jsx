"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DotButton, useDotButton } from "./CarouselDotButtons";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "./CarouselArrowButtons";
import Autoplay from "embla-carousel-autoplay";
import useCarousel from "embla-carousel-react";
import TeamMemberCard from "../Cards/TeamMemberCard";
import styles from "./carousel.module.css";

const TeamCarousel = (props) => {
  const { teamData = [], options = { loop: true, align: "start" } } = props;
  const [carouselRef, carouselApi] = useCarousel(options, [Autoplay()]);
  const [screenSize, setScreenSize] = useState("desktop");

  // Update screen size state based on viewport width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1025) {
        setScreenSize("desktop");
      } else if (window.innerWidth >= 769) {
        setScreenSize("tablet");
      } else {
        setScreenSize("mobile");
      }
    };

    // Initial setup
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onNavButtonClick = useCallback((carouselApi) => {
    const autoplay = carouselApi?.plugins()?.autoplay;
    if (!autoplay) return;

    const resetOrStop =
      autoplay.options.stopOnInteraction === false
        ? autoplay.reset
        : autoplay.stop;

    resetOrStop();
  }, []);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(
    carouselApi,
    onNavButtonClick,
  );

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(carouselApi, onNavButtonClick);

  // Create team groups based on screen size
  const createTeamGroups = () => {
    if (teamData.length === 0) return [];

    const groups = [];

    if (screenSize === "desktop") {
      // Desktop view: First two slides have 4 members, rest have 3
      // First group with 4 members
      groups.push(teamData.slice(0, 4));

      // Second group with 4 members
      if (teamData.length > 4) {
        groups.push(teamData.slice(4, 8));
      }

      // Rest of the groups with 3 members each
      let processed = 8;
      while (processed < teamData.length) {
        groups.push(teamData.slice(processed, processed + 3));
        processed += 3;
      }
    } else if (screenSize === "tablet") {
      // Tablet view: All slides have 3 members
      for (let i = 0; i < teamData.length; i += 3) {
        groups.push(teamData.slice(i, i + 3));
      }
    } else {
      // Mobile view: All slides have 2 members
      for (let i = 0; i < teamData.length; i += 2) {
        groups.push(teamData.slice(i, i + 2));
      }
    }

    return groups;
  };

  // Create groups
  const teamGroups = createTeamGroups();

  return (
    <section className={styles.carousel}>
      <div className="flex justify-center w-full">
        <h2 className="text-4xl font-bold text-center mb-10 relative">
          Meet Our Team
        </h2>
      </div>

      <div
        className={styles.carousel__viewport}
        ref={carouselRef}
        style={{
          background: "transparent",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "2rem",
        }}
      >
        <div className={styles.carousel__container}>
          {teamGroups.map((group, index) => (
            <div
              className={`${styles.carousel__slide} ${
                screenSize === "desktop" && index < 2
                  ? styles.carousel__slide__wider
                  : screenSize === "tablet"
                    ? styles.carousel__slide__tablet
                    : screenSize === "mobile"
                      ? styles.carousel__slide__mobile
                      : ""
              }`}
              key={index}
            >
              {group.map((member, memberIndex) => (
                <TeamMemberCard
                  key={`${index}-${memberIndex}`}
                  member={member}
                  className="team-card-container"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.carousel__controls}>
        <div className={styles.carousel__buttons}>
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className={styles.carousel__dots}>
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={`${styles.carousel__dot} ${
                index === selectedIndex ? styles["carousel__dot--selected"] : ""
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamCarousel;
