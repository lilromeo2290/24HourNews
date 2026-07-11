'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useStore } from '@/lib/store'
import NewsCard from '@/components/public/NewsCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { Search, X, SlidersHorizontal } from 'lucide-react'

const PAGE_SIZE = 12

export default function SearchPage() {
  const {
    currentPage,
    search,
    searchResults,
    searchTotal,
    searchQuery,
    categories,
    searchFilters,
    setSearchFilters,
    isLoading,
  } = useStore()

  const initialQuery = currentPage.type === 'search' ? (currentPage.query ?? '') : ''
  const initialCategoryId = currentPage.type === 'search' ? currentPage.categoryId : undefined

  const [query, setQuery] = useState(initialQuery)
  const [categoryId, setCategoryId] = useState<string>(initialCategoryId ?? 'all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [hasSearched, setHasSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const totalPages = useMemo(
    () => (searchTotal > 0 ? Math.ceil(searchTotal / PAGE_SIZE) : 1),
    [searchTotal],
  )

  const doSearch = useCallback(
    async (q: string, p: number) => {
      try {
        await search(q, p, PAGE_SIZE)
        setHasSearched(true)
      } catch {
        // silently handle
      }
    },
    [search],
  )

  // Set initial category filter and run initial search
  useEffect(() => {
    if (initialCategoryId) {
      setSearchFilters({ ...searchFilters, categoryId: initialCategoryId })
      setCategoryId(initialCategoryId)
    }
    if (initialQuery) {
      doSearch(initialQuery, 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (newPage = 1) => {
    if (!query.trim()) return
    // Update filters
    const filters: Record<string, string | undefined> = {}
    if (categoryId && categoryId !== 'all') filters.categoryId = categoryId
    if (dateFrom) filters.dateFrom = dateFrom
    if (dateTo) filters.dateTo = dateTo
    setSearchFilters(filters)

    setPage(newPage)
    doSearch(query.trim(), newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClear = () => {
    setQuery('')
    setCategoryId('all')
    setDateFrom('')
    setDateTo('')
    setSearchFilters({})
    setPage(1)
    setHasSearched(false)
    useStore.setState({ searchResults: [], searchTotal: 0, searchQuery: '' })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    handleSearch(newPage)
  }

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
      {/* Search Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Search</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-9"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <Button onClick={() => handleSearch(1)} disabled={!query.trim()}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-4">
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
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

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">From:</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[160px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">To:</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[160px]"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategoryId('all')
                setDateFrom('')
                setDateTo('')
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
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
      ) : hasSearched ? (
        <>
          <p className="text-sm text-muted-foreground">
            {searchTotal > 0 ? (
              <>Found <strong>{searchTotal}</strong> results{searchQuery ? ` for "${searchQuery}"` : ''}</>
            ) : (
              'No results found'
            )}
          </p>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-4">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg text-muted-foreground">
                No articles match your search criteria.
              </p>
              <p className="text-sm text-muted-foreground">
                Try different keywords or adjust your filters.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center space-y-4">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg text-muted-foreground">
            Enter a search term to find articles.
          </p>
        </div>
      )}

      {/* Pagination */}
      {hasSearched && totalPages > 1 && (
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