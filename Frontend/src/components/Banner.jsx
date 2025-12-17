import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

function Banner() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-[90vh] flex items-center bg-[#fdfbf7] overflow-hidden">
      {/* Content Container */}
      <div className="container mx-auto px-6 lg:px-12 flex items-center h-full relative z-10">

        {/* Left: Text Content */}
        <div className="w-full lg:w-1/2 py-20 lg:py-0 pr-0 lg:pr-12">
          <span className="text-xs font-bold tracking-[0.2em] text-[#c17f59] uppercase mb-6 block">
            GOOD FOR YOU, GOOD FOR <span className="bg-[#2563eb] text-white px-1 py-0.5">EARTH</span>
          </span>

          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl leading-[1] text-gray-900 mb-8 tracking-tight">
            Sustainable <br />
            <span className="italic">Beauty</span>
          </h1>

          <p className="text-gray-600 text-lg md:text-xl mb-12 max-w-lg leading-relaxed">
            Discover skincare that nurtures, cosmetics that celebrate, and a beauty routine that's uniquely yours.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/category/skincare")}
              className="px-10 py-4 !text-white bg-gray-900 hover:bg-black transition-all rounded-full text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center whitespace-nowrap"
            >
              Shop Now
            </button>
            <button
              className="px-10 py-4 bg-white border border-gray-200 text-gray-900 hover:border-gray-900 transition-all rounded-full text-base font-medium flex items-center justify-center whitespace-nowrap"
            >
              Find Your Match
            </button>
          </div>
        </div>
      </div>

      {/* Right: Full Bleed Image */}
      <div className="hidden lg:block absolute right-0 top-0 w-[50%] h-full">
        <div className="absolute inset-0 bg-gradient-to-r from-[#fdfbf7] to-transparent z-10 w-20"></div>
        <img
          src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=2000&auto=format&fit=crop"
          alt="Beauty Model"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-10 lg:left-1/2 lg:-translate-x-1/2 flex gap-2 items-center text-gray-400 animate-bounce">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown size={16} />
      </div>
    </div>
  );
}

export default Banner;
