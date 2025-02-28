import React from "react";
import Image from "next/image";
import styles from "./Footer.module.css";
import title from "../../assets/community/community-title.png";
import communityImg from "../../assets/community/community-component.png";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLeft}>
          <div className={styles.footerTitle}>
            <Image
              src={title}
              alt="Join Our Community"
              className={styles.communityTitle}
            />
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
            {/*  Replace with actual discord link  */}
            <a
              href="https://www.youtube.com/watch?v=9bZkp7q19f0"
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
