'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Quote,
  Code,
  Undo2,
  Redo2,
  Upload,
  Eye,
  Loader2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Toolbar button for the rich text editor (must be outside any component)
// ---------------------------------------------------------------------------
function ToolbarButton({
  onClick,
  title,
  children,
  active,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded p-1.5 text-sm transition-colors hover:bg-accent ${
        active ? 'bg-accent text-primary' : 'text-muted-foreground'
      }`}
    >
      {children}
    </button>
  )
}

// Rich text editor component
// ---------------------------------------------------------------------------
function RichTextEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    if (editorRef.current && !editorRef.current.hasAttribute('data-initialized')) {
      editorRef.current.innerHTML = value
      editorRef.current.setAttribute('data-initialized', 'true')
    }
  }, []) // only on mount

  const handleInput = () => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    onChange(html)
    const text = editorRef.current.innerText || ''
    setWordCount(
      text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    )
  }

  const execCmd = (command: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, val)
    handleInput()
  }

  const [linkUrl, setLinkUrl] = useState('')
  const [linkOpen, setLinkOpen] = useState(false)

  const insertLink = () => {
    if (linkUrl) {
      execCmd('createLink', linkUrl)
      setLinkUrl('')
      setLinkOpen(false)
    }
  }

  const [imageUrl, setImageUrl] = useState('')
  const [imageOpen, setImageOpen] = useState(false)

  const insertImage = () => {
    if (imageUrl) {
      execCmd('insertImage', imageUrl)
      setImageUrl('')
      setImageOpen(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/30 p-1.5">
        <ToolbarButton onClick={() => execCmd('bold')} title="Bold">
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd('italic')} title="Italic">
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd('underline')} title="Underline">
          <Underline className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton onClick={() => execCmd('formatBlock', 'h1')} title="Heading 1">
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd('formatBlock', 'h2')} title="Heading 2">
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd('formatBlock', 'h3')} title="Heading 3">
          <Heading3 className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton onClick={() => execCmd('insertUnorderedList')} title="Bullet List">
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd('insertOrderedList')} title="Numbered List">
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <ToolbarButton onClick={() => setLinkOpen(true)} title="Insert Link">
              <Link2 className="size-4" />
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverContent className="w-72" side="bottom">
            <div className="space-y-2">
              <p className="text-sm font-medium">Insert Link</p>
              <Input
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && insertLink()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setLinkOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={insertLink}>
                  Insert
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={imageOpen} onOpenChange={setImageOpen}>
          <PopoverTrigger asChild>
            <ToolbarButton onClick={() => setImageOpen(true)} title="Insert Image">
              <ImageIcon className="size-4" />
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverContent className="w-72" side="bottom">
            <div className="space-y-2">
              <p className="text-sm font-medium">Insert Image</p>
              <Input
                placeholder="Image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && insertImage()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setImageOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={insertImage}>
                  Insert
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton onClick={() => execCmd('formatBlock', 'blockquote')} title="Blockquote">
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd('formatBlock', 'pre')} title="Code Block">
          <Code className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton onClick={() => execCmd('undo')} title="Undo">
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd('redo')} title="Redo">
          <Redo2 className="size-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="prose-editor min-h-[300px] cursor-text rounded-md border p-4 focus:outline-none focus:ring-2 focus:ring-primary"
        style={{ whiteSpace: 'pre-wrap' }}
      />

      <p className="text-right text-xs text-muted-foreground">
        {wordCount} word{wordCount !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Article Editor page
// ---------------------------------------------------------------------------

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminArticleEditor() {
  const {
    currentPage,
    currentArticle,
    categories,
    adminUsers,
    token,
    createArticle,
    updateArticle,
    publishArticle,
    fetchArticleById,
    fetchCategories,
    fetchAdminUsers,
    navigate,
    isLoading,
  } = useStore()

  const isEditing = currentPage.type === 'admin-article-edit'
  const editId = isEditing ? (currentPage as { type: 'admin-article-edit'; id: string }).id : null

  // Form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [authorId, setAuthorId] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isBreaking, setIsBreaking] = useState(false)

  // UI state
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Tags
  const [allTags, setAllTags] = useState<{ id: string; name: string; slug: string }[]>([])
  const [tagsOpen, setTagsOpen] = useState(false)

  // Load existing article
  useEffect(() => {
    if (isEditing && editId) {
      fetchArticleById(editId)
    }
  }, [isEditing, editId, fetchArticleById])

  useEffect(() => {
    if (isEditing && currentArticle) {
      setTitle(currentArticle.title)
      setSlug(currentArticle.slug)
      setSlugEdited(true)
      setExcerpt(currentArticle.excerpt ?? '')
      setContent(currentArticle.content)
      setFeaturedImage(currentArticle.featuredImage ?? '')
      setCategoryId(currentArticle.categoryId)
      setSelectedTagIds(currentArticle.tags?.map((t) => t.id) ?? [])
      setAuthorId(currentArticle.authorId)
      setIsFeatured(currentArticle.isFeatured)
      setIsPinned(currentArticle.isPinned)
      setIsBreaking(currentArticle.isBreaking)
    }
  }, [isEditing, currentArticle])

  // Load categories & users
  useEffect(() => {
    fetchCategories()
    fetchAdminUsers()
  }, [fetchCategories, fetchAdminUsers])

  // Load tags from API
  useEffect(() => {
    const loadTags = async () => {
      try {
        const res = await fetch('/api/tags')
        if (res.ok) {
          const data = await res.json()
          setAllTags(Array.isArray(data) ? data : data.tags ?? data.data ?? [])
        }
      } catch {
        // Tags endpoint may not exist, that's fine
      }
    }
    loadTags()
  }, [])

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slugEdited) {
      setSlug(generateSlug(val))
    }
  }

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Upload failed')
      }
      const data = await res.json()
      setFeaturedImage(data.url ?? data.data?.url ?? '')
      toast.success('Image uploaded successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Build article data
  const buildData = () => ({
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    categoryId,
    tagIds: selectedTagIds,
    authorId,
    seoTitle,
    seoDescription,
    scheduledAt: scheduledAt || undefined,
    isFeatured,
    isPinned,
    isBreaking,
  })

  // Save draft
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      if (isEditing && editId) {
        await updateArticle(editId, { ...buildData(), status: 'draft' })
      } else {
        await createArticle({ ...buildData(), status: 'draft' })
      }
      toast.success('Draft saved')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  // Submit for review
  const handleSubmitForReview = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      if (isEditing && editId) {
        await updateArticle(editId, { ...buildData(), status: 'pending' })
      } else {
        await createArticle({ ...buildData(), status: 'pending' })
      }
      toast.success('Article submitted for review')
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit')
    } finally {
      setSaving(false)
    }
  }

  // Publish — with all the critical requirements
  const handlePublish = async () => {
    // 1. Validate required fields
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!content.trim() || content === '<br>') {
      toast.error('Content is required')
      return
    }
    if (!categoryId) {
      toast.error('Please select a category')
      return
    }

    setPublishing(true)
    try {
      const data = buildData()

      if (isEditing && editId) {
        // 3. Editing: update then publish if not already published
        await updateArticle(editId, { ...data, status: 'published' })
        if (currentArticle?.status !== 'published') {
          await publishArticle(editId)
        }
      } else {
        // 2. Creating: create then publish
        const article = await createArticle({ ...data, status: 'published' })
        await publishArticle(article.id)
      }

      // 5. Show success notification
      toast.success('Article published successfully!')
      // 7. Navigate back to article list
      navigate({ type: 'admin-articles' })
    } catch (err: any) {
      // 6. On error: show error message from API
      toast.error(err.message || 'Failed to publish article')
    } finally {
      setPublishing(false)
    }
  }

  // Preview
  const handlePreview = () => {
    if (isEditing && editId) {
      navigate({ type: 'admin-article-preview', id: editId })
    }
  }

  // Loading state for editing
  if (isEditing && isLoading && !currentArticle) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Edit Article' : 'Create Article'}
        </h2>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="mr-2 size-4" />
              Preview
            </Button>
          )}
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Save Draft
          </Button>
          <Button
            variant="outline"
            onClick={handleSubmitForReview}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Submit for Review
          </Button>
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content area */}
        <div className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter article title..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <div className="flex items-center gap-2">
              <Input
                id="slug"
                placeholder="article-url-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugEdited(true)
                }}
                className="flex-1"
              />
              {!slugEdited && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSlugEdited(true)
                    setSlug(generateSlug(title))
                  }}
                  className="shrink-0"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              placeholder="Write a short excerpt..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Rich text editor */}
          <div className="space-y-1.5">
            <Label>Content</Label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Featured Image */}
          <div className="space-y-3 rounded-lg border p-4">
            <Label>Featured Image</Label>
            {featuredImage && (
              <div className="relative aspect-video overflow-hidden rounded-md border bg-muted">
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="size-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 size-7"
                  onClick={() => setFeaturedImage('')}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <Input
                placeholder="Image URL..."
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}
                {uploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5 rounded-lg border p-4">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-1.5 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Label>Tags</Label>
              <Dialog open={tagsOpen} onOpenChange={setTagsOpen}>
                <Button variant="ghost" size="sm" onClick={() => setTagsOpen(true)}>
                  {allTags.length > 0 ? 'Select' : 'Manage'}
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Tags</DialogTitle>
                    <DialogDescription>
                      Choose tags for this article.
                    </DialogDescription>
                  </DialogHeader>
                  {allTags.length > 0 ? (
                    <div className="max-h-60 space-y-2 overflow-y-auto">
                      {allTags.map((tag) => (
                        <label
                          key={tag.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-accent"
                        >
                          <Checkbox
                            checked={selectedTagIds.includes(tag.id)}
                            onCheckedChange={() => toggleTag(tag.id)}
                          />
                          <span className="text-sm">{tag.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-muted-foreground">
                      No tags available. Create tags via the API.
                    </p>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setTagsOpen(false)}>
                      Done
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {selectedTagIds.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedTagIds.map((id) => {
                  const tag = allTags.find((t) => t.id === id)
                  return tag ? (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs"
                    >
                      {tag.name}
                      <button
                        onClick={() => toggleTag(id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ) : null
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No tags selected</p>
            )}
          </div>

          {/* Author */}
          <div className="space-y-1.5 rounded-lg border p-4">
            <Label>Author</Label>
            <Select value={authorId} onValueChange={setAuthorId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select author" />
              </SelectTrigger>
              <SelectContent>
                {adminUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SEO */}
          <div className="space-y-3 rounded-lg border p-4">
            <Label className="font-semibold">SEO</Label>
            <div className="space-y-1.5">
              <Label htmlFor="seo-title" className="text-xs text-muted-foreground">
                SEO Title
              </Label>
              <Input
                id="seo-title"
                placeholder="Meta title..."
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="seo-desc"
                className="text-xs text-muted-foreground"
              >
                SEO Description
              </Label>
              <Textarea
                id="seo-desc"
                placeholder="Meta description..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-1.5 rounded-lg border p-4">
            <Label htmlFor="schedule">Schedule Publishing</Label>
            <Input
              id="schedule"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3 rounded-lg border p-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={isFeatured}
                onCheckedChange={(v) => setIsFeatured(v === true)}
              />
              <span className="text-sm font-medium">Featured Article</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={isPinned}
                onCheckedChange={(v) => setIsPinned(v === true)}
              />
              <span className="text-sm font-medium">Pinned Article</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={isBreaking}
                onCheckedChange={(v) => setIsBreaking(v === true)}
              />
              <span className="text-sm font-medium">Breaking News</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}