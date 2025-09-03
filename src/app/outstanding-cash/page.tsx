"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const OutstandingCashPage = () => {
  const [teamId, setTeamId] = useState('');
  const [totalOutstandingCash, setTotalOutstandingCash] = useState<number | null>(null);
  const [totalReceivedCash, setTotalReceivedCash] = useState<number | null>(null);
  const [projectWiseOutstandingCash, setProjectWiseOutstandingCash] = useState<Record<string, number> | null>(null);
  const [projectWiseReceivedCash, setProjectWiseReceivedCash] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [chartType, setChartType] = useState<'comparison' | 'stacked'>('comparison');

  // Smart currency formatting function
  const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) { // 1 crore or more
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) { // 1 lakh or more
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const fetchOutstandingCash = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://sitenote-analytics.vercel.app/api/payment/outstanding-cash/${teamId}`);
      const data = await res.json();
      setTotalOutstandingCash(data.totalOutstandingCash);
    } catch {
      setError('Failed to fetch total outstanding cash');
    }
    setLoading(false);
  };

  const fetchProjectWiseOutstandingCash = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://sitenote-analytics.vercel.app/api/payment/outstanding-cash-project/${teamId}`);
      const data = await res.json();
      setProjectWiseOutstandingCash(data.projectWiseOutstandingCash);
      setProjectWiseReceivedCash(data.projectWiseReceivedCash);
      
      // Calculate total received cash
      const totalReceived = Object.values(data.projectWiseReceivedCash || {}).reduce((sum: number, amount: unknown) => sum + Number(amount), 0);
      setTotalReceivedCash(totalReceived);
    } catch {
      setError('Failed to fetch project-wise outstanding cash');
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchProjectNames = async () => {
      try {
        const res = await fetch(`https://sitenote-analytics.vercel.app/api/project/getProjectsByTeamId/${teamId}`);
        const projects = await res.json();
        const mapping: Record<string, string> = {};
        projects.forEach((project: { projectId?: string; _id: string; projectName: string }) => {
          // Map both projectId and _id to handle different ID formats
          if (project.projectId) {
            mapping[project.projectId] = project.projectName;
          }
          mapping[project._id] = project.projectName;
        });
        setProjectNames(mapping);
        console.log('Project names mapping:', mapping); // Debug log
      } catch (error) {
        console.error('Error fetching project names:', error);
      }
    };
    if (teamId) {
      fetchOutstandingCash();
      fetchProjectWiseOutstandingCash();
      fetchProjectNames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  // Prepare data for table and chart
  const tableData =
    projectWiseOutstandingCash && Object.keys(projectWiseOutstandingCash).length > 0
      ? Object.entries(projectWiseOutstandingCash)
          .map(([projectId, amount]) => {
            const projectName = projectNames[projectId] || `Project ${projectId.substring(0, 8)}...`;
            console.log(`Mapping ${projectId} to ${projectName}`); // Debug log
            return {
              name: projectName,
              projectId: projectId, // Keep original ID for reference
              outstanding: Number(amount),
              received: Number((projectWiseReceivedCash && projectWiseReceivedCash[projectId]) || 0),
            };
          })
          .filter(row => row.outstanding >= 10000)
      : [];

  // Prepare data for stacked chart - shows received as portion of outstanding, remaining as gap
  const stackedData = tableData.map(row => {
    const received = row.received;
    const remaining = Math.max(0, row.outstanding - row.received);
    return {
      name: row.name,
      'Received Cash': received,
      'Outstanding Cash': remaining,
      outstanding: row.outstanding // Keep for reference
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Outstanding Cash Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Track and analyze outstanding payments across projects
            </p>
          </div>
          <ModeToggle />
        </div>

        {/* Team ID Input */}
        <Card>
          <CardHeader>
            <CardTitle>Team Configuration</CardTitle>
            <CardDescription>
              Enter your team ID to load outstanding cash data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="teamId">Team ID</Label>
                <Input
                  id="teamId"
                  type="text"
                  value={teamId}
                  onChange={e => setTeamId(e.target.value)}
                  placeholder="Enter Team ID"
                />
              </div>
              <Button 
                onClick={() => {
                  if (teamId) {
                    fetchOutstandingCash();
                    fetchProjectWiseOutstandingCash();
                  }
                }}
                disabled={!teamId || loading}
                className="mt-6"
              >
                {loading ? 'Loading...' : 'Fetch Data'}
              </Button>
            </div>
            {error && (
              <div className="text-destructive text-sm font-medium">{error}</div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {typeof totalOutstandingCash === 'number' && typeof totalReceivedCash === 'number' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Outstanding Cash */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-700 dark:text-red-300 text-lg">Total Outstanding Cash</CardTitle>
                <CardDescription>
                  Amount pending collection across all projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  ₹{totalOutstandingCash.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* Total Received Cash */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-700 dark:text-green-300 text-lg">Total Received Cash</CardTitle>
                <CardDescription>
                  Amount successfully collected from all projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ₹{totalReceivedCash.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* Due Cash */}
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-700 dark:text-amber-300 text-lg">Due Cash</CardTitle>
                <CardDescription>
                  Net amount remaining to be collected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  ₹{(totalOutstandingCash - totalReceivedCash).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {totalOutstandingCash > 0 ? 
                    `${(((totalOutstandingCash - totalReceivedCash) / totalOutstandingCash) * 100).toFixed(1)}% of total` 
                    : '0% of total'
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Project-wise Data */}
        {tableData.length > 0 && (
          <div className="space-y-6">
            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>Project-wise Outstanding Cash</CardTitle>
                <CardDescription>
                  Detailed breakdown of outstanding and received cash by project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead className="text-right">Outstanding Cash</TableHead>
                      <TableHead className="text-right">Received Cash</TableHead>
                      <TableHead className="text-right">Completion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row) => {
                      const completionRate = ((row.received / row.outstanding) * 100);
                      return (
                        <TableRow key={row.name}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell className="text-right font-mono">
                            ₹{row.outstanding.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ₹{row.received.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={completionRate > 80 ? "default" : completionRate > 50 ? "secondary" : "destructive"}>
                              {completionRate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Charts */}
            <Card className="chart-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cash Flow Visualization</CardTitle>
                    <CardDescription>
                      Visual representation of outstanding vs received cash
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="chartType">Chart Type:</Label>
                    <Select value={chartType} onValueChange={(value: 'comparison' | 'stacked') => setChartType(value)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comparison">Side-by-Side Comparison</SelectItem>
                        <SelectItem value="stacked">Stacked Bar Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  config={{
                    outstanding: {
                      label: "Outstanding Cash",
                      color: "hsl(var(--chart-1))",
                    },
                    received: {
                      label: "Received Cash",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[600px] w-full"
                >
                  {chartType === 'comparison' ? (
                    <BarChart 
                      data={tableData} 
                      margin={{ top: 40, right: 40, left: 80, bottom: 120 }}
                      accessibilityLayer
                    >
                      <defs>
                        <linearGradient id="outstandingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#dc2626" stopOpacity={0.7}/>
                        </linearGradient>
                        <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.7}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="hsl(var(--border))"
                        strokeOpacity={0.3}
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="name" 
                        interval={0} 
                        angle={-45} 
                        textAnchor="end" 
                        height={120}
                        tick={{ 
                          fontSize: 11, 
                          fill: 'hsl(var(--foreground))',
                          fontWeight: 500
                        }}
                        axisLine={{
                          stroke: 'hsl(var(--border))',
                          strokeWidth: 1
                        }}
                        tickLine={{
                          stroke: 'hsl(var(--border))',
                          strokeWidth: 1
                        }}
                      />
                      <YAxis 
                        tick={{ 
                          fontSize: 11, 
                          fill: 'hsl(var(--foreground))',
                          fontWeight: 500
                        }}
                        tickFormatter={(value) => {
                          if (value >= 10000000) {
                            return `₹${(value / 10000000).toFixed(1)}Cr`;
                          } else if (value >= 100000) {
                            return `₹${(value / 100000).toFixed(1)}L`;
                          }
                          return `₹${(value / 1000).toFixed(0)}K`;
                        }}
                        axisLine={{
                          stroke: 'hsl(var(--border))',
                          strokeWidth: 1
                        }}
                        tickLine={{
                          stroke: 'hsl(var(--border))',
                          strokeWidth: 1
                        }}
                        width={70}
                      />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-xl min-w-[240px]">
                                <div className="space-y-2">
                                  <div className="font-semibold text-sm text-foreground border-b border-border/50 pb-2">
                                    {label}
                                  </div>
                                  {payload.map((entry, index) => {
                                    const isOutstanding = entry.dataKey === 'outstanding';
                                    const gradientColor = isOutstanding ? '#ef4444' : '#10b981';
                                    return (
                                      <div key={index} className="flex items-center justify-between gap-3 py-1">
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="h-3 w-3 rounded-full shadow-sm" 
                                            style={{ 
                                              background: `linear-gradient(135deg, ${gradientColor}, ${isOutstanding ? '#dc2626' : '#059669'})`,
                                              border: '1px solid rgba(255,255,255,0.2)'
                                            }}
                                          />
                                          <span className="text-xs font-medium text-foreground">
                                            {entry.name}
                                          </span>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-foreground">
                                          ₹{Number(entry.value).toLocaleString()}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  {payload.length > 1 && (
                                    <div className="border-t border-border/50 pt-2 mt-1">
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-muted-foreground">Collection Rate:</span>
                                        <span className="font-bold text-green-600">
                                          {((Number(payload.find(p => p.dataKey === 'received')?.value || 0) / 
                                            Number(payload.find(p => p.dataKey === 'outstanding')?.value || 1)) * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ChartLegend 
                        wrapperStyle={{
                          paddingTop: '25px'
                        }}
                        iconType="circle"
                        formatter={(value) => (
                          <span style={{ 
                            fontWeight: 600, 
                            fontSize: '14px',
                            color: 'hsl(var(--foreground))'
                          }}>
                            {value}
                          </span>
                        )}
                      />
                      <Bar 
                        dataKey="outstanding" 
                        fill="url(#outstandingGradient)"
                        radius={[8, 8, 0, 0]} 
                        name="Outstanding Cash"
                        stroke="#dc2626"
                        strokeWidth={2}
                        strokeOpacity={0.8}
                      />
                      <Bar 
                        dataKey="received" 
                        fill="url(#receivedGradient)"
                        radius={[8, 8, 0, 0]} 
                        name="Received Cash"
                        stroke="#059669"
                        strokeWidth={2}
                        strokeOpacity={0.8}
                      />
                    </BarChart>
                  ) : (
                    <BarChart 
                      data={stackedData} 
                      margin={{ top: 40, right: 40, left: 80, bottom: 120 }}
                      barGap={8}
                      barCategoryGap={20}
                    >
                      <defs>
                        <linearGradient id="stackedReceivedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                        </linearGradient>
                        <linearGradient id="stackedOutstandingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="hsl(var(--border))"
                        strokeOpacity={0.3}
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="name" 
                        interval={0} 
                        angle={-45} 
                        textAnchor="end" 
                        height={120}
                        tick={{ 
                          fontSize: 11, 
                          fill: 'hsl(var(--foreground))',
                          fontWeight: 500
                        }}
                        axisLine={{
                          stroke: 'hsl(var(--border))',
                          strokeWidth: 1
                        }}
                        tickLine={{
                          stroke: 'hsl(var(--border))',
                          strokeWidth: 1
                        }}
                      />
                      <YAxis 
                        tick={{ 
                          fontSize: 11, 
                          fill: 'hsl(var(--foreground))',
                          fontWeight: 500
                        }}
                        tickFormatter={(value) => {
                          if (value >= 10000000) {
                            return `₹${(value / 10000000).toFixed(1)}Cr`;
                          } else if (value >= 100000) {
                            return `₹${(value / 100000).toFixed(1)}L`;
                          }
                          return `₹${(value / 1000).toFixed(0)}K`;
                        }}
                        axisLine={{
                          stroke: 'hsl(var(--border))',
                          strokeWidth: 1
                        }}
                        tickLine={{
                          stroke: 'hsl(var(--border))',
                          strokeWidth: 1
                        }}
                        width={70}
                      />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const total = payload.reduce((sum, entry) => sum + Number(entry.value), 0);
                            const receivedAmount = Number(payload.find(p => p.dataKey === 'Received Cash')?.value || 0);
                            const outstandingAmount = Number(payload.find(p => p.dataKey === 'Outstanding Cash')?.value || 0);
                            const completionRate = ((receivedAmount / (receivedAmount + outstandingAmount)) * 100);
                            
                            return (
                              <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-xl min-w-[240px]">
                                <div className="space-y-2">
                                  <div className="font-semibold text-sm text-foreground border-b border-border/50 pb-2">
                                    {label}
                                  </div>
                                  {payload.reverse().map((entry, index) => {
                                    const isReceived = entry.dataKey === 'Received Cash';
                                    const gradientColor = isReceived ? '#3b82f6' : '#f59e0b';
                                    const gradientEndColor = isReceived ? '#1d4ed8' : '#d97706';
                                    return (
                                      <div key={index} className="flex items-center justify-between gap-3 py-1">
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="h-3 w-3 rounded-full shadow-sm" 
                                            style={{ 
                                              background: `linear-gradient(135deg, ${gradientColor}, ${gradientEndColor})`,
                                              border: '1px solid rgba(255,255,255,0.2)'
                                            }}
                                          />
                                          <span className="text-xs font-medium text-foreground">
                                            {entry.name}
                                          </span>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-foreground">
                                          ₹{Number(entry.value).toLocaleString()}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  <div className="border-t border-border/50 pt-2 mt-1 space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="font-medium text-muted-foreground">Total Value:</span>
                                      <span className="font-bold text-foreground">₹{total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="font-medium text-muted-foreground">Completion:</span>
                                      <span className="font-bold text-green-600">{completionRate.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ChartLegend 
                        wrapperStyle={{
                          paddingTop: '25px'
                        }}
                        iconType="circle"
                        formatter={(value) => (
                          <span style={{ 
                            fontWeight: 600, 
                            fontSize: '14px',
                            color: 'hsl(var(--foreground))'
                          }}>
                            {value}
                          </span>
                        )}
                      />
                      <Bar 
                        dataKey="Received Cash" 
                        stackId="a" 
                        fill="url(#stackedReceivedGradient)"
                        radius={[0, 0, 8, 8]} 
                        name="Received Cash"
                        stroke="#1d4ed8"
                        strokeWidth={2}
                        strokeOpacity={0.8}
                      />
                      <Bar 
                        dataKey="Outstanding Cash" 
                        stackId="a" 
                        fill="url(#stackedOutstandingGradient)"
                        radius={[8, 8, 0, 0]} 
                        name="Outstanding Cash"
                        stroke="#d97706"
                        strokeWidth={2}
                        strokeOpacity={0.8}
                      />
                    </BarChart>
                  )}
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutstandingCashPage;
