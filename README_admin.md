# Admin SPA-like Shell

This admin area uses Next.js App Router features to feel like a SPA while keeping routes deep-linkable and standalone.

## Structure

- `app/admin/layout.tsx`: Persistent shell with Sidebar and Topbar. Includes a parallel route slot `@modal`.
- `app/admin/@modal/*`: Parallel routes rendering on top of the current page (modals/drawers).
- Intercepting routes with `(.)segment` allow opening forms as modals when navigated from a list while preserving standalone pages on direct access.

## Example Modules

- Coupons: `app/admin/coupons/page.tsx` list; modal create: `app/admin/coupons/@modal/(.)new/page.tsx` (wraps `app/admin/coupons/new/page.tsx`).
- Products: `app/admin/products/page.tsx` list; modal create: `app/admin/products/@modal/(.)new/page.tsx`; modal edit: `app/admin/products/@modal/(.)[id]/page.tsx`.

## How routes work

- Inside admin, navigating to `/admin/coupons/new` or `/admin/products/[id]` will render in the `@modal` slot because of intercepting `(.)` routes.
- Opening the same URL directly (reload / paste URL) renders the standalone page (`app/admin/.../new/page.tsx` or `[id]/page.tsx`) without overlay.
- Close modal with `router.back()`.

## Prefetch strategy

- Sidebar/Topbar links use prefetch (few critical routes).
- In large tables/grids, set `prefetch={false}` for row links to avoid unnecessary requests.

## Optimistic UI

- Mutations should update local state optimistically, close modal, then revalidate (via `router.refresh()` or refetch). On error, revert and show toast.

## Loading UX

- Each segment has `loading.tsx` with skeletons, ensuring no blank screens.

## Accessibility

- Modal uses focus management and is dismissible with `Esc` and backdrop click.
- Keyboard shortcuts: `N` to open contextual New, `Esc` to close modals, `Ctrl/Cmd+K` placeholder for a command palette.

## Adding a new module (e.g., Orders)

1. Create list page at `app/admin/orders/page.tsx`.
2. Create form pages at `app/admin/orders/new/page.tsx` and `app/admin/orders/[id]/page.tsx`.
3. Create intercepting modal wrappers:
   - `app/admin/orders/@modal/(.)new/page.tsx` that imports and wraps `../new/page`.
   - `app/admin/orders/@modal/(.)[id]/page.tsx` that imports and wraps `../[id]/page`.
4. Add `loading.tsx` for skeletons and ensure sidebar link exists.
5. In lists, disable prefetch on large row links with `prefetch={false}`.
