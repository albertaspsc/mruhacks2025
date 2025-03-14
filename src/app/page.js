import Navbar from "../components/Navbar/Navbar";
import RegisterSection from "../components/RegisterSection/Register";
import About from "../components/About/About"; // Only About section
import Gallery from "../components/Gallery/Gallery";
import Stats from "../components/Stats/Stats";
import Sponsor from "../components/Sponsor/Sponsor";
import Footer from "../components/Footer/Footer";


export default function Home() {
  return (
    <>
      <Navbar />
      <main>

        <RegisterSection />
        <section>
          <About /> {/* Only About Section */}
        </section>
        <section id="register">
          <RegisterSection />
        </section>

        <section>
          <Stats />
        </section>

        <section>
          <Gallery />
        </section>

        <section id="sponsors">
          <Sponsor />
        </section>
      </main>
      <Footer />
    </>
  );
}
