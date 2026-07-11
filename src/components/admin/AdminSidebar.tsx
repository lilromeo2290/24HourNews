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
          'fixed left-0 top-0 z-50 flex h-full flex-col transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-0 lg:w-16',
          'overflow-hidden'
        )}
        style={{ backgroundColor: '#003050' }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <img
                src="/logo.jpg"
                alt="24HN Admin"
                className="h-8 w-8 rounded object-cover"
              />
              <span className="text-lg font-bold text-white tracking-tight">24HN Admin</span>
            </div>
          ) : (
            <img
              src="/logo.jpg"
              alt="GNH"
              className="h-8 w-8 rounded object-cover"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hidden lg:flex text-white/60 hover:text-white hover:bg-white/10"
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
        <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
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
                        ? 'bg-white/15 text-white'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
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

        <Separator className="bg-white/10" />

        {/* User info */}
        {user && sidebarOpen && (
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar className="size-9">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs" style={{ backgroundColor: '#f08010', color: '#fff' }}>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-white/50 capitalize">
                {user.role}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-white/50 hover:text-red-400 hover:bg-white/10"
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
              <AvatarFallback className="text-xs" style={{ backgroundColor: '#f08010', color: '#fff' }}>
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