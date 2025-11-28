export interface Project {
  id: string
  name: string
  description: string
  thumbnail: string
  roomCount: number
  createdAt: string
  updatedAt: string
  status: "active" | "archived"
}

export interface Room {
  id: string
  projectId: string
  name: string
  type: "living-room" | "bedroom" | "kitchen" | "bathroom" | "office" | "dining"
  originalImage: string
  outputs: RoomOutput[]
  createdAt: string
}

export interface RoomOutput {
  id: string
  roomId: string
  style: string
  image: string
  createdAt: string
  isFavorite: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  plan: "free" | "pro" | "enterprise"
  credits: number
  totalCredits: number
}

export interface Style {
  id: string
  name: string
  description: string
  thumbnail: string
  category: "modern" | "classic" | "minimalist" | "industrial" | "bohemian"
}

export interface FurnitureItem {
  id: string
  name: string
  category: string
  thumbnail: string
  price: string
}

export const mockUser: User = {
  id: "user-1",
  name: "Alex Johnson",
  email: "alex@example.com",
  avatar: "/professional-avatar.png",
  plan: "pro",
  credits: 47,
  totalCredits: 100,
}

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "Modern Apartment Redesign",
    description: "Complete renovation concept for downtown apartment",
    thumbnail: "/modern-apartment-living-room.png",
    roomCount: 4,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    status: "active",
  },
  {
    id: "proj-2",
    name: "Beach House Makeover",
    description: "Coastal-inspired design for vacation home",
    thumbnail: "/beach-house-interior.png",
    roomCount: 6,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
    status: "active",
  },
  {
    id: "proj-3",
    name: "Home Office Setup",
    description: "Productive workspace design",
    thumbnail: "/modern-home-office.png",
    roomCount: 1,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-12",
    status: "active",
  },
  {
    id: "proj-4",
    name: "Vintage Loft Conversion",
    description: "Industrial meets cozy design concept",
    thumbnail: "/industrial-loft-interior.jpg",
    roomCount: 3,
    createdAt: "2023-12-20",
    updatedAt: "2024-01-08",
    status: "archived",
  },
]

export const mockRooms: Room[] = [
  {
    id: "room-1",
    projectId: "proj-1",
    name: "Living Room",
    type: "living-room",
    originalImage: "/empty-living-room-before-renovation.jpg",
    outputs: [
      {
        id: "output-1",
        roomId: "room-1",
        style: "Modern Minimalist",
        image: "/modern-minimalist-living-room.jpg",
        createdAt: "2024-01-20",
        isFavorite: true,
      },
      {
        id: "output-2",
        roomId: "room-1",
        style: "Scandinavian",
        image: "/scandinavian-living-room.png",
        createdAt: "2024-01-19",
        isFavorite: false,
      },
    ],
    createdAt: "2024-01-15",
  },
  {
    id: "room-2",
    projectId: "proj-1",
    name: "Master Bedroom",
    type: "bedroom",
    originalImage: "/empty-bedroom-before-renovation.jpg",
    outputs: [
      {
        id: "output-3",
        roomId: "room-2",
        style: "Cozy Modern",
        image: "/cozy-modern-bedroom.jpg",
        createdAt: "2024-01-18",
        isFavorite: true,
      },
    ],
    createdAt: "2024-01-16",
  },
  {
    id: "room-3",
    projectId: "proj-1",
    name: "Kitchen",
    type: "kitchen",
    originalImage: "/empty-kitchen-before-renovation.jpg",
    outputs: [],
    createdAt: "2024-01-17",
  },
  {
    id: "room-4",
    projectId: "proj-1",
    name: "Home Office",
    type: "office",
    originalImage: "/empty-office-room.jpg",
    outputs: [
      {
        id: "output-4",
        roomId: "room-4",
        style: "Industrial",
        image: "/industrial-home-office.jpg",
        createdAt: "2024-01-20",
        isFavorite: false,
      },
    ],
    createdAt: "2024-01-18",
  },
]

