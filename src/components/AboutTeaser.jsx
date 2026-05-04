import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function AboutTeaser() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-[#1A1A1A] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left Side: Big Heading */}
          <div className="space-y-6">
            <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">What We Do</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              What We Provide Is Luxury Transport And The Most <span className="text-[#C5A059] italic">Comfortable Experience.</span>
            </h2>
          </div>

          {/* Right Side: Content & SEO Keywords */}
          <div className="space-y-8 pt-2">
            <p className="text-gray-400 leading-relaxed text-base md:text-lg font-light">
              Step into a world of reliability with plush seating, pristine interiors, and state-of-the-art features designed to maximize comfort. Whether you need VIP airport transfers or want to <strong className="text-white font-medium">save money with our rentals</strong>, we offer highly competitive, <strong className="text-white font-medium">cheap rental services in Nairobi</strong> without ever compromising on our premium standards.
            </p>

            <ul className="space-y-4">
              {[
                "Our diverse fleet includes executive sedans, luxury SUVs, and safari cruisers.",
                "We offer flexible options to suit any occasion, from corporate events to weddings.",
                "Our experienced, courteous chauffeurs are trained to ensure a safe, private journey."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="mt-1">
                    <CheckCircle2 size={16} className="text-[#C5A059]" />
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate("/about")}
              className="flex items-center gap-4 text-white font-bold hover:text-[#B35A38] transition-all text-sm group pt-4"
            >
              Read Our Full Story
              <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-[#B35A38] group-hover:bg-[#B35A38] transition-all">
                <ArrowRight size={16} />
              </div>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}