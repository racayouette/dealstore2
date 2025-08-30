import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopNav from "@/components/top-nav";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Eye, Activity, Globe } from "lucide-react";
import { format, parseISO, subDays, startOfDay, endOfDay } from "date-fns";

interface PageViewSummary {
  pageName: string;
  pageUrl: string;
  date: string;
  viewCount: number;
  uniqueVisitors: number;
}

interface DailySummary {
  date: string;
  totalViews: number;
  uniquePages: number;
  topPage: string;
}

interface Subdomain {
  id: string;
  subdomain: string;
  displayName: string;
  description: string;
  isActive: boolean;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState(7); // Default to last 7 days
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>("all"); // Default to all subdomains

  // Fetch subdomains list
  const { data: subdomains } = useQuery<Subdomain[]>({
    queryKey: ['/api/subdomains'],
    queryFn: async () => {
      const response = await fetch('/api/subdomains');
      return response.json();
    }
  });

  // Fetch page view analytics data
  const { data: pageViewData, isLoading } = useQuery({
    queryKey: ['/api/analytics/page-views', dateRange, selectedSubdomain],
    queryFn: async () => {
      const params = new URLSearchParams({ days: dateRange.toString() });
      if (selectedSubdomain && selectedSubdomain !== "all") {
        params.append('subdomain', selectedSubdomain);
      }
      const response = await fetch(`/api/analytics/page-views?${params}`);
      return response.json();
    }
  });

  // Fetch daily summary data
  const { data: dailySummary } = useQuery({
    queryKey: ['/api/analytics/daily-summary', dateRange, selectedSubdomain],
    queryFn: async () => {
      const params = new URLSearchParams({ days: dateRange.toString() });
      if (selectedSubdomain && selectedSubdomain !== "all") {
        params.append('subdomain', selectedSubdomain);
      }
      const response = await fetch(`/api/analytics/daily-summary?${params}`);
      return response.json();
    }
  });

  // Calculate total metrics
  const totalViews = pageViewData?.reduce((sum: number, item: PageViewSummary) => sum + item.viewCount, 0) || 0;
  const uniquePages = new Set(pageViewData?.map((item: PageViewSummary) => item.pageUrl)).size || 0;
  const averageViewsPerDay = dailySummary?.length ? Math.round(totalViews / dailySummary.length) : 0;

  // Prepare chart data - group by date
  const chartData = dailySummary?.map((day: DailySummary) => ({
    date: format(parseISO(day.date), 'MMM dd'),
    totalViews: day.totalViews,
    uniquePages: day.uniquePages
  })) || [];

  // Prepare page ranking data
  const pageRankingData = pageViewData?.reduce((acc: any[], curr: PageViewSummary) => {
    const existing = acc.find(item => item.pageUrl === curr.pageUrl);
    if (existing) {
      existing.totalViews += curr.viewCount;
      existing.totalUniqueVisitors += curr.uniqueVisitors;
    } else {
      acc.push({
        pageName: curr.pageName,
        pageUrl: curr.pageUrl,
        totalViews: curr.viewCount,
        totalUniqueVisitors: curr.uniqueVisitors
      });
    }
    return acc;
  }, [])?.sort((a: any, b: any) => b.totalViews - a.totalViews) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Activity className="w-8 h-8 animate-spin text-net-green mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-net-dark mb-2">Page View Analytics</h1>
                <p className="text-gray-600">Comprehensive analysis of page views and visitor engagement</p>
              </div>
              
              {/* Subdomain Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">Subdomain</label>
                <Select 
                  value={selectedSubdomain} 
                  onValueChange={setSelectedSubdomain}
                  data-testid="select-subdomain"
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select subdomain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subdomains (Demo Site)</SelectItem>
                    {subdomains?.filter(sub => sub.isActive).map((subdomain) => (
                      <SelectItem key={subdomain.id} value={subdomain.id}>
                        {subdomain.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Date Range Selector */}
            <div className="flex gap-2">
              {[7, 14, 30, 90].map((days) => (
                <Button
                  key={days}
                  variant={dateRange === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange(days)}
                  className={dateRange === days ? "bg-net-green hover:bg-net-green-dark" : ""}
                  data-testid={`button-date-range-${days}`}
                >
                  {days} days
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-net-green">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last {dateRange} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Pages</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-net-green">{uniquePages}</div>
              <p className="text-xs text-muted-foreground">Pages with views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Views/Day</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-net-green">{averageViewsPerDay}</div>
              <p className="text-xs text-muted-foreground">Daily average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Page</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-net-green truncate">
                {pageRankingData[0]?.pageName || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {pageRankingData[0]?.totalViews?.toLocaleString() || 0} views
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Page Views</CardTitle>
              <CardDescription>Total views and unique pages per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalViews" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Total Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uniquePages" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Unique Pages"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Pages Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages by Views</CardTitle>
              <CardDescription>Most visited pages in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pageRankingData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="pageName" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalViews" fill="#22c55e" name="Total Views" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Page Performance Details</CardTitle>
            <CardDescription>Comprehensive view of all page statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Page Name</th>
                    <th className="text-left p-2 font-medium">URL</th>
                    <th className="text-right p-2 font-medium">Total Views</th>
                    <th className="text-right p-2 font-medium">Unique Visitors</th>
                    <th className="text-right p-2 font-medium">Avg. Views/Day</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRankingData.map((page: any, index: number) => (
                    <tr key={page.pageUrl} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{page.pageName}</td>
                      <td className="p-2 text-gray-600">{page.pageUrl}</td>
                      <td className="p-2 text-right">{page.totalViews.toLocaleString()}</td>
                      <td className="p-2 text-right">{page.totalUniqueVisitors.toLocaleString()}</td>
                      <td className="p-2 text-right">
                        {Math.round(page.totalViews / dateRange)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}