import Image from "next/image";
import React from "react";
import photo1 from "../../assets/gallery/event-photo1.svg";
import photo2 from "../../assets/gallery/event-photo2.svg";
import photo3 from "../../assets/gallery/event-photo3.svg";
import styles from "./Gallery.module.css";

export default function Gallery() {
  return (
    <div className={styles["gallery-container"]}>
      {[photo1, photo2, photo3].map((x, i) => (
        <Image
          src={x}
          key={`gallery-image-${i}`}
          alt={`photo of event ${i}`}
          className={styles["gallery-image"]}
        ></Image>
      ))}
    </div>
  );
}
