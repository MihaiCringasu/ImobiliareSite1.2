import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropertyForm from '@/components/admin/PropertyForm';
import { propertyService } from '@/services/api';
import { Property } from '@/types/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AdminPropertyEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      propertyService.getById(id)
        .then(response => {
          setProperty(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch property:", error);
          toast({
            variant: "destructive",
            title: "Eroare",
            description: "Nu am putut încărca detaliile proprietății.",
          });
          setLoading(false);
        });
    }
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center p-8">
        <p>Proprietatea nu a fost găsită.</p>
      </div>
    );
  }

  const handleFormSubmit = async (formData: any) => {
    if (!id) return;
    setFormSubmitting(true);
    try {
      await propertyService.update(id, formData);
      toast({
        title: "Succes!",
        description: "Proprietatea a fost actualizată.",
      });
      navigate('/admin/properties');
    } catch (error) {
      console.error("Failed to update property:", error);
      toast({
        variant: "destructive",
        title: "Eroare la actualizare",
        description: "A apărut o problemă la salvarea modificărilor.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Se încarcă datele proprietății...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Eroare</CardTitle>
            <CardDescription>
              Proprietatea nu a fost găsită sau nu a putut fi încărcată. Vă rugăm să reveniți la listă și să încercați din nou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin/properties')}>
              Înapoi la proprietăți
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }



  return (
    <div className="p-4 sm:p-6">
       <Card>
        <CardHeader>
          <CardTitle>Editează Proprietatea</CardTitle>
          <CardDescription>Modifică detaliile proprietății selectate.</CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyForm
            initialData={property}
            onSubmit={handleFormSubmit}
            onCancel={() => navigate('/admin/properties')}
            isLoading={formSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPropertyEdit;
