import {
  MapPin,
  CheckCircle,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface PropertyCardData {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  address?: string;
  city?: string;
  area: number;
  rooms?: number;
  floor?: string | number;
  type: string;
  category?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  badges?: string[];
  sold?: boolean;
  yearBuilt?: number;
  mapUrl?: string;
}

interface PropertyCardProps {
  property: PropertyCardData;
  index: number;
  onClick?: (e: React.MouseEvent) => void;
  layout?: "index" | "properties";
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  index,
  onClick,
  layout = "index",
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Parse badges if it's a string, or use as is if it's an array, or default to empty array
  const getBadges = () => {
    if (!property.badges) return [];

    let badgesSource: any[] = [];

    if (Array.isArray(property.badges)) {
      badgesSource = property.badges;
    } else if (typeof property.badges === "string") {
      try {
        const parsed = JSON.parse(property.badges);
        if (Array.isArray(parsed)) {
          badgesSource = parsed;
        } else {
          badgesSource = [parsed];
        }
      } catch (e) {
        badgesSource = [property.badges];
      }
    }

    return badgesSource.filter((badge) => {
      if (badge === null || badge === undefined) return false;
      if (typeof badge === "number" && badge === 0) return false;
      if (typeof badge === "string") {
        const trimmedBadge = badge.trim();
        if (trimmedBadge === "" || trimmedBadge === "0") return false;
      }
      return true;
    });
  };

  const badges = getBadges();

  const {
    id,
    title,
    price,
    currency = "���",
    location,
    area,
    rooms,
    floor,
    type,
    category,
    videoUrl,
    thumbnailUrl,
    images = [],
    sold,
    yearBuilt,
  } = property;

  // Determine which images to display
  const displayImages =
    images.length > 0
      ? images
      : thumbnailUrl
        ? [{ url: thumbnailUrl, alt: title, isPrimary: true }]
        : [];
  const hasImages = displayImages.length > 0;

  // Image navigation functions
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length,
    );
  };

  // For properties page (list layout)
  if (layout === "properties") {
    return (
      <div
        className={cn(
          "relative group overflow-hidden flex transition-all duration-200",
        )}
      >
        {/* Image Section - Left side, sized to match reference image */}
        <div className="relative w-[350px] h-[240px] overflow-hidden flex-shrink-0">
          {/* VÂNDUT banner */}
          {property.sold && (
            <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center pointer-events-none">
              <div className="bg-red-600 text-white text-sm font-bold px-3 py-1 transform -rotate-12 shadow-lg">
                VÂNDUT
              </div>
            </div>
          )}

          {hasImages ? (
            <>
              {/* Main image */}
              <img
                src={displayImages[currentImageIndex]?.url}
                alt={displayImages[currentImageIndex]?.alt || title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600";
                }}
              />

              {/* Navigation arrows for multiple images - always visible */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 text-gray-700 p-2 hover:bg-white hover:text-gray-900 transition-all z-10 shadow-md rounded-full"
                    aria-label="Imagine anterioară"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 text-gray-700 p-2 hover:bg-white hover:text-gray-900 transition-all z-10 shadow-md rounded-full"
                    aria-label="Imagine următoare"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-3 left-3 bg-black/80 text-white px-2 py-1 text-xs font-medium">
                    {currentImageIndex + 1} / {displayImages.length}
                  </div>
                </>
              )}

              {/* Badges Overlay - Top left */}
              {badges.length > 0 && (
                <div className="absolute top-3 left-3 flex flex-wrap gap-1 pointer-events-none z-10">
                  {badges.slice(0, 2).map((badge, badgeIndex) => (
                    <Badge
                      key={badgeIndex}
                      variant="secondary"
                      className="bg-gray-900 text-white text-xs font-medium px-2 py-1"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Fallback when no images
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              <div className="text-center">
                <Building className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <span className="text-slate-400 text-sm">Fără imagine</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section - Right side */}
        <div className="flex-1 p-4 flex flex-col justify-between min-h-[240px]">
          <div className="flex-1">
            {/* Category badges */}
            <div className="flex justify-start gap-2 mb-3">
              <span className="bg-green-100 text-green-700 px-2 py-1 text-xs font-medium rounded">
                Comision 0%
              </span>
              {category === "vanzare" && (
                <span className="bg-red-100 text-red-700 px-2 py-1 text-xs font-medium rounded">
                  Exclusivitate
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
              {title}
            </h3>

            {/* Price */}
            <div className="text-xl font-light text-gray-900 mb-3">
              {price.toLocaleString()} {currency}
            </div>

            {/* Property category and location info - inline layout */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium rounded">
                {(() => {
                  // Extract only the property type from the full type string
                  if (type) {
                    if (type.toLowerCase().includes("apartament"))
                      return "Apartament";
                    if (type.toLowerCase().includes("garsonieră"))
                      return "Garsonieră";
                    if (type.toLowerCase().includes("casă")) return "Casă";
                    if (type.toLowerCase().includes("vilă")) return "Vilă";
                    if (type.toLowerCase().includes("teren")) return "Teren";
                    if (type.toLowerCase().includes("comercial"))
                      return "Spațiu comercial";
                    return type.split(" ")[0]; // Take first word if no match
                  }
                  return category === "vanzare"
                    ? "De vânzare"
                    : "De închiriere";
                })()}
              </span>
              <span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium rounded">
                {property.city || location.split(",")[0]}
              </span>
              {property.county && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium rounded">
                  {property.county}
                </span>
              )}
              <span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium rounded">
                {area} mp
              </span>
              {yearBuilt && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium rounded">
                  {yearBuilt}
                </span>
              )}
            </div>
          </div>

          {/* Bottom section with buttons */}
          <div className="flex items-center gap-3 mt-4">
            {/* Vezi mai multe detalii button */}
            <button
              onClick={onClick}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 text-xs font-medium transition-colors duration-200 hover:from-red-700 hover:to-red-800 flex items-center justify-center"
            >
              Vezi mai multe detalii
            </button>

            {/* Map button */}
            {(property.mapUrl || property.address) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (property.mapUrl) {
                    window.open(property.mapUrl, "_blank");
                  }
                }}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 text-xs font-medium transition-colors duration-200 hover:from-green-700 hover:to-green-800 flex items-center justify-center gap-2"
              >
                <MapPin className="w-3 h-3" />
                Hartă
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For index page (grid layout) - existing design
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group bg-white overflow-hidden cursor-pointer h-full flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200",
      )}
    >
      {/* Image Section - 60% height */}
      <div className="relative h-48 overflow-hidden">
        {/* VÂNDUT banner */}
        {property.sold && (
          <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-red-600 text-white text-sm font-bold px-3 py-1 transform -rotate-12 shadow-lg">
              VÂNDUT
            </div>
          </div>
        )}

        {hasImages ? (
          <>
            {/* Main image */}
            <img
              src={displayImages[currentImageIndex]?.url}
              alt={displayImages[currentImageIndex]?.alt || title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600";
              }}
            />

            {/* Navigation arrows for multiple images - Always visible */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 text-gray-700 p-1 hover:bg-white hover:text-gray-900 transition-all z-10 shadow-lg rounded-full w-7 h-7 flex items-center justify-center"
                  aria-label="Imagine anterioară"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 text-gray-700 p-1 hover:bg-white hover:text-gray-900 transition-all z-10 shadow-lg rounded-full w-7 h-7 flex items-center justify-center"
                  aria-label="Imagine următoare"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>

                {/* Image counter */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 text-xs rounded">
                  {currentImageIndex + 1} / {displayImages.length}
                </div>
              </>
            )}

            {/* Show arrows even for single images to indicate there could be more */}
            {displayImages.length === 1 && (
              <>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 text-gray-500 p-1 z-10 shadow-lg rounded-full w-7 h-7 flex items-center justify-center opacity-50">
                  <ChevronLeft className="w-3 h-3" />
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 text-gray-500 p-1 z-10 shadow-lg rounded-full w-7 h-7 flex items-center justify-center opacity-50">
                  <ChevronRight className="w-3 h-3" />
                </div>
              </>
            )}

            {/* Image counter when single image */}
            {displayImages.length === 1 && (
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 text-xs">
                1 / 1
              </div>
            )}
          </>
        ) : (
          // Fallback when no images
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <div className="text-center">
              <Building className="w-8 h-8 text-slate-400 mx-auto mb-1" />
              <span className="text-slate-400 text-xs">Fără imagine</span>
            </div>
          </div>
        )}

        {/* Badges Overlay - Top left */}
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 pointer-events-none z-10">
            {badges.slice(0, 2).map((badge, badgeIndex) => (
              <Badge
                key={badgeIndex}
                variant="secondary"
                className="bg-orange-500 text-white text-xs font-medium px-2 py-0.5"
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content Section - 40% height */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2 leading-tight">
          {title}
        </h3>

        {/* Price */}
        <div className="text-lg font-light text-slate-900 mb-2">
          {price.toLocaleString()} {currency}
        </div>

        {/* Location */}
        <div className="flex items-center text-xs text-slate-600 mb-2">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">{property.address || location}</span>
        </div>

        {/* Property Type */}
        <div className="text-xs text-slate-700 font-medium mb-1">{type}</div>

        {/* Property Details - Bottom row */}
        <div className="flex items-center justify-between text-xs text-slate-600 mt-auto">
          <div className="flex items-center gap-2">
            {area > 0 && <span>{area} mp</span>}
            {yearBuilt && (
              <>
                <span>•</span>
                <span>{yearBuilt}</span>
              </>
            )}
          </div>

          {/* Category badge */}
          {category === "inchiriere" && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium">
              Închiriere
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
