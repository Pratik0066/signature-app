# SignFlow — Secure Digital Signature Platform

A full-stack digital signature application built with **Next.js 16**, **Supabase**, and **Tailwind CSS v4**. Upload PDFs, place signature fields, invite signers, and track documents through a complete signing workflow with real-time audit trails.

![Stack](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Stack](https://img.shields.io/badge/Supabase-2.107-3ECF8E?logo=supabase)
![Stack](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Stack](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

---

## Features

- **PDF Upload** — Drag-and-drop PDF upload with size validation (max 10MB)
- **Field Placement Editor** — Drag, resize, and position signature, initials, text, date, and checkbox fields directly on the PDF
- **Signature Capture** — Draw on canvas, type a cursive signature, or upload an image
- **Initials Capture** — Smaller field with bold uppercase sans-serif rendering
- **Signer Management** — Invite signers by email with roles (signer/approver/CC) and sequential signing order
- **Public Signing Page** — Unique token-based signing URL for each signer
- **Audit Trail** — Every action logged with IP, browser, device, and location tracking
- **Analytics Dashboard** — Monthly trends, status distribution, recent activity charts
- **Document Status Tracking** — Draft → Pending → Signed/Rejected lifecycle
- **Dark Theme** — Modern dark UI with violet accent throughout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, React 19, React Compiler) |
| **Auth & Database** | [Supabase](https://supabase.com/) (Postgres, Auth, Storage) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **PDF Rendering** | [react-pdf](https://github.com/wojtekmaj/react-pdf) |
| **Charts** | [recharts](https://recharts.org/) |
| **Forms** | [react-hook-form](https://react-hook-form.com/) + [zod](https://zod.dev/) |
| **Icons** | [lucide-react](https://lucide.dev/) |
| **Toasts** | [sonner](https://sonner.emilkowal.ski/) |
| **Drag & Drop** | [@dnd-kit](https://dndkit.com/) |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/               # Login, Register, Forgot/Reset Password
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── api/analytics/        # Monthly analytics API route
│   ├── auth/callback/        # Supabase OAuth callback
│   ├── dashboard/
│   │   ├── page.tsx          # Dashboard home (stats, chart, recent docs)
│   │   ├── analytics/        # Analytics with charts
│   │   ├── audit/            # Audit trail timeline
│   │   ├── documents/
│   │   │   ├── page.tsx      # Document list with search/filter
│   │   │   ├── upload/       # PDF upload page
│   │   │   └── [id]/
│   │   │       ├── page.tsx  # Document detail + preview
│   │   │       └── edit/     # Field placement editor
│   │   ├── settings/         # Profile, security, billing settings
│   │   ├── signers/          # All signers overview
│   │   └── layout.tsx        # Dashboard layout (sidebar + navbar + footer)
│   ├── sign/[token]/         # Public signing page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   ├── layout/               # Sidebar, Navbar, MobileNav
│   ├── landing/              # Landing page sections
│   ├── dashboard/            # StatsCard, RecentDocuments, DashboardChart
│   └── pdf-viewer.tsx        # Reusable PDF viewer
├── hooks/                    # use-documents, use-signature
├── lib/
│   ├── supabase/             # client.ts, server.ts
│   └── utils.ts              # cn(), formatDate(), generateToken()
├── services/                 # Server actions
│   ├── documents.ts
│   ├── signers.ts
│   ├── signature-fields.ts
│   └── audit.ts
├── types/index.ts            # All TypeScript types
└── proxy.ts                  # Auth middleware
```

---

## Database Schema

### Tables

**`documents`** — Uploaded PDFs with status tracking
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | |
| `user_id` | UUID FK | References `auth.users` |
| `name` | text | Document name |
| `file_url` | text | Public storage URL |
| `file_path` | text | Internal storage path |
| `status` | enum | `draft` → `pending` → `signed` / `rejected` |
| `page_count` | int | |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**`signers`** — Signers invited to a document
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | |
| `document_id` | UUID FK | References `documents` |
| `email` | text | |
| `name` | text | |
| `role` | enum | `signer` / `approver` / `cc` |
| `status` | enum | `pending` → `viewed` → `signed` |
| `signing_order` | int | Sequential order |
| `token` | text | Unique 32-char signing link token |

**`signature_fields`** — Placed fields on the PDF
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | |
| `document_id` | UUID FK | |
| `signer_id` | UUID FK | Nullable |
| `field_type` | enum | `signature` / `initials` / `text` / `date` / `checkbox` |
| `x`, `y` | float | Percentage-based position |
| `width`, `height` | float | Pixel dimensions |
| `page` | int | PDF page number |

**`signatures`** — Captured signature images
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | |
| `signer_id` | UUID FK | |
| `document_id` | UUID FK | |
| `field_id` | UUID FK | |
| `image_url` | text | Storage URL of signature PNG |
| `type` | enum | `draw` / `type` / `upload` |

**`audit_logs`** — Complete activity log
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | |
| `document_id` | UUID FK | |
| `user_id` / `signer_id` | UUID FK | Who performed the action |
| `action` | enum | 8 action types |
| `details` | JSONB | Extra context |
| `ip_address`, `browser`, `device`, `country` | text | Request metadata |

### Storage Buckets

| Bucket | Path | Purpose |
|--------|------|---------|
| `documents` | `{userId}/{timestamp}-{filename}` | Uploaded PDFs |
| `signatures` | `signatures/{signerId}/{timestamp}.png` | Captured signatures |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the following SQL in the SQL Editor to create all tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'rejected', 'expired')),
  page_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signers table
CREATE TABLE signers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'signer' CHECK (role IN ('signer', 'approver', 'cc')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'signed', 'rejected')),
  signing_order INTEGER NOT NULL DEFAULT 1,
  token TEXT NOT NULL UNIQUE,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signature fields table
CREATE TABLE signature_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  signer_id UUID REFERENCES signers(id) ON DELETE SET NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('signature', 'initials', 'text', 'date', 'checkbox')),
  label TEXT NOT NULL,
  page INTEGER NOT NULL DEFAULT 1,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  width DOUBLE PRECISION NOT NULL,
  height DOUBLE PRECISION NOT NULL,
  required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signatures table
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signer_id UUID REFERENCES signers(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  field_id UUID REFERENCES signature_fields(id) ON DELETE CASCADE,
  image_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('draw', 'type', 'upload')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  signer_id UUID REFERENCES signers(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  browser TEXT,
  country TEXT,
  device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('documents', 'documents', true),
  ('signatures', 'signatures', true);
```

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Pratik0066/signature-app.git
cd signature-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deployment

The app is ready to deploy to any platform that supports Next.js (Vercel, Netlify, Railway, etc.):

1. Set the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables on your hosting platform
2. Deploy with `npm run build && npm start` or use your platform's built-in Next.js support

---

## License

MIT
