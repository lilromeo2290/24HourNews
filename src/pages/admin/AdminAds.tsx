'use client'

import { useEffect, useState } from 'react'
import { useStore, type Advertisement } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const positionOptions = [
  { value: 'banner', label: 'Banner' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'in_article', label: 'In Article' },
  { value: 'footer', label: 'Footer' },
]

interface AdFormData {
  title: string
  imageUrl: string
  linkUrl: string
  position: string
  startDate: string
  endDate: string
  isActive: boolean
}

const emptyForm: AdFormData = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  position: 'banner',
  startDate: '',
  endDate: '',
  isActive: true,
}

export default function AdminAds() {
  const { ads, fetchAds, createAd, updateAd, deleteAd, isLoading } = useStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Advertisement | null>(null)
  const [form, setForm] = useState<AdFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (ad: Advertisement) => {
    setEditing(ad)
    setForm({
      title: ad.title,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl ?? '',
      position: ad.position ?? ad.type ?? 'banner',
      startDate: ad.startDate ? ad.startDate.split('T')[0] : '',
      endDate: ad.endDate ? ad.endDate.split('T')[0] : '',
      isActive: ad.isActive,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.imageUrl.trim()) {
      toast.error('Title and image URL are required')
      return
    }
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        title: form.title,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl || undefined,
        position: form.position,
        type: form.position,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        isActive: form.isActive,
      }
      if (editing) {
        await updateAd(editing.id, data)
        toast.success('Advertisement updated')
      } else {
        await createAd(data)
        toast.success('Advertisement created')
      }
      setDialogOpen(false)
      fetchAds()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save advertisement')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (ad: Advertisement) => {
    try {
      await updateAd(ad.id, { isActive: !ad.isActive })
      toast.success(ad.isActive ? 'Advertisement deactivated' : 'Advertisement activated')
      fetchAds()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteAd(deleteId)
      toast.success('Advertisement deleted')
      fetchAds()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advertisements</h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Add Ad
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px]">Title</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-center">Clicks</TableHead>
              <TableHead className="text-center">Impressions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : ads.length > 0 ? (
              ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.title}</TableCell>
                  <TableCell>
                    <div className="h-10 w-16 overflow-hidden rounded border bg-muted">
                      {ad.imageUrl && (
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="size-full object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium capitalize">
                      {ad.position ?? ad.type ?? 'banner'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={ad.isActive}
                      onCheckedChange={() => handleToggleActive(ad)}
                    />
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {ad.clickCount?.toLocaleString() ?? '0'}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {ad.impressionCount?.toLocaleString() ?? '0'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(ad)}
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(ad.id)}
                        title="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No advertisements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Advertisement' : 'Add Advertisement'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update ad details.' : 'Create a new advertisement.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ad-title">Title</Label>
              <Input
                id="ad-title"
                placeholder="Ad title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ad-image">Image URL</Label>
              <Input
                id="ad-image"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
              {form.imageUrl && (
                <div className="mt-2 overflow-hidden rounded border bg-muted">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="h-20 w-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ad-link">Link URL</Label>
              <Input
                id="ad-link"
                placeholder="https://..."
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ad-position">Position</Label>
              <Select
                value={form.position}
                onValueChange={(v) => setForm({ ...form, position: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ad-start">Start Date</Label>
                <Input
                  id="ad-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ad-end">End Date</Label>
                <Input
                  id="ad-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="ad-active"
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label htmlFor="ad-active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Advertisement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this advertisement?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}