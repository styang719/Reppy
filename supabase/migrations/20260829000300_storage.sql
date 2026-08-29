-- Private bucket for scan photos. Users can write into their own folder and
-- read only their own files; the service role reads everything.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('scans', 'scans', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Paths are "<user_id>/<scan_id>.jpg", so the first path segment is the owner.
create policy "users upload to their own scan folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users read their own scan photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
