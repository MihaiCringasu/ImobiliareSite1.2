import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface PropertyFiltersProps {
  onFilterChange?: () => void;
}

const PropertyFilters = ({ onFilterChange }: PropertyFiltersProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
  const [category, setCategory] = useState("");

  // Initialize filters from URL
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setPropertyType(searchParams.get("type") || "");
    setCategory(searchParams.get("category") || "");
    setPriceMin(searchParams.get("priceMin") || "");
    setPriceMax(searchParams.get("priceMax") || "");
    setAreaMin(searchParams.get("areaMin") || "");
    setAreaMax(searchParams.get("areaMax") || "");

    const rooms = searchParams.get("rooms");
    if (rooms) {
      setSelectedRooms(rooms.split(",").map(Number));
    } else {
      setSelectedRooms([]);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (searchTerm) params.set("search", searchTerm);
    if (propertyType) params.set("type", propertyType);
    if (category) params.set("category", category);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (areaMin) params.set("areaMin", areaMin);
    if (areaMax) params.set("areaMax", areaMax);
    if (selectedRooms.length > 0) params.set("rooms", selectedRooms.join(","));

    navigate(`/proprietati?${params.toString()}`);

    if (onFilterChange) {
      onFilterChange();
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPropertyType("");
    setCategory("");
    setPriceMin("");
    setPriceMax("");
    setAreaMin("");
    setAreaMax("");
    setSelectedRooms([]);
    navigate("/proprietati");

    if (onFilterChange) {
      onFilterChange();
    }
  };

  const toggleRoom = (room: number) => {
    let newRooms = [...selectedRooms];
    if (newRooms.includes(room)) {
      newRooms = newRooms.filter((r) => r !== room);
    } else {
      newRooms.push(room);
    }
    setSelectedRooms(newRooms);
  };

  const toggleFloor = (floor: string) => {
    let newFloors = [...selectedFloors];
    if (newFloors.includes(floor)) {
      newFloors = newFloors.filter((f) => f !== floor);
    } else {
      newFloors.push(floor);
    }
    setSelectedFloors(newFloors);
  };

  const hasActiveFilters =
    searchTerm ||
    propertyType ||
    category ||
    priceMin ||
    priceMax ||
    areaMin ||
    areaMax ||
    selectedRooms.length > 0;

  return (
    <form
      onSubmit={handleSearch}
      className="p-3 sm:p-4 lg:sticky lg:top-24 mb-4 lg:mb-0"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Filtrare proprietăți
          </h2>
          <p className="text-xs text-slate-600">Rezultate filtrate</p>
        </div>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
            onClick={clearFilters}
          >
            <X className="h-3 w-3" />
            Șterge filtrele
          </Button>
        )}
      </div>

      <Separator className="bg-red-200 mb-3 sm:mb-4" />

      {/* Search by Title */}
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-slate-800">
          Caută proprietate
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Caută după titlu, locație..."
            className="pl-8 bg-slate-50 border-red-200 text-slate-800 placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500 h-9 sm:min-h-10 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-3 sm:mb-4">
        <div className="grid grid-cols-2 gap-1">
          <Button
            type="button"
            variant={category === "vanzare" ? "default" : "outline"}
            className={`h-9 sm:h-10 text-xs ${
              category === "vanzare"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "border-red-200 text-slate-700 hover:bg-red-50 hover:border-red-300"
            }`}
            onClick={() => setCategory(category === "vanzare" ? "" : "vanzare")}
          >
            Vânzare
          </Button>
          <Button
            type="button"
            variant={category === "inchiriere" ? "default" : "outline"}
            className={`h-9 sm:h-10 text-xs ${
              category === "inchiriere"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "border-red-200 text-slate-700 hover:bg-red-50 hover:border-red-300"
            }`}
            onClick={() =>
              setCategory(category === "inchiriere" ? "" : "inchiriere")
            }
          >
            Închiriere
          </Button>
        </div>
      </div>

      {/* Tip proprietate */}
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-slate-800">
          Tip proprietate
        </label>
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="bg-slate-50 border-red-200 text-slate-800 focus:border-red-500 focus:ring-red-500 h-9 sm:h-10 text-sm">
            <SelectValue placeholder="Toate proprietățile" />
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

      {/* Price Range */}
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-slate-800">
          Preț (€)
        </label>
        <div className="flex gap-1">
          <Input
            type="number"
            placeholder="Min"
            className="bg-slate-50 border-red-200 text-slate-800 placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500 h-9 sm:h-10 text-sm"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            className="bg-slate-50 border-red-200 text-slate-800 placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500 h-9 sm:h-10 text-sm"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>
      </div>

      {/* Rooms */}
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-slate-800">
          Camere
        </label>
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3].map((num) => (
            <Button
              key={num}
              type="button"
              variant={selectedRooms.includes(num) ? "default" : "outline"}
              className={`h-9 sm:h-10 text-xs ${
                selectedRooms.includes(num)
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "border-red-200 text-slate-700 hover:bg-red-50 hover:border-red-300"
              }`}
              onClick={() => toggleRoom(num)}
            >
              {num}
            </Button>
          ))}
          <Button
            type="button"
            variant={selectedRooms.includes(4) ? "default" : "outline"}
            className={`h-9 sm:h-10 text-xs ${
              selectedRooms.includes(4)
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "border-red-200 text-slate-700 hover:bg-red-50 hover:border-red-300"
            }`}
            onClick={() => toggleRoom(4)}
          >
            4+
          </Button>
        </div>
      </div>

      {/* Floor */}
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-slate-800">
          Etaj
        </label>
        <div className="grid grid-cols-4 gap-1">
          {["1", "2", "3"].map((floor) => (
            <Button
              key={floor}
              type="button"
              variant={selectedFloors.includes(floor) ? "default" : "outline"}
              className={`h-9 sm:h-10 text-xs ${
                selectedFloors.includes(floor)
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "border-red-200 text-slate-700 hover:bg-red-50 hover:border-red-300"
              }`}
              onClick={() => toggleFloor(floor)}
            >
              {floor}
            </Button>
          ))}
          <Button
            type="button"
            variant={selectedFloors.includes("4+") ? "default" : "outline"}
            className={`h-9 sm:h-10 text-xs ${
              selectedFloors.includes("4+")
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "border-red-200 text-slate-700 hover:bg-red-50 hover:border-red-300"
            }`}
            onClick={() => toggleFloor("4+")}
          >
            4+
          </Button>
        </div>
      </div>

      {/* Useful Area */}
      <div className="mb-4 sm:mb-5">
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-slate-800">
          Suprafața utilă (mp)
        </label>
        <div className="flex gap-1">
          <Input
            type="number"
            placeholder="Min"
            className="bg-slate-50 border-red-200 text-slate-800 placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500 h-9 sm:h-10 text-sm"
            value={areaMin}
            onChange={(e) => setAreaMin(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            className="bg-slate-50 border-red-200 text-slate-800 placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500 h-9 sm:h-10 text-sm"
            value={areaMax}
            onChange={(e) => setAreaMax(e.target.value)}
          />
        </div>
      </div>

      {/* Apply Filters Button */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 text-xs font-medium transition-colors duration-200 hover:from-red-700 hover:to-red-800 flex items-center justify-center gap-2 h-12"
      >
        <SlidersHorizontal className="h-3 w-3" />
        Aplică filtrele
      </Button>
    </form>
  );
};

export default PropertyFilters;
