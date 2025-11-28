"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { RoomCard } from "@/components/room-card"
import { mockProjects, mockRooms } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Settings, MoreHorizontal, Calendar, Folder } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const roomTypes = [
  { value: "living-room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "office", label: "Office" },
  { value: "dining", label: "Dining Room" },
]

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: "", type: "" })

  const project = mockProjects.find((p) => p.id === projectId)
  const projectRooms = mockRooms.filter((r) => r.projectId === projectId)

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-foreground">Project not found</h1>
          <p className="text-muted-foreground mt-2">The project you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/projects">Back to Projects</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const handleAddRoom = () => {
    console.log("[v0] Adding room:", newRoom)
    setIsAddRoomOpen(false)
    setNewRoom({ name: "", type: "" })
  }

  const handleEditProject = () => {
    console.log("[v0] Edit project:", projectId)
  }

  const handleArchiveProject = () => {
    console.log("[v0] Archive project:", projectId)
  }

  const handleDeleteProject = () => {
    console.log("[v0] Delete project:", projectId)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Room</DialogTitle>
                  <DialogDescription>Add a room to this project to start designing</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-name">Room Name</Label>
                    <Input
                      id="room-name"
                      placeholder="Master Bedroom"
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-type">Room Type</Label>
                    <Select onValueChange={(value) => setNewRoom({ ...newRoom, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRoom}>Add Room</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditProject}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchiveProject}>
                  <Folder className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeleteProject} className="text-destructive">
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Folder className="w-4 h-4" />
            {projectRooms.length} rooms
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Created {new Date(project.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Updated {new Date(project.updatedAt).toLocaleDateString()}
          </span>
        </div>

        {projectRooms.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No rooms yet</h3>
            <p className="text-muted-foreground mt-1">Add your first room to start designing</p>
            <Button className="mt-4" onClick={() => setIsAddRoomOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
