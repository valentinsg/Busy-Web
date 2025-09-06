'use client'
import { useI18n } from '@/components/i18n-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Heart, Leaf, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const values = [
  { icon: Award, key: 'quality' },
  { icon: Users, key: 'community' },
  { icon: Leaf, key: 'sustainable' },
  { icon: Heart, key: 'passion' },
]

const timeline = [
  { year: '2020' },
  { year: '2021' },
  { year: '2022' },
  { year: '2023' },
  { year: '2024' },
]

export default function AboutPage() {
  const { t } = useI18n()
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Pattern background limited to this hero section */}
        <div
          className="pointer-events-none absolute bg-repeat bg-cover opacity-80"
          style={{
            backgroundImage: 'url(/pattern.png)',
            backgroundSize: '40% ',
            width: '100%',
            height: '100%',
          }}
        />
        <div className="container px-4 relative z-10 py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-row items-center justify-center gap-3 ">
              <div className="relative h-28 w-28">
                <Image
                  src="/logo-busy-white.png"
                  alt={t('about.image.alt')}
                  fill
                />
              </div>
            </div>
            <h1
              className="font-heading text-4xl md:text-6xl font-bold mb-2"
              dangerouslySetInnerHTML={{ __html: t('about.hero.title') }}
            />
            <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t('about.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                  {t('about.story.title')}
                </h2>
                <div className="font-body space-y-4 text-muted-foreground leading-relaxed">
                  <p>{t('about.story.p1')}</p>
                  <p>{t('about.story.p2')}</p>
                  <p>{t('about.story.p3')}</p>
                </div>
                <Button asChild className="mt-6" size="lg">
                  <Link href="/products">{t('about.story.cta')}</Link>
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <Image
                    src="/busy-brand-story.jpg"
                    alt={t('about.image.alt')}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {t('about.values.title')}
              </h2>
              <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
                {t('about.values.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-brand/10 rounded-full mb-4">
                      <value.icon className="h-6 w-6 text-accent-brand" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold mb-2">
                      {t(`about.values.items.${value.key}.title`)}
                    </h3>
                    <p className="font-body text-muted-foreground text-sm leading-relaxed">
                      {t(`about.values.items.${value.key}.desc`)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {t('about.timeline.title')}
              </h2>
              <p className="font-body text-muted-foreground text-lg">
                {t('about.timeline.subtitle')}
              </p>
            </div>

            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-accent-brand rounded-full flex items-center justify-center text-white font-bold">
                      {item.year.slice(-2)}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-px h-16 bg-border mt-4" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-medium text-accent-brand">
                        {item.year}
                      </span>
                      <h3 className="font-heading text-xl font-semibold">
                        {t(`about.timeline.items.${item.year}.title`)}
                      </h3>
                    </div>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      {t(`about.timeline.items.${item.year}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              {t('about.cta.title')}
            </h2>
            <p className="font-body text-muted-foreground text-lg mb-8 leading-relaxed">
              {t('about.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/products">{t('about.cta.primary')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">{t('about.cta.secondary')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
