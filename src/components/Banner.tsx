import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { COMPANY_CONFIG } from "@/config/app";
import { Button } from "./ui/button";
import {
  Phone,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";

interface BannerProperty {
  id: string;
  title: string;
  price: number;
  videoUrl: string;
  thumbnailUrl: string;
}

const Banner = () => {
  const navigate = useNavigate();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedVideos, setSelectedVideos] = useState<BannerProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Don't render if banner is disabled
  if (!COMPANY_CONFIG.banner.enabled) {
    return null;
  }

  // Fetch properties for banner
  useEffect(() => {
    const fetchBannerProperties = async () => {
      try {
        // TODO: Replace with actual API call to get featured properties
        // For now, we'll use an empty array
        setSelectedVideos([]);
      } catch (err) {
        console.error('Error fetching banner properties:', err);
        setError('Nu s-au putut încărca proprietățile pentru banner');
      } finally {
        setLoading(false);
      }
    };

    fetchBannerProperties();
  }, []);

  // Auto-play carousel every 5 seconds
  useEffect(() => {
    if (!isPlaying || selectedVideos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % selectedVideos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, selectedVideos.length]);

  const handleButtonClick = () => {
    if (COMPANY_CONFIG.banner.buttonLink.startsWith("/")) {
      navigate(COMPANY_CONFIG.banner.buttonLink);
    } else {
      window.open(COMPANY_CONFIG.banner.buttonLink, "_blank");
    }
  };

  const goToPrevious = () => {
    setCurrentVideoIndex((prev) =>
      prev === 0 ? selectedVideos.length - 1 : prev - 1,
    );
  };

  const goToNext = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % selectedVideos.length);
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/proprietate/${propertyId}`);
  };

  if (selectedVideos.length === 0) return null;

  const currentProperty = selectedVideos[currentVideoIndex];

  return (
    <section className="relative py-0 overflow-hidden bg-slate-900">
      {/* Video Carousel Container */}
      <div className="relative h-[600px] max-w-7xl mx-auto">
        {/* Video Background */}
        <div className="absolute inset-0 bg-black">
          <video
            key={currentProperty.id}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={currentProperty.thumbnailUrl}
          >
            <source src={currentProperty.videoUrl} type="video/mp4" />
          </video>

          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          aria-label="Video anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          aria-label="Video următor"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute bottom-6 left-6 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300"
          aria-label={isPlaying ? "Pauză" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 font-heading text-shadow">
              {COMPANY_CONFIG.banner.title}
            </h2>

            <p className="text-xl sm:text-2xl mb-8 max-w-2xl mx-auto text-shadow">
              {COMPANY_CONFIG.banner.subtitle}
            </p>

            {/* Property Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 max-w-lg mx-auto">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {currentProperty.title}
              </h3>
              <div className="text-2xl font-bold text-yellow-400">
                €{currentProperty.price.toLocaleString()}
              </div>
              <button
                onClick={() => handlePropertyClick(currentProperty.id)}
                className="mt-4 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Vezi Proprietatea →
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleButtonClick}
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                {COMPANY_CONFIG.banner.buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <a
                href={`tel:${COMPANY_CONFIG.contact.phone}`}
                className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors text-lg font-medium bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg backdrop-blur-sm"
              >
                <Phone className="h-5 w-5" />
                {COMPANY_CONFIG.contact.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Video Indicators */}
        <div className="absolute bottom-6 right-6 z-20 flex gap-2">
          {selectedVideos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentVideoIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentVideoIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Video ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{
              width: `${((currentVideoIndex + 1) / selectedVideos.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Banner;
