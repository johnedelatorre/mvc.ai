"use client"
import React, { useState, useMemo } from "react";
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
} from "@fortawesome/free-solid-svg-icons"
import { faTiktok, faInstagram, faYoutube, faTwitter } from "@fortawesome/free-brands-svg-icons"

const PlatformIcon = ({ platform }: { platform: string }) => {
  const getIcon = () => {
    switch (platform) {
      case "TikTok":
        return faTiktok
      case "Instagram":
        return faInstagram
      case "YouTube":
        return faYoutube
      case "Twitter":
        return faTwitter
      default:
        return faTwitter
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
            <FontAwesomeIcon icon={getIcon()} className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{platform}</p>
        </TooltipContent>
      </TooltipProvider>
  );
};

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
} | null

type SearchFilters = {
  [key: string]: string
}

interface DataTableProps {
  data: Array<{
    id: number
    dateObj: Date
    placements: string
    placementTypes: string
    platforms: string
    smv: number
    fmv: number
    impressions: number
    views: number
    videoViews: number
  }>
}

export default function DataTable({ data }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isExpanded, setIsExpanded] = useState(true)
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({})
  const [activeSearchColumn, setActiveSearchColumn] = useState<string | null>(null)
  const itemsPerPage = 10

  // Format the data for display
  const baseData = useMemo(() => {
    return data
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map((item) => ({
        ...item,
        date: item.dateObj.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        exposures: Math.floor(item.impressions / 10), // Simulated exposures
        duration: Math.floor(item.views / 100), // Simulated duration in seconds
        engagements: Math.floor(item.views * 0.8), // Simulated engagements
        mvp: `${Math.floor(Math.random() * 50 + 10)}%`, // Simulated MVP percentage
        postCount: Math.floor(Math.random() * 1000 + 100), // Simulated post count
        smvFormatted: `$${item.smv.toLocaleString()}`,
        fmvFormatted: `$${item.fmv.toFixed(1)}k`,
        impressionsFormatted: `${item.impressions.toLocaleString()}`,
        viewsFormatted: `${item.views.toLocaleString()}`,
        videoViewsFormatted: `${item.videoViews.toLocaleString()}`,
      }))
  }, [data])

  // Apply sorting and filtering
  const filteredAndSortedData = useMemo(() => {
    let processedData = [...baseData]

    // Apply search filters
    Object.entries(searchFilters).forEach(([column, searchTerm]) => {
      if (searchTerm) {
        processedData = processedData.filter((item) => {
          const value = item[column as keyof typeof item]
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      }
    })

    // Apply sorting
    if (sortConfig) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a]
        const bValue = b[sortConfig.key as keyof typeof a]

        // Handle different data types
        if (sortConfig.key === "date") {
          const aDate = new Date(aValue as string)
          const bDate = new Date(bValue as string)
          return sortConfig.direction === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime()
        }

        // Handle numeric values
        if (
          typeof aValue === "string" &&
          (aValue.includes("$") || aValue.includes("%") || !isNaN(Number(aValue.replace(/[,$%]/g, ""))))
        ) {
          const aNum = Number.parseFloat(aValue.toString().replace(/[$,%]/g, ""))
          const bNum = Number.parseFloat(bValue.toString().replace(/[$,%]/g, ""))
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum
        }

        // Handle string values
        const aStr = aValue?.toString().toLowerCase() || ""
        const bStr = bValue?.toString().toLowerCase() || ""

        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return processedData
  }, [baseData, searchFilters, sortConfig])

  // Calculate totals
  const totals = useMemo(() => {
    return {
      exposures: filteredAndSortedData.reduce((sum, item) => sum + item.exposures, 0),
      duration: filteredAndSortedData.reduce((sum, item) => sum + item.duration, 0),
      impressions: filteredAndSortedData.reduce((sum, item) => sum + item.impressions, 0),
      videoViews: filteredAndSortedData.reduce((sum, item) => sum + item.videoViews, 0),
      engagements: filteredAndSortedData.reduce((sum, item) => sum + item.engagements, 0),
      fmv: filteredAndSortedData.reduce((sum, item) => sum + item.fmv, 0),
      mvp: Math.floor(
        filteredAndSortedData.reduce((sum, item) => sum + Number.parseInt(item.mvp), 0) / filteredAndSortedData.length,
      ),
      postCount: filteredAndSortedData.reduce((sum, item) => sum + item.postCount, 0),
    }
  }, [filteredAndSortedData])

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredAndSortedData.slice(startIndex, endIndex)

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
  // Define CSV headers
  const headers = [
    'Date',
    'Exposures', 
    'Duration (Sec)',
    'Impressions',
    'Video Views',
    'Engagements',
    'FMV',
    'MVP %',
    'Post Count'
  ];

  // Convert data to CSV format
  const csvData = filteredAndSortedData.map(row => [
    row.date,
    row.exposures,
    row.duration,
    row.impressions,
    row.videoViews,
    row.engagements,
    row.fmv.toFixed(1) + 'k',
    row.mvp,
    row.postCount
  ]);

  // Add totals row
  const totalsRow = [
    'Total',
    totals.exposures,
    totals.duration,
    totals.impressions,
    totals.videoViews,
    totals.engagements,
    totals.fmv.toFixed(1) + 'k',
    totals.mvp + '%',
    totals.postCount
  ];

  // Combine headers, data, and totals
  const allData = [headers, ...csvData, totalsRow];

  // Convert to CSV string
  const csvContent = allData.map(row => 
    row.map(cell => {
      // Handle cells that contain commas or quotes
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `measures-breakdown-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

  const columns = [
    { key: "date", label: "Date" },
    { key: "exposures", label: "Exposures" },
    { key: "duration", label: "Duration (Sec)" },
    { key: "impressions", label: "Impressions" },
    { key: "videoViews", label: "Video Views" },
    { key: "engagements", label: "Engagements" },
    { key: "fmv", label: "FMV" },
    { key: "mvp", label: "MVP %" },
    { key: "postCount", label: "Post Count" },
  ]

  return (
    <div className="w-full">
      <Card className="w-full mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">Measures Breakdown By Date</CardTitle>
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
                      {row.date}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.exposures.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.duration.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.impressionsFormatted}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.videoViewsFormatted}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.engagements.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.fmvFormatted}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.mvp}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                      {row.postCount.toLocaleString()}
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
                    Total
                  </TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">
                    {totals.exposures.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">
                    {totals.duration.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">
                    {totals.impressions.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">
                    {totals.videoViews.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">
                    {totals.engagements.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">
                    ${totals.fmv.toFixed(1)}k
                  </TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">
                    {totals.mvp}%
                  </TableCell>
                  <TableCell className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300">
                    {totals.postCount.toLocaleString()}
                  </TableCell>
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
