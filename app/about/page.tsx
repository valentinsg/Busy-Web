import Image from "next/image"
import { Award, Users, Leaf, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const values = [
  {
    icon: Award,
    title: "Quality First",
    description:
      "We never compromise on quality. Every piece is crafted with premium materials and attention to detail.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Our designs are inspired by and created for our community of style enthusiasts worldwide.",
  },
  {
    icon: Leaf,
    title: "Sustainable",
    description: "We're committed to sustainable practices and ethical manufacturing processes.",
  },
  {
    icon: Heart,
    title: "Passion",
    description: "Fashion is our passion, and we pour our heart into every design and customer interaction.",
  },
]

const timeline = [
  {
    year: "2020",
    title: "The Beginning",
    description: "Founded with a vision to create premium streetwear that doesn't compromise on comfort or style.",
  },
  {
    year: "2021",
    title: "First Collection",
    description: "Launched our signature hoodie line, quickly gaining recognition for quality and design.",
  },
  {
    year: "2022",
    title: "Community Growth",
    description: "Reached 10,000+ satisfied customers and expanded our product range.",
  },
  {
    year: "2023",
    title: "Sustainability Focus",
    description: "Implemented eco-friendly practices and sustainable material sourcing.",
  },
  {
    year: "2024",
    title: "Global Expansion",
    description: "Expanded shipping worldwide and opened our first flagship store.",
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              About <span className="text-accent-brand">Busy</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              We're more than just a clothing brand. We're a community of individuals who believe that great style
              should be accessible, comfortable, and authentic to who you are.
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
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Busy was born from a simple observation: the modern individual is always on the move, juggling
                    multiple responsibilities while trying to maintain their personal style. We saw a gap in the market
                    for clothing that could keep up with this lifestyle.
                  </p>
                  <p>
                    Our founders, passionate about both fashion and functionality, set out to create pieces that would
                    seamlessly transition from work to weekend, from casual to elevated. Every design decision is made
                    with the busy individual in mind.
                  </p>
                  <p>
                    Today, Busy represents more than just clothing—it's a mindset. It's about being productive,
                    purposeful, and stylish, no matter what your day brings.
                  </p>
                </div>
                <Button asChild className="mt-6" size="lg">
                  <Link href="/products">Shop Our Collection</Link>
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <Image src="/busy-brand-story.jpg" alt="Busy brand story" fill className="object-cover" />
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
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                These core principles guide everything we do, from design to customer service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-brand/10 rounded-full mb-4">
                      <value.icon className="h-6 w-6 text-accent-brand" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
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
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
              <p className="text-muted-foreground text-lg">
                From a small idea to a growing community of style enthusiasts.
              </p>
            </div>

            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-accent-brand rounded-full flex items-center justify-center text-white font-bold">
                      {item.year.slice(-2)}
                    </div>
                    {index < timeline.length - 1 && <div className="w-px h-16 bg-border mt-4" />}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-medium text-accent-brand">{item.year}</span>
                      <h3 className="font-heading text-xl font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">Join the Busy Community</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Be part of a community that values quality, style, and authenticity. Follow us on social media and stay
              updated with our latest collections and stories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
