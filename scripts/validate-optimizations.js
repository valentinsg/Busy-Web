#!/usr/bin/env node

/**
 * Script de validación de optimizaciones de rendimiento
 * Verifica que todas las optimizaciones estén implementadas correctamente
 */

const fs = require('fs');
const path = require('path');

const errors = [];
const warnings = [];
const success = [];

console.log('🔍 Validando optimizaciones de rendimiento...\n');

// 1. Verificar que las fuentes existen
console.log('📝 Verificando fuentes locales...');
const fontsDir = path.join(__dirname, '..', 'public', 'fonts');
const requiredFonts = [
  'SpaceGrotesk-Regular.woff2',
  'SpaceGrotesk-Medium.woff2',
  'SpaceGrotesk-Bold.woff2',
  'PlusJakartaSans-Regular.woff2',
  'PlusJakartaSans-Medium.woff2',
  'PlusJakartaSans-Bold.woff2',
  'Abel-Regular.woff2',
  'DMSans-Regular.woff2',
  'DMSans-Bold.woff2',
  'Poppins-Regular.woff2',
  'Poppins-Medium.woff2',
  'Poppins-Bold.woff2',
];

if (!fs.existsSync(fontsDir)) {
  errors.push('❌ Directorio public/fonts/ no existe');
} else {
  requiredFonts.forEach(font => {
    const fontPath = path.join(fontsDir, font);
    if (fs.existsSync(fontPath)) {
      success.push(`✅ Fuente encontrada: ${font}`);
    } else {
      warnings.push(`⚠️  Fuente faltante: ${font}`);
    }
  });
}

// 2. Verificar next.config.mjs
console.log('\n📝 Verificando next.config.mjs...');
const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (nextConfig.includes("formats: ['image/avif', 'image/webp']")) {
    success.push('✅ Formatos de imagen AVIF y WebP configurados');
  } else {
    errors.push('❌ Formatos de imagen no configurados correctamente');
  }
  
  if (nextConfig.includes('unoptimized: true')) {
    errors.push('❌ Imágenes sin optimizar (unoptimized: true)');
  } else {
    success.push('✅ Optimización de imágenes habilitada');
  }
} else {
  errors.push('❌ next.config.mjs no encontrado');
}

// 3. Verificar app/fonts.ts
console.log('\n📝 Verificando app/fonts.ts...');
const fontsConfigPath = path.join(__dirname, '..', 'app', 'fonts.ts');
if (fs.existsSync(fontsConfigPath)) {
  const fontsConfig = fs.readFileSync(fontsConfigPath, 'utf8');
  
  if (fontsConfig.includes("display: 'swap'")) {
    success.push('✅ Fuentes configuradas con display: swap');
  } else {
    warnings.push('⚠️  Fuentes sin display: swap');
  }
  
  if (fontsConfig.includes('localFont')) {
    success.push('✅ Usando fuentes locales (localFont)');
  } else {
    errors.push('❌ No se están usando fuentes locales');
  }
} else {
  errors.push('❌ app/fonts.ts no encontrado');
}

// 4. Verificar app/layout.tsx
console.log('\n📝 Verificando app/layout.tsx...');
const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layout = fs.readFileSync(layoutPath, 'utf8');
  
  if (layout.includes("from './fonts'")) {
    success.push('✅ Layout importa fuentes locales');
  } else {
    errors.push('❌ Layout no importa fuentes locales');
  }
  
  if (layout.includes('next/font/google')) {
    warnings.push('⚠️  Layout todavía importa fuentes de Google');
  }
  
  if (layout.includes('<Analytics') && layout.includes('<SpeedInsights')) {
    success.push('✅ Analytics y SpeedInsights configurados');
  }
} else {
  errors.push('❌ app/layout.tsx no encontrado');
}

// 5. Verificar página principal
console.log('\n📝 Verificando página principal...');
const pageServerPath = path.join(__dirname, '..', 'app', 'page-server.tsx');
const pagePath = path.join(__dirname, '..', 'app', 'page.tsx');

