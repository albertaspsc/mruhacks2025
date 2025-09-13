"use client";

import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "./CarouselArrowButtons";
import Autoplay from "embla-carousel-autoplay";
import useCarousel, { UseEmblaCarouselType } from "embla-carousel-react";
import TeamMemberCard, { MemberData } from "../Cards/TeamMemberCard";
import styles from "./carousel.module.css";
import { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";

type Props = {
  teamData?: MemberData[]; // Optional to allow lazy loading
  options?: EmblaOptionsType;
  onDataLoaded?: (count: number) => void; // optional callback for metrics
};

const TeamCarousel: FunctionComponent<Props> = (props) => {
  const {
    teamData,
    options = { loop: true, align: "start" },
    onDataLoaded,
  } = props;
  const [data, setData] = useState<MemberData[]>(teamData || []);
  const [loading, setLoading] = useState<boolean>(!teamData);
  const [error, setError] = useState<string | null>(null);
  const [carouselRef, carouselApi] = useCarousel(options as EmblaOptionsType, [
    Autoplay(),
  ]);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view on component mount and window resize
  useEffect(() => {
    const checkForMobile = () => {
      setIsMobile(window.innerWidth < 768); // Standard tablet breakpoint is 768px
    };

    // Initial check
    checkForMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkForMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkForMobile);
  }, []);

  const onNavButtonClick = useCallback((carouselApi: EmblaCarouselType) => {
    const autoplay = carouselApi?.plugins()?.autoplay;
    if (!autoplay) return;

    const resetOrStop =
      autoplay.options.stopOnInteraction === false
        ? autoplay.reset
        : autoplay.stop;

    resetOrStop();
  }, []);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(carouselApi, onNavButtonClick);

  // Grouping responsive to screen size
  const createCustomGroups = (data: MemberData[]) => {
    if (isMobile) {
      // For mobile: always 2 cards per slide
      const mobileGroups = [];
      for (let i = 0; i < data.length; i += 2) {
        mobileGroups.push(data.slice(i, i + 2));
      }
      return mobileGroups;
    } else {
      // For tablet and desktop: use the original grouping logic
      const groupSizes = [2, 4, 2, 3, 4]; // Group sizes determined by # of people in each team
      const groups = [];
      let index = 0;

      for (const size of groupSizes) {
        if (index < data.length) {
          groups.push(data.slice(index, index + size));
          index += size;
        }
      }

      // If there are still team members left, add them to additional groups of 3
      while (index < data.length) {
        const remaining = data.length - index;
        const groupSize = Math.min(remaining, 3);
        groups.push(data.slice(index, index + groupSize));
        index += groupSize;
      }

      return groups;
    }
  };

  // Lazy load data on mount if not provided
  useEffect(() => {
    if (data.length === 0 && !teamData) {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          // Dynamic import so JSON is split out of main bundle
          const mod = await import("@/data/team.json");
          if (!cancelled) {
            const loaded: MemberData[] = mod.default as any;
            setData(loaded);
            onDataLoaded?.(loaded.length);
          }
        } catch (e: any) {
          if (!cancelled) setError(e?.message || "Failed to load team data");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [data.length, teamData, onDataLoaded]);

  const teamGroups = createCustomGroups(data);

  useEffect(() => {
    if (carouselApi) {
      carouselApi.reInit();
    }
  }, [isMobile, carouselApi]);

  return (
    <div className={styles["carousel-background"]}>
      <section className={styles.carousel}>
        <h2>
          <span>Meet Our Team</span>
        </h2>

        <div className={styles.carousel__wrapper}>
          {/* Left Button */}
          <div className={styles.carousel__button_left}>
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
            />
          </div>

          <div className={styles.carousel__viewport} ref={carouselRef}>
            <div className={styles.carousel__container}>
              {loading && (
                <div className={styles.carousel__slide}>
                  <div className="animate-pulse text-sm opacity-70 p-6">
                    Loading team...
                  </div>
                </div>
              )}
              {error && !loading && (
                <div className={styles.carousel__slide}>
                  <div className="text-red-400 text-sm p-6">{error}</div>
                </div>
              )}
              {!loading &&
                !error &&
                teamGroups.map((group, index) => (
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

          {/* Right Button */}
          <div className={styles.carousel__button_right}>
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamCarousel;
