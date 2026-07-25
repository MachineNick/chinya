-- Run in Supabase Dashboard → SQL Editor

insert into storage.buckets (id, name, public)
values ('kyc', 'kyc', false)
on conflict (id) do nothing;

-- Allow authenticated + anon uploads to kyc bucket
create policy "allow kyc upload" on storage.objects
  for insert with check (bucket_id = 'kyc');

create policy "allow kyc read" on storage.objects
  for select using (bucket_id = 'kyc');
