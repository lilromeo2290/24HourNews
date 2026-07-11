'use client'

import { useEffect, useState, useCallback } from 'react'
import { useStore, type Article } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Send,
  Star,
  Pin,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const ITEMS_PER_PAGE = 10

export default function AdminArticles() {
  const {
    adminArticles,
    adminArticlesTotal,
    adminArticlesPage,
    adminFilters,
    setAdminFilters,
    categories,
    fetchAdminArticles,
    fetchAdminCategories,
    deleteArticle,
    publishArticle,
    navigate,
    isLoading,
  } = useStore()

  const [searchInput, setSearchInput] = useState(adminFilters.search ?? '')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const totalPages = Math.max(1, Math.ceil((adminArticlesTotal ?? 0) / ITEMS_PER_PAGE))

  const loadData = useCallback(
    (page?: number) => {
      fetchAdminArticles(adminFilters, page ?? adminArticlesPage)
    },
    [adminFilters, adminArticlesPage, fetchAdminArticles]
  )

  useEffect(() => {
    fetchAdminCategories()
  }, [fetchAdminCategories])

  useEffect(() => {
    loadData(1)
  }, [adminFilters, loadData])

  const handleStatusChange = (value: string) => {
    setAdminFilters({ ...adminFilters, status: value === 'all' ? undefined : value })
  }

  const handleCategoryChange = (value: string) => {
    setAdminFilters({ ...adminFilters, categoryId: value === 'all' ? undefined : value })
  }

  const handleSearch = () => {
    setAdminFilters({ ...adminFilters, search: searchInput || undefined })
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadData(newPage)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteArticle(deleteId)
      toast.success('Article deleted successfully')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete article')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handlePublish = async (article: Article) => {
    setPublishingId(article.id)
    try {
      await publishArticle(article.id)
      toast.success('Article published successfully!')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish article')
    } finally {
      setPublishingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Articles</h2>
        <Button onClick={() => navigate({ type: 'admin-article-create' })}>
          <Plus className="mr-2 size-4" />
          Create New Article
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={adminFilters.status ?? 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={adminFilters.categoryId ?? 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
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

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Featured</TableHead>
              <TableHead className="text-center">Pinned</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : adminArticles.length > 0 ? (
              adminArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>
                    <span
                      className="inline-block size-2.5 rounded-full mr-1.5"
                      style={{ backgroundColor: article.category?.color }}
                    />
                    {article.category?.name}
                  </TableCell>
                  <TableCell>{article.author?.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColors[article.status] ??
                        'bg-gray-100 text-gray-700'
                      }
                      variant="outline"
                    >
                      {article.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {article.isFeatured ? (
                      <Star className="mx-auto size-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {article.isPinned ? (
                      <Pin className="mx-auto size-4 text-primary" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {article.viewCount?.toLocaleString() ?? '0'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(article.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() =>
                          navigate({ type: 'admin-article-edit', id: article.id })
                        }
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      {(article.status === 'draft' || article.status === 'pending') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={publishingId === article.id}
                          onClick={() => handlePublish(article)}
                          title="Publish"
                        >
                          <Send className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(article.id)}
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
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No articles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {adminArticlesPage} of {totalPages} ({adminArticlesTotal} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={adminArticlesPage <= 1}
              onClick={() => handlePageChange(adminArticlesPage - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={adminArticlesPage >= totalPages}
              onClick={() => handlePageChange(adminArticlesPage + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be
              undone.
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