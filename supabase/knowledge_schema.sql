-- Knowledge Documents Metadata Table
-- This table tracks uploaded documents for the admin portal

create table if not exists knowledge_documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null default 'General',
  content text,
  chunk_count integer default 0,
  status text not null default 'pending' check (status in ('pending', 'processing', 'indexed', 'failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists idx_knowledge_documents_status on knowledge_documents(status);
create index if not exists idx_knowledge_documents_category on knowledge_documents(category);
create index if not exists idx_knowledge_documents_created_at on knowledge_documents(created_at desc);

-- Enable RLS
alter table knowledge_documents enable row level security;

-- Policy: Service role can do everything
create policy "Service role full access" on knowledge_documents
  for all to service_role
  using (true)
  with check (true);

-- Update trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_knowledge_documents_updated_at
  before update on knowledge_documents
  for each row
  execute function update_updated_at_column();

