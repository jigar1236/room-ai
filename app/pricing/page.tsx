"use client"

import { MarketingLayout } from "@/components/marketing-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Check, X, Sparkles, HelpCircle } from "lucide-react"
import { pricingPlans } from "@/lib/mock-data"

const faqs = [
  {
    question: "How do credits work?",
    answer:
      "Each room transformation uses 1 credit. Credits refresh monthly based on your plan. Unused credits do not roll over.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the start of your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! The Free plan gives you 5 generations per month to try RoomAI. Pro plans also include a 7-day free trial.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time, and you'll continue to have access until the end of your billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund.",
  },
]

export default function PricingPage() {
  const handleSelectPlan = (planName: string) => {
    console.log("[v0] Plan selected:", planName)
  }

  return (
    <MarketingLayout>
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Simple Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Choose the perfect plan for your design needs
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free and scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-start gap-2 text-muted-foreground">
                        <X className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan.name)}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include a 14-day money-back guarantee.{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact us
              </Link>{" "}
              for custom enterprise pricing.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
            <p className="mt-4 text-muted-foreground">Everything you need to know about our pricing</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq) => (
              <div key={faq.question} className="space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  {faq.question}
                </h3>
                <p className="text-sm text-muted-foreground pl-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold">Need a custom solution?</h2>
              <p className="mt-4 text-primary-foreground/80">
                For large teams, agencies, or specific requirements, we offer custom enterprise plans with dedicated
                support and flexible terms.
              </p>
              <Button variant="secondary" size="lg" className="mt-8" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  )
}
