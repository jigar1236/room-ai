"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectCard } from "@/components/project-card"
import { mockProjects, mockUser } from "@/lib/mock-data"
import Link from "next/link"
import { Plus, FolderOpen, Sparkles, TrendingUp, Clock, Zap } from "lucide-react"

const quickStats = [
  {
    label: "Total Projects",
    value: mockProjects.length.toString(),
    icon: FolderOpen,
    change: "+2 this month",
  },
  {
    label: "Rooms Designed",
    value: "14",
    icon: Sparkles,
    change: "+5 this week",
  },
  {
    label: "Credits Used",
    value: `${mockUser.totalCredits - mockUser.credits}`,
    icon: Zap,
    change: "53 remaining",
  },
  {
    label: "Time Saved",
    value: "12h",
    icon: Clock,
    change: "vs traditional design",
  },
]

export default function DashboardPage() {
  const handleCreateProject = () => {
    console.log("[v0] Create new project clicked")
  }

  const recentProjects = mockProjects.filter((p) => p.status === "active").slice(0, 3)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {mockUser.name.split(" ")[0]}</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your projects</p>
          </div>
          <Button onClick={handleCreateProject}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Projects</h2>
            <Button variant="ghost" asChild>
              <Link href="/projects">View All</Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to get you started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => console.log("[v0] Upload room photo clicked")}
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                Upload a Room Photo
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => console.log("[v0] Browse styles clicked")}
              >
                <FolderOpen className="w-4 h-4 mr-2 text-primary" />
                Browse Design Styles
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href="/settings">
                  <Zap className="w-4 h-4 mr-2 text-primary" />
                  Get More Credits
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips & Tricks</CardTitle>
              <CardDescription>Get the most out of RoomAI</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Use well-lit photos for best results",
                  "Try multiple styles on the same room",
                  "Clear photos without clutter work best",
                  "Wide-angle shots capture more of the room",
                ].map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
