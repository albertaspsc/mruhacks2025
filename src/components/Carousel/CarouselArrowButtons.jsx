"use client";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./carousel.module.css"; // Import the CSS module

export const usePrevNextButtons = (carouselApi, onButtonClick) => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!carouselApi) return;
    carouselApi.scrollPrev();
    if (onButtonClick) onButtonClick(carouselApi);
  }, [carouselApi, onButtonClick]);

  const onNextButtonClick = useCallback(() => {
    if (!carouselApi) return;
    carouselApi.scrollNext();
    if (onButtonClick) onButtonClick(carouselApi);
  }, [carouselApi, onButtonClick]);

  const onSelect = useCallback((carouselApi) => {
    setPrevBtnDisabled(!carouselApi.canScrollPrev());
    setNextBtnDisabled(!carouselApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    onSelect(carouselApi);
    carouselApi.on("reInit", onSelect).on("select", onSelect);
  }, [carouselApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

export const PrevButton = (props) => {
  const { children, ...restProps } = props;

  return (
    <button
      className={`${styles.carousel__button} ${styles["carousel__button--prev"]}`}
      type="button"
      {...restProps}
    >
      <span className={styles.carousel__arrow}>&#10094;</span>
      {children}
    </button>
  );
};

export const NextButton = (props) => {
  const { children, ...restProps } = props;

  return (
    <button
      className={`${styles.carousel__button} ${styles["carousel__button--next"]}`}
      type="button"
      {...restProps}
    >
      <span className={styles.carousel__arrow}>&#10095;</span>
      {children}
    </button>
  );
};
