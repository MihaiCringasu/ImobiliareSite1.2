import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { teamService } from "@/services/api";
import type { TeamMember } from "@/types/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Upload, Plus, GripVertical } from "lucide-react";
import type { Property } from "@/types/api";

// Property types
const PROPERTY_TYPES = [
  "Apartament",
  "Garsonieră",
  "Casă",
  "Teren",
  "Spațiu comercial",
] as const;

// Define image and video types
type PropertyImage = {
  id?: string;
  url: string;
  alt?: string;
  order: number;
  isPrimary: boolean;
};

type PropertyVideo = {
  id?: string;
  url: string;
  title?: string;
  description?: string;
  order: number;
};

// Define the form schema with conditional validation
const propertyFormSchema = z
  .object({
    title: z.string().min(10, "Titlul trebuie să aibă cel puțin 10 caractere"),
    description: z.string().optional(),
    price: z.number().min(1, "Prețul trebuie să fie mai mare de 0"),
    address: z.string().optional(),
    city: z.string().optional(),
    county: z.string().optional(),
    area: z.number().min(1, "Suprafața trebuie să fie mai mare de 0"),
    rooms: z
      .number()
      .min(0, "Numărul de camere nu poate fi negativ")
      .optional(),
    floor: z.number().optional(),
    yearBuilt: z
      .number()
      .min(1900, "Anul construcției nu este valid")
      .optional(),
    type: z.string().min(1, "Tipul proprietății este obligatoriu"),
    category: z.string().default("vanzare"),
    status: z.string().default("disponibil"),
    featured: z.boolean().default(false),
    badges: z.array(z.string()).default([]),
    amenities: z.array(z.string()).default([]),
    currency: z.string().default("EUR"),
    agentId: z.string().optional(),
    mapUrl: z
      .string()
      .url("URL-ul hărții nu este valid")
      .or(z.literal(""))
      .optional(),
    mapEmbedUrl: z.string().optional(),
    bathrooms: z
      .number()
      .min(0, "Numărul de băi nu poate fi negativ")
      .optional(),
    orientation: z.string().optional(),
    balconies: z
      .number()
      .min(0, "Numărul de balcoane nu poate fi negativ")
      .optional(),
    constructionType: z.string().optional(),
    hasBasement: z.boolean().optional(),
    hasAttic: z.boolean().optional(),
    buildingFloors: z
      .number()
      .min(1, "Numărul de etaje trebuie să fie mai mare de 0")
      .optional(),
    parkingSpaces: z
      .number()
      .min(0, "Numărul de locuri de parcare nu poate fi negativ")
      .optional(),
    bedrooms: z
      .number()
      .min(0, "Numărul de dormitoare nu poate fi negativ")
      .optional(),
    isNegotiable: z.boolean().default(true),
    images: z
      .array(
        z.object({
          url: z.string().url("URL-ul imaginii nu este valid"),
          alt: z.string().optional(),
          order: z.number(),
          isPrimary: z.boolean(),
        }),
      )
      .default([]),
    videos: z
      .array(
        z.object({
          url: z.string().url("URL-ul video nu este valid"),
          title: z.string().optional(),
          description: z.string().optional(),
          order: z.number(),
        }),
      )
      .default([]),
  })
  .refine(
    (data) => {
      // Make rooms required only for non-land property types
      if (
        data.type !== "Teren" &&
        (data.rooms === undefined || data.rooms === null)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Numărul de camere este obligatoriu pentru acest tip de proprietate",
      path: ["rooms"],
    },
  );

// Define form values type
type PropertyFormValues = z.infer<typeof propertyFormSchema>;

// Interface for property form data
interface PropertyFormData
  extends Omit<
    Property,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "viewsCount"
    | "contactCount"
    | "coordinates"
    | "agent"
    | "county"
    | "agentId"
  > {
  address?: string;
  badges: string[];
  agentId?: string;
  county?: string;
  images: PropertyImage[];
  videos: PropertyVideo[];
}

interface PropertyFormProps {
  initialData?: Partial<Property>;
  onSubmit: (data: PropertyFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PropertyForm = ({
  initialData = {},
  onSubmit: onSubmitProp,
  onCancel,
  isLoading,
}: PropertyFormProps) => {
  // Create default form values based on the schema
  const defaultFormValues: PropertyFormValues = {
    title: "",
    description: "",
    price: 0,
    type: "Apartament",
    area: 0,
    address: "",
    city: "",
    county: "",
    rooms: 1,
    yearBuilt: new Date().getFullYear(),
    floor: 0,
    featured: false,
    currency: "EUR",
    badges: [],
    amenities: [],
    category: "vanzare",
    status: "disponibil",
    agentId: "",
    images: [],
    videos: [],
    mapUrl: "",
    mapEmbedUrl: "",
    bathrooms: 1,
    orientation: "",
    balconies: 0,
    constructionType: "",
    hasBasement: false,
    hasAttic: false,
    buildingFloors: 1,
    parkingSpaces: 0,
    bedrooms: 1,
    isNegotiable: true,
  };

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoadingTeam(true);
        const response = await teamService.getAll();
        if (response?.data?.data) {
          setTeamMembers(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      } finally {
        setLoadingTeam(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const formValues = { ...defaultFormValues, ...initialData };

      // Convert legacy video/thumbnail data to new format
      const images: PropertyImage[] = [];
      const videos: PropertyVideo[] = [];

      // Handle existing images
      if (initialData.images && Array.isArray(initialData.images)) {
        images.push(
          ...initialData.images.map((img, index) => ({
            url: img.url,
            alt: img.alt || "",
            order: index,
            isPrimary: img.isPrimary || index === 0,
          })),
        );
      }

      // Convert legacy thumbnail to image
      if (
        initialData.thumbnailUrl &&
        !images.some((img) => img.url === initialData.thumbnailUrl)
      ) {
        images.unshift({
          url: initialData.thumbnailUrl,
          alt: `Imagine principală pentru ${initialData.title}`,
          order: 0,
          isPrimary: true,
        });
      }

      // Convert legacy video to videos array
      if (initialData.videoUrl) {
        videos.push({
          url: initialData.videoUrl,
          title: `Video pentru ${initialData.title}`,
          description: "",
          order: 0,
        });
      }

      formValues.images = images;
      formValues.videos = videos;

      // Sanitize null values
      Object.keys(formValues).forEach((key) => {
        const formKey = key as keyof PropertyFormValues;
        if (formValues[formKey] === null) {
          (formValues as any)[formKey] = "";
        }
      });

      // Map agent ID
      if (
        initialData.agent &&
        typeof initialData.agent === "object" &&
        "id" in initialData.agent
      ) {
        formValues.agentId = String(initialData.agent.id);
      }

      form.reset(formValues);
    }
  }, [initialData, form.reset]);

  const onSubmit = (data: PropertyFormValues) => {
    const isLand = data.type === "Teren";
    const submitData: any = {
      ...data,
      price: Number(data.price) || 0,
      area: Number(data.area) || 0,
      rooms: isLand ? 0 : Number(data.rooms) || 0,
      floor: isLand ? 0 : Number(data.floor) || 0,
      yearBuilt: isLand
        ? new Date().getFullYear()
        : Number(data.yearBuilt) || new Date().getFullYear(),
      badges: Array.isArray(data.badges) ? data.badges : [],
      amenities: Array.isArray(data.amenities) ? data.amenities : [],
      title: data.title?.trim() || "Fără titlu",
      description: data.description?.trim() || "",
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      county: data.county?.trim() || null,
      type: data.type || "Apartament",
      category: data.category || "vanzare",
      status: data.status || "disponibil",
      currency: data.currency || "EUR",
      images: data.images || [],
      videos: data.videos || [],
      ...(data.agentId?.trim() ? { agentId: data.agentId.trim() } : {}),
    };

    console.log("Submitting property data:", submitData);
    onSubmitProp(submitData);
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;

    const currentImages = form.getValues("images") || [];
    const newImage: PropertyImage = {
      url: newImageUrl.trim(),
      alt: "",
      order: currentImages.length,
      isPrimary: currentImages.length === 0,
    };

    form.setValue("images", [...currentImages, newImage]);
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    const newImages = currentImages.filter((_, i) => i !== index);

    // Reassign orders and ensure we have a primary image
    const updatedImages = newImages.map((img, i) => ({
      ...img,
      order: i,
      isPrimary: i === 0,
    }));

    form.setValue("images", updatedImages);
  };

  const setPrimaryImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    const updatedImages = currentImages.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));

    form.setValue("images", updatedImages);
  };

  const addVideo = () => {
    if (!newVideoUrl.trim()) return;

    const currentVideos = form.getValues("videos") || [];
    const newVideo: PropertyVideo = {
      url: newVideoUrl.trim(),
      title: newVideoTitle.trim() || "Video proprietate",
      description: "",
      order: currentVideos.length,
    };

    form.setValue("videos", [...currentVideos, newVideo]);
    setNewVideoUrl("");
    setNewVideoTitle("");
  };

  const removeVideo = (index: number) => {
    const currentVideos = form.getValues("videos") || [];
    const newVideos = currentVideos.filter((_, i) => i !== index);

    const updatedVideos = newVideos.map((video, i) => ({
      ...video,
      order: i,
    }));

    form.setValue("videos", updatedVideos);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titlu Proprietate *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Exemplu: Apartament 2 camere ultracentral..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preț (€) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Exemplu: 85000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip proprietate *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={loadingTeam}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează tipul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorie *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "vanzare"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vanzare">Vânzare</SelectItem>
                      <SelectItem value="inchiriere">Închiriere</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monedă</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "EUR"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează moneda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="RON">RON (lei)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suprafață (mp) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="65"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("type") !== "Teren" && (
              <FormField
                control={form.control}
                name="rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Camere</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Exemplu: 3"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresă</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Strada, numărul, bloc, scara..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Oraș</FormLabel>
                  <FormControl>
                    <Input placeholder="Exemplu: București" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="county"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Județ</FormLabel>
                  <FormControl>
                    <Input placeholder="Exemplu: Ilfov" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Conditional Fields Based on Property Type */}
          {(form.watch("type") === "Apartament" ||
            form.watch("type") === "Garsonieră") && (
            <div className="space-y-6 border rounded-lg p-6 bg-slate-50">
              <h3 className="text-lg font-medium">
                Detalii Apartament/Garsonieră
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Număr băi</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dormitoare</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="balconies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Număr balcoane</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parkingSpaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locuri parcare</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orientation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orientare</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selectează orientarea" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Nord">Nord</SelectItem>
                          <SelectItem value="Sud">Sud</SelectItem>
                          <SelectItem value="Est">Est</SelectItem>
                          <SelectItem value="Vest">Vest</SelectItem>
                          <SelectItem value="Nord-Est">Nord-Est</SelectItem>
                          <SelectItem value="Nord-Vest">Nord-Vest</SelectItem>
                          <SelectItem value="Sud-Est">Sud-Est</SelectItem>
                          <SelectItem value="Sud-Vest">Sud-Vest</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="constructionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tip construcție</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selectează tipul" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bloc de apartamente">
                            Bloc de apartamente
                          </SelectItem>
                          <SelectItem value="Vila duplex">
                            Vila duplex
                          </SelectItem>
                          <SelectItem value="Ansamblu rezidențial">
                            Ansamblu rezidențial
                          </SelectItem>
                          <SelectItem value="Casă transformată">
                            Casă transformată
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buildingFloors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etaje clădire</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="4"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="hasBasement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Are demisol</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasAttic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Are mansardă</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {form.watch("type") !== "Teren" && (
              <>
                <FormField
                  control={form.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>An construcție</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                          placeholder="Exemplu: 2020"
                          value={field.value === undefined ? "" : field.value}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value);
                            field.onChange(isNaN(value) ? undefined : value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etaj</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Exemplu: 2"
                          value={field.value === undefined ? "" : field.value}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value);
                            field.onChange(isNaN(value) ? undefined : value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descriere</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descriere detaliată a proprietății..."
                    className="min-h-[120px]"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(e.target.value || undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Images Section */}
          <div className="space-y-4 border rounded-lg p-6 bg-slate-50">
            <h3 className="text-lg font-medium">Imagini Proprietate</h3>
            <FormDescription>
              Adaugă imagini pentru proprietate. Prima imagine va fi folosită ca
              imagine principală.
            </FormDescription>

            {/* Add new image */}
            <div className="flex gap-2">
              <Input
                placeholder="URL imagine (ex: https://example.com/image.jpg)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addImage}
                variant="outline"
                size="sm"
                disabled={!newImageUrl.trim()}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adaugă
              </Button>
            </div>

            {/* Images list */}
            <div className="space-y-3">
              {form.watch("images")?.map((image, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white rounded border"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.alt || "Preview"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden",
                        );
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs hidden">
                      Eroare încărcare
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-600 truncate">
                      {image.url}
                    </div>
                    <Input
                      placeholder="Text alternativ (descriere imagine)"
                      value={image.alt || ""}
                      onChange={(e) => {
                        const images = form.getValues("images") || [];
                        images[index] = {
                          ...images[index],
                          alt: e.target.value,
                        };
                        form.setValue("images", images);
                      }}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={image.isPrimary ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPrimaryImage(index)}
                      disabled={image.isPrimary}
                    >
                      {image.isPrimary ? "Principală" : "Setează ca principală"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {(!form.watch("images") ||
                form.watch("images")?.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  Nicio imagine adăugată încă. Adaugă prima imagine folosind
                  câmpul de mai sus.
                </div>
              )}
            </div>
          </div>

          {/* Map Location Section */}
          <div className="space-y-4 border rounded-lg p-6 bg-slate-50">
            <h3 className="text-lg font-medium">Locație pe Hartă (Opțional)</h3>
            <FormDescription>
              Adaugă link-ul Google Maps pentru a afișa locația proprietății pe
              hartă.
            </FormDescription>

            <FormField
              control={form.control}
              name="mapUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Google Maps</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.google.com/maps/place/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Copiază link-ul complet din Google Maps pentru această
                    proprietate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Map Preview */}
            {form.watch("mapUrl") && (
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="text-sm font-medium mb-3">
                  Previzualizare Hartă
                </h4>
                <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src={(() => {
                      const url = form.watch("mapUrl") || "";
                      // Convert Google Maps URL to embed URL
                      if (url.includes("google.com/maps")) {
                        // Extract coordinates or place info and create embed URL
                        const embedUrl = url
                          .replace("/place/", "/embed?pb=")
                          .replace("/maps/", "/maps/embed?pb=");
                        return embedUrl;
                      }
                      return url;
                    })()}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Map Preview"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Videos Section */}
          <div className="space-y-4 border rounded-lg p-6 bg-slate-50">
            <h3 className="text-lg font-medium">Video-uri Embed (Opțional)</h3>
            <FormDescription>
              Adaugă video-uri YouTube care vor apărea într-o secțiune separată
              pe pagina proprietății.
            </FormDescription>

            {/* Add new video */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="URL video YouTube (ex: https://youtube.com/watch?v=...)"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Titlu video"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  className="w-48"
                />
                <Button
                  type="button"
                  onClick={addVideo}
                  variant="outline"
                  size="sm"
                  disabled={!newVideoUrl.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adaugă
                </Button>
              </div>
            </div>

            {/* Videos list */}
            <div className="space-y-3">
              {form.watch("videos")?.map((video, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white rounded border"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {video.title || "Video fără titlu"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {video.url}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeVideo(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {(!form.watch("videos") ||
                form.watch("videos")?.length === 0) && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Niciun video adăugat.
                </div>
              )}
            </div>
          </div>

          {/* Price Options */}
          <div className="space-y-4 border rounded-lg p-6 bg-slate-50">
            <h3 className="text-lg font-medium">Opțiuni Preț</h3>
            <FormField
              control={form.control}
              name="isNegotiable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Preț negociabil</FormLabel>
                    <FormDescription>
                      Bifează dacă prețul poate fi negociat cu cumpărătorul
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Agent Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Agent Imobiliar</h3>
            <FormField
              control={form.control}
              name="agentId"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? undefined : value);
                    }}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează agentul imobiliar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Fără agent</SelectItem>
                      {loadingTeam ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          Se încarcă agenții...
                        </div>
                      ) : teamMembers?.length > 0 ? (
                        teamMembers.map((member) => (
                          <SelectItem key={member.id} value={String(member.id)}>
                            {member.name}{" "}
                            {member.role ? `- ${member.role}` : ""}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          Niciun agent disponibil
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Etichete</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {[
                "Nou",
                "Vânzare",
                "Închiriere",
                "Recomandat",
                "Redus",
                "Oferta zilei",
              ].map((badge) => (
                <div key={badge} className="flex items-center space-x-2">
                  <Checkbox
                    id={`badge-${badge}`}
                    checked={form.watch("badges")?.includes(badge) || false}
                    onCheckedChange={(checked) => {
                      const currentBadges = form.getValues("badges") || [];
                      if (checked) {
                        form.setValue("badges", [...currentBadges, badge]);
                      } else {
                        form.setValue(
                          "badges",
                          currentBadges.filter((b) => b !== badge),
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`badge-${badge}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {badge}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <Input
                placeholder="Adaugă altă etichetă"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const newBadge = e.currentTarget.value.trim();
                    const currentBadges = form.getValues("badges") || [];
                    if (!currentBadges.includes(newBadge)) {
                      form.setValue("badges", [...currentBadges, newBadge]);
                    }
                    e.currentTarget.value = "";
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Apasă Enter pentru a adăuga o etichetă nouă
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch("badges")?.map((badge) => (
                <div
                  key={badge}
                  className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-md flex items-center"
                >
                  {badge}
                  <button
                    type="button"
                    onClick={() => {
                      const currentBadges = form.getValues("badges") || [];
                      form.setValue(
                        "badges",
                        currentBadges.filter((b) => b !== badge),
                      );
                    }}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading || loadingTeam}
            >
              {isLoading
                ? "Se salvează..."
                : initialData
                  ? "Actualizează"
                  : "Adaugă Proprietatea"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Anulează
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default PropertyForm;
