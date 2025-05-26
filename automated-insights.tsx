"use client"
import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { PopoverClose } from "@radix-ui/react-popover"

interface AutomatedInsightsProps {
  data: any
}

export default function AutomatedInsights({ data }: AutomatedInsightsProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const dailyData = useMemo(() => {
    if (!data || !data.length) return []

    const formattedDate = date ? format(date, "yyyy-MM-dd") : null

    return data.filter((item: any) => {
      const itemDate = item.date.split("T")[0]
      return itemDate === formattedDate
    })
  }, [data, date])

  const totalImpressions = useMemo(() => {
    return dailyData.reduce((sum: number, item: any) => sum + item.impressions, 0)
  }, [dailyData])

  const totalClicks = useMemo(() => {
    return dailyData.reduce((sum: number, item: any) => sum + item.clicks, 0)
  }, [dailyData])

  const totalCost = useMemo(() => {
    return dailyData.reduce((sum: number, item: any) => sum + item.cost, 0)
  }, [dailyData])

  const totalConversions = useMemo(() => {
    return dailyData.reduce((sum: number, item: any) => sum + item.conversions, 0)
  }, [dailyData])

  const campaignPerformanceData = useMemo(() => {
    if (!dailyData || !dailyData.length) return []

    const campaignData: { [key: string]: any } = {}

    dailyData.forEach((item: any) => {
      const campaignName = item.campaign
      if (!campaignData[campaignName]) {
        campaignData[campaignName] = {
          impressions: 0,
          clicks: 0,
          cost: 0,
          conversions: 0,
        }
      }
      campaignData[campaignName].impressions += item.impressions
      campaignData[campaignName].clicks += item.clicks
      campaignData[campaignName].cost += item.cost
      campaignData[campaignName].conversions += item.conversions
    })

    return Object.entries(campaignData).map(([campaign, values]) => ({
      campaign,
      ...values,
    }))
  }, [dailyData])

  const topCampaign = useMemo(() => {
    if (!campaignPerformanceData || campaignPerformanceData.length === 0) {
      return null
    }

    return campaignPerformanceData.reduce((maxCampaign, currentCampaign) => {
      return currentCampaign.impressions > maxCampaign.impressions ? currentCampaign : maxCampaign
    }, campaignPerformanceData[0])
  }, [campaignPerformanceData])

  const chartData = useMemo(() => {
    if (!dailyData || dailyData.length === 0) {
      return []
    }

    return dailyData.map((item: any) => ({
      time: item.time,
      impressions: item.impressions,
    }))
  }, [dailyData])

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Automated Insights</CardTitle>
          <CardDescription>Key metrics and insights from your marketing data.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Impressions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpressions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConversions}</div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Performance Chart</CardTitle>
          <CardDescription>Impressions over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="impressions" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Performance metrics for each campaign.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Campaign</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Conversions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignPerformanceData.map((campaign: any) => (
                <TableRow key={campaign.campaign}>
                  <TableCell className="font-medium">{campaign.campaign}</TableCell>
                  <TableCell>{campaign.impressions}</TableCell>
                  <TableCell>{campaign.clicks}</TableCell>
                  <TableCell>${campaign.cost.toFixed(2)}</TableCell>
                  <TableCell>{campaign.conversions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Campaign</CardTitle>
          <CardDescription>Details of the campaign with the most impressions.</CardDescription>
        </CardHeader>
        <CardContent>
          {topCampaign ? (
            <div>
              <p>
                <strong>Campaign:</strong> {topCampaign.campaign}
              </p>
              <p>
                <strong>Impressions:</strong> {topCampaign.impressions}
              </p>
              <p>
                <strong>Clicks:</strong> {topCampaign.clicks}
              </p>
              <p>
                <strong>Cost:</strong> ${topCampaign.cost.toFixed(2)}
              </p>
              <p>
                <strong>Conversions:</strong> {topCampaign.conversions}
              </p>
            </div>
          ) : (
            <p>No campaign data available for the selected date.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>Choose a date to view insights for.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date > new Date() || date < new Date("2023-01-01")}
                initialFocus
              />
              <PopoverClose>
                <Button className="w-full" variant={"secondary"}>
                  Close
                </Button>
              </PopoverClose>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
    </div>
  )
}
