-- Enable vector extension (PGVector)
create extension if not exists vector;

-- Drop existing objects if re-running the script
drop function if exists match_documents(vector, int, jsonb);
drop table if exists documents;

-- Table to store source documents and embeddings
create table documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(768) -- text-embedding-004 outputs 768-d vectors
);

-- Speed up similarity search
create index on documents
using ivfflat (embedding vector_l2_ops)
with (lists = 100);

-- Helper RPC used by LangChain SupabaseVectorStore
create or replace function match_documents(
  query_embedding vector,
  match_count int default 5,
  filter jsonb default '{}'::jsonb
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where d.metadata @> filter
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Optional: relax RLS for service role inserts/reads (safe when using service key)
alter table documents enable row level security;

-- INSERT policy: only WITH CHECK is allowed for INSERT
create policy "Service role can insert" on documents
  for insert to service_role
  with check (true);

-- SELECT policy: only USING is allowed for SELECT
create policy "Service role can select" on documents
  for select to service_role
  using (true);

-- Allow service role to update and delete as well (for maintenance)
create policy "Service role can update" on documents
  for update to service_role
  using (true)
  with check (true);

create policy "Service role can delete" on documents
  for delete to service_role
  using (true);