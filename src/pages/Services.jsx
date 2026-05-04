import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Building, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";
import BackButton from "../components/BackButton";
import ServiceFlipCards from "../components/Services/ServiceFlipCards";
import ClientReviews from "../components/Services/ClientReviews";

export default function Services() {
  const { hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const allCards = document.querySelectorAll(".is-flipped");
    allCards.forEach((card) => card.classList.remove("is-flipped"));

    if (hash) {
      const targetId = hash.replace("#", "");
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        const flipInner = element.querySelector(".transition-all"); 
        if (flipInner) {
          setTimeout(() => {
            flipInner.classList.add("is-flipped");
          }, 600);
        }
      }
    }
  }, [hash]); 

  const handlePropertyListing = () => {
    const phoneNumber = "254705416781";
    const message = "Hello Jamupet Transit, I own a property/Airbnb and I am interested in partnering with you for guest transfers.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="bg-white min-h-screen">
      <BackButton />

      {/* INVISIBLE SEO FAQ SCHEMA */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How much does it cost to rent an Executive Sedan in Nairobi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our Executive Sedan rentals are highly flexible, starting from approximately KES 2,500 per hour. They are perfect for city meetings, quick errands, and comfortable airport drop-offs for up to 3 passengers."
            }
          },
          {
            "@type": "Question",
            "name": "Are there cheap rental transfer services available?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our pricing is designed to let you save money with our rentals by offering flexible hourly, daily, and per-trip rates tailored to your exact needs in Kenya."
            }
          },
          {
            "@type": "Question",
            "name": "Can I get a daily rate for a Luxury SUV or Safari Tour?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! We offer custom daily rates for our Luxury SUVs and specialized Safari cruisers. They are ideal for intercity rides, corporate teams, and tourist expeditions."
            }
          }
        ]
      })}} />

      {/* HERO SECTION */}
      <section className="pt-40 pb-12 bg-[#1A1A1A] text-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-2xl">
            <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px] mb-4 block">
              Redefining Kenyan Hospitality
            </span>
            <h1 className="text-5xl md:text-7xl font-bold">
              Our <span className="text-[#C5A059]">Solutions.</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg font-light max-w-sm border-l border-[#C5A059]/30 pl-6 mb-2">
            Professional logistics for the discerning traveler, tourist, and property partner.
          </p>
        </div>
      </section>

      {/* 1. CORE SERVICES (FLIP CARDS) */}
      <ServiceFlipCards />

      {/* 2. DYNAMIC PRICING TABLE (SEO OPTIMIZED & LUXRIDE STYLE) */}
      <section className="py-24 px-6 bg-gray-50" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Solutions designed for comfort, reliability and style.</h2>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Why compromise on quality when you can have both? We make it easy to <strong className="text-gray-900">save money with our rentals</strong> without sacrificing luxury. Whether you are looking for highly competitive, <strong className="text-gray-900">cheap rental transfer services</strong> for quick Nairobi city errands or premium chauffeur rates for a multi-day safari, our pricing adapts to your specific needs, duration, and vehicle choice.
            </p>
            <p className="text-[#B35A38] text-xs font-bold uppercase tracking-widest mt-6 bg-[#B35A38]/10 inline-block px-4 py-2 rounded-full">
              Rates are flexible based on hours, distance & itinerary
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Standard Tier */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Executive Sedan</h3>
              <p className="text-gray-500 text-sm mb-6">Perfect for city meetings & airport drops.</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-gray-900">Flexible</span>
                <span className="text-gray-400 text-sm block mt-1">Hourly & Airport Rates</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Up to 3 Passengers', 'Clean, air-conditioned comfort', 'Professional Chauffeur', 'Complimentary Bottled Water'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle2 size={16} className="text-[#C5A059]" /> {feature}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/booking", { state: { type: "Sedan Rental" }})} className="w-full py-4 rounded-xl border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-colors">
                Book Sedan
              </button>
            </div>

            {/* Featured Tier (Matches Luxride Middle Column Style) */}
            <div className="bg-[#1A1A1A] p-10 rounded-[2.5rem] shadow-2xl relative transform lg:-translate-y-4 border border-gray-800">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#B35A38] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Luxury SUV</h3>
              <p className="text-gray-400 text-sm mb-6">Ideal for intercity rides & corporate teams.</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">Custom</span>
                <span className="text-gray-400 text-sm block mt-1">Daily / Hourly rates available</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Up to 7 Passengers', 'Superior legroom & luggage space', 'Elite, discreet chauffeurs', 'Free Wi-Fi & Refreshments', 'Priority Booking Status'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                    <CheckCircle2 size={16} className="text-[#B35A38]" /> {feature}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/booking", { state: { type: "SUV Rental" }})} className="w-full py-4 rounded-xl bg-[#B35A38] text-white font-bold hover:bg-white hover:text-black transition-colors">
                Book Luxury SUV
              </button>
            </div>

            {/* Premium Tier */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Safari & Wedding</h3>
              <p className="text-gray-500 text-sm mb-6">Designed for special events & expeditions.</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-gray-900">Per Trip</span>
                <span className="text-gray-400 text-sm block mt-1">Based on exact itinerary</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Modified Safari Vans/Cruisers', 'Pristine Wedding Fleet', 'Expert driver-guides available', 'Decor & Custom Routing'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle2 size={16} className="text-[#C5A059]" /> {feature}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/booking", { state: { type: "Specialty Rental" }})} className="w-full py-4 rounded-xl border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-colors">
                Request Quote
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROPERTY PARTNERSHIP (CREATIVE TEXT UI) */}
      <section className="py-24 px-6 bg-white" id="hotels">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[3rem] p-10 md:p-16 border border-gray-200 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C5A059] opacity-10 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1 text-center md:text-left">
                <span className="text-[#B35A38] font-bold tracking-widest text-[10px] uppercase mb-4 block">B2B Partnerships</span>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Elevate Your Guest Experience.
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Do you own a premium Hotel, Boutique Airbnb, or Lodge in Kenya? Partner with Jamupet Transit to offer your guests seamless, reliable transportation from the moment they land at JKIA straight to your doorstep. 
                </p>
                <button 
                  onClick={handlePropertyListing}
                  className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-[#B35A38] transition-all flex items-center justify-center md:justify-start gap-3 w-full md:w-auto"
                >
                  List Your Property With Us <ArrowRight size={16} />
                </button>
              </div>

              <div className="flex-1 w-full space-y-6">
                <PartnerBenefit 
                  icon={<Building size={24} className="text-[#C5A059]" />}
                  title="Direct Client Connections"
                  desc="Provide immense value to your guests by solving their logistical headaches before they arrive."
                />
                <PartnerBenefit 
                  icon={<TrendingUp size={24} className="text-[#C5A059]" />}
                  title="Zero Hassle, High Reward"
                  desc="We handle the driving, the tracking, and the luggage. You get the 5-star review for a smooth check-in."
                />
                <PartnerBenefit 
                  icon={<ShieldCheck size={24} className="text-[#C5A059]" />}
                  title="Guaranteed Safety & Vetting"
                  desc="Rest easy knowing your guests are handled by verified, professional Kenyan chauffeurs."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CLIENT REVIEWS SECTION */}
      <ClientReviews />

    </div>
  );
}

// Reusable micro-component for the Partnership section
function PartnerBenefit({ icon, title, desc }) {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl flex gap-5 items-start shadow-sm hover:shadow-md transition-shadow">
      <div className="mt-1 bg-gray-50 p-3 rounded-full">{icon}</div>
      <div>
        <h4 className="text-gray-900 font-bold text-lg mb-2">{title}</h4>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}