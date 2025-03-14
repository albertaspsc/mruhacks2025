"use client";

import React, { useCallback } from "react";
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

  // Create groups of 3 team members for each slide
  const teamGroups = [];
  for (let i = 0; i < teamData.length; i += 3) {
    teamGroups.push(teamData.slice(i, i + 3));
  }

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
            <div className={styles.carousel__slide} key={index}>
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
