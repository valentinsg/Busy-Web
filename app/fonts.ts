import localFont from 'next/font/local'

// Fuentes principales
export const spaceGrotesk = localFont({
  src: [
    {
      path: '../public/fonts/SpaceGrotesk-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/SpaceGrotesk-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/SpaceGrotesk-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
})

export const plusJakartaSans = localFont({
  src: [
    {
      path: '../public/fonts/PlusJakartaSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/PlusJakartaSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/PlusJakartaSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  preload: true,
})

export const abel = localFont({
  src: '../public/fonts/Abel-Regular.woff2',
  weight: '400',
  variable: '--font-abel',
  display: 'swap',
  preload: false,
})

export const dmSans = localFont({
  src: [
    {
      path: '../public/fonts/DMSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/DMSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: false,
})

export const poppins = localFont({
  src: [
    {
      path: '../public/fonts/Poppins-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Poppins-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Poppins-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-poppins',
  display: 'swap',
  preload: false,
})
