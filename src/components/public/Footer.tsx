'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Newspaper,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'

const QUICK_LINKS = [
  { label: 'Home', page: { type: 'home' as const } },
  { label: 'Politics', page: { type: 'category' as const, slug: 'politics', categoryName: 'Politics' } },
  { label: 'Business', page: { type: 'category' as const, slug: 'business', categoryName: 'Business' } },
  { label: 'Sports', page: { type: 'category' as const, slug: 'sports', categoryName: 'Sports' } },
  { label: 'Entertainment', page: { type: 'category' as const, slug: 'entertainment', categoryName: 'Entertainment' } },
  { label: 'Technology', page: { type: 'category' as const, slug: 'technology', categoryName: 'Technology' } },
]

export default function Footer() {
  const { categories, navigate, subscribeNewsletter } = useStore()
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const visibleCategories = [...categories]
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, 6)

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }
    setSubscribing(true)
    try {
      await subscribeNewsletter(email)
      toast.success('Subscribed! Thank you for joining our newsletter.')
      setEmail('')
    } catch {
      toast.error('Failed to subscribe. Please try again later.')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo & description & socials */}
          <div className="space-y-4">
            <button
              onClick={() => navigate({ type: 'home' })}
              className="inline-flex items-center gap-2 font-bold text-lg text-primary"
            >
              <Newspaper className="h-6 w-6" />
              GhanaNewsHub
            </button>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted source for the latest news, politics, business, sports, and
              entertainment from Ghana and beyond. Delivering accurate journalism 24/7.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Categories</h3>
            <ul className="space-y-2.5">
              {visibleCategories.map((cat) => (
                <li key={cat.id} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <button
                    onClick={() =>
                      navigate({
                        type: 'category',
                        slug: cat.slug,
                        categoryName: cat.name,
                      })
                    }
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Newsletter</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Get the latest news delivered straight to your inbox.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={handleSubscribe}
                disabled={subscribing}
                size="icon"
                aria-label="Subscribe"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-sm text-muted-foreground">
          <p>&copy; 2024 GhanaNewsHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button className="hover:text-foreground transition-colors">
              Privacy Policy
            </button>
            <button className="hover:text-foreground transition-colors">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}