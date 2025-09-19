"use client";

import Image from "next/image";
import React from "react";
import logo from "@/assets/logos/black-white-logo.svg";
import MRUHacksCountdown from "./countdown/MRUHacksCountdown";
import { DeferredGradientBackground } from "./background/DeferredGradientBackground";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="flex flex-col items-center justify-center w-full h-[90vh] mx-auto p-0 md:min-h-screen"
    >
      <div className="absolute top-0 left-0 right-0 w-full h-screen -z-10">
        <DeferredGradientBackground />
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        <div className="flex justify-center items-center max-w-[80%] mb-0 md:mb-8">
          <Image
            src={logo}
            alt="MRU Hackathon Logo"
            priority={true}
            width={1192}
            height={332}
            className="max-w-[65%] h-auto max-h-[40vh] md:max-h-[50vh] object-contain"
            sizes="(max-width: 768px) 80vw, 1192px"
          />
        </div>

        <div className="text-center mb-8 md:mb-12">
          <p className="text-xl font-light text-black md:text-3xl">
            October 4 - 5, 2025
          </p>
        </div>

        <div className="m-4 flex justify-center">
          <a
            href="/login-gateway"
            className="inline-block px-8 py-2 md:px-12 md:py-4 text-base md:text-xl font-semibold uppercase tracking-wider text-black bg-white border-0 rounded-full cursor-pointer transition-all duration-300 no-underline hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/75 active:translate-y-0"
            style={{ boxShadow: "0 4px 15px rgb(255, 255, 255)" }}
          >
            Register Now
          </a>
        </div>

        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          <MRUHacksCountdown />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
