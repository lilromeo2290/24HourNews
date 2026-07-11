'use client'

import { useEffect, useState, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { CheckCircle2, XCircle, Ban, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

const statusColors: Record<string, string> = {
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  spam:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
}

type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam'

export default function AdminComments() {
  const { adminComments, fetchAdminComments, updateCommentStatus, deleteComment, isLoading } =
    useStore()

  const [activeTab, setActiveTab] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadComments = useCallback(
    (status?: string) => {
      const filters: { status?: string } = {}
      if (status && status !== 'all') filters.status = status
      fetchAdminComments(filters)
    },
    [fetchAdminComments]
  )

  useEffect(() => {
    loadComments(activeTab)
  }, [activeTab, loadComments])

  // Count by status
  const counts = {
    all: adminComments.length,
    pending: adminComments.filter((c) => c.status === 'pending').length,
    approved: adminComments.filter((c) => c.status === 'approved').length,
    rejected: adminComments.filter((c) => c.status === 'rejected').length,
    spam: adminComments.filter((c) => c.status === 'rejected').length,
  }

  const filteredComments =
    activeTab === 'all'
      ? adminComments
      : adminComments.filter((c) => c.status === activeTab)

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id)
    try {
      await updateCommentStatus(id, status)
      toast.success(`Comment ${status}`)
      loadComments(activeTab)
    } catch (err: any) {
      toast.error(err.message || `Failed to ${status} comment`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkSpam = async (id: string) => {
    setActionLoading(id)
    try {
      await updateCommentStatus(id, 'rejected')
      toast.success('Comment marked as spam')
      loadComments(activeTab)
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark as spam')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteComment(deleteId)
      toast.success('Comment deleted')
      loadComments(activeTab)
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete comment')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredComments.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredComments.map((c) => c.id)))
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => updateCommentStatus(id, 'approved'))
      )
      toast.success(`${selectedIds.size} comments approved`)
      setSelectedIds(new Set())
      loadComments(activeTab)
    } catch (err: any) {
      toast.error(err.message || 'Bulk approve failed')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteComment(id)))
      toast.success(`${selectedIds.size} comments deleted`)
      setSelectedIds(new Set())
      loadComments(activeTab)
    } catch (err: any) {
      toast.error(err.message || 'Bulk delete failed')
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comments</h2>
          <p className="text-sm text-muted-foreground">
            {counts.pending} pending, {counts.approved} approved,{' '}
            {counts.rejected} rejected, {counts.spam} spam
          </p>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkApprove}
              disabled={bulkLoading}
            >
              {bulkLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 size-4 text-green-600" />
              )}
              Approve Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className="text-destructive hover:text-destructive"
            >
              {bulkLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
          <TabsTrigger value="spam">Spam ({counts.spam})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        filteredComments.length > 0 &&
                        selectedIds.size === filteredComments.length
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
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
                ) : filteredComments.length > 0 ? (
                  filteredComments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(comment.id)}
                          onCheckedChange={() => toggleSelect(comment.id)}
                        />
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate font-medium">
                        {comment.article?.title ?? 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{comment.authorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {comment.authorEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {comment.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={statusColors[comment.status] ?? 'bg-gray-100 text-gray-700'}
                          variant="outline"
                        >
                          {comment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-green-600 hover:text-green-700"
                            disabled={actionLoading === comment.id}
                            onClick={() => handleStatusChange(comment.id, 'approved')}
                            title="Approve"
                          >
                            <CheckCircle2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-yellow-600 hover:text-yellow-700"
                            disabled={actionLoading === comment.id}
                            onClick={() => handleStatusChange(comment.id, 'rejected')}
                            title="Reject"
                          >
                            <XCircle className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-orange-600 hover:text-orange-700"
                            disabled={actionLoading === comment.id}
                            onClick={() => handleMarkSpam(comment.id)}
                            title="Spam"
                          >
                            <Ban className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(comment.id)}
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
                      No comments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment?
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