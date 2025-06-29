import { useState, useEffect, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Eye, Loader2, Search, CircleDollarSign, Undo2 } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";
import { propertyService } from "@/services/api";
import type { Property, ApiResponse, PaginatedData } from "@/types/api";
import type { PropertyType, PropertyCategory, PropertyStatus, PropertyFormData as ModelPropertyFormData } from "@/types/models";

// Use the PropertyFormData from models but make all fields optional for updates
type PropertyFormData = Partial<ModelPropertyFormData>;

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchProperties = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      const filters = search ? { search } : {};
      const response = await propertyService.getAll(page, 10, filters);
      
      if (response && response.data) {
        const paginatedData = response.data as PaginatedData<Property>;
        setProperties(paginatedData.data || []);
        setTotalPages(paginatedData.meta?.last_page || 1);
        setError(null);
      } else {
        throw new Error("Format de răspuns neașteptat de la server");
      }
    } catch (err: any) {
      console.error("Failed to fetch properties:", err);
      toast({ 
        variant: "destructive", 
        title: "Eroare la încărcare", 
        description: err.response?.data?.message || "Nu am putut încărca proprietățile." 
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProperties(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchProperties, refetchTrigger]);

  const handleCreate = () => {
    setEditingProperty(null);
    setIsFormOpen(true);
  };

  const handleEdit = (property: Property) => {
    navigate(`/admin/property/edit/${property.id}`);
  };

  const handleDelete = (property: Property) => {
    setDeletingProperty(property);
  };

  const confirmDelete = async () => {
    if (!deletingProperty) return;
    try {
      await propertyService.delete(deletingProperty.id);
      toast({ title: "Succes", description: `Proprietatea "${deletingProperty.title}" a fost ștearsă.` });
      setRefetchTrigger(c => c + 1); // Trigger a refetch by updating the state
    } catch (err) {
      console.error("Failed to delete property:", err);
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut șterge proprietatea." });
    } finally {
      setDeletingProperty(null);
    }
  };

  const handleToggleSold = async (propertyToUpdate: Property) => {
    const newSoldStatus = !propertyToUpdate.sold;

    // Creăm un payload complet pentru a evita pierderea de date
    const payload: Partial<PropertyFormData> = {
      title: propertyToUpdate.title,
      description: propertyToUpdate.description,
      price: propertyToUpdate.price,
      location: propertyToUpdate.location,
      city: propertyToUpdate.city,
      county: propertyToUpdate.county,
      area: propertyToUpdate.area,
      rooms: propertyToUpdate.rooms,
      bathrooms: propertyToUpdate.bathrooms,
      type: propertyToUpdate.type as any,
      category: propertyToUpdate.category as any,
      videoUrl: propertyToUpdate.videoUrl,
      amenities: propertyToUpdate.amenities,
      yearBuilt: propertyToUpdate.yearBuilt,
      floor: propertyToUpdate.floor,
      totalFloors: propertyToUpdate.totalFloors,
      parking: propertyToUpdate.parking,
      agentId: propertyToUpdate.agentId,
      sold: newSoldStatus,
    };

    try {
      setLoading(true);
      await propertyService.update(propertyToUpdate.id, payload);
      
      // Actualizăm starea locală pentru a reflecta schimbarea
      setProperties(prevProperties => 
        prevProperties.map(p => 
          p.id === propertyToUpdate.id 
            ? { ...p, sold: newSoldStatus } 
            : p
        )
      );

      toast({
        title: "Succes",
        description: `Proprietatea a fost marcată ca ${newSoldStatus ? '"Vândută"' : '"Disponibilă"'}`,
      });
      
      // Reîmprospătăm lista pentru a ne asigura că avem cele mai recente date
      setRefetchTrigger(prev => prev + 1);
      
    } catch (err) {
      console.error("Eroare la actualizarea statusului:", err);
      let errorMessage = "Ceva nu a funcționat la actualizarea statusului.";
      
      if (axios.isAxiosError(err) && err.response?.data) {
        errorMessage = err.response.data.message || JSON.stringify(err.response.data);
      }
      
      toast({
        variant: "destructive",
        title: "Eroare",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    setFormSubmitting(true);
    try {
      if (editingProperty) {
        // For updates, we need to ensure required fields are present
        const updateData: any = {};
        
        // Only include fields that have changed
        Object.keys(formData).forEach(key => {
          if (JSON.stringify(formData[key]) !== JSON.stringify(editingProperty[key as keyof Property])) {
            updateData[key] = formData[key];
          }
        });
        
        // Ensure required fields are always included in the update
        const requiredFields = ['title', 'price', 'type', 'category', 'status'];
        requiredFields.forEach(field => {
          if (formData[field] !== undefined) {
            updateData[field] = formData[field];
          } else if (editingProperty[field as keyof Property] !== undefined) {
            updateData[field] = editingProperty[field as keyof Property];
          }
        });
        
        // Handle empty arrays properly
        if (formData.amenities && formData.amenities.length === 0) {
          updateData.amenities = [];
        }
        
        // Ensure we're not sending undefined values, but keep empty strings for agentId to clear it
        Object.keys(updateData).forEach(key => {
          if (key === 'agentId') {
            // Keep null values for agentId to allow clearing the agent
            if (updateData[key] === '') {
              updateData[key] = null;
            }
          } else if (updateData[key] === undefined || updateData[key] === '') {
            delete updateData[key];
          }
        });
        
        console.log('Updating property with data:', updateData);
        
        // Ensure agentId is included in the update if it's in the form data
        if (formData.agentId !== undefined) {
          updateData.agentId = formData.agentId;
        }
        
        const response = await propertyService.update(editingProperty.id, updateData);
        console.log('Update response:', response);
        
        toast({ 
          title: "Succes", 
          description: "Detaliile proprietății au fost actualizate cu succes!" 
        });
      } else {
        // For new properties, prepare the data with all required fields
        const createData: any = {
          // Required fields with defaults
          id: crypto.randomUUID(), // Generate a UUID for the new property
          title: formData.title,
          price: formData.price,
          area: formData.area,
          type: formData.type,
          category: formData.category || 'vanzare',
          status: formData.status || 'disponibil',
          
          // Location fields - make sure at least one is provided
          location: formData.address || formData.city || 'Nespecificat',
          address: formData.address || null,
          city: formData.city || null,
          county: formData.county || null,
          
          // Description with default
          description: formData.description || '',
          
          // Conditional fields based on property type
          ...(formData.type !== 'Teren' ? {
            rooms: formData.rooms || 0,
            floor: formData.floor || 0,
            yearBuilt: formData.yearBuilt || new Date().getFullYear()
          } : {
            rooms: 0,
            floor: 0,
            yearBuilt: new Date().getFullYear()
          }),
          
          // Media fields with defaults
          videoUrl: formData.videoUrl || null,
          thumbnailUrl: formData.thumbnailUrl || null,
          
          // Feature flags with defaults
          featured: formData.featured || false,
          currency: formData.currency || 'EUR',
          
          // Arrays with defaults
          amenities: JSON.stringify(Array.isArray(formData.amenities) ? formData.amenities : []),
          badges: JSON.stringify(Array.isArray(formData.badges) ? formData.badges : []),
          
          // System fields with defaults
          viewsCount: 0,
          contactCount: 0,
          createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        };
        
        // Handle undefined and empty values
        Object.keys(createData).forEach(key => {
          if (key === 'agentId') {
            // Keep null values for agentId to allow clearing the agent
            if (createData[key] === '') {
              createData[key] = null;
            }
          } else if (createData[key] === undefined || createData[key] === '') {
            delete createData[key];
          }
        });
        
        // Only include agentId if it's provided and not empty
        if (formData.agentId && formData.agentId.trim() !== '') {
          createData.agentId = formData.agentId;
        }
        
        console.log('Creating property with data:', createData);
        
        const response = await propertyService.create(createData);
        console.log('Create response:', response);
        
        toast({ 
          title: "Succes", 
          description: "O nouă proprietate a fost adăugată cu succes!" 
        });
      }
      setIsFormOpen(false);
      setRefetchTrigger(c => c + 1); // Trigger a refetch by updating the state
    } catch (err) {
      console.error("Failed to submit form:", err);
      toast({ variant: "destructive", title: "Eroare", description: "A apărut o problemă. Vă rugăm încercați din nou." });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleViewProperty = (property: Property) => {
    navigate(`/proprietate/${property.id}`);
  };

  const renderContent = () => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Titlu</TableHead>
            <TableHead>Tip</TableHead>
            <TableHead>Preț</TableHead>
            <TableHead>Detalii</TableHead>
            <TableHead>Locație</TableHead>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-red-500">
                {error}
              </TableCell>
            </TableRow>
          ) : properties.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="font-medium text-slate-600">Nu există proprietăți listate.</p>
                  <p className="text-sm text-slate-500">Click pe "Adaugă Proprietate" pentru a începe.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            properties.map((property) => (
              <TableRow key={property.id} className="relative">
                <TableCell className={`font-medium ${property.sold ? 'opacity-40' : ''}`}>
                  {property.sold && (
                    <div className="absolute inset-0 bg-red-600 bg-opacity-90 flex items-center justify-center z-10 pointer-events-none">
                      <div className="text-white text-2xl font-bold transform -rotate-12 bg-red-700 px-6 py-3 rounded-lg shadow-lg">
                        VÂNDUT
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {property.sold && <Badge variant="destructive">Vândut</Badge>}
                    <span className="truncate w-[240px]" title={property.title}>
                      {property.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {property.type.replace("de vânzare", "").replace("de închiriat", "").trim()}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">€{property.price.toLocaleString()}</TableCell>
                <TableCell>
                  {property.area} mp
                  {property.rooms && ` • ${property.rooms} cam`}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate text-sm text-gray-600" title={property.location}>
                    {property.location}
                  </div>
                </TableCell>
                <TableCell className={`text-right ${property.sold ? 'relative z-20' : ''}`}>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewProperty(property)} 
                      className={`text-blue-600 hover:text-blue-700 ${property.sold ? 'bg-white shadow-md' : ''}`}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(property)} className="text-green-600 hover:text-green-700">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleSold(property)} 
                      className={property.sold ? "text-yellow-500 hover:text-yellow-600" : "text-green-600 hover:text-green-700"}
                      title={property.sold ? "Marchează ca disponibil" : "Marchează ca vândut"}>
                      {property.sold ? <Undo2 className="w-4 h-4" /> : <CircleDollarSign className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(property)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <CardTitle>Management Proprietăți</CardTitle>
            <CardDescription>Adaugă, editează sau șterge proprietățile listate.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Caută după titlu sau categorie..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Adaugă Proprietate
            </Button>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>

      {/* Property Form Dialog for CREATE */}
      <Dialog open={isFormOpen && !editingProperty} onOpenChange={(isOpen) => { if (!isOpen) setIsFormOpen(false)}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adaugă Proprietate Nouă</DialogTitle>
            <DialogDescription>
              Completează formularul pentru a adăuga o nouă proprietate
            </DialogDescription>
          </DialogHeader>
          <PropertyForm
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={formSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProperty} onOpenChange={() => setDeletingProperty(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare Ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="font-bold text-red-700">ATENȚIE: Acțiunea este ireversibilă!</p>
              Sunteți absolut sigur că doriți să <strong>ȘTERGEȚI DEFINITIV</strong> proprietatea "{deletingProperty?.title}"?
              <br/><br/>
              <span className="text-sm">Pentru a marca anunțul doar ca "Vândut", folosiți butonul dedicat din listă.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProperties;
