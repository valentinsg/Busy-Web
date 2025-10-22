# Authors System Migration - Database Implementation

## Overview

The authors system has been migrated from static JSON (`data/authors.json`) to a dynamic database-driven system with full CRUD capabilities and profile management.

## Database Schema

### Table: `public.authors`

```sql
create table public.authors (
  id text primary key,              -- slug-like id (e.g., 'valentin-sg')
  name text not null,
  email text unique,
  avatar_url text,
  bio text,
  instagram text,
  twitter text,
  linkedin text,
  medium text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Storage Bucket: `authors`

- **Purpose**: Store author avatar images
- **Access**: Public read, authenticated write
- **Policies**: Users can upload/update/delete their own avatars

## API Endpoints

### Public Endpoints

- `GET /api/authors` - Get all active authors
- `GET /api/authors/[id]` - Get author by ID

### Admin Endpoints

- `GET /api/admin/authors` - Get all authors (including inactive)
- `POST /api/admin/authors` - Create new author
- `GET /api/admin/authors/[id]` - Get author by ID
- `PATCH /api/admin/authors/[id]` - Update author
- `DELETE /api/admin/authors/[id]` - Delete author (soft delete)

### Profile Management

- `GET /api/admin/profile` - Get current user's profile
- `PATCH /api/admin/profile` - Update current user's profile
- `POST /api/admin/profile/avatar` - Upload avatar
- `DELETE /api/admin/profile/avatar` - Delete avatar

## Admin Pages

### `/admin/profile`

Personal profile management for logged-in users:
- Edit name, bio, and social links
- Upload/delete avatar image
- View current profile information

### `/admin/authors`

Full authors management (admin only):
- View all authors in a table
- Create new author profiles
- Edit existing authors
- Delete authors (soft delete)
- View social media links
- Filter by active/inactive status

## Repository Functions

Located in `lib/repo/authors.ts`:

- `getAllAuthors(supabase)` - Get all active authors
- `getAuthorById(supabase, id)` - Get author by ID
- `getAuthorByEmail(supabase, email)` - Get author by email
- `getAuthorByName(supabase, name)` - Get author by name (case-insensitive)
- `createAuthor(supabase, input)` - Create new author
- `updateAuthor(supabase, id, input)` - Update author
- `deleteAuthor(supabase, id)` - Soft delete author
- `uploadAuthorAvatar(supabase, authorId, file)` - Upload avatar to storage
- `deleteAuthorAvatar(supabase, avatarUrl)` - Delete avatar from storage

## Migration Steps

### 1. Run SQL Migrations

Execute in this order:

```bash
# 1. Create/update authors table
psql -f supabase/schema/authors.sql

# 2. Create storage bucket
psql -f supabase/schema/migrations/create_authors_bucket.sql

# 3. Seed initial data
psql -f supabase/seed/authors_seed.sql
```

### 2. Upload Existing Avatar Images

The seed data references existing images in `/public/authors/`:
- `agustin-molina.jpg`
- `valentin-sg.jpg`

These images are already in the public folder and will continue to work. To migrate them to Supabase Storage:

1. Go to `/admin/authors`
2. Edit each author
3. Upload their avatar image
4. The new URL will be stored in `avatar_url`

### 3. Update Environment Variables

No new environment variables needed. Uses existing Supabase configuration.

## Security & Permissions

### Row Level Security (RLS)

1. **Public Read**: Anyone can read active authors
2. **Self Update**: Users can update their own profile (matched by email)
3. **Admin Full Access**: Admin users (by email whitelist) can create/update/delete all authors

### Admin Email Whitelist

Currently configured for:
- `sanchezguevara.valentin@gmail.com`
- `agustinmancho5@gmail.com`

To add more admins, update the policy in `supabase/schema/authors.sql`.

## Component Updates

### Updated Components

1. **`components/admin/admin-header.tsx`**
   - Now fetches avatar from database instead of JSON
   - Uses Supabase query to get author by email

2. **`app/blog/[slug]/page.tsx`**
   - Removed dependency on `authors.json`
   - Uses database queries with fallback logic
   - Maintains backward compatibility

3. **`app/admin/blog/new/page.tsx`**
   - Already loads authors from database ✓

4. **`app/admin/blog/edit/[slug]/page.tsx`**
   - Already loads authors from database ✓

## Usage Examples

### Create a New Author (Admin Panel)

1. Navigate to `/admin/authors`
2. Click "Nuevo Autor"
3. Fill in the form:
   - **ID**: Unique slug (e.g., `juan-perez`)
   - **Name**: Full name
   - **Email**: Optional, for admin access
   - **Bio**: Short description
   - **Social Links**: Instagram, Twitter, LinkedIn, Medium
4. Click "Crear Autor"

### Update Your Profile

1. Navigate to `/admin/profile`
2. Update your information
3. Upload a new avatar (max 2MB)
4. Click "Guardar Cambios"

### Programmatic Usage

```typescript
import { getAllAuthors, getAuthorByEmail } from '@/lib/repo/authors'
import getServiceClient from '@/lib/supabase/server'

// Get all active authors
const supabase = getServiceClient()
const authors = await getAllAuthors(supabase)

// Get author by email
const author = await getAuthorByEmail(supabase, 'user@example.com')
```

## Seeded Authors

The following authors are pre-seeded:

1. **default** - Equipo Busy
2. **agus-molina** - Agustín Molina (agustinmancho5@gmail.com)
3. **eze-molina** - Ezequiel Molina
4. **juampi-pavone** - Juán Pablo Pavone
5. **valentin-sg** - Valentín Sánchez Guevara (sanchezguevara.valentin@gmail.com)

## Benefits

✅ **Dynamic Content**: Authors can be added/edited without code changes
✅ **Self-Service**: Users can update their own profiles
✅ **Centralized**: Single source of truth in database
✅ **Scalable**: Easy to add new authors and fields
✅ **Secure**: RLS policies protect data
✅ **Avatar Management**: Direct upload to Supabase Storage
✅ **Backward Compatible**: Existing blog posts continue to work

## Next Steps

1. **Run migrations** in your Supabase project
2. **Test the admin pages** at `/admin/profile` and `/admin/authors`
3. **Migrate avatar images** to Supabase Storage (optional)
4. **Add more authors** as needed through the admin panel
5. **Consider deprecating** `data/authors.json` after full migration

## Troubleshooting

### Avatar Upload Fails

- Check storage bucket exists: `authors`
- Verify storage policies are set correctly
- Ensure file is under 2MB and is an image format

### Can't Update Profile

- Verify your email matches an author record
- Check RLS policies are enabled
- Ensure you're authenticated

### Authors Not Showing in Blog

- Verify authors are marked as `active = true`
- Check author name matches exactly in blog post metadata
- Review fallback logic in `app/blog/[slug]/page.tsx`

## Files Created/Modified

### Created Files
- `lib/repo/authors.ts`
- `app/api/authors/route.ts`
- `app/api/authors/[id]/route.ts`
- `app/api/admin/authors/route.ts`
- `app/api/admin/authors/[id]/route.ts`
- `app/api/admin/profile/route.ts`
- `app/api/admin/profile/avatar/route.ts`
- `app/admin/profile/page.tsx`
- `app/admin/authors/page.tsx`
- `supabase/schema/migrations/create_authors_bucket.sql`
- `supabase/seed/authors_seed.sql`

### Modified Files
- `supabase/schema/authors.sql`
- `components/admin/admin-header.tsx`
- `app/blog/[slug]/page.tsx`

### Unchanged (Already Using Database)
- `app/admin/blog/new/page.tsx`
- `app/admin/blog/edit/[slug]/page.tsx`
