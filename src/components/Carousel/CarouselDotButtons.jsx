"use client";
import React, { useCallback, useEffect, useState } from "react";

export const useDotButton = (carouselApi, onButtonClick) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const onDotButtonClick = useCallback(
    (index) => {
      if (!carouselApi) return;
      carouselApi.scrollTo(index);
      if (onButtonClick) onButtonClick(carouselApi);
    },
    [carouselApi, onButtonClick],
  );

  const onInit = useCallback((carouselApi) => {
    setScrollSnaps(carouselApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((carouselApi) => {
    setSelectedIndex(carouselApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    onInit(carouselApi);
    onSelect(carouselApi);
    carouselApi
      .on("reInit", onInit)
      .on("reInit", onSelect)
      .on("select", onSelect);
  }, [carouselApi, onInit, onSelect]);

  return {
    selectedIndex,
    scrollSnaps,
    onDotButtonClick,
  };
};

export const DotButton = (props) => {
  const { children, ...restProps } = props;

  return (
    <button type="button" {...restProps}>
      {children}
    </button>
  );
};
