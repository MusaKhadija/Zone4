-- Create storage bucket for dispute evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true);

-- Set up RLS policies for evidence bucket
CREATE POLICY "Users can upload evidence files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence');

CREATE POLICY "Users can view evidence files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evidence');

CREATE POLICY "Users can delete own evidence files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);