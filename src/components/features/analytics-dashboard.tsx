'use client';

import type { ChartConfig } from '@/components/ui/chart';
import { TrendingUp, Users, MessageSquare, ThumbsUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const engagementChartData = [
  { date: '2024-05-01', engagement: 280 },
  { date: '2024-05-02', engagement: 320 },
  { date: '2024-05-03', engagement: 290 },
  { date: '2024-05-04', engagement: 450 },
  { date: '2024-05-05', engagement: 410 },
  { date: '2024-05-06', engagement: 580 },
  { date: '2024-05-07', engagement: 550 },
];

const engagementChartConfig = {
  engagement: {
    label: 'Engagement',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const platformChartData = [
  { platform: 'LinkedIn', engagement: 186, fill: 'hsl(var(--chart-1))' },
  { platform: 'Twitter', engagement: 305, fill: 'hsl(var(--chart-2))' },
  { platform: 'Instagram', engagement: 237, fill: 'hsl(var(--chart-3))' },
  { platform: 'Facebook', engagement: 73, fill: 'hsl(var(--chart-4))' },
];

const platformChartConfig = {
    engagement: {
      label: 'Engagement',
    },
} satisfies ChartConfig;

const topPostsData = [
  { id: 1, post: "We're excited to share our origin story...", platform: 'LinkedIn', engagement: '1.2k', change: '+15%' },
  { id: 2, post: 'Behind the scenes at BrandNarrator HQ...', platform: 'Instagram', engagement: '980', change: '+8%' },
  { id: 3, post: 'Our core values: Authenticity, Innovation...', platform: 'Twitter', engagement: '750', change: '+12%' },
  { id: 4, post: 'Announcing our new Prompt Generator feature!', platform: 'Facebook', engagement: '550', change: '+5%' },
];

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-headline">Content Analytics</h1>
        <p className="text-muted-foreground">
          Track and analyze the performance of your shared content.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground">+18.7% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+5.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.3%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reach</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573k</div>
            <p className="text-xs text-muted-foreground">+21% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Engagement Over Time</CardTitle>
            <CardDescription>Showing total engagement for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={engagementChartConfig} className="h-64 w-full">
              <LineChart data={engagementChartData} margin={{ left: 12, right: 12, top: 5, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis />
                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Line dataKey="engagement" type="monotone" stroke="hsl(var(--primary))" strokeWidth={2} dot={true} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Engagement by Platform</CardTitle>
             <CardDescription>Comparison of total engagement across platforms.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={platformChartConfig} className="h-64 w-full">
              <BarChart data={platformChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="platform" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="engagement" radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Top Performing Posts</CardTitle>
          <CardDescription>Your most engaging posts from this month.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead className="w-[120px]">Platform</TableHead>
                <TableHead className="w-[120px] text-right">Engagement</TableHead>
                <TableHead className="w-[120px] text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPostsData.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium truncate max-w-xs">{post.post}</TableCell>
                  <TableCell>{post.platform}</TableCell>
                  <TableCell className="text-right">{post.engagement}</TableCell>
                  <TableCell className="text-right text-green-500">{post.change}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
