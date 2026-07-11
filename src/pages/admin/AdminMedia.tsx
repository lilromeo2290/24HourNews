'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Upload, Search, Trash2, Copy, Loader2, FileIcon, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function isImageType(mimeType?: string): boolean {
  return mimeType?.startsWith('image/') ?? false
}

export default function AdminMedia() {
  const { mediaItems, fetchMedia, deleteMedia, token, isLoading } = useStore()

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [uploading, setUploading] = useState(false)

  const [previewItem, setPreviewItem] = useState<(typeof mediaItems)[0] | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = useCallback(
    (query?: string) => {
      fetchMedia(query)
    },
    [fetchMedia]
  )

  useEffect(() => {
    loadData(search)
  }, [search, loadData])

  const handleSearch = () => {
    setSearch(searchInput)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('file', files[i])
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message || `Failed to upload ${files[i].name}`)
        }
      }
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded`)
      loadData(search)
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteMedia(deleteId)
      toast.success('File deleted')
      loadData(search)
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => toast.success('URL copied to clipboard'),
      () => toast.error('Failed to copy URL')
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Media Library</h2>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            {uploading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : mediaItems.length > 0 ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
            >
              {/* Thumbnail */}
              <div
                className="aspect-square cursor-pointer bg-muted"
                onClick={() => setPreviewItem(item)}
              >
                {isImageType(item.mimeType) ? (
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 p-4">
                    <FileIcon className="size-10 text-muted-foreground" />
                    <span className="text-center text-xs text-muted-foreground">
                      {item.mimeType?.split('/')[1]?.toUpperCase() ?? 'File'}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="truncate text-sm font-medium">{item.originalName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(item.size)} · {format(new Date(item.createdAt), 'MMM d, yyyy')}
                </p>
              </div>

              {/* Actions overlay */}
              <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-8 shadow-sm"
                  onClick={() => handleCopyUrl(item.url)}
                  title="Copy URL"
                >
                  <Copy className="size-3.5" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="size-8 shadow-sm"
                  onClick={() => setDeleteId(item.id)}
                  title="Delete"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <ImageIcon className="mb-3 size-12 text-muted-foreground" />
          <p className="text-muted-foreground">No media files found.</p>
          <p className="text-sm text-muted-foreground">
            Upload files to get started.
          </p>
        </div>
      )}

      {/* Preview dialog */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.originalName}</DialogTitle>
            <DialogDescription>
              {previewItem && (
                <>
                  {formatFileSize(previewItem.size)} · {previewItem.mimeType} ·{' '}
                  {format(new Date(previewItem.createdAt), 'MMM d, yyyy')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {previewItem && isImageType(previewItem.mimeType) && (
            <div className="overflow-hidden rounded-md border">
              <img
                src={previewItem.url}
                alt={previewItem.originalName}
                className="w-full"
              />
            </div>
          )}
          {previewItem && !isImageType(previewItem.mimeType) && (
            <div className="flex items-center justify-center rounded-md border bg-muted py-12">
              <FileIcon className="size-16 text-muted-foreground" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={previewItem?.url ?? ''}
              className="flex-1 font-mono text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => previewItem && handleCopyUrl(previewItem.url)}
            >
              <Copy className="mr-2 size-3.5" />
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
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