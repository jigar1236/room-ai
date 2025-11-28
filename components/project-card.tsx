"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Folder, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Project } from "@/lib/mock-data"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const handleEdit = () => {
    console.log("[v0] Edit project:", project.id)
  }

  const handleArchive = () => {
    console.log("[v0] Archive project:", project.id)
  }

  const handleDelete = () => {
    console.log("[v0] Delete project:", project.id)
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/projects/${project.id}`}>
        <div className="relative aspect-video overflow-hidden">
          <img
            src={project.thumbnail || "/placeholder.svg"}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {project.status === "archived" && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary">Archived</Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projects/${project.id}`}>
            <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
              {project.name}
            </h3>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive}>Archive</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Folder className="w-3.5 h-3.5" />
          {project.roomCount} rooms
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(project.updatedAt).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  )
}
