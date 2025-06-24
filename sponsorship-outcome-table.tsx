"use client"
import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faEllipsisV,
  faEye,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faDownload,
  faCog,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons"

type SortConfig = {
  key: string
  direction: "asc" | "desc"
} | null

interface SponsorshipOutcomeTableProps {
  data: Array<{
    id: number
    dateObj: Date
    placements: string
    placementTypes: string
    platforms: string
    sponsors: string
    smv: number
    fmv: number
    impressions: number
    views: number
    videoViews: number
  }>
}

export default function SponsorshipOutcomeTable({ data }: SponsorshipOutcomeTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const itemsPerPage = 10

  // Transform data for property opportunity scores
  const baseData = useMemo(() => {
    const sportsTeams = [
      {
        rank: 1,
        propertyName: "Los Angeles Lakers",
        opportunityScore: 26,
        engagement: "45%",
        intensity: "35%",
        momentum: "23%",
        passion: "16%",
        excitement: "35%",
        consideration: "14%",
        favorability: "13%",
      },
      {
        rank: 2,
        propertyName: "New York Yankees",
        opportunityScore: 12,
        engagement: "31%",
        intensity: "29%",
        momentum: "13%",
        passion: "10%",
        excitement: "24%",
        consideration: "10%",
        favorability: "8%",
      },
      {
        rank: 3,
        propertyName: "Boston Celtics",
        opportunityScore: 12,
        engagement: "33%",
        intensity: "32%",
        momentum: "11%",
        passion: "9%",
        excitement: "20%",
        consideration: "8%",
        favorability: "7%",
      },
      {
        rank: 4,
        propertyName: "Chicago Bulls",
        opportunityScore: 11,
        engagement: "30%",
        intensity: "31%",
        momentum: "11%",
        passion: "9%",
        excitement: "21%",
        consideration: "9%",
        favorability: "8%",
      },
      {
        rank: 5,
        propertyName: "New York Knicks",
        opportunityScore: 11,
        engagement: "32%",
        intensity: "31%",
        momentum: "11%",
        passion: "8%",
        excitement: "18%",
        consideration: "8%",
        favorability: "7%",
      },
      {
        rank: 6,
        propertyName: "New York Giants",
        opportunityScore: 10,
        engagement: "29%",
        intensity: "28%",
        momentum: "11%",
        passion: "9%",
        excitement: "19%",
        consideration: "8%",
        favorability: "7%",
      },
      {
        rank: 7,
        propertyName: "Golden State Warriors",
        opportunityScore: 9,
        engagement: "28%",
        intensity: "33%",
        momentum: "10%",
        passion: "8%",
        excitement: "18%",
        consideration: "7%",
        favorability: "7%",
      },
      {
        rank: 8,
        propertyName: "New York Mets",
        opportunityScore: 9,
        engagement: "29%",
        intensity: "29%",
        momentum: "10%",
        passion: "8%",
        excitement: "17%",
        consideration: "7%",
        favorability: "7%",
      },
      {
        rank: 9,
        propertyName: "Washington Commanders",
        opportunityScore: 8,
        engagement: "26%",
        intensity: "31%",
        momentum: "10%",
        passion: "8%",
        excitement: "15%",
        consideration: "7%",
        favorability: "7%",
      },
      {
        rank: 10,
        propertyName: "Los Angeles Dodgers",
        opportunityScore: 8,
        engagement: "28%",
        intensity: "28%",
        momentum: "8%",
        passion: "7%",
        excitement: "15%",
        consideration: "6%",
        favorability: "6%",
      },
    ]

    return sportsTeams.map((team, index) => ({
      ...(data[index] || data[0]), // Keep original structure for compatibility
      id: index + 1,
      rank: team.rank,
      propertyName: team.propertyName,
      opportunityScore: team.opportunityScore,
      engagement: team.engagement,
      intensity: team.intensity,
      momentum: team.momentum,
      passion: team.passion,
      excitement: team.excitement,
      consideration: team.consideration,
      favorability: team.favorability,
    }))
  }, [data])

  // Apply sorting
  const sortedData = useMemo(() => {
    const processedData = [...baseData]

    if (sortConfig) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a]
        const bValue = b[sortConfig.key as keyof typeof a]

        if (sortConfig.key === "date") {
          const aDate = new Date(aValue as string)
          const bDate = new Date(bValue as string)
          return sortConfig.direction === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime()
        }

        if (
          typeof aValue === "string" &&
          (aValue.includes("$") || aValue.includes("%") || !isNaN(Number(aValue.replace(/[,$%]/g, ""))))
        ) {
          const aNum = Number.parseFloat(aValue.toString().replace(/[$,%]/g, ""))
          const bNum = Number.parseFloat(bValue.toString().replace(/[$,%]/g, ""))
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum
        }

        const aStr = aValue?.toString().toLowerCase() || ""
        const bStr = bValue?.toString().toLowerCase() || ""

        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return processedData
  }, [baseData, sortConfig])

  // Calculate totals
  const totals = useMemo(() => {
    return {
      reach: sortedData.reduce((sum, item) => sum + (Math.floor(item.impressions * 0.8) || 0), 0),
      impressions: sortedData.reduce((sum, item) => sum + (item.impressions || 0), 0),
      engagement: sortedData.reduce((sum, item) => sum + (Math.floor(item.views * 0.15) || 0), 0),
      clicks: sortedData.reduce((sum, item) => sum + (Math.floor(item.views * 0.05) || 0), 0),
      conversions: sortedData.reduce((sum, item) => sum + (Math.floor(item.views * 0.02) || 0), 0),
      revenue: sortedData.reduce((sum, item) => sum + (item.fmv * 1000 || 0), 0),
      roi:
        sortedData.length > 0
          ? sortedData.reduce((sum, item) => sum + (Math.floor(Math.random() * 150 + 50) || 0), 0) / sortedData.length
          : 0,
    }
  }, [sortedData])

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = sortedData.slice(startIndex, endIndex)

  const handleSort = (column: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig?.key === column) {
        return {
          key: column,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key: column, direction: "asc" }
    })
  }

  const getSortIcon = (column: string) => {
    if (sortConfig?.key === column) {
      return sortConfig.direction === "asc" ? faSortUp : faSortDown
    }
    return faSort
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleDownloadCSV = () => {
    const headers = [
      "Date",
      "Campaign",
      "Brand",
      "Platform",
      "Content Type",
      "Reach",
      "Impressions",
      "Engagement",
      "Clicks",
      "Conversions",
      "Revenue",
      "ROI %",
    ]

    const csvData = sortedData.map((row) => [
      row.date,
      row.campaign,
      row.brand,
      row.platform,
      row.contentType,
      row.reachFormatted,
      row.impressionsFormatted,
      row.engagementFormatted,
      row.clicks,
      row.conversions,
      row.revenueFormatted,
      row.roiFormatted,
    ])

    const totalsRow = [
      "Total",
      "-",
      "-",
      "-",
      "-",
      (totals.reach / 1000).toFixed(1) + "k",
      (totals.impressions / 1000).toFixed(1) + "k",
      (totals.engagement / 1000).toFixed(1) + "k",
      totals.clicks,
      totals.conversions,
      "$" + (totals.revenue / 1000).toFixed(1) + "k",
      totals.roi.toFixed(1) + "%",
    ]

    const allData = [headers, ...csvData, totalsRow]
    const csvContent = allData
      .map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell)
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`
            }
            return cellStr
          })
          .join(","),
      )
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `sponsorship-outcome-data-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  const columns = [
    { key: "rank", label: "Rank" },
    { key: "propertyName", label: "Property Name" },
    { key: "opportunityScore", label: "Opportunity Score" },
    { key: "engagement", label: "Engagement" },
    { key: "intensity", label: "Intensity" },
    { key: "momentum", label: "Momentum" },
    { key: "passion", label: "Passion" },
    { key: "excitement", label: "Excitement" },
    { key: "consideration", label: "Consideration" },
    { key: "favorability", label: "Favorability" },
  ]

  return (
    <div className="w-full">
      <Card className="w-full mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Sports Properties Ranked by Opportunity Score
            </CardTitle>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="btn-tertiary btn-icon">
                      <FontAwesomeIcon icon={faCog} className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <button onClick={handleDownloadCSV} className="btn-primary btn-sm flex items-center gap-2">
                <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
                Download As CSV
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#B8D4E3] hover:bg-[#B8D4E3] border-b border-gray-300">
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className="text-gray-700 font-semibold text-sm py-4 px-4 border-r border-gray-300 last:border-r-0"
                    >
                      <div className="flex items-center justify-between">
                        <span>{column.label}</span>
                        <button
                          onClick={() => handleSort(column.key)}
                          className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <FontAwesomeIcon icon={getSortIcon(column.key)} className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-gray-700 font-semibold text-sm py-4 px-4 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className="bg-white hover:bg-gray-50 transition-colors border-b border-gray-200"
                  >
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.rank}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.propertyName}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          row.opportunityScore >= 20
                            ? "bg-green-100 text-green-800"
                            : row.opportunityScore >= 10
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.opportunityScore}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.engagement}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.intensity}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.momentum}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.passion}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.excitement}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.consideration}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.favorability}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                            <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4 text-[#4F8EF7]" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => console.log("View row:", row.id)}>
                            <FontAwesomeIcon icon={faEye} className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Delete row:", row.id)} className="text-red-600">
                            <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Totals Row */}
                <TableRow className="bg-[#9BC5D9] hover:bg-[#9BC5D9] border-t-2 border-gray-400">
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">
                    Total Properties: {sortedData.length}
                  </TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">-</TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">
                    Avg:{" "}
                    {Math.floor(sortedData.reduce((sum, item) => sum + item.opportunityScore, 0) / sortedData.length)}
                  </TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">-</TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">-</TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">-</TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">-</TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">-</TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">-</TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">-</TableCell>
                  <TableCell className="py-4 px-4"></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center py-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4 text-gray-600" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-8 h-8 rounded transition-colors ${
                        currentPage === page ? "bg-[#4F8EF7] text-white" : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
