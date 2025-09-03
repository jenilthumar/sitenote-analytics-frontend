import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

interface SalesDistributionChartProps {
  data: ChartData[];
}

const chartConfig = {
  sold: {
    label: "Sold Flats",
    color: "hsl(var(--chart-1))",
  },
  unsold: {
    label: "Unsold Flats",
    color: "hsl(var(--chart-2))",
  },
};

export default function SalesDistributionChart({ data }: SalesDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Sales Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Breakdown of sold vs unsold flats
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={4}
                strokeWidth={2}
                stroke="hsl(var(--background))"
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                    }}
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number, name: string) => [
                  `${value} flats (${((value / total) * 100).toFixed(1)}%)`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
