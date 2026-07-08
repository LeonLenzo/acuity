-- organisms
create table public.organisms (
    id          uuid primary key default gen_random_uuid(),
    owner_id    uuid not null references auth.users(id) on delete cascade,
    name        text not null,
    taxonomy_id integer,
    description text,
    created_at  timestamptz not null default now()
);

-- isolates
create table public.isolates (
    id          uuid primary key default gen_random_uuid(),
    organism_id uuid not null references public.organisms(id) on delete cascade,
    name        text not null,
    description text,
    created_at  timestamptz not null default now()
);

-- assemblies
create table public.assemblies (
    id           uuid primary key default gen_random_uuid(),
    isolate_id   uuid not null references public.isolates(id) on delete cascade,
    name         text not null,
    description  text,
    fasta_s3_key text,
    fai_s3_key   text,
    stats        jsonb,
    created_at   timestamptz not null default now()
);

-- jobs (defined before tracks so tracks can reference it)
create table public.jobs (
    id              uuid primary key default gen_random_uuid(),
    owner_id        uuid not null references auth.users(id) on delete cascade,
    assembly_id     uuid references public.assemblies(id) on delete set null,
    type            text not null,
    status          text not null default 'queued'
                        check (status in ('queued', 'running', 'completed', 'failed')),
    slurm_job_id    text,
    params          jsonb,
    output_track_id uuid,  -- fk added after tracks table
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- tracks
create table public.tracks (
    id            uuid primary key default gen_random_uuid(),
    assembly_id   uuid not null references public.assemblies(id) on delete cascade,
    name          text not null,
    type          text not null check (type in ('annotation', 'alignment', 'variant')),
    file_s3_key   text,
    index_s3_key  text,
    source_job_id uuid references public.jobs(id) on delete set null,
    created_at    timestamptz not null default now()
);

-- resolve circular reference: jobs.output_track_id → tracks
alter table public.jobs
    add constraint jobs_output_track_id_fkey
    foreign key (output_track_id) references public.tracks(id) on delete set null;

-- updated_at trigger for jobs
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger jobs_updated_at
    before update on public.jobs
    for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.organisms  enable row level security;
alter table public.isolates   enable row level security;
alter table public.assemblies enable row level security;
alter table public.tracks     enable row level security;
alter table public.jobs       enable row level security;

-- owners can do everything on their own data
create policy "owner full access" on public.organisms
    for all using (owner_id = auth.uid());

create policy "owner full access" on public.isolates
    for all using (
        organism_id in (
            select id from public.organisms where owner_id = auth.uid()
        )
    );

create policy "owner full access" on public.assemblies
    for all using (
        isolate_id in (
            select id from public.isolates
            where organism_id in (
                select id from public.organisms where owner_id = auth.uid()
            )
        )
    );

create policy "owner full access" on public.tracks
    for all using (
        assembly_id in (
            select id from public.assemblies
            where isolate_id in (
                select id from public.isolates
                where organism_id in (
                    select id from public.organisms where owner_id = auth.uid()
                )
            )
        )
    );

create policy "owner full access" on public.jobs
    for all using (owner_id = auth.uid());
