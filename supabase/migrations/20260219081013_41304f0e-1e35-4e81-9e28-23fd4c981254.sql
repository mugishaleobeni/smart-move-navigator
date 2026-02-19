
-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public) VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for car-images bucket
CREATE POLICY "Anyone can view car images"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-images');

CREATE POLICY "Admins can upload car images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'car-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update car images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'car-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete car images"
ON storage.objects FOR DELETE
USING (bucket_id = 'car-images' AND has_role(auth.uid(), 'admin'::app_role));
