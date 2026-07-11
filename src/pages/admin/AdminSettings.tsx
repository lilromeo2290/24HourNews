'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

const STORAGE_KEY = 'gnh-admin-settings'

interface SiteSettings {
  siteName: string
  siteDescription: string
}

const defaultSettings: SiteSettings = {
  siteName: 'GNH News',
  siteDescription: 'Your trusted source for breaking news and in-depth analysis.',
}

function loadSettings(): SiteSettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) }
    }
  } catch {
    // ignore parse errors
  }
  return defaultSettings
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
    setLoaded(true)
  }, [])

  const handleSave = async () => {
    if (!settings.siteName.trim()) {
      toast.error('Site name is required')
      return
    }
    setSaving(true)
    // Simulate a brief async save
    await new Promise((r) => setTimeout(r, 500))
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      toast.success('Settings saved successfully!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return null

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <Separator />

      <div className="max-w-xl space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="site-name">Site Name</Label>
          <Input
            id="site-name"
            placeholder="My News Portal"
            value={settings.siteName}
            onChange={(e) =>
              setSettings({ ...settings, siteName: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="site-desc">Site Description</Label>
          <Textarea
            id="site-desc"
            placeholder="A brief description of your news portal..."
            value={settings.siteDescription}
            onChange={(e) =>
              setSettings({ ...settings, siteDescription: e.target.value })
            }
            rows={4}
          />
        </div>

        <Separator />

        <div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}