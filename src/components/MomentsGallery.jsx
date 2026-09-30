import React from 'react';
import { Camera } from 'lucide-react';

export default function MomentsGallery() {
  const images = [
    {
      src: "/assets/luggage-loaded.webp",
      alt: "Jamupet Transit Luggage Loaded in Expedition Van for Travel - jamupettransit.com",
      title: "Loading Luggage into Jamupet Transit Expedition Van",
      span: "md:col-span-2 md:row-span-2"
    },
    {
      src: "/assets/maasaimara.webp",
      alt: "Jamupet Transit Expedition Van at Maasai Mara National Reserve - jamupettransit.com",
      title: "Jamupet Transit Expedition at Maasai Mara",
      span: "md:col-span-1 md:row-span-1"
    },
    {
      src: "/assets/naivasha.webp",
      alt: "Jamupet Transit Scenic Expedition in Naivasha - jamupettransit.com",
      title: "Scenic Expedition in Naivasha with Jamupet Transit",
      span: "md:col-span-1 md:row-span-1"
    },
    {
      src: "/assets/roadtrips.webp",
      alt: "Jamupet Transit Fleet on a Road Trip Expedition in Kenya - jamupettransit.com",
      title: "Jamupet Transit Fleet on a Kenyan Road Trip",
      span: "md:col-span-2 md:row-span-1"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="text-[#C5A059]" size={24} />
            <h2 className="text-[#C5A059] font-semibold tracking-wider uppercase text-sm">Captured Moments</h2>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-6">Our Expeditions in Action</h3>
          <p className="text-gray-600 text-lg font-light">
            Glimpses of unforgettable journeys across East Africa with Jamupet Transit's premium fleet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
          {images.map((img, index) => (
            <div key={index} className={`relative group overflow-hidden rounded-2xl ${img.span}`}>
              <img
                src={img.src}
                alt={img.alt}
                title={img.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
