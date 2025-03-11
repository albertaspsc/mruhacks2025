import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import RegisterSection from "../components/RegisterSection/Register";
import Welcome from "../components/Welcome/Welcome"; // Only Welcome section

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <RegisterSection />
        <section>
          <Welcome /> {/* Only Welcome Section */}
        </section>
      </main>
      <Footer />
    </>
  );
}
