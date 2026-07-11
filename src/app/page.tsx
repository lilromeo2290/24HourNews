'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

// Public components
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'

// Public pages
import HomePage from '@/pages/HomePage'
import ArticlePage from '@/pages/ArticlePage'
import CategoryPage from '@/pages/CategoryPage'
import SearchPage from '@/pages/SearchPage'
import LoginPage from '@/pages/LoginPage'

// Admin components
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminArticles from '@/pages/admin/AdminArticles'
import AdminArticleEditor from '@/pages/admin/AdminArticleEditor'
import AdminCategories from '@/pages/admin/AdminCategories'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminComments from '@/pages/admin/AdminComments'
import AdminMedia from '@/pages/admin/AdminMedia'
import AdminAds from '@/pages/admin/AdminAds'
import AdminSettings from '@/pages/admin/AdminSettings'

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  )
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function PageRouter() {
  const currentPage = useStore((s) => s.currentPage)
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const fetchMe = useStore((s) => s.fetchMe)
  const token = useStore((s) => s.token)

  // Restore auth session on mount
  useEffect(() => {
    if (token && !isAuthenticated) {
      fetchMe()
    }
  }, [token, isAuthenticated, fetchMe])

  // Admin pages require auth - redirect to login if not authenticated
  const isAdminPage = currentPage.type.startsWith('admin')

  if (isAdminPage && !isAuthenticated) {
    return (
      <PublicLayout>
        <LoginPage />
      </PublicLayout>
    )
  }

  // Login page - if already authenticated, go to dashboard
  if (currentPage.type === 'login' && isAuthenticated) {
    return null
  }

  // Public pages
  switch (currentPage.type) {
    case 'home':
      return (
        <PublicLayout>
          <HomePage />
        </PublicLayout>
      )
    case 'article':
      return (
        <PublicLayout>
          <ArticlePage />
        </PublicLayout>
      )
    case 'category':
      return (
        <PublicLayout>
          <CategoryPage />
        </PublicLayout>
      )
    case 'search':
      return (
        <PublicLayout>
          <SearchPage />
        </PublicLayout>
      )
    case 'login':
      return (
        <PublicLayout>
          <LoginPage />
        </PublicLayout>
      )

    // Admin pages
    case 'admin-dashboard':
      return (
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      )
    case 'admin-articles':
      return (
        <AdminLayout>
          <AdminArticles />
        </AdminLayout>
      )
    case 'admin-article-create':
    case 'admin-article-edit':
    case 'admin-article-preview':
      return (
        <AdminLayout>
          <AdminArticleEditor />
        </AdminLayout>
      )
    case 'admin-categories':
      return (
        <AdminLayout>
          <AdminCategories />
        </AdminLayout>
      )
    case 'admin-users':
      return (
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      )
    case 'admin-comments':
      return (
        <AdminLayout>
          <AdminComments />
        </AdminLayout>
      )
    case 'admin-media':
      return (
        <AdminLayout>
          <AdminMedia />
        </AdminLayout>
      )
    case 'admin-ads':
      return (
        <AdminLayout>
          <AdminAds />
        </AdminLayout>
      )
    case 'admin-settings':
      return (
        <AdminLayout>
          <AdminSettings />
        </AdminLayout>
      )
    default:
      return (
        <PublicLayout>
          <HomePage />
        </PublicLayout>
      )
  }
}

export default function Home() {
  return <PageRouter />
}