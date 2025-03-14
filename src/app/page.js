"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import RegisterSection from "../components/RegisterSection/Register";
import Welcome from "../components/Welcome/Welcome";
import About from "../components/About/About";
import Gallery from "../components/Gallery/Gallery";
import Stats from "../components/Stats/Stats";
import FAQ from "../components/FAQ/FAQ";
import Sponsor from "../components/Sponsor/Sponsor";
import Footer from "../components/Footer/Footer";
import TeamCarousel from "../components/Carousel/TeamCarousel";
import teamDataJson from "../data/team.json";

export default function Home() {
  const [teamData] = useState(teamDataJson);

  return (
    <>
      <Navbar />
      <main>
        <section id="register">
          <RegisterSection />
        </section>

        <section>
          <Welcome />
        </section>

        <section id="about">
          <About />
        </section>

        <section>
          <Stats />
        </section>

        <section>
          <Gallery />
        </section>

        <section id="team" className="py-16 px-4 md:px-8">
          <TeamCarousel
            teamData={teamData}
            options={{
              loop: true,
              align: "start",
              dragFree: false,
              containScroll: "trimSnaps",
            }}
          />
        </section>

        <section id="faq">
          <FAQ />

        </section>

        <section id="sponsors">
          <Sponsor />
        </section>
      </main>
      <Footer />
    </>
  );
}
