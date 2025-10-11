/**
 * Script to update author avatars in authors.json
 * 
 * INSTRUCTIONS:
 * 1. Save the author images to public/authors/ folder:
 *    - agustin-molina.jpg (chico de rojo)
 *    - valentin-sg.jpg (chico con fondo blanco)
 * 2. Run: npx tsx scripts/update-author-avatars.ts
 */

import fs from 'fs'
import path from 'path'

const AUTHORS_FILE = path.join(process.cwd(), 'data', 'authors.json')

interface Author {
  id: string
  name: string
  email: string
  avatar: string
  instagram?: string
  twitter?: string
  bio?: string
}

async function updateAuthors() {
  console.log('📝 Updating author avatars...\n')

  // Read current authors
  const authorsData = fs.readFileSync(AUTHORS_FILE, 'utf-8')
  const authors: Author[] = JSON.parse(authorsData)

  // Update avatars
  const updates = [
    { id: 'agus-molina', avatar: '/authors/agustin-molina.jpg' },
    { id: 'valentin-sg', avatar: '/authors/valentin-sg.jpg' },
  ]

  let updated = 0
  for (const update of updates) {
    const author = authors.find((a) => a.id === update.id)
    if (author) {
      author.avatar = update.avatar
      updated++
      console.log(`✅ Updated ${author.name}: ${update.avatar}`)
    } else {
      console.log(`⚠️  Author not found: ${update.id}`)
    }
  }

  // Write back to file
  fs.writeFileSync(AUTHORS_FILE, JSON.stringify(authors, null, 2) + '\n', 'utf-8')

  console.log(`\n✨ Done! Updated ${updated} author(s)`)
  console.log(`\n📁 Make sure to save the images to:`)
  console.log(`   - public/authors/agustin-molina.jpg`)
  console.log(`   - public/authors/valentin-sg.jpg`)
}

updateAuthors().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
