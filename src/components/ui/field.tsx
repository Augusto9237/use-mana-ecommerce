"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <div
      data-slot="field"
      data-orientation={orientation}
      className={cn(
        "has-data-[slot=field-label]:has-data-[slot=radio-group-item]:cursor-pointer rounded-lg border bg-card p-4 shadow-xs transition-colors",
        "has-data-[slot=radio-group-item][data-checked]:border-primary has-data-[slot=radio-group-item][data-checked]:bg-primary/5",
        "hover:border-primary/50 hover:bg-muted/30",
        orientation === "horizontal"
          ? "flex items-center gap-4"
          : "flex flex-col gap-2",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="field-label"
      className={cn(
        "block cursor-pointer text-sm font-medium leading-none select-none",
        className
      )}
      {...props}
    />
  )
}

function FieldContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("flex flex-1 flex-col gap-1", className)}
      {...props}
    />
  )
}

function FieldTitle({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export { Field, FieldLabel, FieldContent, FieldTitle, FieldDescription }
