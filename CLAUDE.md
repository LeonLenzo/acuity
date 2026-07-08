# acuity — Project Context

## What is this?

A minimal, clean, open-source web platform for bioinformatic sequence analysis and genome visualisation. Built as a side project by a Research Assistant at CCDM (Centre for Crop and Disease Management, funded by GRDC, Perth WA), who works primarily with **plant pathogens** (fungal, oomycete, bacterial) — smaller genomes (30–250 Mb) rather than human/biomedical scale.

**Core frustration driving this:** Existing tools (Geneious, IGV, JBrowse) are either expensive, clunky at genomic scale, or visually overwhelming. The goal is a UX that shows only what is needed and no more, while offering easy integrations that currently require significant manual setup.

## Design Philosophy

- **Progressive disclosure:** only surface complexity when the user needs it
- **Plugin-first:** core platform is lean; functionality grows through addons
- **Accessible to both CLI-comfortable and CLI-averse users**
- **Open source**, publicly hosted, with per-user private data isolation

## Primary Use Cases (Day One)

- Genome assembly QC and visualisation (contigs, scaffolds, N50, BUSCO)
- RNA-seq alignment viewing and coverage tracks
- Variant visualisation (VCF)
- Fetching reference data from NCBI
- Uploading/storing data in S3 with private isolation

## Out of Scope Initially

- Pan-genome / GFA graph support (plugin territory)
- Protein structure viewing (plugin territory)
- Human/biomedical genomics optimisations

## Stack

### Frontend
- **Next.js 15** (App Router, React 19)
- **TypeScript**
- **Tailwind CSS** — styling
- **shadcn/ui** — component library (headless, source-owned, minimal aesthetic)
- **TanStack Query** — server state and data fetching
- **Zustand** — lightweight client state
- **Custom genome renderer** — Canvas/WebGL, using `tabix-js` and `@gmod/bam` for binary format parsing (not JBrowse; full UX control)

### Auth + Database
- **Supabase** — authentication, PostgreSQL, Row Level Security for per-user data isolation

### Backend
- **FastAPI** (Python 3.12+) — chosen over Node because bioinformatics ecosystem is Python-first
- **Pydantic v2** — data validation
- **SQLAlchemy 2** — ORM (Supabase PostgreSQL)
- **Celery + Redis** — async job queue for SLURM submission and status polling
- **Boto3** — S3 integration
- **Biopython** — NCBI Entrez queries, sequence parsing
- **Paramiko** — SSH interface to SLURM clusters
- **Uvicorn** — ASGI server

### Storage
- **AWS S3** (MinIO locally) — per-user prefix isolation; large files (BAM, FASTA) served via **presigned URLs directly to the browser**, never proxied through FastAPI

### Local Dev
- **Docker Compose** — Next.js + FastAPI + PostgreSQL + Redis + MinIO

## Plugin System (design TBD)

Plugins are npm packages that export a manifest + React components. Community members (including AI-assisted developers) can build plugins for:
- Pan-genome graph viewers
- Protein structure (AlphaFold integration)
- Organism-specific databases
- Custom analysis workflows

First-party plugins (built alongside core, set the pattern):
- RNA-seq coverage + differential expression overlay
- Assembly quality metrics
- Basic variant calling view

## HPC Integration

- **Primary:** SLURM (via SSH with Paramiko)
- **Architecture:** generic adapter interface so other schedulers (PBS, AWS Batch) can be added as plugins
- Job submission, status polling, log streaming via WebSocket

## Key Architectural Decisions

1. **Large files go S3 → browser directly** via presigned URLs. Backend is never in the data path for reads.
2. **Supabase RLS** handles per-user data isolation at the database level.
3. **Celery** decouples long-running HPC jobs from the HTTP request cycle.
4. **Custom renderer** over JBrowse — full UX control, no biomedical-scale complexity baggage. Reuse existing JS parsers for binary formats only.

## Project Status

Early architecture / side project. No timeline pressure. Building iteratively.
