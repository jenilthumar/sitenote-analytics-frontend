'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Building, TrendingUp, Users, RefreshCw, BarChart3 } from 'lucide-react';

// Data interfaces
interface FlatData {
  flatId: string;
  projectId: string;
  projectName: string;
  flatNumber: string;
  type: string;
  size: number;
  price: number;
  status: 'sold' | 'unsold' | 'reserved';
  soldDate?: string;
  buyerName?: string;
}

interface FlatsAnalyticsData {
  totalFlats: number;
  soldFlats: number;
  unsoldFlats: number;
  reservedFlats: number;
  sellRate: number;
  averagePrice: number;
  totalRevenue: number;
  projectWise: Array<{
    projectId: string;
    projectName: string;
    totalFlats: number;
    soldFlats: number;
    unsoldFlats: number;
    sellRate: number;
    averagePrice: number;
  }>;
  flatsByType: Array<{
    type: string;
    total: number;
    sold: number;
    unsold: number;
    averagePrice: number;
  }>;
  flats: FlatData[];
}

// API Data interfaces
interface ApiFlat {
  _id?: string;
  flatId?: string;
  projectId?: string;
  projectName?: string;
  series?: string;
  bhkSize?: string;
  squareFeet?: number;
  customerName?: string;
  isSold?: boolean;
  status?: string;
}

interface ApiAnalyticsData {
  flats?: {
    total?: number;
    sold?: number;
    unsold?: number;
    sellRate?: number;
  };
  projectWise?: Array<{
    projectId?: string;
    name?: string;
    projectName?: string;
    totalFlats?: number;
    soldFlats?: number;
    unsoldFlats?: number;
    sellRate?: number;
  }>;
}

