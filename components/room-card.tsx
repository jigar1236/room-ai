"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Sofa, UtensilsCrossed, Bath, Monitor, GlassWater } from "lucide-react"
import type { Room } from "@/lib/mock-data"

const roomIcons = {
  "living-room": Sofa,
  bedroom: Bed,
  kitchen: UtensilsCrossed,
  bathroom: Bath,
  office: Monitor,
  dining: GlassWater,
}

const roomLabels = {
  "living-room": "Living Room",
  bedroom: "Bedroom",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  office: "Office",
  dining: "Dining Room",
}

interface RoomCardProps {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {
  const Icon = roomIcons[room.type]

  return (
    <Link href={`/projects/${room.projectId}/rooms/${room.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={room.originalImage || "/placeholder.svg"}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {room.outputs.length} outputs
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{room.name}</h3>
              <p className="text-xs text-muted-foreground">{roomLabels[room.type]}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
