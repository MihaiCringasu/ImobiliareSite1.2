import { useParams, useNavigate, Link } from "react-router-dom";
import { useProperty, useProperties } from "@/hooks/useApi";
import { getYouTubeEmbedUrl } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import type { Property } from "@/types/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { COMPANY_CONFIG } from "@/config/app";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Ruler,
  Bed,
  Bath,
  Building,
  Phone,
  MessageCircle,
  LoaderCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Play,
  X,
} from "lucide-react";
import {
  FaBuilding,
  FaHome,
  FaTree,
  FaStore,
  FaWarehouse,
  FaCalendarAlt,
  FaLayerGroup,
  FaWhatsapp,
} from "react-icons/fa";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [pricePerSqM, setPricePerSqM] = useState<number | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideoSection, setShowVideoSection] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const {
    data: propertyData,
    isLoading,
    isError,
    refetch,
  } = useProperty(id || "");
  const { data: allProperties } = useProperties(1, 100, {});

  const property = propertyData?.data as Property | undefined;
  const agent = property?.agent;

  const stickyRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Get images from property data
  const images = property?.images || [];
  const hasImages = images.length > 0;

  // Get videos from property data or legacy videoUrl
  const videos = property?.videos || [];
  const legacyVideo = property?.videoUrl
    ? [
        {
          id: "legacy",
          url: property.videoUrl,
          title: `Video pentru ${property.title}`,
          description: "",
          order: 0,
        },
      ]
    : [];
  const allVideos = [...videos, ...legacyVideo];
  const hasVideos = allVideos.length > 0;

  // Update price per square meter when property data is available
  useEffect(() => {
    if (property?.price && property?.area) {
      setPricePerSqM(Math.round(property.price / property.area));
    }
  }, [property]);

  // Update related properties
  useEffect(() => {
    if (allProperties?.data?.data && property) {
      const properties = Array.isArray(allProperties.data.data)
        ? allProperties.data.data
        : [];

      const sameCategory = properties.filter(
        (p: Property) =>
          p.id !== property.id && p.category === property.category,
      );

      const shuffled = [...sameCategory].sort(() => 0.5 - Math.random());
      const filtered = shuffled.slice(0, 4);

      setRelatedProperties(filtered);
    }
  }, [allProperties, property]);

  // Format price with thousands separator
  const formatPrice = (price: number) => {
    return (
      new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 }).format(
        price,
      ) + " €"
    );
  };

  const fullDescription = property?.description || "Descriere indisponibilă.";

  // Navigation functions for image gallery
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Modal navigation functions
  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  // Loading state
  if (isLoading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  // Error state
  if (isError || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Eroare la încărcarea proprietății
        </h2>
        <p className="text-slate-600 mb-4">
          Nu am putut încărca detaliile proprietății. Vă rugăm să încercați din
          nou.
        </p>
        <Button
          onClick={() => refetch()}
          className="bg-red-600 hover:bg-red-700"
        >
          Încercați din nou
        </Button>
      </div>
    );
  }

  // Property not found
  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Proprietatea nu a fost găsită
        </h2>
        <p className="text-slate-600 mb-6">
          Nu am putut găsi proprietatea solicitată.
        </p>
        <Button onClick={() => navigate("/proprietati")} variant="default">
          Înapoi la anunțuri
        </Button>
      </div>
    );
  }

  // Create property details dynamically
  const createPropertyDetails = () => {
    const details = [];

    // Basic details
    if (property.type) {
      details.push({
        label: "Tip apartament",
        value: (() => {
          if (property.type.toLowerCase().includes("apartament"))
            return "Apartament";
          if (property.type.toLowerCase().includes("garsonieră"))
            return "Garsonieră";
          if (property.type.toLowerCase().includes("casă")) return "Casă";
          if (property.type.toLowerCase().includes("vilă")) return "Vilă";
          if (property.type.toLowerCase().includes("teren")) return "Teren";
          return property.type.split(" ")[0];
        })(),
      });
    }

    if (property.rooms && property.type.toLowerCase() !== "teren") {
      details.push({ label: "Număr camere", value: property.rooms.toString() });
    }

    if (property.bathrooms) {
      details.push({
        label: "Număr băi",
        value: property.bathrooms.toString(),
      });
    }

    if (property.area) {
      details.push({ label: "Suprafață utilă", value: `${property.area} mp` });
    }

    if ((property as any).builtArea) {
      details.push({
        label: "Suprafață construită",
        value: `${(property as any).builtArea} mp`,
      });
    }

    if (property.floor && property.type.toLowerCase() !== "teren") {
      details.push({ label: "Etaj", value: property.floor.toString() });
    }

    if ((property as any).orientation) {
      details.push({
        label: "Orientare",
        value: (property as any).orientation,
      });
    }

    if ((property as any).comfort) {
      details.push({ label: "Confort", value: (property as any).comfort });
    }

    if ((property as any).interiorState) {
      details.push({
        label: "Stare interior",
        value: (property as any).interiorState,
      });
    }

    if (property.yearBuilt) {
      details.push({
        label: "Anul finalizării",
        value: property.yearBuilt.toString(),
      });
    }

    if ((property as any).balconies) {
      details.push({
        label: "Număr balcoane",
        value: (property as any).balconies.toString(),
      });
    }

    if ((property as any).terraces) {
      details.push({
        label: "Număr terase",
        value: (property as any).terraces.toString(),
      });
    }

    if ((property as any).parkingSpaces) {
      details.push({
        label: "Număr locuri parcare",
        value: (property as any).parkingSpaces.toString(),
      });
    }

    if ((property as any).fencing) {
      details.push({ label: "Împrejmuiri", value: (property as any).fencing });
    }

    if ((property as any).availability) {
      details.push({
        label: "Disponibilitate",
        value: (property as any).availability,
      });
    }

    return details;
  };

  const propertyDetails = createPropertyDetails();
  const halfLength = Math.ceil(propertyDetails.length / 2);
  const leftColumnDetails = propertyDetails.slice(0, halfLength);
  const rightColumnDetails = propertyDetails.slice(halfLength);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {property.sold && (
        <div className="fixed top-20 right-4 bg-red-600 text-white px-6 py-3 rounded-lg z-50 font-bold text-lg shadow-lg">
          VÂNDUT
        </div>
      )}

      {/* Back button */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-red-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Înapoi la anunțuri
        </button>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-4">
        {/* Header with title and price with categories inline */}
        <div className="mb-3">
          <h1
            className="text-xl lg:text-2xl font-medium text-gray-900 mb-3"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {property.title}
          </h1>

          {/* Price and Categories on same line */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl lg:text-3xl font-light text-gray-900"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {formatPrice(property.price)}
              </span>
              {(property as any).isNegotiable && (
                <span
                  className="text-sm text-gray-600 font-light"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  (negociabil)
                </span>
              )}
            </div>

            {/* Categories on the right side */}
            <div className="flex flex-wrap gap-2">
              <span
                className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {(() => {
                  if (property.type) {
                    if (property.type.toLowerCase().includes("apartament"))
                      return "Apartament";
                    if (property.type.toLowerCase().includes("garsonieră"))
                      return "Garsonieră";
                    if (property.type.toLowerCase().includes("casă"))
                      return "Casă";
                    if (property.type.toLowerCase().includes("vilă"))
                      return "Vilă";
                    if (property.type.toLowerCase().includes("teren"))
                      return "Teren";
                    return property.type.split(" ")[0];
                  }
                  return "Proprietate";
                })()}
              </span>
              <span
                className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {property.city || "Locație"}
              </span>
              <span
                className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {property.area} mp
              </span>
              {property.yearBuilt && (
                <span
                  className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {property.yearBuilt}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery Section */}
            <div className="bg-slate-100 overflow-hidden relative h-[500px]">
              {property.sold ? (
                <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center pointer-events-none">
                  <div className="bg-red-600 text-white text-4xl md:text-5xl font-bold px-8 py-3 rounded-lg transform -rotate-12 shadow-lg">
                    VÂNDUT
                  </div>
                </div>
              ) : null}

              {hasImages ? (
                <>
                  {/* Main image */}
                  <div className="relative w-full h-[500px]">
                    <img
                      src={images[currentImageIndex]?.url}
                      alt={
                        images[currentImageIndex]?.alt ||
                        `Imagine ${currentImageIndex + 1} pentru ${property.title}`
                      }
                      className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
                      onClick={() => openImageModal(currentImageIndex)}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800";
                      }}
                    />

                    {/* Navigation buttons */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 transition-colors shadow-lg"
                          aria-label="Imagine anterioară"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 transition-colors shadow-lg"
                          aria-label="Imagine următoare"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Image counter */}
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail navigation */}
                  {images.length > 1 && (
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-6 gap-2">
                        {images.slice(0, 6).map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`aspect-square overflow-hidden border-2 transition-colors ${
                              currentImageIndex === index
                                ? "border-red-600"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={image.alt || `Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                        {images.length > 6 && (
                          <button
                            onClick={() => openImageModal(6)}
                            className="aspect-square bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-medium hover:bg-slate-300 transition-colors"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                          >
                            +{images.length - 6}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Fallback when no images
                <div className="flex items-center justify-center h-64 bg-slate-200">
                  <div className="text-center">
                    <Building className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <span className="text-slate-400">
                      Nicio imagine disponibilă
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Breadcrumb */}
            <div
              className="flex items-center text-sm text-gray-500"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <Link to="/" className="hover:text-gray-700 transition-colors">
                Acasă
              </Link>
              <span className="mx-2">/</span>
              <Link
                to="/proprietati"
                className="hover:text-gray-700 transition-colors"
              >
                Oferte Imobiliare Casa Vis
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-800 font-medium">{property.type}</span>
            </div>

            {/* Description Section */}
            <div className="bg-white">
              <div className="mb-6">
                <div
                  className={`text-gray-600 relative ${
                    !showFullDescription && "max-h-32 overflow-hidden"
                  }`}
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {fullDescription}
                  </p>
                  {!showFullDescription && fullDescription.length > 200 && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
                {fullDescription.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-gray-700 hover:text-gray-900 font-medium mt-2 flex items-center gap-1 text-sm"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {showFullDescription
                      ? "Citește mai puțin"
                      : "Citește mai mult"}
                    {showFullDescription ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Videos Section */}
            {hasVideos && (
              <div className="bg-white">
                <div className="space-y-4">
                  {allVideos.map((video, index) => (
                    <div key={video.id || index} className="space-y-2">
                      <div className="h-[500px] bg-black overflow-hidden">
                        <iframe
                          src={getYouTubeEmbedUrl(video.url)}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          title={video.title || `Video ${index + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Details Table - 2 Separate Tables Side by Side */}
            <div className="bg-white">
              <div className="grid grid-cols-2 gap-0 max-w-4xl mx-auto">
                {/* Left Table */}
                <div className="border border-gray-300">
                  {leftColumnDetails.map((detail, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-2 ${index < leftColumnDetails.length - 1 ? "border-b border-gray-300" : ""}`}
                    >
                      <div className="p-3 border-r border-gray-300 bg-gray-50">
                        <span
                          className="text-xs text-gray-700 font-medium"
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          {detail.label}
                        </span>
                      </div>
                      <div className="p-3">
                        <span
                          className="text-xs text-gray-900"
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          {detail.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Table */}
                <div className="border border-gray-300 border-l-0">
                  {rightColumnDetails.map((detail, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-2 ${index < rightColumnDetails.length - 1 ? "border-b border-gray-300" : ""}`}
                    >
                      <div className="p-3 border-r border-gray-300 bg-gray-50">
                        <span
                          className="text-xs text-gray-700 font-medium"
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          {detail.label}
                        </span>
                      </div>
                      <div className="p-3">
                        <span
                          className="text-xs text-gray-900"
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          {detail.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Section */}
            {(property.address ||
              property.location ||
              (property as any).mapUrl ||
              (property as any).mapEmbedUrl) && (
              <div className="bg-white">
                <div className="h-[500px] bg-slate-100 overflow-hidden">
                  <iframe
                    src={(() => {
                      // Use embed URL if available, otherwise try to convert map URL or create from address
                      if ((property as any).mapEmbedUrl) {
                        return (property as any).mapEmbedUrl;
                      }

                      if ((property as any).mapUrl) {
                        // Convert Google Maps URL to embed URL
                        let embedUrl = (property as any).mapUrl;

                        // Handle different Google Maps URL formats
                        if (embedUrl.includes("google.com/maps")) {
                          // If it's already an embed URL, use it as is
                          if (embedUrl.includes("/embed")) {
                            return embedUrl;
                          }

                          // Extract place information and create embed URL
                          if (embedUrl.includes("/place/")) {
                            const placeMatch =
                              embedUrl.match(/\/place\/([^\/]+)/);
                            if (placeMatch) {
                              const placeName = placeMatch[1];
                              return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d26.1025!3d44.4268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(placeName)}!5e0!3m2!1sen!2sro!4v1234567890`;
                            }
                          }

                          // Fallback: create a basic embed URL
                          return embedUrl.replace(
                            "google.com/maps",
                            "google.com/maps/embed",
                          );
                        }

                        return embedUrl;
                      }

                      // Create embed URL from address/location
                      const locationQuery = encodeURIComponent(
                        property.address ||
                          property.location ||
                          `${property.city}, România`,
                      );
                      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d26.1025!3d44.4268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${locationQuery}!5e0!3m2!1sen!2sro!4v1234567890`;
                    })()}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Locația pentru ${property.title}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right side - Agent Info */}
          <div className="lg:col-span-1">
            <div ref={stickyRef} className="sticky top-4">
              <div className="bg-white p-6 border border-gray-200">
                {agent ? (
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center overflow-hidden border-4 border-red-100">
                        {agent.image ? (
                          <img
                            src={agent.image}
                            alt={agent.name || "Agent imobiliar"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-3xl font-bold">
                            {agent.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "A"}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3
                      className="text-lg font-bold text-slate-800"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {agent.name}
                    </h3>
                    <p
                      className="text-slate-600 text-xs mb-3"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Agent imobiliar
                    </p>

                    <div className="bg-slate-50 p-2 mb-4">
                      <div
                        className="text-xs text-slate-500"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Sună acum
                      </div>
                      <a
                        href={`tel:${agent.phone}`}
                        className="text-lg font-bold text-slate-800 hover:text-red-600 transition-colors"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {agent.phone}
                      </a>
                    </div>

                    <div className="space-y-2">
                      <a
                        href={`tel:${agent.phone}`}
                        className="block w-full bg-red-400 hover:bg-red-500 text-white font-medium py-2 px-3 transition-colors flex items-center justify-center gap-2 text-sm"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        <Phone className="w-4 h-4" />
                        Sună acum
                      </a>
                      <a
                        href={`https://wa.me/${agent.phone.replace(
                          /[^0-9]/g,
                          "",
                        )}?text=Bună! Am o întrebare despre proprietatea ${
                          property.title
                        } (ID: ${property.id})`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-3 transition-colors flex items-center justify-center gap-2 text-sm"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {COMPANY_CONFIG.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    </div>

                    <h3
                      className="text-lg font-bold text-slate-800"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {COMPANY_CONFIG.name}
                    </h3>
                    <p
                      className="text-slate-600 text-xs mb-3"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {COMPANY_CONFIG.tagline}
                    </p>

                    <div className="bg-slate-50 p-2 mb-4">
                      <div
                        className="text-xs text-slate-500"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Sună acum
                      </div>
                      <a
                        href={`tel:${COMPANY_CONFIG.contact.phone}`}
                        className="text-lg font-bold text-slate-800 hover:text-red-600 transition-colors"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {COMPANY_CONFIG.contact.phone}
                      </a>
                    </div>

                    <div className="space-y-2">
                      <a
                        href={`tel:${COMPANY_CONFIG.contact.phone}`}
                        className="block w-full bg-red-400 hover:bg-red-500 text-white font-medium py-2 px-3 transition-colors flex items-center justify-center gap-2 text-sm"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        <Phone className="w-4 h-4" />
                        Sună acum
                      </a>
                      <a
                        href={`https://wa.me/${COMPANY_CONFIG.contact.whatsapp.replace(
                          /[^0-9]/g,
                          "",
                        )}?text=Bună! Am o întrebare despre proprietatea ${
                          property.title
                        } (ID: ${property.id})`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-3 transition-colors flex items-center justify-center gap-2 text-sm"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Properties */}
      {relatedProperties.length > 0 && (
        <div className="bg-slate-50 py-12">
          <div className="container mx-auto px-4">
            <h2
              className="text-2xl font-bold text-slate-800 mb-8"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Proprietăți similare
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProperties.map((prop, index) => {
                const isSold = (prop.sold as any) == 1;
                const propertyCardData = {
                  id: prop.id,
                  title: prop.title,
                  price: prop.price,
                  currency: "€",
                  location: prop.city || prop.location || "Locație nedefinită",
                  area: prop.area,
                  rooms: prop.rooms,
                  type: prop.type,
                  videoUrl: prop.videoUrl,
                  thumbnailUrl: prop.images?.[0]?.url,
                  badges: prop.badges,
                  sold: isSold,
                  floor: prop.floor,
                  mapUrl: (prop as any).mapUrl,
                  city: prop.city,
                  address: (prop as any).address,
                  images: prop.images || [],
                };

                return (
                  <PropertyCard
                    key={prop.id}
                    property={propertyCardData}
                    index={index}
                    layout="index"
                    onClick={() => navigate(`/proprietate/${prop.id}`)}
                  />
                );
              })}
            </div>

            {/* Back to Properties Button */}
            <div className="text-center mt-8">
              <button
                onClick={() => navigate("/proprietati")}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 text-sm font-medium transition-colors duration-200 hover:from-red-700 hover:to-red-800 flex items-center justify-center mx-auto gap-2"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <ChevronLeft className="w-4 h-4" />
                Înapoi la Proprietăți
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
              aria-label="Închide"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevModalImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  aria-label="Imagine anterioară"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextModalImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  aria-label="Imagine următoare"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Main image */}
            <div className="relative max-w-full max-h-full">
              <img
                src={images[modalImageIndex]?.url}
                alt={
                  images[modalImageIndex]?.alt ||
                  `Imagine ${modalImageIndex + 1}`
                }
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200";
                }}
              />

              {/* Image info */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
                <div className="text-center">
                  <div
                    className="text-sm font-medium"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {property.title}
                  </div>
                  <div
                    className="text-xs text-gray-300"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {modalImageIndex + 1} din {images.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PropertyDetail;
