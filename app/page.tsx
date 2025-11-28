import { MarketingLayout } from "@/components/marketing-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Sparkles, Upload, Palette, Wand2, ArrowRight, Check, Star, Zap, Shield, Clock } from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Upload Any Room",
    description: "Simply upload a photo of your room and let our AI analyze the space and layout.",
  },
  {
    icon: Palette,
    title: "Choose Your Style",
    description: "Select from dozens of curated design styles, from Modern Minimalist to Bohemian Chic.",
  },
  {
    icon: Wand2,
    title: "AI Transformation",
    description: "Watch as our AI reimagines your space with new furniture, colors, and decor.",
  },
  {
    icon: Sparkles,
    title: "Instant Results",
    description: "Get photorealistic renderings of your redesigned room in seconds, not days.",
  },
]

const stats = [
  { value: "500K+", label: "Rooms Transformed" },
  { value: "50+", label: "Design Styles" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "<30s", label: "Average Generation" },
]

const testimonials = [
  {
    quote:
      "RoomAI completely changed how I approach interior design. I can show clients exactly what their space could look like before making any purchases.",
    author: "Sarah Chen",
    role: "Interior Designer",
    avatar: "/professional-woman-portrait.png",
  },
  {
    quote:
      "I was skeptical at first, but the AI understood exactly what I wanted. Saved me thousands on hiring a designer for my apartment renovation.",
    author: "Michael Torres",
    role: "Homeowner",
    avatar: "/professional-man-portrait.png",
  },
  {
    quote:
      "The before/after comparisons are incredible. Our real estate listings with RoomAI staging sell 40% faster on average.",
    author: "Jessica Park",
    role: "Real Estate Agent",
    avatar: "/woman-realtor-portrait.jpg",
  },
]

const trustedBy = ["Architectural Digest", "HGTV", "Better Homes", "Elle Decor", "Dwell"]

export default function HomePage() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Interior Design
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight text-balance">
              Transform your space with <span className="text-primary">AI magic</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Upload a photo of any room and watch as our AI transforms it into your dream space. Explore endless design
              possibilities in seconds.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="text-base">
                <Link href="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required • 5 free generations</p>
          </div>

          <div className="mt-16 relative">
            <div className="aspect-video max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-border">
              <img
                src="/modern-living-room-ai-transformation-before-after.jpg"
                alt="RoomAI transformation example"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-lg border border-border">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background overflow-hidden">
                    <img
                      src="/avatar-person.png"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium">4.9/5 from 2,000+ reviews</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">TRUSTED BY LEADING DESIGN PUBLICATIONS</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {trustedBy.map((company) => (
              <span key={company} className="text-lg md:text-xl font-semibold text-muted-foreground/60">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">How it works</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform any room in four simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="relative p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl md:text-5xl font-bold text-primary">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">See the transformation instantly</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our advanced AI understands spatial relationships, lighting, and design principles to create
                photorealistic transformations.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Photorealistic AI-generated images",
                  "Preserve your room's architecture",
                  "50+ curated design styles",
                  "Furniture recommendations included",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8" size="lg" asChild>
                <Link href="/dashboard">Try it Now</Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/bedroom-before-after-transformation-ai-interior-de.jpg"
                  alt="Before and after transformation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Loved by designers and homeowners</h2>
            <p className="mt-4 text-lg text-muted-foreground">See what our users are saying about RoomAI</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Get your redesigned room in under 30 seconds with our optimized AI pipeline.",
              },
              {
                icon: Shield,
                title: "Privacy First",
                description: "Your photos are encrypted and automatically deleted after processing.",
              },
              {
                icon: Clock,
                title: "Always Available",
                description: "Design your space anytime, anywhere. Our AI never sleeps.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl bg-card border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">Ready to transform your space?</h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Join thousands of homeowners and designers using RoomAI to visualize their dream spaces.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" asChild className="text-base">
              <Link href="/auth/signup">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
