import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function Category() {
  const navigate = useNavigate();

  const categories = [
    {
      title: "Serums",
      subtitle: "Targeted treatments for radiant skin",
      img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Moisturizers",
      subtitle: "Hydration that lasts all day",
      img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Cleansers",
      subtitle: "Gentle formulas for every skin type",
      img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop"
    },
  ];

  return (
    <div className="bg-white py-24">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl text-gray-900 mb-4 tracking-tight">Shop by Category</h2>
          <p className="text-gray-500 text-lg">Find the perfect products for <span className="underline decoration-[#c17f59] underline-offset-4">your</span> routine</p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="group relative h-[450px] bg-[#fdfbf7] rounded-3xl overflow-hidden cursor-pointer transition-shadow hover:shadow-xl"
              onClick={() => navigate(`/category/${cat.title.toLowerCase()}`)}
            >
              {/* Image (Top/Center) */}
              <div className="h-[65%] w-full overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Content (Bottom) */}
              <div className="absolute bottom-0 left-0 w-full p-8 bg-[#fdfbf7]">
                <h3 className="font-serif text-3xl text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-gray-600 mb-4">{cat.subtitle}</p>
                <div className="flex items-center gap-2 text-gray-900 font-medium group-hover:gap-4 transition-all">
                  Explore <ArrowRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Category;
