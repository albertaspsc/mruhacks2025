import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import RegisterSection from "../components/RegisterSection/Register";
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <RegisterSection />
        {/* Add your section here  */}
        <section></section>
      </main>
      <Footer />
    </>
  );
}
