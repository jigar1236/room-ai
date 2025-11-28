import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Sparkles,
  Target,
  Heart,
  Users,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

const team = [
  {
    name: "Emma Chen",
    role: "CEO & Co-founder",
    bio: "Former lead designer at Airbnb, passionate about democratizing design.",
    image: "/placeholder.svg?key=d6rk7",
  },
  {
    name: "Marcus Williams",
    role: "CTO & Co-founder",
    bio: "AI researcher from MIT, building the future of generative design.",
    image: "/placeholder.svg?key=8lmfc",
  },
  {
    name: "Sofia Rodriguez",
    role: "Head of Design",
    bio: "Award-winning interior designer bringing expertise to AI training.",
    image: "/placeholder.svg?key=0r6k7",
  },
  {
    name: "David Park",
    role: "Head of Engineering",
    bio: "Previously built ML infrastructure at Google, scaling AI systems.",
    image: "/placeholder.svg?key=t4ksy",
  },
];

const values = [
  {
    icon: Target,
    title: "Design for Everyone",
    description:
      "We believe great interior design should be accessible to everyone, not just those who can afford professional designers.",
  },
  {
    icon: Heart,
    title: "Quality First",
    description:
      "Every feature we build is crafted with care. We never compromise on the quality of our AI outputs.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Driven",
    description:
      "We're constantly pushing the boundaries of what's possible with AI and design technology.",
  },
  {
    icon: Users,
    title: "Community Focused",
    description:
      "Our users are at the heart of everything we do. We build features based on real feedback.",
  },
];

const milestones = [
  { year: "2022", event: "RoomAI founded in San Francisco" },
  { year: "2023", event: "Launched beta with 10,000 users" },
  { year: "2023", event: "Raised $12M Series A" },
  { year: "2024", event: "Reached 500,000 rooms transformed" },
  { year: "2024", event: "Launched enterprise features" },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                Our Story
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                Reimagining interior design with AI
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                RoomAI was born from a simple frustration: why is it so hard to
                visualize what a room could look like with different furniture
                or styles? We set out to make professional interior design
                visualization accessible to everyone.
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                Today, we&apos;re proud to have helped over 500,000 people transform
                their spaces, from first-time homeowners to professional
                interior designers and real estate agents.
              </p>
              <Button className="mt-8" size="lg" asChild>
                <Link href="/auth/signup">
                  Join Our Community
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/placeholder.svg?key=nxr7x"
                  alt="RoomAI team"
                  className="w-full h-full object-cover"
                  width={100}
                  height={100}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Meet the Team
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The passionate people behind RoomAI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    width={100}
                    height={100}
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm text-primary font-medium">
                  {member.role}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Our Journey
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Key milestones in our story
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`flex-1 ${
                      index % 2 === 0 ? "text-right" : "text-left"
                    }`}
                  >
                    <div className="inline-block p-4 rounded-xl bg-card border border-border">
                      <p className="text-sm font-bold text-primary">
                        {milestone.year}
                      </p>
                      <p className="text-foreground mt-1">{milestone.event}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-primary relative z-10" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Join us in shaping the future of design
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We&apos;re always looking for talented people who share our passion for
            design and technology.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/contact">
                View Open Positions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
