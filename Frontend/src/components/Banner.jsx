import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

function Banner() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-[85vh] flex items-center bg-[#fdfbf7] overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=2000&auto=format&fit=crop"
          alt="Sustainable Beauty Background"
          className="w-full h-full object-cover object-center opacity-90"
        />
        {/* Soft overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/30 to-transparent"></div>
      </div>

      {/* Content Container - Left Aligned */}
      <div className="container mx-auto px-6 lg:px-12 relative z-10 animate-fade-in pt-12">
        <div className="max-w-xl">
          <span className="text-xs font-bold tracking-[0.2em] text-[#c17f59] uppercase mb-4 block">
            BEAUTY WITHOUT COMPROMISE
          </span>

          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl leading-[1.1] text-[#1a1a1a] mb-6 tracking-tight">
            Cruelty Free
          </h1>

          <p className="text-gray-700 text-lg md:text-xl mb-10 leading-relaxed font-normal">
            Discover skincare that nurtures, cosmetics that celebrate, and a beauty routine that's uniquely yours.
          </p>

          <div className="flex flex-row gap-4">
            <button
              onClick={() => navigate("/shop")}
              className="btn-premium px-10"
            >
              Shop Now
            </button>
            <button
              onClick={() => navigate("/quiz")}
              className="btn-outline-premium px-10"
            >
              Find Your Match
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-800 animate-bounce z-20 cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
        <ChevronDown size={24} strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default Banner;