// Generate mock flats data for demonstration
const generateMockFlatsData = (): FlatsAnalyticsData => {
  const projects = ['Sunrise Apartments', 'Green Valley', 'Metro Heights', 'Royal Gardens'];
  const flatTypes = ['1BHK', '2BHK', '3BHK', '4BHK'];
  const statuses: ('sold' | 'unsold' | 'reserved')[] = ['sold', 'unsold', 'reserved'];
  
  const flats: FlatData[] = [];
  
  // Generate mock flats
  projects.forEach((project, projIndex) => {
    for (let i = 1; i <= 20; i++) {
      const flatType = flatTypes[Math.floor(Math.random() * flatTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const basePrice = flatType === '1BHK' ? 2500000 : flatType === '2BHK' ? 4000000 : flatType === '3BHK' ? 6000000 : 8000000;
      const price = basePrice + (Math.random() * 1000000);
      
      flats.push({
        flatId: `flat_${projIndex}_${i}`,
        projectId: `proj_${projIndex}`,
        projectName: project,
        flatNumber: `${String.fromCharCode(65 + projIndex)}${i.toString().padStart(3, '0')}`,
        type: flatType,
        size: flatType === '1BHK' ? 650 : flatType === '2BHK' ? 950 : flatType === '3BHK' ? 1200 : 1500,
        price,
        status,
        soldDate: status === 'sold' ? '2024-06-15' : undefined,
        buyerName: status === 'sold' ? `Buyer ${i}` : undefined
      });
    }
  });
  
  // Calculate analytics
  const totalFlats = flats.length;
  const soldFlats = flats.filter(f => f.status === 'sold').length;
  const unsoldFlats = flats.filter(f => f.status === 'unsold').length;
  const reservedFlats = flats.filter(f => f.status === 'reserved').length;
  const sellRate = (soldFlats / totalFlats) * 100;
  const totalRevenue = flats.filter(f => f.status === 'sold').reduce((sum, f) => sum + f.price, 0);
  const averagePrice = flats.reduce((sum, f) => sum + f.price, 0) / flats.length;
  
  // Project-wise analysis
  const projectWise = projects.map((project, index) => {
    const projectFlats = flats.filter(f => f.projectId === `proj_${index}`);
    const projectSold = projectFlats.filter(f => f.status === 'sold').length;
    const projectUnsold = projectFlats.filter(f => f.status === 'unsold').length;
    const projectAvgPrice = projectFlats.reduce((sum, f) => sum + f.price, 0) / projectFlats.length;
    
    return {
      projectId: `proj_${index}`,
      projectName: project,
      totalFlats: projectFlats.length,
      soldFlats: projectSold,
      unsoldFlats: projectUnsold,
      sellRate: (projectSold / projectFlats.length) * 100,
      averagePrice: projectAvgPrice
    };
  });
  
  // Type-wise analysis
  const flatsByType = flatTypes.map(type => {
    const typeFlats = flats.filter(f => f.type === type);
    const sold = typeFlats.filter(f => f.status === 'sold').length;
    const unsold = typeFlats.filter(f => f.status === 'unsold').length;
    const avgPrice = typeFlats.reduce((sum, f) => sum + f.price, 0) / typeFlats.length;
    
    return {
      type,
      total: typeFlats.length,
      sold,
      unsold,
      averagePrice: avgPrice
    };
  });
  
  return {
    totalFlats,
    soldFlats,
    unsoldFlats,
    reservedFlats,
    sellRate,
    averagePrice,
    totalRevenue,
    projectWise,
    flatsByType,
    flats
  };
};

// Transform real API data to our interface
const transformApiDataToFlatsAnalytics = (apiFlats: ApiFlat[]): FlatsAnalyticsData => {
  // Transform API flats to our FlatData interface
  const flats: FlatData[] = apiFlats.map((apiFlat, index) => {
    // Determine status based on API data
    let status: 'sold' | 'unsold' | 'reserved' = 'unsold';
    if (apiFlat.customerName && apiFlat.customerName.trim() !== '') {
      status = 'sold';
    } else if (apiFlat.isSold) {
      status = 'sold';
    } else if (apiFlat.status === 'reserved') {
      status = 'reserved';
    }
    
    // Calculate estimated price based on flat size and type
    const basePrice = apiFlat.bhkSize === '1BHK' ? 2500000 : 
                     apiFlat.bhkSize === '2BHK' ? 4000000 : 
                     apiFlat.bhkSize === '3BHK' ? 6000000 : 8000000;
    const price = apiFlat.squareFeet ? basePrice + (apiFlat.squareFeet * 2000) : basePrice;
    
    return {
      flatId: apiFlat._id || apiFlat.flatId || `flat_${index}`,
      projectId: apiFlat.projectId || `proj_${index}`,
      projectName: apiFlat.projectName || `Project ${index + 1}`,
      flatNumber: apiFlat.series || apiFlat.flatId || `A${index.toString().padStart(3, '0')}`,
      type: apiFlat.bhkSize || '2BHK',
      size: apiFlat.squareFeet || 950,
      price,
      status,
      soldDate: status === 'sold' ? new Date().toISOString().split('T')[0] : undefined,
      buyerName: apiFlat.customerName || undefined
    };
  });
  
  // Calculate analytics
  const totalFlats = flats.length;
  const soldFlats = flats.filter(f => f.status === 'sold').length;
  const unsoldFlats = flats.filter(f => f.status === 'unsold').length;
  const reservedFlats = flats.filter(f => f.status === 'reserved').length;
  const sellRate = totalFlats > 0 ? (soldFlats / totalFlats) * 100 : 0;
  const totalRevenue = flats.filter(f => f.status === 'sold').reduce((sum, f) => sum + f.price, 0);
  const averagePrice = flats.length > 0 ? flats.reduce((sum, f) => sum + f.price, 0) / flats.length : 0;
  
  // Project-wise analysis
  const projectMap = new Map<string, { projectId: string; projectName: string; flats: FlatData[] }>();
  flats.forEach(flat => {
    const key = flat.projectId;
    if (!projectMap.has(key)) {
      projectMap.set(key, {
        projectId: flat.projectId,
        projectName: flat.projectName,
        flats: []
      });
    }
    projectMap.get(key)!.flats.push(flat);
  });
  
  const projectWise = Array.from(projectMap.values()).map(project => {
    const projectFlats = project.flats;
    const projectSold = projectFlats.filter(f => f.status === 'sold').length;
    const projectUnsold = projectFlats.filter(f => f.status === 'unsold').length;
    const projectAvgPrice = projectFlats.length > 0 
      ? projectFlats.reduce((sum, f) => sum + f.price, 0) / projectFlats.length 
      : 0;
    
    return {
      projectId: project.projectId,
      projectName: project.projectName,
      totalFlats: projectFlats.length,
      soldFlats: projectSold,
      unsoldFlats: projectUnsold,
      sellRate: projectFlats.length > 0 ? (projectSold / projectFlats.length) * 100 : 0,
      averagePrice: projectAvgPrice
    };
  });
  
  // Type-wise analysis
  const flatTypes = ['1BHK', '2BHK', '3BHK', '4BHK'];
  const flatsByType = flatTypes.map(type => {
    const typeFlats = flats.filter(f => f.type === type);
    const sold = typeFlats.filter(f => f.status === 'sold').length;
    const unsold = typeFlats.filter(f => f.status === 'unsold').length;
    const avgPrice = typeFlats.length > 0 
      ? typeFlats.reduce((sum, f) => sum + f.price, 0) / typeFlats.length 
      : 0;
    
    return {
      type,
      total: typeFlats.length,
      sold,
      unsold,
      averagePrice: avgPrice
    };
  }).filter(item => item.total > 0); // Only include types that exist
  
  return {
    totalFlats,
    soldFlats,
    unsoldFlats,
    reservedFlats,
    sellRate,
    averagePrice,
    totalRevenue,
    projectWise,
    flatsByType,
    flats
  };
};

// Transform analytics data to our interface
const transformAnalyticsDataToFlatsAnalytics = (analyticsData: ApiAnalyticsData): FlatsAnalyticsData => {
  const mockFlats = generateMockFlatsData();
  
  // Override with real analytics data
  if (analyticsData.flats) {
    mockFlats.totalFlats = analyticsData.flats.total || 0;
    mockFlats.soldFlats = analyticsData.flats.sold || 0;
    mockFlats.unsoldFlats = analyticsData.flats.unsold || 0;
    mockFlats.reservedFlats = 0; // Analytics doesn't have reserved count
    mockFlats.sellRate = analyticsData.flats.sellRate || 0;
  }
  
  // Override project data if available
  if (analyticsData.projectWise && Array.isArray(analyticsData.projectWise)) {
    mockFlats.projectWise = analyticsData.projectWise.map((project) => ({
      projectId: project.projectId || '',
      projectName: project.name || project.projectName || '',
      totalFlats: project.totalFlats || 0,
      soldFlats: project.soldFlats || 0,
      unsoldFlats: project.unsoldFlats || 0,
      sellRate: project.sellRate || 0,
      averagePrice: 4500000 // Default average price
    }));
  }
  
  return mockFlats;
};

export default function FlatsAnalyticsPage() {
  const [flatsData, setFlatsData] = useState<FlatsAnalyticsData>(generateMockFlatsData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamId, setTeamId] = useState("2acd2ec8-5532-4710-bcc0-5c467b96b44a");

  const fetchFlatsData = useCallback(async () => {
    if (!teamId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching flats data for team:', teamId);
      
      // Try to fetch from the flats endpoint first
      const response = await fetch(`https://sitenote-analytics.vercel.app/api/flats/getallteamflats/${teamId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.log(`Flats endpoint failed with status: ${response.status}, trying analytics endpoint`);
        // Fallback to analytics endpoint
        const altResponse = await fetch(`https://sitenote-analytics.vercel.app/api/analytics/${teamId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!altResponse.ok) {
          console.log(`Analytics endpoint also failed with status: ${altResponse.status}, using mock data`);
          // Both endpoints failed, use mock data
          const mockData = generateMockFlatsData();
          setFlatsData(mockData);
          setError('Could not connect to server. Showing sample data.');
          return;
        }
        
        const analyticsData = await altResponse.json();
        console.log('Analytics data received successfully:', analyticsData);
        const transformedData = transformAnalyticsDataToFlatsAnalytics(analyticsData);
        setFlatsData(transformedData);
        setError('Using analytics data (flats endpoint unavailable)');
        return;
      }
      
      const flatsResponse = await response.json();
      console.log('Raw flats data received successfully:', flatsResponse);
      
      // Handle different response formats
      let flats = [];
      if (flatsResponse.flats) {
        flats = flatsResponse.flats;
      } else if (Array.isArray(flatsResponse)) {
        flats = flatsResponse;
      } else if (flatsResponse.data) {
        flats = flatsResponse.data;
      }
      
      if (flats.length === 0) {
        // Use mock data if no flats found
        console.log('No flats found, using mock data');
        const mockData = generateMockFlatsData();
        setFlatsData(mockData);
        return;
      }
      
      // Transform API data to our interface
      const analyticsData = transformApiDataToFlatsAnalytics(flats);
      setFlatsData(analyticsData);
      console.log('Successfully transformed and set flats data');
      
    } catch (error) {
      console.error('Failed to fetch flats data:', error);
      setError('Failed to load flats data. Using sample data.');
      // Use mock data as fallback
      const mockData = generateMockFlatsData();
      setFlatsData(mockData);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchFlatsData();
  }, [fetchFlatsData]);

  const pieData = [
    { name: 'Sold', value: flatsData.soldFlats, color: '#22c55e' },
    { name: 'Unsold', value: flatsData.unsoldFlats, color: '#6b7280' },
    { name: 'Reserved', value: flatsData.reservedFlats, color: '#3b82f6' }
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flats Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for your property inventory
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => window.open('/analytics', '_blank')} 
            variant="default"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics Hub
          </Button>
          <Button 
            onClick={() => window.open('/analytics/team123', '_blank')} 
            variant="outline"
          >
            Phase 1 Analytics
          </Button>
          <Button onClick={fetchFlatsData} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Team ID Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="teamId">Team ID</Label>
              <Input
                id="teamId"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="Enter team ID"
              />
            </div>
            <Button onClick={fetchFlatsData} disabled={!teamId || loading}>
              {loading ? 'Loading...' : 'Load Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flats</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flatsData.totalFlats}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flats Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{flatsData.soldFlats}</div>
            <p className="text-xs text-muted-foreground">
              {flatsData.sellRate.toFixed(1)}% sell rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flats Unsold</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{flatsData.unsoldFlats}</div>
            <p className="text-xs text-muted-foreground">
              Available for sale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Distribution</CardTitle>
            <CardDescription>
              Current status of all flats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sold: {
                  label: "Sold",
                  color: "hsl(var(--chart-1))",
                },
                unsold: {
                  label: "Unsold", 
                  color: "hsl(var(--chart-2))",
                },
                reserved: {
                  label: "Reserved",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="var(--color-sold)"
                  strokeWidth={2}
                >
                  <Cell fill="var(--color-sold)" />
                  <Cell fill="var(--color-unsold)" />
                  <Cell fill="var(--color-reserved)" />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Performance</CardTitle>
            <CardDescription>
              Sales performance across all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                soldFlats: {
                  label: "Sold Flats",
                  color: "hsl(var(--chart-1))",
                },
                unsoldFlats: {
                  label: "Unsold Flats",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart
                accessibilityLayer
                data={flatsData.projectWise}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="projectName"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="soldFlats" fill="var(--color-soldFlats)" radius={4} />
                <Bar dataKey="unsoldFlats" fill="var(--color-unsoldFlats)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
