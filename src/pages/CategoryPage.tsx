'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useStore } from '@/lib/store'
import NewsCard from '@/components/public/NewsCard'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'

const PAGE_SIZE = 12

export default function CategoryPage() {
  const { currentPage, search, categories, searchResults, searchTotal, isLoading } =
    useStore()
  const [page, setPage] = useState(1)

  const slug =
    currentPage.type === 'category' ? currentPage.slug : ''
  const categoryName =
    currentPage.type === 'category' ? currentPage.categoryName : ''

  const category = categories.find((c) => c.slug === slug)

  const totalPages = useMemo(
    () => (searchTotal > 0 ? Math.ceil(searchTotal / PAGE_SIZE) : 1),
    [searchTotal],
  )

  const doSearch = useCallback(
    async (p: number) => {
      if (!slug) return
      try {
        await search('', p, PAGE_SIZE)
      } catch {
        // silently handle
      }
    },
    [slug, search],
  )

  useEffect(() => {
    if (!slug) return
    useStore.setState({ searchFilters: { categoryId: category?.id } })
    doSearch(1)
  }, [category?.id, slug, doSearch])

  useEffect(() => {
    if (page <= 1) return
    doSearch(page)
  }, [page, doSearch])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Build page numbers
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('ellipsis')
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Category Header */}
      <div
        className="rounded-lg p-6 sm:p-8 text-white"
        style={{ backgroundColor: category?.color ?? '#888' }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{categoryName}</h1>
        {category?.description && (
          <p className="text-white/80 max-w-2xl">{category.description}</p>
        )}
      </div>

      {/* Results Grid */}
      {isLoading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {searchResults.length} of {searchTotal} articles
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            No articles found in this category.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {getPageNumbers().map((p, i) =>
              p === 'ellipsis' ? (
                <PaginationItem key={`e-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={() => handlePageChange(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(page + 1)}
                className={
                  page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}