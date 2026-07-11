'use client'

import { useStore, type Page } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Users,
  MessageSquare,
  Image,
  Megaphone,
  Settings,
  LogOut,
  ChevronLeft,
  Newspaper,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: React.ElementType
  page: Page
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, page: { type: 'admin-dashboard' } },
  { label: 'Articles', icon: FileText, page: { type: 'admin-articles' } },
  { label: 'Categories', icon: FolderTree, page: { type: 'admin-categories' } },
  { label: 'Users', icon: Users, page: { type: 'admin-users' } },
  { label: 'Comments', icon: MessageSquare, page: { type: 'admin-comments' } },
  { label: 'Media Library', icon: Image, page: { type: 'admin-media' } },
  { label: 'Advertisements', icon: Megaphone, page: { type: 'admin-ads' } },
  { label: 'Settings', icon: Settings, page: { type: 'admin-settings' } },
]

export default function AdminSidebar() {
  const { currentPage, navigate, user, sidebarOpen, toggleSidebar, logout } =
    useStore()

  const isActive = (pageType: string) => currentPage.type === pageType

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r bg-card transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-0 lg:w-16',
          'overflow-hidden'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <Newspaper className="size-7 shrink-0 text-primary" />
          {sidebarOpen && (
            <span className="text-lg font-bold tracking-tight">GNH Admin</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hidden lg:flex"
            onClick={toggleSidebar}
          >
            <ChevronLeft
              className={cn(
                'size-4 transition-transform',
                !sidebarOpen && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.page.type)
              return (
                <li key={item.page.type}>
                  <button
                    onClick={() => {
                      navigate(item.page)
                      // On mobile, close sidebar after navigation
                      if (window.innerWidth < 1024 && sidebarOpen) {
                        toggleSidebar()
                      }
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <Separator />

        {/* User info */}
        {user && sidebarOpen && (
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar className="size-9">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={logout}
              title="Logout"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}

        {/* Collapsed user section */}
        {user && !sidebarOpen && (
          <div className="flex justify-center py-3">
            <Avatar className="size-9">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </aside>
    </>
  )
}