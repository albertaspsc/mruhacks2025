"use client";
import React from "react";
import styles from "./Navbar.module.css";

type NavbarItemProps = {
  label: string;
  href?: string;
  isActive?: boolean;
  variant?: "link" | "button";
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
};

const NavbarItem: React.FC<NavbarItemProps> = ({
  label,
  href,
  isActive,
  variant = "link",
  onClick,
}) => {
  if (variant === "button") {
    return (
      <button
        type="button"
        className={styles.loginButton}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      >
        {label}
      </button>
    );
  }

  return (
    <a
      href={href}
      className={`${styles.navLink} ${isActive ? styles.active : ""}`}
      onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
    >
      {label}
    </a>
  );
};

export default NavbarItem;
