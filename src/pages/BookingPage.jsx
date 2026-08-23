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
        title="Book a Ride - Jamupet Transit"
        description="Book your luxury airport transfer, intercity ride, or safari expedition online with Jamupet Transit."
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
