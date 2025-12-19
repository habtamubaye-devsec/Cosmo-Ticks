import { ArrowRight } from "lucide-react";

function StorySection() {
    return (
        <section className="bg-[#f7f5f0] min-h-screen flex items-center">
            <div className="container mx-auto px-6 py-16 lg:py-20">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left: Text */}
                    <div className="lg:w-1/2">
                        <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-6 leading-tight">
                            Clean Beauty,<br />Delivered
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-8 max-w-md">
                            Every product is carefully formulated with transparent ingredients, dermatologist-tested, and crafted to enhance your natural beauty.
                        </p>
                        <a href="/about" className="inline-flex items-center gap-2 text-gray-900 font-medium hover:gap-3 transition-all">
                            Our Story <ArrowRight size={18} />
                        </a>
                    </div>

                    {/* Right: Image */}
                    <div className="lg:w-1/2">
                        <img
                            src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop"
                            alt="Natural Ingredients"
                            className=" rounded-2xl shadow-lg"
                           
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default StorySection;
