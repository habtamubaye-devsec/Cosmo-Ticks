import Announcement from "../components/Announcement";
import Banner from "../components/Banner";
import Navbar from "../components/Navbar";
import TrustBar from "../components/TrustBar";
import Category from "../components/Category";
import Products from "../components/Products";
import StorySection from "../components/StorySection";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Banner />
      <TrustBar />
      <Category />
      <Products />
      <StorySection />
      <Footer />
    </div>
  );
}

export default Home;
