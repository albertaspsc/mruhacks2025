"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import logo from "@/assets/logos/color-logo.svg";
import NavbarItem from "./NavbarItem";
import { createClient } from "@/utils/supabase/client";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

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

  // Track active section while scrolling (landing pages only)
  useEffect(() => {
    const isLanding = pathname === "/" || pathname.startsWith("/landing");
    if (!isLanding) return;

    const handleScroll = () => {
      const sections = ["home", "about", "sponsors", "faq"];
      const scrollPosition = window.scrollY + 100;

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
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

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

  // Admin logout function
  const handleAdminLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/admin-login-portal");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Build items based on current route
  const isLanding = pathname === "/" || pathname.startsWith("/landing");
  const isAdmin =
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin-login-portal");

  const navItems = isLanding
    ? [
        {
          key: "about",
          label: "About",
          href: "#about",
          isActive: isActive("about"),
          variant: "link" as const,
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) =>
            scrollToSection("about", e),
        },
        {
          key: "team",
          label: "Meet the Team",
          href: "#team",
          isActive: isActive("team"),
          variant: "link" as const,
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) =>
            scrollToSection("team", e),
        },
        {
          key: "faq",
          label: "FAQ",
          href: "#faq",
          isActive: isActive("faq"),
          variant: "link" as const,
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) =>
            scrollToSection("faq", e),
        },
        {
          key: "sponsors",
          label: "Sponsors",
          href: "#sponsors",
          isActive: isActive("sponsors"),
          variant: "link" as const,
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) =>
            scrollToSection("sponsors", e),
        },
        {
          key: "login",
          label: "Login",
          variant: "button" as const,
          onClick: () => {
            setIsOpen(false);
            router.push("/login");
          },
        },
      ]
    : pathname.startsWith("/user")
      ? [
          {
            key: "user-dashboard",
            label: "Dashboard",
            href: "/user/dashboard",
            isActive: pathname.startsWith("/user/dashboard"),
            variant: "link" as const,
            onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              setIsOpen(false);
              router.push("/user/dashboard");
            },
          },
          {
            key: "user-profile",
            label: "Profile",
            href: "/user/profile",
            isActive: pathname.startsWith("/user/profile"),
            variant: "link" as const,
            onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              setIsOpen(false);
              router.push("/user/profile");
            },
          },
          {
            key: "user-settings",
            label: "Settings",
            href: "/user/settings",
            isActive: pathname.startsWith("/user/settings"),
            variant: "link" as const,
            onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              setIsOpen(false);
              router.push("/user/settings");
            },
          },
          {
            key: "user-logout",
            label: "Logout",
            variant: "button" as const,
            onClick: () => {
              setIsOpen(false);
              window.location.href = "/auth/logout?next=/";
            },
          },
        ]
      : isAdmin
        ? [
            {
              key: "admin-participants",
              label: "Participants",
              href: "/admin/dashboard?tab=participants",
              isActive:
                pathname.startsWith("/admin/dashboard") &&
                (pathname.includes("participants") ||
                  !pathname.includes("tab=")),
              variant: "link" as const,
              onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                setIsOpen(false);
                router.push("/admin/dashboard?tab=participants");
              },
            },
            {
              key: "admin-workshops",
              label: "Workshops",
              href: "/admin/dashboard?tab=workshops",
              isActive:
                pathname.includes("workshop") ||
                (pathname.startsWith("/admin/dashboard") &&
                  pathname.includes("workshops")),
              variant: "link" as const,
              onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                setIsOpen(false);
                router.push("/admin/dashboard?tab=workshops");
              },
            },
            {
              key: "admin-logout",
              label: "Logout",
              variant: "button" as const,
              onClick: () => {
                setIsOpen(false);
                handleAdminLogout();
              },
            },
          ]
        : [
            {
              key: "home",
              label: "Home",
              href: "/",
              isActive: pathname === "/",
              variant: "link" as const,
              onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                setIsOpen(false);
                router.push("/");
              },
            },
          ];

  // Determine navbar background based on route
  const isUserRoute = pathname.startsWith("/user");
  const navbarClass = isUserRoute
    ? `${styles.navbarCustom} ${styles.navbarUser}`
    : styles.navbarCustom;

  return (
    <nav className={navbarClass}>
      <div className={styles.navbarContainer}>
        <a
          href={isLanding ? "#register" : isAdmin ? "/admin/dashboard" : "/"}
          className={styles.navbarBrand}
          onClick={(e) => {
            if (isLanding) {
              scrollToSection("register", e);
            } else {
              e.preventDefault();
              setIsOpen(false);
              if (isAdmin) {
                router.push("/admin/dashboard");
              } else {
                router.push("/");
              }
            }
          }}
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
            {navItems.map((item) => (
              <NavbarItem
                key={item.key}
                label={item.label}
                href={item.href as string | undefined}
                isActive={item.isActive}
                variant={item.variant as "link" | "button"}
                onClick={item.onClick as any}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
