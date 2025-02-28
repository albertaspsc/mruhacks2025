"use client";
import React, { useState, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";
import Image from "next/image";
import logo from "../../assets/logos/color-logo.png";
import styles from "./Navbar.module.css";

function NavigationBar() {
  const [expanded, setExpanded] = useState(false);

  // Handle closing the navbar when clicking outside
  useEffect(() => {
    if (!expanded) return;

    const handleOutsideClick = (e) => {
      // If the click is on the hamburger or its children, ignore
      if (e.target.closest(`.${styles.navbarToggler}`)) return;

      // If the click is outside the nav container and navbar is expanded
      if (!e.target.closest(`.${styles.navContainer}`) && expanded) {
        handleNavLinkClick();
      }
    };

    // Add event listener
    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [expanded]);

  const toggleNavbar = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);

    // Add or remove class from body when navbar is expanded
    if (newExpandedState) {
      document.body.classList.add("navbar-expanded");
      // Lock scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("navbar-expanded");
      // Restore scroll when menu is closed
      document.body.style.overflow = "";
    }
  };

  // Function to handle navigation link clicks
  const handleNavLinkClick = () => {
    setExpanded(false);
    document.body.classList.remove("navbar-expanded");
    document.body.style.overflow = "";
  };

  return (
    <Navbar
      expanded={expanded}
      expand="md"
      className={`${styles.navbarCustom}`}
      fixed="top"
    >
      <div className={styles.navbarContainer}>
        <Navbar.Brand href="#home" className={styles.navbarBrand}>
          <Image
            src={logo}
            height={40}
            width={120}
            className="d-inline-block align-top"
            alt="MRUHacks Logo"
            priority
          />
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={toggleNavbar}
          className={styles.navbarToggler}
        >
          <div className={styles.hamburgerIcon}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </Navbar.Toggle>
        <Navbar.Collapse
          id="basic-navbar-nav"
          className={`${styles.navbarCollapse} ${expanded ? styles.show : ""}`}
        >
          <Nav className={styles.navContainer}>
            <Nav.Link
              href="#about"
              onClick={handleNavLinkClick}
              className={styles.navLink}
            >
              About
            </Nav.Link>
            <Nav.Link
              href="#home"
              onClick={handleNavLinkClick}
              className={styles.navLink}
            >
              Register
            </Nav.Link>
            <Nav.Link
              href="#faq"
              onClick={handleNavLinkClick}
              className={styles.navLink}
            >
              FAQ
            </Nav.Link>
            <Nav.Link
              href="#sponsors"
              onClick={handleNavLinkClick}
              className={styles.navLink}
            >
              Sponsors
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}

export default NavigationBar;
