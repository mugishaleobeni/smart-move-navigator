import { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { fetchCars(); }, []);

  const fetchCars = async () => {
    const { data } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
    if (data) setCars(data as CarRow[]);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error, data } = await supabase.storage.from('car-images').upload(fileName, file, { upsert: true });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } else {
      const { data: urlData } = supabase.storage.from('car-images').getPublicUrl(data.path);
      setForm((prev) => ({ ...prev, image: urlData.publicUrl }));
      toast({ title: 'Image uploaded successfully' });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.type) {
      toast({ title: 'Missing fields', description: 'Name and type are required.', variant: 'destructive' });
      return;
    }
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
      toast({ title: 'Car updated successfully' });
    } else {
      const { error } = await supabase.from('cars').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Car added successfully' });
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
    if (!confirm('Delete this car?')) return;
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
          <DialogContent className="max-w-lg glass max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? 'Edit Car' : 'Add New Car'}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Toyota Land Cruiser" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type *</Label>
                  <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="SUV, Sedan, Van" />
                </div>
                <div>
                  <Label>Seats</Label>
                  <Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value) || 5 })} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Features (comma-separated)</Label>
                <Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="4WD, Bluetooth, AC, GPS" />
              </div>

              {/* Image Section */}
              <div className="space-y-2">
                <Label>Car Image</Label>
                <Tabs defaultValue="upload">
                  <TabsList className="w-full">
                    <TabsTrigger value="upload" className="flex-1 gap-1">
                      <Upload className="w-3 h-3" /> Upload File
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex-1 gap-1">
                      <LinkIcon className="w-3 h-3" /> Image URL
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="glass border-2 border-dashed border-border hover:border-accent/60 rounded-xl p-6 text-center cursor-pointer transition-smooth"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {uploading ? 'Uploading...' : 'Click to upload image'}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="url" className="mt-2">
                    <Input
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://example.com/car.jpg"
                    />
                  </TabsContent>
                </Tabs>
                {form.image && (
                  <div className="relative">
                    <img src={form.image} alt="Preview" className="h-36 w-full object-cover rounded-xl mt-2 border border-border" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-3 right-2 h-6 px-2 text-xs"
                      onClick={() => setForm({ ...form, image: '' })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="garage">In Garage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={uploading}>
                {uploading ? 'Uploading image...' : editId ? 'Update Car' : 'Add Car'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <Card key={car.id} className="glass overflow-hidden hover-lift">
            {car.image ? (
              <div className="h-44 overflow-hidden">
                <img src={car.image} alt={car.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-44 bg-muted/40 flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No image</span>
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-base">{car.name}</h3>
                  <p className="text-sm text-muted-foreground">{car.type} · {car.seats} seats</p>
                </div>
                <Badge variant={car.status === 'available' ? 'default' : 'secondary'} className="shrink-0">
                  {car.status}
                </Badge>
              </div>
              {car.features?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {car.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{f}</span>
                  ))}
                  {car.features.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{car.features.length - 3}</span>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(car)} className="gap-1 flex-1">
                  <Edit className="w-3 h-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(car.id)} className="gap-1 text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {cars.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            No cars yet. Click "Add Car" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
