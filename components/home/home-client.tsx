'use client'

import { useI18n } from '@/components/providers/i18n-provider'
import { Button } from '@/components/ui/button'
import { getImageConfig } from '@/lib/imageConfig'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function HomeClient() {
  const { t } = useI18n()

  const categories = [
    {
      name: t('footer.sections.shop.links.hoodies', { default: 'Hoodies' }),
      href: '/products/category/buzos',
      image: '/backgrounds/hoodies-background.png',
    },
    {
      name: t('footer.sections.shop.links.tshirts', { default: 'Remeras' }),
      href: '/products/category/remeras',
      image: '/backgrounds/t-shirts-background.png',
    },
    {
      name: t('footer.sections.shop.links.pants', { default: 'Pantalones' }),
      href: '/products/category/pantalones',
      image: '/backgrounds/pants-background.png',
    },
  ]

  return (
    <>
      <section className="relative py-14 sm:py-16 md:py-24 lg:py-28">
        <div className="container px-6 sm:px-4">
          <motion.div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {t('home.categories.title', { default: 'Categorías' })}
            </h2>
            <p className="font-body text-muted-foreground  text-lg md:text-xl">
              {t('home.categories.subtitle', {
                default: 'Explorá por tipo de producto',
              })}
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {categories.map((category) => (
              <motion.div key={category.name}>
                <Link
                  href={category.href}
                  prefetch={false}
                  className="group block"
                >
                  {/* Glow frame wrapper */}
                  <div className="group relative rounded-2xl p-[4px] bg-gradient-to-br from-white/45 via-white/20 to-transparent shadow-[0_0_50px_rgba(35,35,35,0.3)] ring-2 ring-white/30">
                    {/* soft external glow */}
                    <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />

                    {/* subtle inner border */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15" />

                    {/* corner accents */}
                    <span className="pointer-events-none absolute top-3 left-3 h-px w-8 bg-white/40" />
                    <span className="pointer-events-none absolute top-3 left-3 h-8 w-px bg-white/40" />
                    <span className="pointer-events-none absolute top-3 right-3 h-px w-8 bg-white/40" />
                    <span className="pointer-events-none absolute top-3 right-3 h-8 w-px bg-white/40" />
                    <span className="pointer-events-none absolute bottom-3 left-3 h-px w-8 bg-white/30" />
                    <span className="pointer-events-none absolute bottom-3 left-3 h-8 w-px bg-white/30" />
                    <span className="pointer-events-none absolute bottom-3 right-3 h-px w-8 bg-white/30" />
                    <span className="pointer-events-none absolute bottom-3 right-3 h-8 w-px bg-white/30" />

                    {/* content card */}
                    <div className="relative aspect-square overflow-hidden rounded-[16px] bg-background ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)]">
                      {/* gentle sheen on hover */}
                      <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-15 transition-opacity duration-500" />

                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundImage: `url('${category.image}')`,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

                      <div className="absolute bottom-6 left-6 z-20">
                        <h3 className="font-heading text-2xl font-bold text-white mb-2">
                          {category.name}
                        </h3>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="font-body"
                        >
                          {t('home.categories.cta', {
                            default: 'Ver colección',
                          })}{' '}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-black">
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24 py-16 md:py-24">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-repeat opacity-25"
            style={{
              backgroundImage: 'url(/backgrounds/pattern-black.jpg)',
            }}
          />
          {/* Fade lateral izquierdo */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 md:w-48 lg:w-64 bg-gradient-to-r from-black to-transparent z-0" />
          {/* Fade lateral derecho */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 md:w-48 lg:w-64 bg-gradient-to-l from-black to-transparent z-0" />
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center justify-center justify-items-center place-content-center">
            <motion.div className="w-full max-w-xl mx-auto text-center">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {t('home.about.title', {
                  default: 'Hecho para la vida urbana',
                })}
              </h2>
              <p className="text-muted-foreground font-body text-lg md:text-xl mb-4 leading-relaxed ">
                {t('home.about.p1', {
                  default:
                    'Diseñamos básicos premium con foco en calidad, confort y durabilidad.',
                })}
              </p>
              <p className="text-muted-foreground font-body text-lg md:text-xl mb-8 leading-relaxed">
                {t('home.about.p2', {
                  default:
                    'Productos versátiles pensados para acompañarte todos los días.',
                })}
              </p>
              <Button asChild variant="outline" size="lg">
                <Link href="/about" prefetch={false} className="font-heading">
                  {t('home.about.cta', { default: 'Conocé más' })}
                </Link>
              </Button>
            </motion.div>

            <motion.div className="relative ml-auto w-full">
              {/* Creative border frame with subtle white glow */}
              <div className="group relative w-full max-w-md sm:max-w-lg md:max-w-xl aspect-[11/19] rounded-2xl p-[4px] bg-gradient-to-br from-white/45 via-white/20 to-transparent shadow-[0_0_50px_rgba(35,35,35,0.3)] ring-2 ring-white/30">
                {/* soft external glow */}
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />

                {/* subtle inner border */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15" />

                {/* corner accents */}
                <span className="pointer-events-none absolute top-3 left-3 h-px w-8 bg-white/40" />
                <span className="pointer-events-none absolute top-3 left-3 h-8 w-px bg-white/40" />
                <span className="pointer-events-none absolute top-3 right-3 h-px w-8 bg-white/40" />
                <span className="pointer-events-none absolute top-3 right-3 h-8 w-px bg-white/40" />
                <span className="pointer-events-none absolute bottom-3 left-3 h-px w-8 bg-white/30" />
                <span className="pointer-events-none absolute bottom-3 left-3 h-8 w-px bg-white/30" />
                <span className="pointer-events-none absolute bottom-3 right-3 h-px w-8 bg-white/30" />
                <span className="pointer-events-none absolute bottom-3 right-3 h-8 w-px bg-white/30" />

                {/* content card */}
                <div className="relative h-full w-full overflow-hidden rounded-[16px] bg-muted opacity-80 ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)]">
                  {/* gentle sheen on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-15 transition-opacity duration-500" />
                  <div
                    className="w-full h-full bg-cover object-contain"
                    style={{ backgroundImage: "url('/docs/archive/ciro-gif.gif')" }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Removed bottom fade - next section is now black */}
      </section>

      {/* Social Proof - Contracultura */}
      <section className="relative py-16 md:py-28">
        {/* Removed top fade - section is now fully black to blend seamlessly */}
        <div className="relative z-10 container px-3 sm:px-4">
          <motion.div className="text-center mb-24">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {t('home.social.title', { default: 'Comunidad Busy' })}
            </h2>
            <p className="font-body text-muted-foreground text-lg md:text-xl">
              {t('home.social.subtitle', {
                default: 'Lo que construimos con nuestra comunidad',
              })}
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                iconSrc: '/blog/blog.png',
                title: t('home.social.items.rating.title', {
                  default: 'Guías y noticias',
                }),
                description: t('home.social.items.rating.desc', {
                  default: 'Consejos de estilo, cuidado y cultura Busy',
                }),
                href: '/blog',
              },
              {
                iconSrc: '/blog/spotify.png',
                title: t('home.social.items.customers.title', {
                  default: 'Playlist',
                }),
                description: t('home.social.items.customers.desc', {
                  default: 'Sonido para acompañar tu día',
                }),
                href: '/playlists',
              },
              {
                iconSrc: '/blog/drops.png',
                title: t('home.social.items.quality.title', {
                  default: 'Calidad Busy',
                }),
                description: t('home.social.items.quality.desc', {
                  default: 'Materiales premium y confección cuidada',
                }),
                href: '/products',
              },
            ].map(
              (
                item: {
                  iconSrc: string
                  title: string
                  description: string
                  href: string
                },
                index
              ) => (
                <motion.div key={index} className="text-center">
                  {item.href.startsWith('http') ? (
                    <>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-block"
                      >
                        <div className="inline-flex bg-transparent rounded-full border-4 border-white items-center justify-center mb-3 sm:mb-4">
                          <Image
                            src={item.iconSrc || ''}
                            alt={item.title}
                            width={getImageConfig('socialIcon').width}
                            height={getImageConfig('socialIcon').height}
                            sizes={getImageConfig('socialIcon').sizes}
                            className="h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 lg:h-48 lg:w-48 rounded-full contrast-150 brightness-25 transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-semibold mb-1 sm:mb-2">
                          {item.title}
                        </h3>
                      </a>
                      <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg">
                        {item.description}
                      </p>
                    </>
                  ) : (
                    <>
                      <Link
                        href={item.href}
                        prefetch={false}
                        className="group inline-block"
                      >
                        <div className="inline-flex bg-transparent  rounded-full border-4 border-white items-center justify-center mb-3 sm:mb-4">
                          <Image
                            src={item.iconSrc || ''}
                            alt={item.title}
                            width={getImageConfig('socialIcon').width}
                            height={getImageConfig('socialIcon').height}
                            sizes={getImageConfig('socialIcon').sizes}
                            className="h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 lg:h-48 lg:w-48 rounded-full contrast-150 brightness-25 transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-semibold mb-1 sm:mb-2">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg">
                        {item.description}
                      </p>
                    </>
                  )}
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </section>
    </>
  )
}