export const mockStyles: Style[] = [
  {
    id: "style-1",
    name: "Modern Minimalist",
    description: "Clean lines, neutral colors, and functional simplicity",
    thumbnail: "/modern-minimalist-interior.png",
    category: "minimalist",
  },
  {
    id: "style-2",
    name: "Scandinavian",
    description: "Light woods, cozy textures, and natural light",
    thumbnail: "/scandinavian-interior.png",
    category: "modern",
  },
  {
    id: "style-3",
    name: "Industrial",
    description: "Exposed brick, metal accents, and urban edge",
    thumbnail: "/industrial-interior.png",
    category: "industrial",
  },
  {
    id: "style-4",
    name: "Bohemian",
    description: "Eclectic patterns, rich colors, and global influences",
    thumbnail: "/bohemian-interior.png",
    category: "bohemian",
  },
  {
    id: "style-5",
    name: "Mid-Century Modern",
    description: "Retro charm with organic curves and bold colors",
    thumbnail: "/mid-century-modern-living-room.png",
    category: "classic",
  },
  {
    id: "style-6",
    name: "Coastal",
    description: "Beach-inspired blues, whites, and natural textures",
    thumbnail: "/coastal-interior-design.jpg",
    category: "modern",
  },
  {
    id: "style-7",
    name: "Traditional",
    description: "Timeless elegance with rich fabrics and classic patterns",
    thumbnail: "/traditional-interior.png",
    category: "classic",
  },
  {
    id: "style-8",
    name: "Japanese Zen",
    description: "Peaceful minimalism with natural materials",
    thumbnail: "/japanese-zen-interior.jpg",
    category: "minimalist",
  },
]

export const mockFurniture: FurnitureItem[] = [
  {
    id: "furn-1",
    name: "Modern Sofa",
    category: "Seating",
    thumbnail: "/modern-sofa.png",
    price: "$1,299",
  },
  {
    id: "furn-2",
    name: "Coffee Table",
    category: "Tables",
    thumbnail: "/modern-coffee-table.png",
    price: "$449",
  },
  {
    id: "furn-3",
    name: "Floor Lamp",
    category: "Lighting",
    thumbnail: "/modern-floor-lamp.png",
    price: "$199",
  },
  {
    id: "furn-4",
    name: "Bookshelf",
    category: "Storage",
    thumbnail: "/modern-bookshelf.png",
    price: "$599",
  },
  {
    id: "furn-5",
    name: "Accent Chair",
    category: "Seating",
    thumbnail: "/stylish-accent-chair.png",
    price: "$699",
  },
  {
    id: "furn-6",
    name: "Area Rug",
    category: "Decor",
    thumbnail: "/modern-area-rug.png",
    price: "$349",
  },
]

export const mockAdminUsers = [
  {
    id: "admin-user-1",
    name: "John Smith",
    email: "john@example.com",
    plan: "pro",
    credits: 85,
    projects: 12,
    joinedAt: "2023-11-15",
    status: "active",
  },
  {
    id: "admin-user-2",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    plan: "enterprise",
    credits: 450,
    projects: 34,
    joinedAt: "2023-10-20",
    status: "active",
  },
  {
    id: "admin-user-3",
    name: "Mike Chen",
    email: "mike@example.com",
    plan: "free",
    credits: 3,
    projects: 2,
    joinedAt: "2024-01-10",
    status: "active",
  },
  {
    id: "admin-user-4",
    name: "Emily Brown",
    email: "emily@example.com",
    plan: "pro",
    credits: 0,
    projects: 8,
    joinedAt: "2023-12-05",
    status: "suspended",
  },
]

export const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out RoomAI",
    features: ["5 room generations per month", "3 design styles", "Standard quality output", "Community support"],
    limitations: ["No commercial use", "Watermarked outputs"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For serious home designers",
    features: [
      "100 room generations per month",
      "All design styles",
      "HD quality output",
      "Priority support",
      "Commercial use license",
      "No watermarks",
      "Furniture recommendations",
    ],
    limitations: [],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For teams and agencies",
    features: [
      "Unlimited generations",
      "All design styles + custom styles",
      "4K quality output",
      "Dedicated support",
      "API access",
      "Team collaboration",
      "White-label options",
      "Advanced analytics",
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
  },
]
