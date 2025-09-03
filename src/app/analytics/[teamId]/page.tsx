"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import OverviewCards from '../../../components/analytics/overview-cards';
import SalesDistributionChart from '../../../components/analytics/sales-distribution-chart';

// TypeScript interfaces
interface ProjectData {
  projectName: string;
  sold: number;
  unSold: number;
  soldPercentage: string;
  unsoldPercentage: string;
}

interface ApiResponse {
  result: ProjectData[];
  allSold: number;
  allUnsold: number;
  totalFlats: number;
}

interface AnalyticsData {
  totalFlats: number;
  soldFlats: number;
  unsoldFlats: number;
  soldPercentage: string;
}

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

export default function AnalyticsPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://sitenote-analytics.vercel.app/api/flats/getprojectwiseflats/${teamId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: ApiResponse = await response.json();
        
        // Calculate sold percentage
        const soldPercentage = data.totalFlats > 0 
          ? ((data.allSold / data.totalFlats) * 100).toFixed(1)
          : "0.0";

        // Set analytics data
        const analytics: AnalyticsData = {
          totalFlats: data.totalFlats,
          soldFlats: data.allSold,
          unsoldFlats: data.allUnsold,
          soldPercentage: `${soldPercentage}%`
        };
        setAnalyticsData(analytics);

        // Set chart data
        const chart: ChartData[] = [
          {
            name: 'Sold Flats',
            value: data.allSold,
            fill: 'hsl(var(--chart-1))'
          },
          {
            name: 'Unsold Flats',
            value: data.allUnsold,
            fill: 'hsl(var(--chart-2))'
          }
        ];
        setChartData(chart);

      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data. Please try again.');
        
        // Fallback mock data for development
        const mockAnalytics: AnalyticsData = {
          totalFlats: 150,
          soldFlats: 95,
          unsoldFlats: 55,
          soldPercentage: "63.3%"
        };
        setAnalyticsData(mockAnalytics);
        
        const mockChart: ChartData[] = [
          {
            name: 'Sold Flats',
            value: 95,
            fill: 'hsl(var(--chart-1))'
          },
          {
            name: 'Unsold Flats',
            value: 55,
            fill: 'hsl(var(--chart-2))'
          }
        ];
        setChartData(mockChart);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchData();
    }
  }, [teamId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <p className="text-destructive">Failed to load analytics data</p>
            <p className="text-muted-foreground text-sm">Please check your connection and try again</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Link href="/analytics">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Analytics Hub
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights for Team {teamId}
        </p>
        {error && (
          <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 p-2 rounded">
            {error} (Showing sample data)
          </div>
        )}
      </div>
      
      {/* Overview Cards - 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCards data={analyticsData} />
      </div>
      
      {/* Single Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesDistributionChart data={chartData} />
        <div className="flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-lg p-8">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">More charts coming soon...</p>
            <p className="text-sm">Additional analytics will be added in Phase 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
