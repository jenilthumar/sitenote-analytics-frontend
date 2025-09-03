"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextProps | null>(null)
function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a <ChartContainer />")
  return context
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { config: ChartConfig; children?: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"] }
>(({ className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const id = `chart-${uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div ref={ref} data-chart={id} className={cn("w-full h-[360px]", className)} {...props}>
        <ChartStyle id={id} config={config} />
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {React.isValidElement(children as React.ReactElement) ? (children as React.ReactElement) : <></>}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, c]) => c.theme || c.color)
  if (!colorConfig.length) return null

  const css = Object.entries(THEMES)
      .map(([theme, prefix]) => {
      const body = colorConfig
        .map(([key, itemConfig]) => {
          const ic = itemConfig as ChartConfig[string]
          const color = ic.theme?.[theme as keyof typeof ic.theme] || ic.color
          return color ? `  --color-${key}: ${color};` : null
        })
        .filter(Boolean)
        .join("\n")

      return `${prefix} [data-chart=${id}] {\n${body}\n}`
    })
    .join("\n")

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

export type TooltipPayloadItem = {
  name?: string
  value?: string | number | null
  color?: string
  dataKey?: string
  payload?: Record<string, unknown>
}

export interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
}

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, payload, label, className, ...props }, ref) => {
    if (!active || !payload || payload.length === 0) return null

    return (
      <div ref={ref} className={cn("rounded-lg border bg-background p-3 shadow-md", className)} {...props}>
        {label !== undefined && <div className="font-medium mb-2">{String(label)}</div>}
        <div className="grid gap-1">
          {payload.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-muted-foreground">{entry.name}: {entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export interface ChartLegendContentProps extends React.HTMLAttributes<HTMLDivElement> {
  hideIcon?: boolean
  payload?: Array<{ value?: string | number; dataKey?: string; color?: string }>
}

export const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(
  ({ className, hideIcon = false, payload, ...props }, ref) => {
    const { config } = useChart()
    if (!payload || payload.length === 0) return null

    return (
      <div ref={ref} className={cn("flex items-center justify-center gap-4", className)} {...props}>
        {payload.map((item, idx) => {
          const key = `${item.dataKey || item.value || "value"}`
          const itemConfig = config[key]
          return (
            <div key={idx} className="flex items-center gap-1.5">
              {!hideIcon ? <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} /> : null}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

export function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) return undefined
  const p = payload as Record<string, unknown>
  const inner = p.payload && typeof p.payload === "object" ? (p.payload as Record<string, unknown>) : undefined

  const labelKey = key in config ? key : inner && key in inner ? key : key
  return config[labelKey]
}

export const ChartTooltip = RechartsPrimitive.Tooltip
export const ChartLegend = RechartsPrimitive.Legend
export { ChartStyle }
