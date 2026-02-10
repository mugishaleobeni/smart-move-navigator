import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CarRow {
  id: string;
  name: string;
  type: string;
  seats: number;
  description: string | null;
  features: string[];
  image: string | null;
  images: string[];
  status: string;
}

const emptyForm = { name: '', type: '', seats: 5, description: '', features: '', image: '', status: 'available' };

export default function CarsManagement() {
  const [cars, setCars] = useState<CarRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchCars(); }, []);

  const fetchCars = async () => {
    const { data } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
    if (data) setCars(data as CarRow[]);
  };

  const handleSave = async () => {
    const featuresArr = form.features.split(',').map((f) => f.trim()).filter(Boolean);
    const payload = {
      name: form.name,
      type: form.type,
      seats: form.seats,
      description: form.description,
      features: featuresArr,
      image: form.image || null,
      images: form.image ? [form.image] : [],
      status: form.status,
    };

    if (editId) {
      const { error } = await supabase.from('cars').update(payload).eq('id', editId);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Car updated' });
    } else {
      const { error } = await supabase.from('cars').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Car added' });
    }
    setOpen(false);
    setEditId(null);
    setForm(emptyForm);
    fetchCars();
  };

  const handleEdit = (car: CarRow) => {
    setForm({
      name: car.name,
      type: car.type,
      seats: car.seats,
      description: car.description || '',
      features: car.features?.join(', ') || '',
      image: car.image || '',
      status: car.status,
    });
    setEditId(car.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('cars').delete().eq('id', id);
    toast({ title: 'Car deleted' });
    fetchCars();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cars Management</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Car</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editId ? 'Edit Car' : 'Add New Car'}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type</Label><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="SUV, Sedan, Van" /></div>
                <div><Label>Seats</Label><Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value) || 5 })} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Features (comma-separated)</Label><Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="4WD, Bluetooth, AC" /></div>
              <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
              {form.image && <img src={form.image} alt="Preview" className="h-32 w-full object-cover rounded-lg" />}
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="garage">Garage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">{editId ? 'Update Car' : 'Add Car'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <Card key={car.id} className="glass overflow-hidden">
            {car.image && <img src={car.image} alt={car.name} className="h-40 w-full object-cover" />}
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{car.name}</h3>
                  <p className="text-sm text-muted-foreground">{car.type} · {car.seats} seats</p>
                </div>
                <Badge variant={car.status === 'available' ? 'default' : 'secondary'}>
                  {car.status}
                </Badge>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(car)} className="gap-1">
                  <Edit className="w-3 h-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(car.id)} className="gap-1 text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-3 h-3" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
