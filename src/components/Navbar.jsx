import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  const serviceItems = [
    { name: "Airport Transfers", hash: "/services#transfers" },
    { name: "Chauffeur Rentals", hash: "/services#rentals" },
    { name: "Hotel Partnerships", hash: "/services#hotels" },
    { name: "Fleet Management", hash: "/services#fleet" },
  ];

  return (
    <>
      <nav className={`fixed w-full z-[3000] transition-all duration-500 ${
        isScrolled 
          ? "bg-[#050505]/80 backdrop-blur-xl py-4 shadow-2xl border-b border-white/5" 
          : "bg-transparent py-6"
      }`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/jts-logoo.png" 
              alt="Jamupet Transit" 
              width="156" 
              height="80"
              className="h-14 md:h-16 w-auto object-contain group-hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${location.pathname === "/" ? "text-[#C5A059]" : "text-white hover:text-[#C5A059]"}`}>
              Home
            </Link>
            <Link to="/about" className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${location.pathname === "/about" ? "text-[#C5A059]" : "text-white hover:text-[#C5A059]"}`}>
              About
            </Link>
            
            {/* Animated Dropdown */}
            <div className="group relative">
              <HashLink to="/services" className={`text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-1 transition-colors ${location.pathname.includes("/services") ? "text-[#C5A059]" : "text-white hover:text-[#C5A059]"}`}>
                Services <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
              </HashLink>
              
              {/* Invisible bridge to keep hover active */}
              <div className="absolute top-full left-0 w-full h-6" />
              
              {/* Dropdown Menu */}
              <div className="absolute w-64 top-full left-0 pt-6 opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out">
                <div className="flex flex-col bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                  {serviceItems.map((item, index) => (
                    <HashLink 
                      key={item.name} 
                      smooth 
                      to={item.hash} 
                      className={`p-4 text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#C5A059] hover:bg-white/5 transition-colors flex items-center gap-2 ${
                        index !== serviceItems.length - 1 ? 'border-b border-white/5' : ''
                      }`}
                    >
                      <ArrowRight size={10} className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100" />
                      {item.name}
                    </HashLink>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/destinations" className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${location.pathname === "/destinations" ? "text-[#C5A059]" : "text-white hover:text-[#C5A059]"}`}>
              Destinations
            </Link>
            <Link to="/auth" className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${location.pathname === "/auth" ? "text-[#C5A059]" : "text-white hover:text-[#C5A059]"}`}>
                 Client Login
                  </Link>
            
            <button 
              onClick={() => navigate("/booking")}
              className="bg-[#C5A059] text-black px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all duration-300"
            >
              
              Book Now
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white hover:text-[#C5A059] transition-colors z-[3001]" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* FULL SCREEN MOBILE MENU */}
      <div className={`fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl z-[2999] flex flex-col justify-center items-center transition-all duration-500 ease-in-out ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      }`}>
        <div className="flex flex-col items-center gap-8 w-full px-6">
          <Link to="/" className="text-2xl font-serif text-white hover:text-[#C5A059] transition-colors">Home</Link>
          <Link to="/about" className="text-2xl font-serif text-white hover:text-[#C5A059] transition-colors">About Us</Link>
          <div className="w-12 h-[1px] bg-white/10 my-2" />
          <Link to="/services" className="text-2xl font-serif text-[#C5A059]">Our Services</Link>
          {serviceItems.map((item) => (
            <HashLink key={item.name} smooth to={item.hash} className="text-sm font-light text-gray-400 uppercase tracking-widest hover:text-white">
              {item.name}
            </HashLink>
          ))}
          <div className="w-12 h-[1px] bg-white/10 my-2" />
          <Link to="/destinations" className="text-2xl font-serif text-white hover:text-[#C5A059] transition-colors">Destinations</Link>
          
          <button 
            onClick={() => {
              setIsOpen(false);
              navigate("/booking");
            }}
            className="mt-8 bg-[#C5A059] text-black w-full max-w-[200px] py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all"
          >
            Book Now
          </button>
        </div>
      </div>
    </>
  );
}