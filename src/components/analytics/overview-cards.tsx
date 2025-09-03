import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, Circle, TrendingUp } from "lucide-react";

interface AnalyticsData {
  totalFlats: number;
  soldFlats: number;
  unsoldFlats: number;
  soldPercentage: string;
}

interface OverviewCardsProps {
  data: AnalyticsData;
}

export default function OverviewCards({ data }: OverviewCardsProps) {
  const cards = [
    {
      title: "Total Flats",
      value: data.totalFlats.toLocaleString(),
      icon: Building2,
      description: "Total inventory",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Sold Flats",
      value: data.soldFlats.toLocaleString(),
      icon: CheckCircle,
      description: "Successfully sold",
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Unsold Flats",
      value: data.unsoldFlats.toLocaleString(),
      icon: Circle,
      description: "Available for sale",
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      title: "Sold Percentage",
      value: data.soldPercentage,
      icon: TrendingUp,
      description: "Sales performance",
      color: "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <>
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
