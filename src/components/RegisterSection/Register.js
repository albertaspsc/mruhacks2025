"use client";
import Image from "next/image";
import styles from "./Register.module.scss";
import logo from "@/assets/logos/black-white-logo.png";

const RegisterSection = () => {
  return (
    <div id="register" className={styles.registerSection}>
      <svg
        style={{ position: "absolute", userSelect: "none" }}
        width="200"
        height="200"
        viewBox="0 0 220 220"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="displacementFilter">
          <feTurbulence
            id="turbulence"
            type="fractalNoise"
            baseFrequency="0.5"
            numOctaves="2"
            seed="0"
            result="fractalNoise"
          />
          <feDisplacementMap
            id="mapping"
            in2="fractalNoise"
            in="SourceGraphic"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
            result="noise"
          />
          <animate
            xlinkHref="#turbulence"
            attributeName="seed"
            dur="0.8s"
            keyTimes="0;0.5;1"
            values="1;100;1000"
            repeatCount="1"
            begin="register.mouseenter"
          ></animate>
          <animate
            xlinkHref="#mapping"
            attributeName="scale"
            dur="0.8s"
            keyTimes="0;0.5;1"
            values="0;40;0"
            repeatCount="1"
            begin="register.mouseenter"
          ></animate>
        </filter>
        <filter id="lightDisplacementFilter">
          <feTurbulence
            id="turbulence"
            type="fractalNoise"
            baseFrequency="0.5"
            numOctaves="2"
            seed="0"
            result="fractalNoise"
          />
          <feDisplacementMap
            id="mapping"
            in2="fractalNoise"
            in="SourceGraphic"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
            result="noise"
          />
          <animate
            xlinkHref="#turbulence"
            attributeName="seed"
            dur="0.8s"
            keyTimes="0;0.5;1"
            values="1;100;1000"
            repeatCount="1"
            begin="register.mouseenter"
          ></animate>
          <animate
            xlinkHref="#mapping"
            attributeName="scale"
            dur="0.8s"
            keyTimes="0;0.5;1"
            values="0;20;0"
            repeatCount="1"
            begin="register.mouseenter"
          ></animate>
        </filter>
      </svg>
      <background id="background"></background>
      <Image
        src={logo}
        alt="MRU Hackathon Logo"
        priority
        className={styles.logo}
      />

      <a
        href="https://forms.gle/YourRegistrationFormLink"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.registerButton}
      >
        Register Now
      </a>
    </div>
  );
};

export default RegisterSection;
