'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  FileText,
  CheckCircle2,
  FilePenLine,
  Clock,
  FolderTree,
  Users,
  Eye,
  MessageSquare,
} from 'lucide-react'
import { format } from 'date-fns'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const commentStatusColors: Record<string, string> = {
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string
  value: number | undefined
  icon: React.ElementType
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-2xl font-bold">
            {value !== undefined ? value.toLocaleString() : '0'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const {
    dashboardStats,
    dailyViews,
    adminArticles,
    adminComments,
    isLoading,
    fetchAnalytics,
    fetchAdminArticles,
    fetchAdminComments,
  } = useStore()

  useEffect(() => {
    fetchAnalytics()
    fetchAdminArticles({}, 1)
    fetchAdminComments({})
  }, [fetchAnalytics, fetchAdminArticles, fetchAdminComments])

  const recentArticles = adminArticles.slice(0, 5)
  const recentComments = adminComments.slice(0, 5)

  const stats = dashboardStats

  return (
    <div className="space-y-6">
      {/* Primary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Posts"
          value={stats?.totalPosts}
          icon={FileText}
          loading={isLoading}
        />
        <StatCard
          title="Published"
          value={stats?.publishedPosts}
          icon={CheckCircle2}
          loading={isLoading}
        />
        <StatCard
          title="Drafts"
          value={stats?.drafts}
          icon={FilePenLine}
          loading={isLoading}
        />
        <StatCard
          title="Pending"
          value={stats?.pendingApproval}
          icon={Clock}
          loading={isLoading}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Categories"
          value={stats?.totalCategories}
          icon={FolderTree}
          loading={isLoading}
        />
        <StatCard
          title="Users"
          value={stats?.totalUsers}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title="Total Views"
          value={stats?.totalViews}
          icon={Eye}
          loading={isLoading}
        />
        <StatCard
          title="Comments"
          value={stats?.totalComments}
          icon={MessageSquare}
          loading={isLoading}
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Visitors (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : dailyViews.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyViews}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => format(new Date(v), 'MMM d')}
                  className="text-muted-foreground"
                />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelFormatter={(v) => format(new Date(v), 'MMM d, yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#viewsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No analytics data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Articles & Comments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentArticles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="max-w-[180px] truncate font-medium">
                        {article.title}
                      </TableCell>
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
                      <TableCell>{article.category?.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(article.createdAt), 'MMM d')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No articles yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentComments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentComments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell className="font-medium">
                        {comment.authorName}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-muted-foreground">
                        {comment.content}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            commentStatusColors[comment.status] ??
                            'bg-gray-100 text-gray-700'
                          }
                          variant="outline"
                        >
                          {comment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No comments yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}