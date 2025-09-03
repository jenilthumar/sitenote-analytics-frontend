"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Chart Container
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config?: Record<string, unknown>
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ children, className, ...props }, ref) => {
  return (
    <div
      data-chart=""
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      )}
      {...props}
    >
      <RechartsPrimitive.ResponsiveContainer>
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "Chart"

// Chart Tooltip
const ChartTooltip = RechartsPrimitive.Tooltip

// Chart Tooltip Content
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      if (labelFormatter) {
        return labelFormatter(label, payload)
      }

      return label
    }, [label, labelFormatter, payload, hideLabel, labelKey])

    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {tooltipLabel ? (
          <div className={cn("font-medium", labelClassName)}>
            {tooltipLabel}
          </div>
        ) : null}
        {payload.map((item) => {
          const itemFormatter = formatter || ((value) => 
            typeof value === "number" ? value.toLocaleString() : value
          )

          return (
            <div
              key={item.dataKey}
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center"
              )}
            >
              {!hideIndicator && (
                <div
                  className={cn("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]")}
                  style={
                    {
                      "--color-bg": item.color,
                      "--color-border": item.color,
                    } as React.CSSProperties
                  }
                >
                  {indicator === "dot" && (
                    <div className="h-2.5 w-2.5" />
                  )}
                  {indicator === "line" && (
                    <div className="w-4 h-[3px]" />
                  )}
                  {indicator === "dashed" && (
                    <div className="w-4 h-[3px] bg-[length:3px_3px] bg-repeat-x" style={{
                      backgroundImage: `linear-gradient(90deg, var(--color-bg) 0%, var(--color-bg) 50%, transparent 50%, transparent 100%)`
                    }} />
                  )}
                </div>
              )}
              <div className={cn("flex flex-1 justify-between leading-none")}>
                <div className="grid gap-1.5">
                  <span className="text-muted-foreground">
                    {item.name}
                  </span>
                </div>
                <span className="font-mono font-medium text-foreground">
                  {itemFormatter(item.value, item.name)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// Chart Legend
const ChartLegend = RechartsPrimitive.Legend

// Chart Legend Content
const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  ({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" && "pb-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.value || item.dataKey || "value"}`

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {!hideIcon && (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              <span className="text-muted-foreground">{item.value}</span>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
