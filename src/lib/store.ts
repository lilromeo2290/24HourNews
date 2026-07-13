import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// Entity Interfaces
// ---------------------------------------------------------------------------

export interface Author {
  id: string
  name: string
  avatar?: string
}

export interface CategoryBasic {
  id: string
  name: string
  slug: string
  color: string
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featuredImage?: string
  status: string
  isFeatured: boolean
  isPinned: boolean
  isBreaking: boolean
  publishedAt?: string
  readingTime: number
  viewCount: number
  createdAt: string
  updatedAt: string
  authorId: string
  categoryId: string
  author: Author
  category: CategoryBasic
  tags: Tag[]
}

export interface ArticleFull extends Article {
  author: Author & { bio?: string }
  category: CategoryBasic & { description?: string }
  tags: Tag[]
}

export interface Category {
  id: string
  name: string
  slug: string
  color: string
  description?: string
  articleCount?: number
  order?: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  authorName: string
  authorEmail: string
  articleId: string
  article?: { id: string; title: string; slug: string }
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  parentId?: string
  replies?: Comment[]
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'author' | 'user'
  avatar?: string
  bio?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  alt?: string
  createdAt: string
  uploadedBy?: string
}

export interface Advertisement {
  id: string
  title: string
  type: 'banner' | 'sidebar' | 'footer' | 'popup'
  imageUrl: string
  linkUrl?: string
  position?: string
  isActive: boolean
  startDate?: string
  endDate?: string
  clickCount: number
  impressionCount: number
  createdAt: string
  updatedAt: string
}

export interface Ad {
  id: string
  title: string
  imageUrl: string
  linkUrl?: string
  position?: string
  type: string
  isActive: boolean
}

// ---------------------------------------------------------------------------
// Page (routing) types
// ---------------------------------------------------------------------------

export type Page =
  | { type: 'home' }
  | { type: 'article'; slug: string }
  | { type: 'category'; slug: string; categoryName: string }
  | { type: 'search'; query?: string; categoryId?: string }
  | { type: 'login' }
  | { type: 'admin-dashboard' }
  | { type: 'admin-articles' }
  | { type: 'admin-article-create' }
  | { type: 'admin-article-edit'; id: string }
  | { type: 'admin-article-preview'; id: string }
  | { type: 'admin-categories' }
  | { type: 'admin-users' }
  | { type: 'admin-comments' }
  | { type: 'admin-media' }
  | { type: 'admin-ads' }
  | { type: 'admin-settings' }

// ---------------------------------------------------------------------------
// Auth-related types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'author' | 'user'
  avatar?: string
  bio?: string
  isActive: boolean
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  drafts: number
  pendingApproval: number
  totalCategories: number
  totalUsers: number
  totalViews: number
  totalComments: number
}

export interface DailyViews {
  date: string
  views: number
}

// ---------------------------------------------------------------------------
// Search / filter types
// ---------------------------------------------------------------------------

export interface SearchFilters {
  categoryId?: string
  dateFrom?: string
  dateTo?: string
  authorId?: string
  tagId?: string
}

export interface AdminArticleFilters {
  status?: string
  categoryId?: string
  search?: string
}

export interface AdminCommentFilters {
  status?: string
  articleId?: string
  search?: string
}

// ---------------------------------------------------------------------------
// Helper: API client
// ---------------------------------------------------------------------------

// Module-level token ref that the store updates on login/logout
let _authToken: string | null = null

