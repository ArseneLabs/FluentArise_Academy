-- ==============================================================================
-- FluentaRise Academy - Storage Bucket Configuration for Media & Documents
-- Creates the public 'academy-media' bucket with 50MB file limit and RLS policies
-- ==============================================================================

-- 1. Create the public bucket if not already created
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'academy-media',
  'academy-media',
  true,
  52428800, -- 50 MB max per file
  ARRAY[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml',
    'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/x-m4a',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-zip-compressed', 'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- 2. Storage Policies (Allow public reads, uploads, updates, deletes)
DROP POLICY IF EXISTS "Academy Media Public Read" ON storage.objects;
CREATE POLICY "Academy Media Public Read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'academy-media' );

DROP POLICY IF EXISTS "Academy Media Public Upload" ON storage.objects;
CREATE POLICY "Academy Media Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'academy-media' );

DROP POLICY IF EXISTS "Academy Media Public Update" ON storage.objects;
CREATE POLICY "Academy Media Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'academy-media' );

DROP POLICY IF EXISTS "Academy Media Public Delete" ON storage.objects;
CREATE POLICY "Academy Media Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'academy-media' );
