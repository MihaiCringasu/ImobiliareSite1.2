import { Search, Home } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useNavigate } from "react-router-dom";
import { useState, KeyboardEvent } from "react";

const PropertySearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [category, setCategory] = useState("vanzare"); // Default to vanzare

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchTerm) {
      params.append("search", searchTerm);
    }

    if (propertyType && propertyType !== "all") {
      params.append("type", propertyType);
    }

    if (category) {
      params.append("category", category);
    }

    navigate(`/proprietati?${params.toString()}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl">
      {/* Category Tabs */}
      <div className="flex mb-6">
        <button
          onClick={() => setCategory("vanzare")}
          className={`px-8 py-3 rounded-l-lg font-semibold text-base transition-all duration-300 ${
            category === "vanzare"
              ? "bg-red-600 text-white shadow-lg"
              : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
          }`}
        >
          Vânzare
        </button>
        <button
          onClick={() => setCategory("inchiriere")}
          className={`px-8 py-3 rounded-r-lg font-semibold text-base transition-all duration-300 ${
            category === "inchiriere"
              ? "bg-red-600 text-white shadow-lg"
              : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
          }`}
        >
          Închiriere
        </button>
      </div>

      {/* Search Form */}
      <div className="bg-transparent backdrop-blur-none p-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mr-32">
          {/* Property Type Dropdown */}
          <div className="md:col-span-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Home className="h-4 w-4" />
                <span>Tip proprietate</span>
              </div>
              <Select
                value={propertyType}
                onValueChange={(value) => setPropertyType(value)}
              >
                <SelectTrigger className="bg-white/20 border-white/20 text-white placeholder:text-white/70 h-12 backdrop-blur-sm">
                  <SelectValue placeholder="Toate proprietățile">
                    {propertyType === ""
                      ? "Toate proprietățile"
                      : propertyType === "apartament"
                        ? "Apartament"
                        : propertyType === "garsoniera"
                          ? "Garsonieră"
                          : propertyType === "casa"
                            ? "Casă"
                            : propertyType === "teren"
                              ? "Teren"
                              : "Spațiu Comercial"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toate">Toate proprietățile</SelectItem>
                  <SelectItem value="apartament">Apartament</SelectItem>
                  <SelectItem value="garsoniera">Garsonieră</SelectItem>
                  <SelectItem value="casa">Casă</SelectItem>
                  <SelectItem value="teren">Teren</SelectItem>
                  <SelectItem value="comercial">Spațiu Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Input */}
          <div className="md:col-span-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Search className="h-4 w-4" />
                <span>Zonă / ID proprietate</span>
              </div>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Zonă / ID proprietate"
                className="bg-white/20 border-white/20 text-white placeholder:text-white/70 h-12 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-3">
            <Button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-12 text-base font-bold rounded-md transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 tracking-wide uppercase border border-red-500/20"
            >
              Caută
            </Button>
          </div>
        </div>

        {/* Construcții noi checkbox */}
        <div className="mt-4">
          <label className="flex items-center text-white text-sm cursor-pointer">
            <input
              type="checkbox"
              className="mr-2 rounded border-white/20 bg-white/20 text-red-600 focus:ring-red-500 focus:ring-offset-0"
            />
            Construcții noi
          </label>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;
