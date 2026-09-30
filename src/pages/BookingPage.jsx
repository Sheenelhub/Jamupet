import { useState } from "react";
import ServiceSelector from "../components/ServiceSelector";
import ServiceBookingForm from "../components/ServiceBookingForm";
import SEO from "../components/SEO";

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
  };

  const handleBackToSelector = () => {
    setSelectedService(null);
  };

  return (
    <div className="bg-[#FDFCFB] min-h-screen relative font-sans selection:bg-[#C5A059] selection:text-white pb-32">
      <SEO 
        title="Book VIP Transport | Airport Transfers Nairobi"
        description="Book your luxury airport transfer, intercity ride, or custom expedition online with Jamupet Transit. Reliable VIP transportation services in Kenya."
        keywords="book airport transfer Nairobi, VIP transport booking, hire executive car Kenya, book chauffeur Nairobi"
        canonical="https://jamupettransit.com/booking"
      />
      
      {/* GLOBAL BACK BUTTON */}
      {selectedService ? (
        <ServiceBookingForm 
          serviceType={selectedService} 
          onBack={handleBackToSelector}
        />
      ) : (
        <ServiceSelector onSelectService={handleServiceSelect} />
      )}
    </div>
  );
}
