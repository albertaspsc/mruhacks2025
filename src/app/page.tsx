import dynamic from "next/dynamic";
import HeroSection from "@/components/landing-page/hero/Hero";
import Footer from "@/components/landing-page/footer/Footer";

const Welcome = dynamic(
  () => import("@/components/landing-page/welcome/Welcome"),
  {
    loading: () => <div style={{ minHeight: 320 }} />,
  },
);
const About = dynamic(() => import("@/components/landing-page/about/About"), {
  loading: () => <div style={{ minHeight: 320 }} />,
});

// Below-the-fold (deferred) sections
const Gallery = dynamic(
  () => import("@/components/landing-page/gallery/Gallery"),
  {
    loading: () => <div style={{ minHeight: 300 }} />,
  },
);
const TeamCarousel = dynamic(
  () => import("@/components/landing-page/team/carousel/TeamCarousel"),
  {
    loading: () => <div style={{ minHeight: 260 }} />,
  },
);
const FAQ = dynamic(() => import("@/components/landing-page/faq/FAQ"), {
  loading: () => <div style={{ minHeight: 260 }} />,
});
const Stats = dynamic(() => import("@/components/landing-page/stats/Stats"), {
  loading: () => <div style={{ minHeight: 260 }} />,
});
const Sponsor = dynamic(
  () => import("@/components/landing-page/sponsor/Sponsor"),
  {
    loading: () => <div style={{ minHeight: 260 }} />,
  },
);

// Revalidate the home page (and thus the countdown) every hour
export const revalidate = 3600; // seconds

export default function Home() {
  return (
    <>
      <main>
        <section id="hero">
          <HeroSection />
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
