import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import RegisterSection from "../components/RegisterSection/Register";
import Welcome from "../components/Welcome/Welcome"; // Import Welcome section
import About from "../components/About/About"; // Import About section
import FAQ from "../components/FAQ/FAQ"; // Import FAQ section

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <RegisterSection />
        {/* Add your section here */}
        <section>
          <Welcome /> {/*  Welcome Section */}
          <About /> {/*  About Section */}
          <FAQ /> {/*  FAQ Section */}
        </section>
      </main>
      <Footer />
    </>
  );
}
