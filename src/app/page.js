import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import RegisterSection from "../components/RegisterSection/Register";
import About from "../components/About/About"; // Only About section

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <RegisterSection />
        <section>
          <About /> {/* Only About Section */}
        </section>
      </main>
      <Footer />
    </>
  );
}
