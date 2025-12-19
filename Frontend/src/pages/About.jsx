import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Leaf, Droplets, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function About() {
  const values = [
    {
      title: "Clean Ingredients",
      description:
        "We keep formulas straightforward and transparent—focused on what works and what your skin actually needs.",
      Icon: Leaf,
    },
    {
      title: "Real Results",
      description:
        "Our products are designed for daily rituals: gentle, effective, and easy to layer across routines.",
      Icon: Sparkles,
    },
    {
      title: "Skin-First Care",
      description:
        "Balanced hydration and barrier support—because consistency beats complexity.",
      Icon: Droplets,
    },
    {
      title: "Safe & Secure",
      description:
        "From checkout to delivery updates, we prioritize a smooth, trustworthy experience.",
      Icon: ShieldCheck,
    },
  ];

  const highlights = [
    {
      label: "2025",
      title: "Cosmo-ticks launches",
      description:
        "Built as a modern beauty store: clean UI, fast browsing, and thoughtful product storytelling.",
    },
    {
      label: "Curated",
      title: "Everyday essentials",
      description:
        "Skincare and self-care picks curated for simple, repeatable routines.",
    },
    {
      label: "Community",
      title: "Reviews that help",
      description:
        "Ratings and reviews are designed to be useful—one review per customer per product.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <header className="bg-[#f7f5f0] pt-28 pb-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#c17f59] mb-4">
                About Cosmo-ticks
              </p>
              <h1 className="font-serif text-5xl md:text-6xl text-gray-900 leading-tight">
                Clean beauty,
                <br />
                delivered with intention.
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mt-6 max-w-xl">
                Cosmo-ticks is built around a simple belief: skincare should feel calm, clear, and
                consistent. We focus on essentials, transparent ingredients, and an experience that
                makes it easy to find what fits you.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gray-900 !text-white font-medium supports-[hover:hover]:hover:bg-black transition-colors"
                >
                  Shop collection <ArrowRight size={18} className="ml-2" />
                </Link>
                <Link
                  to="/category/skincare"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-gray-300 text-gray-900 font-medium supports-[hover:hover]:hover:border-gray-500 transition-colors"
                >
                  Explore skincare
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                <img
                  src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1400&auto=format&fit=crop"
                  alt="Cosmo-ticks story"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {highlights.map((h) => (
                  <div
                    key={h.title}
                    className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4"
                  >
                    <div className="text-xs font-bold tracking-[0.2em] uppercase text-[#c17f59]">
                      {h.label}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mt-2">{h.title}</div>
                    <div className="text-xs text-gray-500 mt-1 leading-relaxed">{h.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="font-serif text-4xl text-gray-900">What we stand for</h2>
              <p className="text-gray-500 mt-3 max-w-2xl">
                A minimal, modern approach: warm aesthetics, helpful details, and an experience that
                stays out of your way.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {values.map(({ title, description, Icon }) => (
              <div
                key={title}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#f7f5f0] flex items-center justify-center text-gray-900">
                  <Icon size={22} />
                </div>
                <div className="mt-5">
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl text-gray-900">A calmer way to shop</h2>
              <p className="text-gray-600 mt-4 leading-relaxed">
                We designed Cosmo-ticks like a skincare routine: clear steps, fewer distractions, and
                details when you need them.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-white border border-gray-100 p-5">
                  <div className="text-sm font-semibold text-gray-900">1) Discover</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Browse by category and see real ratings and review counts.
                  </div>
                </div>
                <div className="rounded-2xl bg-white border border-gray-100 p-5">
                  <div className="text-sm font-semibold text-gray-900">2) Decide</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Product details show average rating, customer reviews, and rich imagery.
                  </div>
                </div>
                <div className="rounded-2xl bg-white border border-gray-100 p-5">
                  <div className="text-sm font-semibold text-gray-900">3) Repeat</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Save favorites to your wishlist and come back anytime.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white">
              <div className="aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1400&auto=format&fit=crop"
                  alt="Skincare routine"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-sm font-semibold text-gray-900">Tip</div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  If you’ve tried a product, leaving a review helps others shop confidently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-8 md:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h2 className="font-serif text-4xl text-gray-900">Ready to find your essentials?</h2>
              <p className="text-gray-600 mt-3 max-w-2xl">
                Start with skincare favorites, build a simple routine, and save what you love.
              </p>
            </div>
            <div className="flex gap-3 flex-col sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gray-900 !text-white font-medium supports-[hover:hover]:hover:bg-black transition-colors"
              >
                Browse all products
              </Link>
              <a
                href="mailto:support@cosmo-ticks.com"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-gray-300 text-gray-900 font-medium supports-[hover:hover]:hover:border-gray-500 transition-colors"
              >
                Contact support
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;
