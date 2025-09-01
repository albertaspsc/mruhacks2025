"use client";

import React, { ButtonHTMLAttributes, FunctionComponent } from "react";
import styles from "./workshopsCarousel.module.css";

type CarouselBtn = FunctionComponent<ButtonHTMLAttributes<{}>>;

export const WorkshopPrevButton: CarouselBtn = (props) => {
  const { children, ...restProps } = props;

  return (
    <button className={styles.carouselButton} type="button" {...restProps}>
      <span className={styles.carouselArrow}>&#10094;</span>
      {children}
    </button>
  );
};

export const WorkshopNextButton: CarouselBtn = (props) => {
  const { children, ...restProps } = props;

  return (
    <button className={styles.carouselButton} type="button" {...restProps}>
      <span className={styles.carouselArrow}>&#10095;</span>
      {children}
    </button>
  );
};
