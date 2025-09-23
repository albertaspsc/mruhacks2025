"use client";
import React, {
  ButtonHTMLAttributes,
  FunctionComponent,
  MouseEventHandler,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import styles from "./carousel.module.css"; // Import the CSS module
import { UseEmblaCarouselType } from "embla-carousel-react";
import { EmblaCarouselType } from "embla-carousel";

type CallbackHander = (x: EmblaCarouselType) => void;
type CarouselBtn = FunctionComponent<ButtonHTMLAttributes<{}>>;

export const usePrevNextButtons = (
  carouselApi: UseEmblaCarouselType[1],
  onButtonClick: CallbackHander,
) => {
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

  const onSelect = useCallback((carouselApi: UseEmblaCarouselType[1]) => {
    setPrevBtnDisabled(!carouselApi?.canScrollPrev());
    setNextBtnDisabled(!carouselApi?.canScrollNext());
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

export const PrevButton: CarouselBtn = (props) => {
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

export const NextButton: CarouselBtn = (props) => {
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