export function setAuthToken(token: string | null) {
  _authToken = token
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // Use in-memory token first, fall back to localStorage
  const token = _authToken ?? (typeof window !== 'undefined'
    ? (() => { try { const s = localStorage.getItem('news-portal-auth'); return s ? JSON.parse(s)?.state?.token : null } catch { return null } })()
    : null)

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(path, {
    headers,
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? body.error ?? `Request failed (${res.status})`)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T
  return res.json()
}

// ---------------------------------------------------------------------------
// State & Actions interfaces
// ---------------------------------------------------------------------------

interface AppState {
  // ---- Navigation ----
  currentPage: Page
  navigate: (page: Page) => void

  // ---- UI ----
  isLoading: boolean
  sidebarOpen: boolean
  toggleSidebar: () => void
  mobileMenuOpen: boolean
  toggleMobileMenu: () => void

  // ---- Auth ----
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>

  // ---- Homepage ----
  breakingNews: Article[]
  featuredArticles: Article[]
  pinnedArticle: Article | null
  latestNews: Article[]
  trendingNews: Article[]
  popularCategories: Category[]
  advertisements: { banner: Ad[]; sidebar: Ad[]; footer: Ad[]; trending: Ad[] }
  fetchHomeData: () => Promise<void>

  // ---- Article (public) ----
  currentArticle: ArticleFull | null
  relatedArticles: Article[]
  comments: Comment[]
  fetchArticle: (slug: string) => Promise<void>
  fetchArticleById: (id: string) => Promise<void>
  fetchComments: (articleId: string) => Promise<void>
  submitComment: (
    articleId: string,
    content: string,
    authorName: string,
    authorEmail: string,
  ) => Promise<void>

  // ---- Categories ----
  categories: Category[]
  fetchCategories: () => Promise<void>

  // ---- Search ----
  searchResults: Article[]
  searchTotal: number
  searchQuery: string
  searchFilters: SearchFilters
  setSearchFilters: (filters: SearchFilters) => void
  search: (query: string, page?: number, limit?: number) => Promise<void>

  // ---- Admin: Articles ----
  adminArticles: Article[]
  adminArticlesTotal: number
  adminArticlesPage: number
  adminFilters: AdminArticleFilters
  setAdminFilters: (filters: AdminArticleFilters) => void
  fetchAdminArticles: (filters?: AdminArticleFilters, page?: number) => Promise<void>
  createArticle: (data: Record<string, unknown>) => Promise<Article>
  updateArticle: (id: string, data: Record<string, unknown>) => Promise<Article>
  deleteArticle: (id: string) => Promise<void>
  publishArticle: (id: string) => Promise<Article>

  // ---- Admin: Categories ----
  adminCategories: Category[]
  fetchAdminCategories: () => Promise<void>
  createCategory: (data: Record<string, unknown>) => Promise<Category>
  updateCategory: (id: string, data: Record<string, unknown>) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
  reorderCategories: (categories: { id: string; order: number }[]) => Promise<void>

  // ---- Admin: Users ----
  adminUsers: User[]
  fetchAdminUsers: () => Promise<void>
  createUser: (data: Record<string, unknown>) => Promise<User>
  updateUser: (id: string, data: Record<string, unknown>) => Promise<User>
  deleteUser: (id: string) => Promise<void>
  resetUserPassword: (id: string, newPassword: string) => Promise<void>

  // ---- Admin: Comments ----
  adminComments: Comment[]
  fetchAdminComments: (filters?: AdminCommentFilters) => Promise<void>
  updateCommentStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>
  deleteComment: (id: string) => Promise<void>

  // ---- Admin: Media ----
  mediaItems: Media[]
  fetchMedia: (search?: string, page?: number) => Promise<void>
  deleteMedia: (id: string) => Promise<void>

  // ---- Admin: Ads ----
  ads: Advertisement[]
  fetchAds: () => Promise<void>
  createAd: (data: Record<string, unknown>) => Promise<Advertisement>
  updateAd: (id: string, data: Record<string, unknown>) => Promise<Advertisement>
  deleteAd: (id: string) => Promise<void>

  // ---- Analytics ----
  dashboardStats: DashboardStats | null
  dailyViews: DailyViews[]
  fetchAnalytics: () => Promise<void>

  // ---- Newsletter ----
  subscribeNewsletter: (email: string) => Promise<void>
}

// ---------------------------------------------------------------------------
// The Store
// ---------------------------------------------------------------------------

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // =====================================================================
      // Navigation
      // =====================================================================
      currentPage: { type: 'home' },

      navigate: (page: Page) => {
        set({ currentPage: page })
        // Scroll to top on navigation
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      },

      // =====================================================================
      // UI
      // =====================================================================
      isLoading: false,
      sidebarOpen: true,
      mobileMenuOpen: false,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleMobileMenu: () =>
        set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),

      // =====================================================================
      // Auth
      // =====================================================================
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const res = await apiFetch<{
            token: string
            user: AuthUser
          }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          })
          setAuthToken(res.token)
          set({
            token: res.token,
            user: res.user,
            isAuthenticated: true,
            isLoading: false,
            currentPage: { type: 'admin-dashboard' },
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        setAuthToken(null)
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          currentPage: { type: 'home' },
        })
      },

      fetchMe: async () => {
        const { token } = get()
        if (!token) {
          setAuthToken(token)
          return
        }
        setAuthToken(token)
        set({ isLoading: true })
        try {
          const user = await apiFetch<AuthUser>('/api/auth/me')
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          // Token is invalid — clear it
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        }
      },

      changePassword: async (oldPassword: string, newPassword: string) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          await apiFetch('/api/auth/change-password', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ oldPassword, newPassword }),
          })
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // =====================================================================
      // Homepage
      // =====================================================================
      breakingNews: [],
      featuredArticles: [],
      pinnedArticle: null,
      latestNews: [],
      trendingNews: [],
      popularCategories: [],
      advertisements: { banner: [], sidebar: [], footer: [], trending: [] },

      fetchHomeData: async () => {
        set({ isLoading: true })
        try {
          const [homeData, adsData] = await Promise.all([
            apiFetch<{
              breakingNews: Article[]
              featuredArticles: Article[]
              pinnedArticle: Article | null
              latestNews: Article[]
              trendingNews: Article[]
              popularCategories: Category[]
            }>('/api/home'),
            apiFetch<{ banner: Ad[]; sidebar: Ad[]; footer: Ad[] }>(
              '/api/advertisements',
            ),
          ])

          set({
            breakingNews: homeData.breakingNews ?? [],
            featuredArticles: homeData.featuredArticles ?? [],
            pinnedArticle: homeData.pinnedArticle ?? null,
            latestNews: homeData.latestNews ?? [],
            trendingNews: homeData.trendingNews ?? [],
            popularCategories: homeData.popularCategories ?? [],
            advertisements: {
              banner: adsData.banner ?? [],
              sidebar: adsData.sidebar ?? [],
              footer: adsData.footer ?? [],
              trending: adsData.trending ?? [],
            },
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // =====================================================================
      // Article (public)
      // =====================================================================
      currentArticle: null,
      relatedArticles: [],
      comments: [],

      fetchArticle: async (slug: string) => {
        set({ isLoading: true })
        try {
          const data = await apiFetch<{
            article: ArticleFull
            relatedArticles: Article[]
          }>(`/api/articles/slug/${slug}`)

          set({
            currentArticle: data.article,
            relatedArticles: data.relatedArticles ?? [],
            comments: [],
            isLoading: false,
          })

          // Fetch comments in background
          get().fetchComments(data.article.id)
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      fetchArticleById: async (id: string) => {
        set({ isLoading: true })
        try {
          const data = await apiFetch<ArticleFull>(
            `/api/articles/${id}`,
          )
          // Map tags from ArticleTag format to flat format
          const article = {
            ...data,
            tags: (data as unknown as { tags?: { tagId: string; tag: { id: string; name: string; slug: string } }[] }).tags?.map((at: { tag: { id: string; name: string; slug: string } }) => ({ id: at.tag.id, name: at.tag.name, slug: at.tag.slug })) ?? [],
          }
          set({ currentArticle: article, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      fetchComments: async (articleId: string) => {
        try {
          const data = await apiFetch<{ comments: Comment[] }>(
            `/api/comments?articleId=${articleId}&status=approved`,
          )
          set({ comments: data.comments ?? [] })
        } catch {
          // Non-critical — swallow
        }
      },

      submitComment: async (
        articleId: string,
        content: string,
        authorName: string,
        authorEmail: string,
      ) => {
        try {
          await apiFetch('/api/comments/public', {
            method: 'POST',
            body: JSON.stringify({ articleId, content, authorName, authorEmail }),
          })
        } catch (error) {
          throw error
        }
      },

      // =====================================================================
      // Categories
      // =====================================================================
      categories: [],

      fetchCategories: async () => {
        try {
          const data = await apiFetch<{ categories: Category[] }>('/api/categories')
          set({ categories: data.categories ?? [] })
        } catch {
          // Swallow — categories will remain empty
        }
      },

      // =====================================================================
      // Search
      // =====================================================================
      searchResults: [],
      searchTotal: 0,
      searchQuery: '',
      searchFilters: {},

      setSearchFilters: (filters: SearchFilters) =>
        set({ searchFilters: filters }),

      search: async (query: string, page = 1, limit = 10) => {
        set({ isLoading: true, searchQuery: query })
        try {
          const params = new URLSearchParams({
            q: query,
            page: String(page),
            limit: String(limit),
          })

          const { searchFilters: filters } = get()
          if (filters.categoryId) params.set('categoryId', filters.categoryId)
          if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
          if (filters.dateTo) params.set('dateTo', filters.dateTo)
          if (filters.authorId) params.set('authorId', filters.authorId)
          if (filters.tagId) params.set('tagId', filters.tagId)

          const data = await apiFetch<{
            articles: Article[]
            total: number
          }>(`/api/search?${params.toString()}`)

          set({
            searchResults: data.articles ?? [],
            searchTotal: data.total ?? 0,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // =====================================================================
      // Admin: Articles
      // =====================================================================
      adminArticles: [],
      adminArticlesTotal: 0,
      adminArticlesPage: 1,
      adminFilters: {},

      setAdminFilters: (filters: AdminArticleFilters) =>
        set({ adminFilters: filters }),

      fetchAdminArticles: async (
        filters?: AdminArticleFilters,
        page = 1,
      ) => {
        const { token } = get()
        set({ isLoading: true })

        try {
          const params = new URLSearchParams({ page: String(page), limit: '20' })
          const f = filters ?? get().adminFilters

          if (f.status) params.set('status', f.status)
          if (f.categoryId) params.set('categoryId', f.categoryId)
          if (f.search) params.set('search', f.search)

          const data = await apiFetch<{
            articles: Article[]
            total: number
          }>(`/api/articles?${params.toString()}`)

          set({
            adminArticles: data.articles ?? [],
            adminArticlesTotal: data.total ?? 0,
            adminArticlesPage: page,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      createArticle: async (data: Record<string, unknown>) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const res = await apiFetch<{ article: Article }>(
            '/api/articles',
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify(data),
            },
          )
          set((s) => ({
            adminArticles: [res.article, ...s.adminArticles],
            adminArticlesTotal: s.adminArticlesTotal + 1,
            isLoading: false,
          }))
          return res.article
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateArticle: async (id: string, data: Record<string, unknown>) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const res = await apiFetch<{ article: Article }>(
            `/api/articles/${id}`,
            {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify(data),
            },
          )
          set((s) => ({
            adminArticles: s.adminArticles.map((a) =>
              a.id === id ? res.article : a,
            ),
            currentArticle:
              s.currentArticle?.id === id
                ? (res.article as unknown as ArticleFull)
                : s.currentArticle,
            isLoading: false,
          }))
          return res.article
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      deleteArticle: async (id: string) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          await apiFetch(`/api/articles/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
          set((s) => ({
            adminArticles: s.adminArticles.filter((a) => a.id !== id),
            adminArticlesTotal: s.adminArticlesTotal - 1,
            isLoading: false,
          }))
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      publishArticle: async (id: string) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const res = await apiFetch<{ article: Article }>(
            `/api/articles/${id}/publish`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          set((s) => ({
            adminArticles: s.adminArticles.map((a) =>
              a.id === id ? res.article : a,
            ),
            currentArticle:
              s.currentArticle?.id === id
                ? (res.article as unknown as ArticleFull)
                : s.currentArticle,
            isLoading: false,
          }))
          return res.article
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // =====================================================================
      // Admin: Categories
      // =====================================================================
      adminCategories: [],

      fetchAdminCategories: async () => {
        const { token } = get()
        try {
          const data = await apiFetch<{ categories: Category[] }>(
            '/api/categories',
            { headers: { Authorization: `Bearer ${token}` } },
          )
          set({ adminCategories: data.categories ?? [] })
        } catch {
          // Swallow
        }
      },

      createCategory: async (data: Record<string, unknown>) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const res = await apiFetch<{ category: Category }>(
            '/api/categories',
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify(data),
            },
          )
          set((s) => ({
            adminCategories: [...s.adminCategories, res.category],
            categories: [...s.categories, res.category],
            isLoading: false,
          }))
          return res.category
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateCategory: async (id: string, data: Record<string, unknown>) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const res = await apiFetch<{ category: Category }>(
            `/api/categories/${id}`,
            {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify(data),
            },
          )
          const updated = res.category
          set((s) => ({
            adminCategories: s.adminCategories.map((c) =>
              c.id === id ? updated : c,
            ),
            categories: s.categories.map((c) =>
              c.id === id ? updated : c,
            ),
            isLoading: false,
          }))
          return updated
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      deleteCategory: async (id: string) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          await apiFetch(`/api/categories/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
          set((s) => ({
            adminCategories: s.adminCategories.filter((c) => c.id !== id),
            categories: s.categories.filter((c) => c.id !== id),
            isLoading: false,
          }))
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      reorderCategories: async (
        categories: { id: string; order: number }[],
      ) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          await apiFetch('/api/categories/reorder', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ categories }),
          })
          // Optimistically update local order
          set((s) => ({
            adminCategories: s.adminCategories
              .map((c) => {
                const match = categories.find((rc) => rc.id === c.id)
                return match ? { ...c, order: match.order } : c
              })
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
            isLoading: false,
          }))
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // =====================================================================
      // Admin: Users
      // =====================================================================
      adminUsers: [],

      fetchAdminUsers: async () => {
        const { token } = get()
        try {
          const data = await apiFetch<{ users: User[] }>(
            '/api/users',
            { headers: { Authorization: `Bearer ${token}` } },
          )
          set({ adminUsers: data.users ?? [] })
        } catch {
          // Swallow
        }
      },

      createUser: async (data: Record<string, unknown>) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const res = await apiFetch<{ user: User }>(
            '/api/users',
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify(data),
            },
          )
          set((s) => ({
            adminUsers: [...s.adminUsers, res.user],
            isLoading: false,
          }))
          return res.user
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateUser: async (id: string, data: Record<string, unknown>) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const res = await apiFetch<{ user: User }>(
            `/api/users/${id}`,
            {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify(data),
            },
          )
          set((s) => ({
            adminUsers: s.adminUsers.map((u) =>
              u.id === id ? res.user : u,
            ),
            isLoading: false,
          }))
          return res.user
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      deleteUser: async (id: string) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          await apiFetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
          set((s) => ({
            adminUsers: s.adminUsers.filter((u) => u.id !== id),
            isLoading: false,
          }))
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      resetUserPassword: async (id: string, newPassword: string) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          await apiFetch(`/api/users/${id}/reset-password`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ newPassword }),
          })
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // =====================================================================
      // Admin: Comments
      // =====================================================================
      adminComments: [],

      fetchAdminComments: async (filters?: AdminCommentFilters) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const params = new URLSearchParams()
          if (filters?.status) params.set('status', filters.status)
          if (filters?.articleId) params.set('articleId', filters.articleId)
          if (filters?.search) params.set('search', filters.search)

          const qs = params.toString()
          const data = await apiFetch<{ comments: Comment[] }>(
            `/api/comments${qs ? `?${qs}` : ''}`,
          )
          set({ adminComments: data.comments ?? [], isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateCommentStatus: async (
        id: string,
        status: 'approved' | 'rejected',
      ) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          await apiFetch(`/api/comments/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
          })
          set((s) => ({
            adminComments: s.adminComments.map((c) =>
              c.id === id ? { ...c, status } : c,
            ),
            comments: s.comments.map((c) =>
              c.id === id ? { ...c, status } : c,
            ),
            isLoading: false,
          }))
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      deleteComment: async (id: string) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          await apiFetch(`/api/comments/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
          set((s) => ({
            adminComments: s.adminComments.filter((c) => c.id !== id),
            comments: s.comments.filter((c) => c.id !== id),
            isLoading: false,
          }))
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // =====================================================================
      // Admin: Media
      // =====================================================================
      mediaItems: [],

      fetchMedia: async (search?: string, page = 1) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const params = new URLSearchParams({ page: String(page), limit: '30' })
          if (search) params.set('search', search)

          const data = await apiFetch<{ media: Media[] }>(
            `/api/media?${params.toString()}`,
            { headers: { Authorization: `Bearer ${token}` } },
          )
          set({ mediaItems: data.media ?? [], isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      deleteMedia: async (id: string) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          await apiFetch(`/api/media/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
          set((s) => ({
            mediaItems: s.mediaItems.filter((m) => m.id !== id),
            isLoading: false,
          }))
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // =====================================================================
      // Admin: Ads
      // =====================================================================
      ads: [],

      fetchAds: async () => {
        const { token } = get()
        try {
          const data = await apiFetch<{ advertisements: Advertisement[] }>(
            '/api/ads',
            { headers: { Authorization: `Bearer ${token}` } },
          )
          set({ ads: data.advertisements ?? [] })
        } catch {
          // Swallow
        }
      },

      createAd: async (data: Record<string, unknown>) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const res = await apiFetch<{ advertisement: Advertisement }>(
            '/api/ads',
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify(data),
            },
          )
          set((s) => ({
            ads: [...s.ads, res.advertisement],
            isLoading: false,
          }))
          return res.advertisement
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateAd: async (id: string, data: Record<string, unknown>) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const res = await apiFetch<{ advertisement: Advertisement }>(
            `/api/ads/${id}`,
            {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify(data),
            },
          )
          set((s) => ({
            ads: s.ads.map((a) =>
              a.id === id ? res.advertisement : a,
            ),
            isLoading: false,
          }))
          return res.advertisement
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      deleteAd: async (id: string) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          await apiFetch(`/api/ads/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
          set((s) => ({
            ads: s.ads.filter((a) => a.id !== id),
            isLoading: false,
          }))
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // =====================================================================
      // Analytics
      // =====================================================================
      dashboardStats: null,
      dailyViews: [],

      fetchAnalytics: async () => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const data = await apiFetch<{
            stats: DashboardStats
            dailyViews: DailyViews[]
          }>('/api/analytics/overview')
          set({
            dashboardStats: data.stats,
            dailyViews: data.dailyViews ?? [],
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // =====================================================================
      // Newsletter
      // =====================================================================
      subscribeNewsletter: async (email: string) => {
        set({ isLoading: true })
        try {
          await apiFetch('/api/newsletter', {
            method: 'POST',
            body: JSON.stringify({ email }),
          })
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
    }),
    {
      name: 'news-portal-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      // Only persist the token — user is fetched on app load via fetchMe()
      partialize: (state) => ({ token: state.token } as Partial<AppState>),
    },
  ),
)