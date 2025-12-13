import Announcement from "../components/Announcement";
import Banner from "../components/Banner";
import Navbar from "../components/Navbar";
import Category from "../components/Category";
import Products from "../components/Products";
import Footer from "../components/Footer";

function Home() {
  return (
    <div>
      <Announcement />
      <Navbar />
      <Banner />
      <Category />
      <Products />
      <Footer />
    </div>
  );
}

export default Home;
