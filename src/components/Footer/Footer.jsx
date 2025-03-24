import React from "react";
import Image from "next/image";
import styles from "./Footer.module.css";
import communityImg from "../../assets/community/community-component.webp";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLeft}>
          <div className={styles.footerTitle}>
            <h1 className={styles.title}>Join Our Community</h1>
          </div>
          <div className={styles.socialLinks}>
            <a
              href="https://www.instagram.com/mruhacks/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <div className={styles.socialIcon}>Instagram</div>
            </a>
            <a
              href="https://discord.gg/e7Fg6jsnrm"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <div className={styles.socialIcon}>Discord</div>
            </a>
            <a
              href="https://www.linkedin.com/company/mruhacks/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <div className={styles.socialIcon}>LinkedIn</div>
            </a>
          </div>
        </div>

        <div className={styles.footerRight}>
          <Image
            src={communityImg}
            alt="Our Team"
            className={styles.teamPhoto}
          />
        </div>
      </div>

      <div className={styles.copyright}>
        <p>
          Copyright &copy; {new Date().getFullYear()} - MRUHacks Development
          Team
        </p>
      </div>
    </footer>
  );
};

export default Footer;