if (fs.existsSync(pageServerPath)) {
  const pageServer = fs.readFileSync(pageServerPath, 'utf8');
  
  if (pageServer.includes('export const revalidate')) {
    success.push('✅ Página principal con revalidación ISR');
  } else {
    warnings.push('⚠️  Página principal sin revalidación');
  }
  
  if (pageServer.includes('async function')) {
    success.push('✅ Página principal es Server Component');
  } else {
    errors.push('❌ Página principal no es Server Component');
  }
  
  if (!pageServer.includes("'use client'")) {
    success.push('✅ Página principal sin "use client"');
  } else {
    errors.push('❌ Página principal tiene "use client"');
  }
}

// 6. Verificar componentes de imágenes
console.log('\n📝 Verificando optimización de imágenes...');
const bannerPath = path.join(__dirname, '..', 'components', 'home', 'auto-slider-banner.tsx');
if (fs.existsSync(bannerPath)) {
  const banner = fs.readFileSync(bannerPath, 'utf8');
  
  if (banner.includes('priority={index === 0}') || banner.includes('priority={true}')) {
    success.push('✅ Banner con imagen priority');
  } else {
    warnings.push('⚠️  Banner sin imagen priority');
  }
  
  if (banner.includes('loading="lazy"')) {
    success.push('✅ Banner con lazy loading');
  }
}

const productCardPath = path.join(__dirname, '..', 'components', 'shop', 'product-card.tsx');
if (fs.existsSync(productCardPath)) {
  const productCard = fs.readFileSync(productCardPath, 'utf8');
  
  if (productCard.includes('loading="lazy"')) {
    success.push('✅ ProductCard con lazy loading');
  } else {
    warnings.push('⚠️  ProductCard sin lazy loading');
  }
}

// 7. Verificar header con minHeight
console.log('\n📝 Verificando estabilidad de layout...');
const headerPath = path.join(__dirname, '..', 'components', 'layout', 'header.tsx');
if (fs.existsSync(headerPath)) {
  const header = fs.readFileSync(headerPath, 'utf8');
  
  if (header.includes('minHeight')) {
    success.push('✅ Header con minHeight fijo (previene CLS)');
  } else {
    warnings.push('⚠️  Header sin minHeight (puede causar CLS)');
  }
}

// 8. Verificar blog con ISR
console.log('\n📝 Verificando configuración de blog...');
const blogPagePath = path.join(__dirname, '..', 'app', 'blog', '[slug]', 'page.tsx');
if (fs.existsSync(blogPagePath)) {
  const blogPage = fs.readFileSync(blogPagePath, 'utf8');
  
  if (blogPage.includes('export const revalidate')) {
    success.push('✅ Blog con revalidación ISR');
  } else {
    warnings.push('⚠️  Blog sin revalidación');
  }
  
  if (blogPage.includes('generateStaticParams')) {
    success.push('✅ Blog con generateStaticParams');
  } else {
    warnings.push('⚠️  Blog sin generateStaticParams (no pre-genera páginas)');
  }
}

// Resumen
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE VALIDACIÓN');
console.log('='.repeat(60));

if (success.length > 0) {
  console.log('\n✅ Éxitos (' + success.length + '):');
  success.forEach(s => console.log('  ' + s));
}

if (warnings.length > 0) {
  console.log('\n⚠️  Advertencias (' + warnings.length + '):');
  warnings.forEach(w => console.log('  ' + w));
}

if (errors.length > 0) {
  console.log('\n❌ Errores (' + errors.length + '):');
  errors.forEach(e => console.log('  ' + e));
}

console.log('\n' + '='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log('🎉 ¡Todas las optimizaciones están correctamente implementadas!');
  process.exit(0);
} else if (errors.length === 0) {
  console.log('✅ No hay errores críticos, pero hay advertencias a revisar.');
  process.exit(0);
} else {
  console.log('❌ Hay errores que deben corregirse antes de continuar.');
  process.exit(1);
}
