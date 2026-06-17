import { Plane, Hotel, MapPin, Heart, Camera, Clock, ShoppingBag } from "lucide-react";

const SERVICES = [
  {
    id: "airport-transfer",
    name: "Airport Transfers",
    description: "Punctual, stress-free arrivals at JKIA & Wilson. Flat Rate: KES 5,000.",
    icon: Plane,
    iconColor: "#C5A059"
  },
  {
    id: "hotel-transfer",
    name: "Hotel Transfers",
    description: "Seamless transit direct to your Nairobi accommodation. Flat Rate: KES 5,000.",
    icon: Hotel,
    iconColor: "#C5A059"
  },
  {
    id: "full-day",
    name: "Full Day Nairobi",
    description: "8 hours of chauffeur-driven SUV service in Nairobi (up to 100km). Flat Rate: KES 12,000.",
    icon: Clock,
    iconColor: "#C5A059"
  },
  {
    id: "excursion",
    name: "Excursion",
    description: "Errands, meetings, lunch, dinner, or shopping (max 3 hours). Flat Rate: KES 5,000.",
    icon: ShoppingBag,
    iconColor: "#C5A059"
  },
  {
    id: "intercity-ride",
    name: "Intercity Rides",
    description: "Safe, luxurious long-distance travel across Kenya. (Custom Quote).",
    icon: MapPin,
    iconColor: "#C5A059"
  },
  {
    id: "wedding-travel",
    name: "Wedding Travel",
    description: "Elegant transport for your special day. (Custom Quote).",
    icon: Heart,
    iconColor: "#C5A059"
  },
  {
    id: "safari-tour",
    name: "Safari Tours",
    description: "Custom expeditions for locals and tourists. (Custom Quote).",
    icon: Camera,
    iconColor: "#C5A059"
  }
];

export default function ServiceSelector({ onSelectService }) {
  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="booking-portal-enter text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Choose Your <span className="text-[#C5A059]">Service</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Select a service to get started with your booking today
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {SERVICES.map((service) => {
            const IconComponent = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onSelectService(service.id)}
                className="booking-portal-enter group relative rounded-xl p-4 sm:p-5 bg-white border border-gray-200 shadow-[0_6px_20px_rgba(15,23,42,0.03)] hover:border-[#1A1A1A]/40 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out text-left cursor-pointer"
              >
                {/* Content */}
                <div className="flex flex-col h-full justify-between">
                  <div>
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-[#C5A059] group-hover:bg-[#1A1A1A] flex items-center justify-center mb-3 shadow-[0_6px_12px_rgba(197,160,89,0.15)] group-hover:shadow-[0_8px_16px_rgba(15,23,42,0.18)] transition-all duration-300">
                      <IconComponent
                        size={20}
                        className="text-white"
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-[#1A1A1A] transition-colors duration-300">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-500 text-xs mb-4 group-hover:text-gray-700 transition-colors duration-300 line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-1.5 bg-gray-50 border border-gray-200 group-hover:bg-[#1A1A1A] group-hover:border-[#1A1A1A] group-hover:text-white transition-all duration-300">
                    <span className="text-[10px] font-semibold tracking-wider">
                      SELECT
                    </span>
                    <span className="text-sm group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
