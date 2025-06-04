"use client"
import type React from "react"
import { useState, useMemo, useRef } from "react"
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
  faGripLines,
  faSort,
  faSortUp,
  faSortDown,
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
      </Tooltip>
    </TooltipProvider>
  )
}

type SortConfig = {
  key: string
  direction: "asc" | "desc"
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
    sponsors: string
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
  const [columns, setColumns] = useState<Array<{ key: string; label: string; width: number }>>([
    { key: "date", label: "Date", width: 120 },
    { key: "sponsors", label: "Sponsors", width: 150 },
    { key: "exposures", label: "Exposures", width: 120 },
    { key: "duration", label: "Duration (Sec)", width: 140 },
    { key: "impressions", label: "Impressions", width: 120 },
    { key: "videoViews", label: "Video Views", width: 120 },
    { key: "engagements", label: "Engagements", width: 120 },
    { key: "fmv", label: "FMV", width: 100 },
    { key: "mvp", label: "MVP %", width: 100 },
    { key: "postCount", label: "Post Count", width: 120 },
  ])
  const [resizingColumnIndex, setResizingColumnIndex] = useState<number | null>(null)
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null)
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)
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

  // Column resizing handlers
  const handleResizeMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    setResizingColumnIndex(index)

    const startX = e.clientX
    const startWidth = columns[index].width

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (resizingColumnIndex !== null) {
        const newWidth = Math.max(80, startWidth + (moveEvent.clientX - startX))
        setColumns((prevColumns) => {
          const newColumns = [...prevColumns]
          newColumns[index] = { ...newColumns[index], width: newWidth }
          return newColumns
        })
      }
    }

    const handleMouseUp = () => {
      setResizingColumnIndex(null)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Column drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedColumnIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverColumnIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedColumnIndex !== null && dragOverColumnIndex !== null && draggedColumnIndex !== dragOverColumnIndex) {
      setColumns((prevColumns) => {
        const newColumns = [...prevColumns]
        const [draggedColumn] = newColumns.splice(draggedColumnIndex, 1)
        newColumns.splice(dragOverColumnIndex, 0, draggedColumn)
        return newColumns
      })
    }
    setDraggedColumnIndex(null)
    setDragOverColumnIndex(null)
  }

  const handleDownloadCSV = () => {
    // Define CSV headers
    const headers = columns.map((col) => col.label)

    // Convert data to CSV format
    const csvData = filteredAndSortedData.map((row) => {
      return columns.map((col) => {
        const key = col.key as keyof typeof row
        let value = row[key]

        // Format specific columns for CSV
        if (col.key === "exposures") value = row.exposures
        else if (col.key === "duration") value = row.duration
        else if (col.key === "impressions") value = row.impressions
        else if (col.key === "videoViews") value = row.videoViews
        else if (col.key === "engagements") value = row.engagements
        else if (col.key === "fmv") value = `${row.fmv.toFixed(1)}k`
        else if (col.key === "postCount") value = row.postCount

        return value
      })
    })

    // Add totals row
    const totalsRow = columns.map((col) => {
      const key = col.key
      if (key === "date") return "Total"
      if (key === "sponsors") return "-"
      if (key === "exposures") return totals.exposures
      if (key === "duration") return totals.duration
      if (key === "impressions") return totals.impressions
      if (key === "videoViews") return totals.videoViews
      if (key === "engagements") return totals.engagements
      if (key === "fmv") return totals.fmv.toFixed(1) + "k"
      if (key === "mvp") return totals.mvp + "%"
      if (key === "postCount") return totals.postCount
      return ""
    })

    // Combine headers, data, and totals
    const allData = [headers, ...csvData, totalsRow]

    // Convert to CSV string
    const csvContent = allData
      .map((row) =>
        row
          .map((cell) => {
            // Handle cells that contain commas or quotes
            const cellStr = String(cell)
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`
            }
            return cellStr
          })
          .join(","),
      )
      .join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `measures-breakdown-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

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
            <Table ref={tableRef}>
              <TableHeader>
                <TableRow className="bg-[#B8D4E3] hover:bg-[#B8D4E3] border-b border-gray-300">
                  {columns.map((column, index) => (
                    <TableHead
                      key={column.key}
                      className={`text-gray-700 font-semibold text-sm py-4 px-4 border-r border-gray-300 last:border-r-0 relative select-none group ${
                        draggedColumnIndex === index ? "opacity-50" : ""
                      } ${dragOverColumnIndex === index ? "bg-blue-100" : ""}`}
                      style={{ width: `${column.width}px`, minWidth: `${column.width}px` }}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={faGripLines}
                            className="h-3 w-3 text-gray-400 mr-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                          <span>{column.label}</span>
                        </div>
                        <button
                          onClick={() => handleSort(column.key)}
                          className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FontAwesomeIcon icon={getSortIcon(column.key)} className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>
                      {/* Resizer */}
                      <div
                        className="absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-blue-400 hover:opacity-50"
                        onMouseDown={(e) => handleResizeMouseDown(e, index)}
                      />
                    </TableHead>
                  ))}
                  <TableHead className="text-gray-700 font-semibold text-sm py-4 px-4 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((row, rowIndex) => (
                  <TableRow
                    key={row.id}
                    className="bg-white hover:bg-gray-50 transition-colors border-b border-gray-200"
                  >
                    {columns.map((column, colIndex) => {
                      let cellContent: React.ReactNode = ""

                      if (column.key === "date") cellContent = row.date
                      else if (column.key === "sponsors") cellContent = row.sponsors
                      else if (column.key === "exposures") cellContent = row.exposures.toLocaleString()
                      else if (column.key === "duration") cellContent = row.duration.toLocaleString()
                      else if (column.key === "impressions") cellContent = row.impressionsFormatted
                      else if (column.key === "videoViews") cellContent = row.videoViewsFormatted
                      else if (column.key === "engagements") cellContent = row.engagements.toLocaleString()
                      else if (column.key === "fmv") cellContent = row.fmvFormatted
                      else if (column.key === "mvp") cellContent = row.mvp
                      else if (column.key === "postCount") cellContent = row.postCount.toLocaleString()

                      return (
                        <TableCell
                          key={`${row.id}-${column.key}`}
                          className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200"
                          style={{ width: `${column.width}px`, minWidth: `${column.width}px` }}
                        >
                          {cellContent}
                        </TableCell>
                      )
                    })}
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
                  {columns.map((column, index) => {
                    let content: React.ReactNode = "-"

                    if (column.key === "date") content = "Total"
                    else if (column.key === "exposures") content = totals.exposures.toLocaleString()
                    else if (column.key === "duration") content = totals.duration.toLocaleString()
                    else if (column.key === "impressions") content = totals.impressions.toLocaleString()
                    else if (column.key === "videoViews") content = totals.videoViews.toLocaleString()
                    else if (column.key === "engagements") content = totals.engagements.toLocaleString()
                    else if (column.key === "fmv") content = `$${totals.fmv.toFixed(1)}k`
                    else if (column.key === "mvp") content = `${totals.mvp}%`
                    else if (column.key === "postCount") content = totals.postCount.toLocaleString()

                    return (
                      <TableCell
                        key={`totals-${column.key}`}
                        className="py-4 px-4 font-semibold text-gray-800 border-r border-gray-300"
                        style={{ width: `${column.width}px`, minWidth: `${column.width}px` }}
                      >
                        {content}
                      </TableCell>
                    )
                  })}
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
