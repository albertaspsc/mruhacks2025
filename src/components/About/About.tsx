import Image from "next/image";
import styles from "./About.module.css";
import background from "@/assets/backgrounds/background.webp";
import AboutClient from "./AboutClient";
export default function About() {
  return (
    <section className={styles.aboutSection}>
      <Image
        src={background}
        alt="Decorative Background"
        className={styles.backgroundImage}
      />
      <AboutClient />
    </section>
  );
}
