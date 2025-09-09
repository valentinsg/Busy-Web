"use server"

import { cookies } from 'next/headers'

/**
 * Set the lastCategory cookie when user visits/clicks a category or product.
 * - name: lastCategory
 * - maxAge: 30 days
 * - sameSite: Lax
 * - secure: true
 * - path: '/'
 */
export async function setLastCategoryCookie(cat: string): Promise<void> {
  if (typeof cat !== 'string' || !cat.trim()) return

  const cookieStore = await cookies()
  cookieStore.set('lastCategory', cat, {
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    sameSite: 'lax',
    secure: true,
    path: '/',
  })
}

export default setLastCategoryCookie
