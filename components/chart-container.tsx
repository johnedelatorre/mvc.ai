"use client"

import React from "react"

interface ChartContainerProps {
  children: React.ReactNode
  config: {
    [key: string]: {
      label: string
      color: string
    }
  }
  className?: string
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ children, config, className }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child as React.ReactElement, { config })
      })}
    </div>
  )
}
