"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockUser, pricingPlans } from "@/lib/mock-data"
import { User, CreditCard, Bell, Shield, Zap, Check, Upload, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: mockUser.name,
    email: mockUser.email,
  })

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    projectComplete: true,
    marketing: false,
    weeklyDigest: true,
  })

  const handleSaveProfile = () => {
    console.log("[v0] Saving profile:", profile)
  }

  const handleUploadAvatar = () => {
    console.log("[v0] Upload avatar clicked")
  }

  const handleDeleteAccount = () => {
    console.log("[v0] Delete account clicked")
  }

  const handleUpgradePlan = (plan: string) => {
    console.log("[v0] Upgrade to plan:", plan)
  }

  const handleManageBilling = () => {
    console.log("[v0] Manage billing clicked")
  }

  const currentPlan = pricingPlans.find((p) => p.name.toLowerCase() === mockUser.plan)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                    <AvatarFallback className="text-2xl">
                      {mockUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" onClick={handleUploadAvatar}>
                      <Upload className="w-4 h-4 mr-2" />
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Permanently delete your account and all data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. All your projects, rooms, and generated designs
                  will be permanently deleted.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>You are currently on the {currentPlan?.name} plan</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-base px-4 py-1">
                    {currentPlan?.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold">{currentPlan?.price}</span>
                  <span className="text-muted-foreground">/{currentPlan?.period}</span>
                </div>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Credits Used</span>
                    <span className="text-sm font-bold">
                      {mockUser.totalCredits - mockUser.credits}/{mockUser.totalCredits}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${((mockUser.totalCredits - mockUser.credits) / mockUser.totalCredits) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{mockUser.credits} credits remaining this month</p>
                </div>
                <ul className="space-y-2">
                  {currentPlan?.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex gap-4">
                <Button variant="outline" onClick={handleManageBilling}>
                  Manage Billing
                </Button>
                <Button onClick={() => handleUpgradePlan("enterprise")}>
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Manage your payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                  </div>
                  <Badge>Default</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Add Payment Method</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your past invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: "Jan 1, 2024", amount: "$29.00", status: "Paid" },
                    { date: "Dec 1, 2023", amount: "$29.00", status: "Paid" },
                    { date: "Nov 1, 2023", amount: "$29.00", status: "Paid" },
                  ].map((invoice, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium">{invoice.date}</p>
                        <p className="text-sm text-muted-foreground">Pro Plan - Monthly</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{invoice.amount}</p>
                        <Badge variant="secondary" className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what emails you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    id: "emailUpdates",
                    label: "Product Updates",
                    description: "News about new features and improvements",
                  },
                  {
                    id: "projectComplete",
                    label: "Project Notifications",
                    description: "Get notified when generations complete",
                  },
                  {
                    id: "weeklyDigest",
                    label: "Weekly Digest",
                    description: "A summary of your activity each week",
                  },
                  {
                    id: "marketing",
                    label: "Marketing Emails",
                    description: "Tips, offers, and promotional content",
                  },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.id as keyof typeof notifications]}
                      onCheckedChange={(checked) => {
                        console.log(`[v0] ${item.id} toggled:`, checked)
                        setNotifications({
                          ...notifications,
                          [item.id]: checked,
                        })
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => console.log("[v0] Update password clicked")}>Update Password</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">Two-factor authentication is currently disabled</p>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => console.log("[v0] Enable 2FA clicked")}>
                  Enable 2FA
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage your active sessions across devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    device: "MacBook Pro",
                    location: "San Francisco, CA",
                    current: true,
                  },
                  {
                    device: "iPhone 15",
                    location: "San Francisco, CA",
                    current: false,
                  },
                ].map((session, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {session.device}
                        {session.current && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{session.location}</p>
                    </div>
                    {!session.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => console.log("[v0] Revoke session:", session.device)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
