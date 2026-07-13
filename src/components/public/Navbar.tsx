'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Search,
  Menu,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from 'next-themes'

export default function Navbar() {
  const { categories, navigate } = useStore()
  const { theme, setTheme } = useTheme()

  const sortedCategories = [...categories].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => navigate({ type: 'home' })}
          className="flex items-center gap-2"
        >
          <img
            src="/logo.jpg"
            alt="24Hour News"
            className="logo-img rounded"
          />
          <span className="hidden sm:inline text-lg font-bold" style={{ color: '#003050' }}>
            24Hour News
          </span>
        </button>

        {/* Desktop category nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {sortedCategories.filter(c => c.slug !== 'technology' && c.slug !== 'general-news').slice(0, 8).map((cat) => (
            <Button
              key={cat.id}
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-foreground/80 hover:text-primary"
              onClick={() =>
                navigate({
                  type: 'category',
                  slug: cat.slug,
                  categoryName: cat.name,
                })
              }
            >
              {cat.name}
            </Button>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ type: 'search' })}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>



          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle className="flex items-center gap-2">
                  <img
                    src="/logo.jpg"
                    alt="24Hour News"
                    className="logo-img-sm rounded"
                  />
                  <span style={{ color: '#003050' }}>24Hour News</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-4 gap-1">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => navigate({ type: 'home' })}
                >
                  Home
                </Button>
                {sortedCategories.filter(c => c.slug !== 'technology' && c.slug !== 'general-news').map((cat) => (
                  <Button
                    key={cat.id}
                    variant="ghost"
                    className="justify-start"
                    onClick={() =>
                      navigate({
                        type: 'category',
                        slug: cat.slug,
                        categoryName: cat.name,
                      })
                    }
                  >
                    <span
                      className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </Button>
                ))}
                <div className="my-2 border-t" />
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => navigate({ type: 'search' })}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>

              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}