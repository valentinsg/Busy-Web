# Author Profile Images

This folder contains profile images for blog authors.

## Instructions

Please save the following images to this folder:

1. **agustin-molina.jpg** - Photo of Agustín (chico de rojo)
2. **valentin-sg.jpg** - Photo of Valentín (chico con fondo blanco)

## Image Requirements

- Format: JPG or PNG
- Recommended size: 400x400px (square)
- Max file size: 500KB

## After Adding Images

Run the update script to update the authors.json file:

```bash
npx tsx scripts/update-author-avatars.ts
```

This will automatically update the avatar paths in `data/authors.json`.
