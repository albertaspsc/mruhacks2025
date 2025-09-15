import dynamic from "next/dynamic";
import RegisterSection from "@/components/RegisterSection/Register";
import Footer from "@/components/Footer/Footer";

const Welcome = dynamic(() => import("@/components/Welcome/Welcome"), {
  loading: () => <div style={{ minHeight: 320 }} />,
});
const About = dynamic(() => import("@/components/About/About"), {
  loading: () => <div style={{ minHeight: 320 }} />,
});

// Below-the-fold (deferred) sections
const Gallery = dynamic(() => import("@/components/Gallery/Gallery"), {
  loading: () => <div style={{ minHeight: 300 }} />,
});
const TeamCarousel = dynamic(
  () => import("@/components/Carousel/TeamCarousel"),
  {
    loading: () => <div style={{ minHeight: 260 }} />,
  },
);
const FAQ = dynamic(() => import("@/components/FAQ/FAQ"), {
  loading: () => <div style={{ minHeight: 260 }} />,
});
const Stats = dynamic(() => import("@/components/Stats/Stats"), {
  loading: () => <div style={{ minHeight: 260 }} />,
});
const Sponsor = dynamic(() => import("@/components/Sponsor/Sponsor"), {
  loading: () => <div style={{ minHeight: 260 }} />,
});

// Revalidate the home page (and thus the countdown) every hour
export const revalidate = 3600; // seconds

export default function Home() {
  return (
    <>
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
