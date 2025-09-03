import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, TrendingUp, Building2, DollarSign } from "lucide-react";

export default function AnalyticsHomePage() {
  const demoTeams = [
    { id: 'team123', name: 'Team Alpha', flats: 150 },
    { id: 'team456', name: 'Team Beta', flats: 200 },
    { id: 'team789', name: 'Team Gamma', flats: 85 }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive real estate analytics and insights for your teams and projects
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Outstanding Cash Analytics */}
        <Card className="relative overflow-hidden border-2 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <CardTitle className="text-orange-900 dark:text-orange-100">Outstanding Cash</CardTitle>
            </div>
            <CardDescription>
              Financial analytics with payment tracking and outstanding amounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-2 py-1 rounded-full text-xs font-medium">
                ✓ Payment Tracking
              </span>
              <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium">
                ✓ Outstanding Amounts
              </span>
              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                ✓ Financial Overview
              </span>
            </div>
            <Link href="/outstanding-cash">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600">
                <DollarSign className="mr-2 h-4 w-4" />
                View Outstanding Cash
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Phase 1 Analytics */}
        <Card className="relative overflow-hidden border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PieChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-blue-900 dark:text-blue-100">Phase 1 Analytics</CardTitle>
            </div>
            <CardDescription>
              Simple, focused analytics with overview cards and pie chart
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                ✓ Overview Cards
              </span>
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                ✓ Pie Chart
              </span>
              <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                ✓ Live API Data
              </span>
            </div>
            <div className="space-y-2">
              {demoTeams.map((team) => (
                <Link key={team.id} href={`/analytics/${team.id}`}>
                  <Button variant="outline" className="w-full justify-between">
                    <span>{team.name}</span>
                    <span className="text-muted-foreground">{team.flats} flats</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Original Dashboard */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <CardTitle>Original Dashboard</CardTitle>
            </div>
            <CardDescription>
              Comprehensive dashboard with multiple charts and detailed analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 px-2 py-1 rounded-full text-xs font-medium">
                ✓ Multiple Charts
              </span>
              <span className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 px-2 py-1 rounded-full text-xs font-medium">
                ✓ Project Details
              </span>
              <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-1 rounded-full text-xs font-medium">
                ✓ Advanced Features
              </span>
            </div>
            <Link href="/dashboard">
              <Button className="w-full">
                <Building2 className="mr-2 h-4 w-4" />
                View Original Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Analytics Options Available</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-orange-600">💰</div>
                <div className="text-sm font-medium">Outstanding Cash</div>
                <div className="text-xs text-muted-foreground">Financial tracking</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-blue-600">📊</div>
                <div className="text-sm font-medium">Phase 1 Analytics</div>
                <div className="text-xs text-muted-foreground">Simple & focused</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">📈</div>
                <div className="text-sm font-medium">Original Dashboard</div>
                <div className="text-xs text-muted-foreground">Comprehensive view</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-green-600">🚀</div>
                <div className="text-sm font-medium">More Coming</div>
                <div className="text-xs text-muted-foreground">Phase 2 features</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
