import React from "react";
import { 
  ShieldCheck, 
  Target, 
  Users, 
  CarFront, 
  ArrowRight, 
  Award, 
  Briefcase, 
  MapPin, 
  CheckCircle2, 
  Check 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const stats = [
  { label: "KM Driven", value: "500k+" },
  { label: "Safety", value: "99.9%" },
  { label: "Drivers", value: "40+" },
  { label: "Partners", value: "15+" },
];

export default function AboutPage() {
  const navigate = useNavigate();

  const handleDriverApplication = () => {
    const phoneNumber = "254705416781";
    const message = "Hello Jamupet Transit, I am interested in applying for a Professional Chauffeur position.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="bg-white">
      <BackButton />

      {/* 1. COMPACT HERO */}
      <section className="pt-32 pb-16 bg-[#1A1A1A] text-white px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px] mb-4 block flex items-center gap-2">
            <MapPin size={12} /> Premium Logistics Kenya
          </span>
          <h1 className="text-4xl md:text-7xl font-bold leading-[1] mb-6">
            Driven by <br /> 
            <span className="italic text-[#C5A059]">Integrity.</span>
          </h1>
          <p className="max-w-lg text-gray-400 font-light text-base md:text-lg leading-relaxed">
            From Nairobi's corporate hub to the wild, we provide the gold standard in Kenyan chauffeur services.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#B35A38] opacity-5 rounded-full blur-[100px] -mr-20 -mt-20" />
      </section>

      {/* 2. OUR STORY & REIMAGINE TEXT */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Born in Nairobi Original Block */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Born in Nairobi,<br/>Serving the World.</h2>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed font-light max-w-md">
                Jamupet Transit Solutions was founded on reliability. Luxury isn't just about the car; it's about the discipline of the person behind the wheel. It's all about travelling with confidence.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                    <h3 className="text-xl font-bold text-[#B35A38]">{stat.value}</h3>
                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="rounded-[2.5rem] overflow-hidden shadow-xl h-[400px] md:h-[450px] border-8 border-gray-50">
                <img 
                  src="/assets/Nairobi-city.webp" 
                  alt="Nairobi" 
                  width="800" 
                  height="600" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=800"; }}
                />
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-8 pt-10 border-t border-gray-100">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">We reimagine the way East Africa moves for the better</h2>
            <p className="text-gray-600 leading-relaxed font-light text-base md:text-lg">
              We offer premium luxury chauffeur-driven transfers and bespoke logistical pickups across Kenya. Exceptional safety protocols, seamless meet-and-greet, and fixed, transparent pricing mean no surprises. From Jomo Kenyatta International to your final destination, we deliver the VIP standard. Get your custom quote today.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto pt-6">
              {[
                '100% Luxurious & Vetted Fleet', 
                'All Vehicles Fully Valeted & Maintained', 
                'A Safe & Secure Journey Every Time', 
                'Unmatched Comfort & Enjoyment', 
                'Clean, Polite & Knowledgeable Drivers'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="bg-white p-1 rounded-full shadow-sm">
                    <Check size={16} className="text-gray-900" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-24 bg-[#0a0a0a] text-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-12">
            <h2 className="text-4xl font-bold mb-10">How It Works</h2>
            
            <div className="relative space-y-10">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-800"></div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-[#B35A38] bg-[#0a0a0a] z-10 ring-4 ring-[#0a0a0a]"></div>
                <h3 className="text-xl font-bold mb-3">Create Your Route</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Enter your pickup & dropoff locations or select the number of hours you wish to book a car and driver for.
                </p>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-gray-600 bg-[#0a0a0a] z-10 ring-4 ring-[#0a0a0a]"></div>
                <h3 className="text-xl font-bold mb-3">Choose Vehicle For You</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Select the perfect vehicle class from our premium fleet to suit your group size, luggage requirements, and personal style.
                </p>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-gray-600 bg-[#0a0a0a] z-10 ring-4 ring-[#0a0a0a]"></div>
                <h3 className="text-xl font-bold mb-3">Enjoy The Journey</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Sit back and relax. Your professional chauffeur will ensure a safe, punctual, and highly comfortable travel experience.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={() => navigate("/booking")}
                className="bg-[#B35A38] text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-black transition-all flex items-center gap-3 text-sm group"
              >
                Go to Booking Form <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="relative w-full aspect-square md:aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
              <img 
                src="/assets/book-now.webp" 
                alt="Booking Interface" 
                width="800" 
                height="600" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=1000"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
            </div>
          </div>

        </div>
      </section>

      {/* 4. COMPACT FLEET  */}
      <section className="py-16 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <h2 className="text-3xl font-bold text-gray-900">Our Professional Fleet</h2>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Maintained to perfection</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FleetCard title="Executive Sedan" img="/assets/sedan.webp" pax="1-4" bags="2" fallback="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800" />
            <FleetCard title="Luxury SUV" img="/assets/suv.webp" pax="1-7" bags="4" fallback="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800" />
            <FleetCard title="Safari Custom" img="/assets/safari-vans.webp" pax="1-8" bags="6" fallback="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800" />
          </div>
        </div>
      </section>

      {/* 5. RELIABILITY KNOWS NO BORDERS */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-3xl overflow-hidden h-[300px] bg-gray-100">
               <img 
                 src="/assets/Airport-picks.webp" 
                 alt="Airport Terminal"
                 width="800" 
                 height="600" 
                 className="w-full h-full object-cover" 
                 onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000"; }}
               />
            </div>
            <div className="rounded-3xl overflow-hidden h-[200px] bg-gray-100">
               <img 
                 src="/assets/Hotel-transfers.webp" 
                 alt="Chauffeur and happy clients" 
                 width="800" 
                 height="600" 
                 className="w-full h-full object-cover"
                 onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600"; }}
               />
            </div>
            <div className="rounded-3xl overflow-hidden h-[200px] bg-gray-100">
               <img 
                 src="/assets/jkia.webp" 
                 alt="Luxury cars" 
                 width="800" 
                 height="600" 
                 className="w-full h-full object-cover"
                 onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=600"; }}
               />
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Reliability knows no borders and trust is universal.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed font-light">
              From the heart of bustling cities to the farthest reaches of remote landscapes, our commitment to reliability remains unwavering. We ensure your schedule is met with exact precision.
            </p>
            
            <div className="space-y-4 pt-2">
              {['Affordable', 'Professional', 'Punctual'].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Check size={16} className="text-gray-900" />
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-6">
          
            </div>
          </div>

        </div>
      </section>

      {/* 6. DRIVER CAREERS */}
      <section id="careers" className="py-16 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1A1A1A] rounded-[3rem] p-8 md:p-14 text-white flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1">
              <span className="text-[#C5A059] font-bold tracking-widest text-[10px] uppercase">Join the Elite</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">Chauffeur Careers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {['Valid PSV & DL Class BCE', 'Clean Criminal Record', '5+ Years Experience', 'Bilingual Proficiency'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                    <CheckCircle2 size={14} className="text-[#B35A38]" /> {item}
                  </div>
                ))}
              </div>
              <button 
                onClick={handleDriverApplication}
                className="bg-[#B35A38] text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-black transition-all flex items-center gap-2 text-sm"
              >
                Apply to Fleet <ArrowRight size={16} />
              </button>
            </div>
            
            <div className="flex-1 w-full rounded-[2rem] overflow-hidden h-[350px] border-8 border-white/5 group/driver">
              <img 
                 src="/assets/chauffers-careers.webp" 
                 alt="Chauffeur" 
                 width="800" 
                 height="600" 
                 className="w-full h-full object-cover grayscale group-hover/driver:grayscale-0 group-hover/driver:scale-110 transition-all duration-700 ease-in-out"
                 onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800"; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. QUICK DESTINATIONS FOOTER */}
      <section className="py-12 px-6 text-center border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ready to travel?</h2>
        <button 
          onClick={() => navigate("/destinations")}
          className="bg-black text-white px-10 py-4 rounded-xl font-bold hover:bg-[#B35A38] transition-all text-sm"
        >
          View All Destinations
        </button>
      </section>
    </div>
  );
}

function FleetCard({ title, img, pax, bags, fallback }) {
  return (
    <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 group">
      <div className="h-56 rounded-2xl overflow-hidden mb-4 relative bg-gray-100">
        <img 
          src={img} 
          alt={title}
          width="400"
          height="300"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = fallback; }}
        />
      </div>
      <div className="px-2">
        <h3 className="text-lg font-bold mb-3">{title}</h3>
        <div className="flex gap-4 border-t border-gray-50 pt-3">
          <div className="flex items-center gap-2 text-gray-500 font-semibold text-[10px] uppercase">
            <Users size={14} className="text-[#B35A38]" /> {pax} Pax
          </div>
          <div className="flex items-center gap-2 text-gray-500 font-semibold text-[10px] uppercase">
            <Briefcase size={14} className="text-[#B35A38]" /> {bags} Bags
          </div>
        </div>
      </div>
    </div>
  );
}