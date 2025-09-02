"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import logo from "@/assets/logos/color-logo.svg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    // Cleanup on component unmount
    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isOpen]);

  // Track active section while scrolling
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "sponsors", "faq"];
      const scrollPosition = window.scrollY + 100; // Adding offset for navbar height

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Smooth scroll function
  const scrollToSection = (
    sectionId: string,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    setIsOpen(false); // Close the mobile menu

    const section = document.getElementById(sectionId);
    if (section) {
      // Get the navbar height to offset the scroll position
      const navbar = document.querySelector<HTMLElement>(
        `.${styles.navbarCustom}`,
      );
      const navbarHeight = navbar ? navbar.offsetHeight : 0;

      const offsetTop = section.offsetTop - navbarHeight;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  // Determines if a section is active
  const isActive = (sectionId: string) => activeSection === sectionId;

  return (
    <nav className={styles.navbarCustom}>
      <div className={styles.navbarContainer}>
        <a
          href="#register"
          className={styles.navbarBrand}
          onClick={(e) => scrollToSection("register", e)}
        >
          <Image src={logo} alt="Logo" width={120} height={40} />
        </a>

        <button
          className={styles.navbarToggler}
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <div className={styles.hamburgerIcon}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        <div
          className={`${styles.navbarCollapse} ${isOpen ? styles.show : ""}`}
        >
          <div className={styles.navContainer}>
            <a
              href="#about"
              className={`${styles.navLink} ${isActive("about") ? styles.active : ""}`}
              onClick={(e) => scrollToSection("about", e)}
            >
              About
            </a>
            <a
              href="#team"
              className={`${styles.navLink} ${isActive("team") ? styles.active : ""}`}
              onClick={(e) => scrollToSection("team", e)}
            >
              Meet the Team
            </a>
            <a
              href="#faq"
              className={`${styles.navLink} ${isActive("faq") ? styles.active : ""}`}
              onClick={(e) => scrollToSection("faq", e)}
            >
              FAQ
            </a>
            <a
              href="#sponsors"
              className={`${styles.navLink} ${isActive("sponsors") ? styles.active : ""}`}
              onClick={(e) => scrollToSection("sponsors", e)}
            >
              Sponsors
            </a>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/login");
              }}
              className={`${styles.loginButton} ${styles.loginButton}`}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
