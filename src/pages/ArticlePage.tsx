'use client'

import { useEffect, useState } from 'react'
import { useStore, type Comment } from '@/lib/store'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import NewsCard from '@/components/public/NewsCard'
import AdBanner from '@/components/public/AdBanner'
import {
  Clock,
  Eye,
  User,
  Calendar,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function ArticlePage() {
  const {
    currentPage,
    currentArticle,
    relatedArticles,
    comments,
    isLoading,
    fetchArticle,
    fetchComments,
    submitComment,
    navigate,
  } = useStore()

  const slug = currentPage.type === 'article' ? currentPage.slug : ''

  // Comment form state
  const [commentName, setCommentName] = useState('')
  const [commentEmail, setCommentEmail] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchArticle(slug)
    }
  }, [slug, fetchArticle])

  const article = currentArticle

  const handleShare = (platform: string) => {
    if (!article) return
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const title = article.title
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    }
    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer,width=600,height=400')
  }

  const handleCommentSubmit = async () => {
    if (!article) return
    if (!commentName.trim() || !commentEmail.trim() || !commentContent.trim()) {
      toast.error('Please fill in all fields.')
      return
    }
    if (!commentEmail.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }

    setSubmittingComment(true)
    try {
      await submitComment(article.id, commentContent, commentName, commentEmail)
      setCommentName('')
      setCommentEmail('')
      setCommentContent('')
      toast.success('Your comment has been submitted and is pending approval.')
    } catch {
      toast.error('Failed to submit comment. Please try again.')
    } finally {
      setSubmittingComment(false)
    }
  }

  const approvedComments = comments.filter((c) => c.status === 'approved')

  // Loading skeleton
  if (isLoading || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-10 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Split content for in-article ad placement
  const contentParts = article.content.split('</p>')
  const midPoint = Math.min(3, Math.ceil(contentParts.length / 2))
  const firstHalf = contentParts.slice(0, midPoint).join('</p>') + '</p>'
  const secondHalf = contentParts.slice(midPoint).join('</p>')

  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'MMMM d, yyyy')
    : format(new Date(article.createdAt), 'MMMM d, yyyy')

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => navigate({ type: 'home' })}
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() =>
                navigate({
                  type: 'category',
                  slug: article.category.slug,
                  categoryName: article.category.name,
                })
              }
            >
              {article.category.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1 max-w-[200px]">
              {article.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Featured Image */}
      {article.featuredImage && (
        <div className="overflow-hidden rounded-xl">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
        {article.title}
      </h1>

      {/* Author / Meta Row */}
      <div className="flex flex-wrap items-center gap-3">
        <Avatar className="h-9 w-9">
          {article.author.avatar && (
            <AvatarImage src={article.author.avatar} alt={article.author.name} />
          )}
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {(article.author?.name || 'A').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{article.author.name}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {publishedDate}
            </span>
            {article.readingTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readingTime} min read
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.viewCount} views
            </span>
          </div>
        </div>
        <Badge
          className="ml-auto text-white text-xs"
          style={{ backgroundColor: article.category.color }}
        >
          {article.category.name}
        </Badge>
      </div>

      {/* Social Share */}
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground mr-1">Share:</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleShare('twitter')} aria-label="Share on X">
          <Twitter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleShare('facebook')} aria-label="Share on Facebook">
          <Facebook className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleShare('linkedin')} aria-label="Share on LinkedIn">
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleShare('whatsapp')} aria-label="Share on WhatsApp">
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {/* Article Content - first half */}
      <div
        className="prose-editor max-w-none"
        dangerouslySetInnerHTML={{ __html: firstHalf }}
      />

      {/* In-article Ad */}
      <AdBanner position="in-article" />

      {/* Article Content - second half */}
      {secondHalf && (
        <div
          className="prose-editor max-w-none"
          dangerouslySetInnerHTML={{ __html: secondHalf }}
        />
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-sm font-medium text-muted-foreground">Tags:</span>
          {article.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <Separator />

      {/* Related Stories */}
      {relatedArticles.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Related Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.slice(0, 3).map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <Separator />

      {/* Comments Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({approvedComments.length})
        </h2>

        {/* Comment Form */}
        <div className="rounded-lg border bg-muted/30 p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Your name"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Your email"
              value={commentEmail}
              onChange={(e) => setCommentEmail(e.target.value)}
            />
          </div>
          <Textarea
            placeholder="Write your comment..."
            rows={3}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={handleCommentSubmit} disabled={submittingComment} size="sm">
              {submittingComment ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Comment
            </Button>
          </div>
        </div>

        {/* Comments List */}
        {approvedComments.length > 0 ? (
          <div className="space-y-4">
            {approvedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </section>

      {/* Previous / Next navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            navigate({
              type: 'category',
              slug: article.category.slug,
              categoryName: article.category.name,
            })
          }
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          More in {article.category.name}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ type: 'home' })}
        >
          Back to Home
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </article>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3 rounded-lg border p-4">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
          {(comment.authorName || 'A').charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(comment.createdAt), 'MMM d, yyyy')}
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  )
}