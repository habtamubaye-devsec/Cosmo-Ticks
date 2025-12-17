import { useNavigate } from "react-router-dom";
import { navStructure } from "../utils/nav-data";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

function Category({ onSelectCategory }) {
  const navigate = useNavigate();
  // Filter out 'About' or non-product categories if needed
  // Filter out 'About' or non-product categories if needed
  const categories = navStructure.filter(c => c.title !== "About");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right'); // 'right' or 'left'
  const [displayCategory, setDisplayCategory] = useState(categories[0]);

  // Responsive Items Per Page
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 768 ? 1 : 3);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 1 : 3);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Subcategory Pagination State
  const [subPage, setSubPage] = useState(0);
  const totalSubPages = Math.ceil(displayCategory.items.length / itemsPerPage);

  // Synchronize display category with active index with a delay for animation
  useEffect(() => {
    if (categories[activeIndex].title !== displayCategory.title) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayCategory(categories[activeIndex]);
        setSubPage(0); // Reset sub sub-page
        setIsAnimating(false);
      }, 400); // Wait for exit animation
      return () => clearTimeout(timer);
    }
  }, [activeIndex, categories, displayCategory.title]);

  const nextCategory = () => {
    setSlideDirection('right');
    setActiveIndex((prev) => (prev + 1) % categories.length);
  };

  const prevCategory = () => {
    setSlideDirection('left');
    setActiveIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const handleSubItemClick = (sub) => {
    navigate(sub.path);
  };

  // Transform calculation for slider
  // Mobile: 85vw items. Desktop: 33.333% items (3 per page).
  // We need to translate the container based on subPage.
  // On Desktop: TranslateX = -100% * subPage (sliding full view of 3 items)
  // On Mobile: We keep standard scroll or use same logic? 
  // User said "responsive for all screen size" and "max in the page is 3".
  // Let's stick to the 3-item logic for desktop. For mobile, maybe 1 item per page logic?
  // User "max in the page is 3" likely implies desktop.

  // The getTranslateValue function is removed as per the instruction,
  // and the transform logic is directly applied in the style prop.
  // The itemsPerPage state now controls the width of individual items,
  // and the translateX(-${subPage * 100}%) will correctly slide by one "page"
  // which contains `itemsPerPage` items.

  return (
    <div className="bg-white h-screen flex flex-col justify-center select-none overflow-hidden">
      <div className="container mx-auto px-6 flex-shrink-0">

        {/* Restored Global Section Header */}
        <div className="text-center mb-6 md:mb-12">
          <h2 className="font-serif text-3xl md:text-5xl text-gray-900 mb-2 tracking-tight">Shop by Category</h2>
          <p className="text-gray-500 text-base md:text-lg">Find the perfect products for <span className="underline decoration-[#c17f59] underline-offset-4">your</span> routine</p>
        </div>

        {/* Header Controls (Active Category) */}
        <div className="flex flex-col items-center mb-8 md:mb-10 space-y-4">
          <div className="flex items-center gap-8 md:gap-16">
            <button
              onClick={prevCategory}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 group z-10"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="min-w-[200px] md:min-w-[250px] text-center overflow-hidden">
              {/* Animated dynamic title */}
              <div
                className={`transition-all duration-400 transform ${isAnimating
                  ? (slideDirection === 'right' ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0')
                  : 'translate-x-0 opacity-100'
                  }`}
              >
                <h2 className="font-serif text-3xl md:text-6xl text-gray-900 whitespace-nowrap">
                  {displayCategory.title}
                </h2>
              </div>
            </div>

            <button
              onClick={nextCategory}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 group z-10"
            >
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid - Full Width, Consistent Height */}
      {/* We fix the height here to ensure no jumping */}
      <div className="w-full px-4 md:px-6 flex-grow max-h-[50vh] min-h-[300px] md:min-h-[400px] flex items-center overflow-hidden">

        {/* Slider Track */}
        <div
          key={displayCategory.title} // Create new instance on change to trigger enter animation
          className={`flex w-full h-full items-center transition-all duration-700 ease-out
                    ${isAnimating
              ? (slideDirection === 'right' ? '-translate-x-1/4 opacity-0' : 'translate-x-1/4 opacity-0')
              : 'opacity-100'
            }
                    ${!isAnimating && (slideDirection === 'right' ? 'animate-in slide-in-from-right-1/4 duration-700' : 'animate-in slide-in-from-left-1/4 duration-700')}
                `}
          style={{
            // Pagination Transform
            transform: !isAnimating ? `translateX(-${subPage * 100}%)` : undefined
          }}
        >
          {displayCategory.items.map((item, index) => (
            <div
              key={item.name}
              onClick={() => handleSubItemClick(item)}
              // Adjusted Width Logic:
              // Mobile (itemsPerPage=1) -> w-full (100%)
              // Desktop (itemsPerPage=3) -> w-1/3 (33.33%)
              className={`group cursor-pointer h-full relative flex-shrink-0 px-2 md:px-4 ${itemsPerPage === 1 ? 'w-full' : 'w-1/3'
                }`}
            >
              {/* Image Container - Takes remaining height */}
              <div className="h-[80%] w-full bg-[#f5f5f3] rounded-[2rem] overflow-hidden mb-4 relative">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <ArrowUpRight size={20} />
                </div>
                <div className="absolute bottom-6 left-6">
                  <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase">
                    Collection
                  </span>
                </div>
              </div>

              {/* Text Content - Fixed height */}
              <div className="h-[20%] flex flex-col justify-start">
                <h3 className="text-2xl font-serif text-gray-900 group-hover:text-[#c17f59] transition-colors">
                  {item.name}
                </h3>
                <p className="text-gray-500 mt-1 text-sm line-clamp-1">
                  Explore {item.name.toLowerCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots - Navigation for Subcategory Pages */}
      <div className="container mx-auto px-6 flex justify-center pb-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          {Array.from({ length: totalSubPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSubPage(idx)}
              className={`transition-all duration-500 rounded-full ${subPage === idx ? 'w-8 h-2 bg-[#c17f59]' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


export default Category;
