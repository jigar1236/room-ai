"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Mail,
  MessageCircle,
  Book,
  Video,
  Zap,
  Upload,
  Palette,
  Download,
} from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "How do I generate my first design?",
    answer:
      "Simply go to the Dashboard, upload a photo of your room, select a design style, and click Generate. Our AI will create 4 unique design variations for you in about 30 seconds.",
  },
  {
    question: "What image formats are supported?",
    answer:
      "We support JPEG, PNG, and WebP image formats. For best results, use well-lit photos with a resolution of at least 512x512 pixels. Maximum file size is 10MB.",
  },
  {
    question: "How many credits does each generation cost?",
    answer:
      "Each design generation uses 1 credit and produces 4 design variations. Free users get 5 credits per month, while Pro users get 100 credits.",
  },
  {
    question: "Can I download my generated designs?",
    answer:
      "Yes! You can download any generated design in both PNG and JPG formats. Simply hover over a design and click the download button.",
  },
  {
    question: "What design styles are available?",
    answer:
      "We offer 12+ design styles including Modern Minimalist, Scandinavian, Industrial, Bohemian, Japanese Zen, Coastal, and many more. Each style is carefully curated to provide authentic design aesthetics.",
  },
  {
    question: "How do I get more credits?",
    answer:
      "You can upgrade to our Pro plan for 100 monthly credits, or purchase additional credit packs. Visit the Pricing page to see all options.",
  },
];

const guides = [
  {
    icon: Upload,
    title: "Uploading Photos",
    description: "Learn how to take and upload the perfect room photo",
  },
  {
    icon: Palette,
    title: "Choosing Styles",
    description: "Explore our design styles and find your perfect match",
  },
  {
    icon: Zap,
    title: "AI Generation",
    description: "Understand how our AI transforms your space",
  },
  {
    icon: Download,
    title: "Downloading Designs",
    description: "Save and share your generated designs",
  },
];

export default function HelpPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            Help Center
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Find answers to common questions and learn how to get the most out
            of RoomAI
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
          <Card className="glass glass-hover cursor-pointer">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Contact Support</CardTitle>
              <CardDescription>
                Get help from our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/contact">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass glass-hover cursor-pointer">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Book className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Documentation</CardTitle>
              <CardDescription>
                Detailed guides and tutorials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Video className="w-4 h-4 mr-2" />
                View Guides
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Guides */}
        <Card className="glass animate-fade-in">
          <CardHeader>
            <CardTitle>Quick Start Guides</CardTitle>
            <CardDescription>
              Learn the basics in just a few minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {guides.map((guide, index) => (
                <div
                  key={guide.title}
                  className={`flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer animate-fade-in stagger-${index + 1}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <guide.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {guide.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="glass animate-fade-in">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Still Need Help */}
        <Card className="glass gradient-border animate-fade-in">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="font-display text-xl font-semibold">
                Still need help?
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Our support team is here to help. Send us a message and we'll
                get back to you within 24 hours.
              </p>
              <Button asChild className="btn-shine">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

