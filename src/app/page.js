import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import RegisterSection from "../components/RegisterSection/Register";
import FAQ from "../components/FAQ/FAQ"; // Only FAQ section

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <RegisterSection />
        <section>
          <FAQ /> {/* Only FAQ Section */}
        </section>
      </main>
      <Footer />
    </>
  );
}
