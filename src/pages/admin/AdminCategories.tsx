'use client'

import { useEffect, useState } from 'react'
import { useStore, type Category } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'

interface CategoryFormData {
  name: string
  slug: string
  description: string
  color: string
  icon: string
  order: number
  isVisible: boolean
  isFeatured: boolean
}

const emptyForm: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  color: '#dc2626',
  icon: '',
  order: 0,
  isVisible: true,
  isFeatured: false,
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminCategories() {
  const {
    adminCategories,
    fetchAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    isLoading,
  } = useStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchAdminCategories()
  }, [fetchAdminCategories])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      color: cat.color,
      icon: '',
      order: cat.order ?? 0,
      isVisible: true,
      isFeatured: false,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        description: form.description,
        color: form.color,
        order: form.order,
      }
      if (editing) {
        await updateCategory(editing.id, data)
        toast.success('Category updated')
      } else {
        await createCategory(data)
        toast.success('Category created')
      }
      setDialogOpen(false)
      fetchAdminCategories()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteCategory(deleteId)
      toast.success('Category deleted')
      fetchAdminCategories()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const cats = [...adminCategories]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= cats.length) return
    ;[cats[index], cats[targetIndex]] = [cats[targetIndex], cats[index]]
    const reordered = cats.map((c, i) => ({ id: c.id, order: i + 1 }))
    reorderCategories(reordered)
    toast.success('Categories reordered')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Add Category
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : adminCategories.length > 0 ? (
              adminCategories.map((cat, index) => (
                <TableRow key={cat.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-5 rounded border"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs text-muted-foreground">{cat.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === adminCategories.length - 1}
                        onClick={() => handleMove(index, 'down')}
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <span className="text-sm tabular-nums">{cat.order ?? index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell>{cat.articleCount ?? 0}</TableCell>
                  <TableCell>
                    <span className="inline-block size-2.5 rounded-full bg-green-500" title="Visible" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(cat.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No categories found.
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
            <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update category details.' : 'Create a new category.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                placeholder="Category name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: form.slug || generateSlug(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                placeholder="category-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                placeholder="Brief description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat-color">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="cat-color"
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="h-9 w-12 cursor-pointer rounded border"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-icon">Icon</Label>
                <Input
                  id="cat-icon"
                  placeholder="Icon name..."
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat-order">Order</Label>
                <Input
                  id="cat-order"
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-end gap-6 pb-1">
                <div className="flex items-center gap-2">
                  <Switch
                    id="cat-visible"
                    checked={form.isVisible}
                    onCheckedChange={(v) => setForm({ ...form, isVisible: v })}
                  />
                  <Label htmlFor="cat-visible" className="text-sm">
                    Visible
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="cat-featured"
                    checked={form.isFeatured}
                    onCheckedChange={(v) => setForm({ ...form, isFeatured: v })}
                  />
                  <Label htmlFor="cat-featured" className="text-sm">
                    Featured
                  </Label>
                </div>
              </div>
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
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will also affect articles using this category.
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