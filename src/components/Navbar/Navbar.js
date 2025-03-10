"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.css";
import logo from "../../assets/logos/color-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className={styles.navbarCustom}>
      <div className={styles.navbarContainer}>
        <Link href="/" className={styles.navbarBrand}>
          <Image src={logo} alt="Logo" width={120} height={40} />
        </Link>

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
            <Link href="#home" className={styles.navLink} onClick={closeMenu}>
              Register
            </Link>
            <Link href="#about" className={styles.navLink} onClick={closeMenu}>
              About
            </Link>
            <Link
              href="#sponsors"
              className={styles.navLink}
              onClick={closeMenu}
            >
              Sponsors
            </Link>
            <Link href="#faq" className={styles.navLink} onClick={closeMenu}>
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
