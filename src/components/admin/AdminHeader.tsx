'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
} from 'lucide-react'

const pageTitles: Record<string, string> = {
  'admin-dashboard': 'Dashboard',
  'admin-articles': 'Articles',
  'admin-article-create': 'Create Article',
  'admin-article-edit': 'Edit Article',
  'admin-article-preview': 'Preview Article',
  'admin-categories': 'Categories',
  'admin-users': 'Users',
  'admin-comments': 'Comments',
  'admin-media': 'Media Library',
  'admin-ads': 'Advertisements',
  'admin-settings': 'Settings',
}

export default function AdminHeader() {
  const { currentPage, navigate, user, toggleSidebar, logout } = useStore()
  const [search, setSearch] = useState('')

  const pageTitle =
    pageTitles[currentPage.type] ?? 'Admin'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 px-4 backdrop-blur-sm sm:px-6">
      {/* Hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="size-5" />
      </Button>

      {/* Page title */}
      <h1 className="hidden text-lg font-semibold sm:block">{pageTitle}</h1>

      {/* Search */}
      <div className="relative ml-auto max-w-sm flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Notification bell */}
      <Button variant="ghost" size="icon" className="relative shrink-0">
        <Bell className="size-5" />
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
      </Button>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="gap-2 px-2"
          >
            <Avatar className="size-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:inline-block">
              {user?.name}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ type: 'admin-settings' })}>
            <User className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ type: 'admin-settings' })}>
            <Settings className="mr-2 size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={logout}
            variant="destructive"
          >
            <LogOut className="mr-2 size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}