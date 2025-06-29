import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import PropertyCard from "./PropertyCard";
import type { Property } from "@/types/api";

interface PropertyCarouselProps {
  properties: Property[];
}

const PropertyCarousel = ({ properties }: PropertyCarouselProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || properties.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % properties.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, properties.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? properties.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % properties.length);
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/proprietate/${propertyId}`);
  };

  const handleTeamClick = () => {
    navigate("/echipa");
  };

  const handleContactClick = () => {
    navigate("/contact");
  };

  if (!properties || properties.length === 0) {
    return null;
  }

  // Normalize the `sold` property to be a strict boolean to fix lint errors and handle API data inconsistency.
  const normalizedProperties = properties.map((p) => ({
    ...p,
    // The `sold` property from the API can be a number (1/0) instead of a boolean.
    // We cast to `any` to bypass TypeScript's type checking for this specific comparison.
    sold: (p.sold as any) == 1,
  }));

  return (
    <section className="bg-gray-100 pt-px pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop & Mobile Layout */}
        <div className="relative">
          {/* Desktop Grid - Show 4 videos */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6 pt-8">
            {normalizedProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={{
                  ...property,
                  currency: "€",
                  mapUrl: (property as any).mapUrl,
                  city: property.city,
                }}
                index={index}
                layout="index"
                onClick={() => handlePropertyClick(property.id)}
              />
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="lg:hidden pt-8">
            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
              Anunțuri Recomandate
            </h2>

            {/* Navigation Buttons */}
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
              aria-label="Proprietatea anterioară"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
              aria-label="Proprietatea următoare"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Mobile Properties Display */}
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {normalizedProperties.map((property, index) => (
                  <div key={property.id} className="w-full flex-shrink-0 px-2">
                    <PropertyCard
                      property={{
                        ...property,
                        currency: "€",
                        mapUrl: (property as any).mapUrl,
                        city: property.city,
                      }}
                      index={index}
                      layout="index"
                      onClick={() => handlePropertyClick(property.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {normalizedProperties.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-red-600 scale-125"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Proprietatea ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Premium Action Buttons */}
        <div className="flex justify-center gap-8 mt-16">
          <button
            onClick={handleTeamClick}
            className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-bold py-5 px-16 text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl font-sans tracking-wider uppercase min-w-[160px]"
          >
            Echipa
          </button>

          <button
            onClick={handleContactClick}
            className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-bold py-5 px-16 text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl font-sans tracking-wider uppercase min-w-[160px]"
          >
            Contact
          </button>
        </div>
      </div>
    </section>
  );
};

export default PropertyCarousel;
