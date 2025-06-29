import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DESIGN_CONFIG, COMPANY_CONFIG } from "@/config/app";
import Navigation from "../components/Navigation";
import PropertySearch from "../components/PropertySearch";
import WhatsAppButton from "../components/WhatsAppButton";
import PropertyCarousel from "../components/PropertyCarousel";
import Footer from "../components/Footer";
import { propertyService } from "@/services/api";
import type { Property } from "@/types/api";

const Index = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getAll(1, 4, {
          includeSold: "true",
        });
        if (response && response.data && response.data.data) {
          setProperties(response.data.data);
        } else {
          // Set fallback properties when API response is empty
          setFallbackProperties();
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        // Set fallback properties when API fails
        setFallbackProperties();
      } finally {
        setIsLoading(false);
      }
    };

    const setFallbackProperties = () => {
      setProperties([
        {
          id: "1",
          title: "Garsonieră ultracentral",
          description: "Garsonieră modernă în centrul orașului",
          price: 61000,
          currency: "EUR",
          location: "București, Sector 1",
          city: "București",
          county: "București",
          area: 35,
          rooms: 1,
          bathrooms: 1,
          type: "Apartament cu 1 camera",
          category: "vânzare",
          status: "disponibil",
          featured: true,
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnailUrl:
            "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400",
          images: [
            {
              id: "1",
              url: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400",
              alt: "Garsonieră modernă",
              order: 1,
              isPrimary: true,
            },
          ],
          amenities: ["centrală proprie", "aer condiționat", "parcare"],
          energyClass: "B",
          yearBuilt: 2015,
          floor: 3,
          totalFloors: 8,
          parking: true,
          agentId: "1",
          viewsCount: 0,
          contactCount: 0,
          badges: ["Nou", "Redus"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Apartament 2 camere, modern",
          description: "Apartament modern cu 2 camere, finisaje de calitate",
          price: 85000,
          currency: "EUR",
          location: "Cluj-Napoca, Zorilor",
          city: "Cluj-Napoca",
          county: "Cluj",
          area: 55,
          rooms: 2,
          bathrooms: 1,
          type: "Apartament cu 2 camere",
          category: "vânzare",
          status: "disponibil",
          featured: true,
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnailUrl:
            "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=400",
          images: [
            {
              id: "2",
              url: "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=400",
              alt: "Apartament modern cu 2 camere",
              order: 1,
              isPrimary: true,
            },
          ],
          amenities: ["centrală termică", "balcon", "parcare subterană"],
          energyClass: "A",
          yearBuilt: 2018,
          floor: 2,
          totalFloors: 4,
          parking: true,
          agentId: "1",
          viewsCount: 0,
          contactCount: 0,
          badges: ["Exclusivitate"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Casă cu grădină",
          description: "Casă modernă cu grădină, ideală pentru familii",
          price: 120000,
          currency: "EUR",
          location: "Timișoara, Iosefin",
          city: "Timișoara",
          county: "Timiș",
          area: 120,
          rooms: 4,
          bathrooms: 2,
          type: "Casă",
          category: "vânzare",
          status: "disponibil",
          featured: true,
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnailUrl:
            "https://images.pexels.com/photos/164558/pexels-photo-164558.jpeg?auto=compress&cs=tinysrgb&w=400",
          images: [
            {
              id: "3",
              url: "https://images.pexels.com/photos/164558/pexels-photo-164558.jpeg?auto=compress&cs=tinysrgb&w=400",
              alt: "Casă cu grădină",
              order: 1,
              isPrimary: true,
            },
          ],
          amenities: ["grădină", "garaj", "teren propriu", "pavilion de vară"],
          energyClass: "C",
          yearBuilt: 2010,
          floor: 1,
          totalFloors: 1,
          parking: true,
          agentId: "1",
          viewsCount: 0,
          contactCount: 0,
          badges: ["Gradină"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          title: "Apartament 3 camere, central",
          description: "Apartament spațios cu 3 camere în centrul orașului",
          price: 95000,
          currency: "EUR",
          location: "Iași, Copou",
          city: "Iași",
          county: "Iași",
          area: 75,
          rooms: 3,
          bathrooms: 1,
          type: "Apartament cu 3 camere",
          category: "vânzare",
          status: "disponibil",
          featured: true,
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnailUrl:
            "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
          images: [
            {
              id: "4",
              url: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
              alt: "Apartament 3 camere central",
              order: 1,
              isPrimary: true,
            },
          ],
          amenities: [
            "centrală termică",
            "balcon",
            "parcare",
            "podea laminată",
          ],
          energyClass: "B",
          yearBuilt: 2017,
          floor: 2,
          totalFloors: 8,
          parking: true,
          agentId: "1",
          viewsCount: 0,
          contactCount: 0,
          badges: ["Central", "Renovare recentă"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    };

    fetchProperties();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm font-light">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <div className="relative min-h-screen bg-gray-50">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/18788673/pexels-photo-18788673.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1')`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen pt-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 w-full text-center">
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 mb-6 tracking-tight">
              Casa Vis
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
              Găsește casa perfectă pentru stilul tău de viață
            </p>

            {/* CTA Button */}
            <button
              onClick={() => navigate("/proprietati")}
              className="bg-gray-900 text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              Explorează proprietățile
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Property Carousel Section */}
      <PropertyCarousel properties={properties} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
