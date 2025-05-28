"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import AutomatedInsights from "../automated-insights"
import DataTable from "../data-table"
import DataBarChart from "../bar-chart"
import MultiMetricChart from "../multi-metric-chart"
import ComparisonLineChart from "../line-chart"
import {
  faTable,
  faChartColumn,
  faTimes,
  faChevronDown,
  faChevronUp,
  faFilter,
  faBookmark,
  faChartLine,
  faLightbulb,
  faEdit,
  faEllipsisV,
  faTrash,
  faSave,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

// Available placement options
const PLACEMENT_OPTIONS = [
  "Billboard",
  "Digital Display",
  "Floor Court Logo",
  "Ceiling Logo",
  "LED-Fascia",
  "Jersey",
  "Sneakers",
  "Entrance Logo",
]

// Sponsors by category
const SPONSORS_BY_CATEGORY = {
  "Sports Apparel": [
    "Nike",
    "Adidas",
    "Under Armour",
    "Puma",
    "New Balance",
    "Jordan Brand",
    "Reebok",
    "ASICS",
    "Converse",
    "Vans",
  ],
  Beverage: [
    "Coca-Cola",
    "Pepsi",
    "Red Bull",
    "Monster Energy",
    "Gatorade",
    "Powerade",
    "Dr Pepper",
    "Sprite",
    "Mountain Dew",
    "Rockstar Energy",
  ],
  "Alcohol Beverage": [
    "Budweiser",
    "Corona",
    "Heineken",
    "Miller Lite",
    "Coors Light",
    "Stella Artois",
    "Michelob Ultra",
    "Guinness",
    "Jack Daniel's",
    "Johnnie Walker",
  ],
  Insurance: [
    "State Farm",
    "GEICO",
    "Progressive",
    "Allstate",
    "Liberty Mutual",
    "USAA",
    "Farmers Insurance",
    "Nationwide",
    "American Family",
    "Travelers",
  ],
  Banking: [
    "Chase",
    "Bank of America",
    "Wells Fargo",
    "Citibank",
    "Capital One",
    "US Bank",
    "PNC Bank",
    "TD Bank",
    "Truist",
    "Fifth Third Bank",
  ],
  Crypto: [
    "Coinbase",
    "Crypto.com",
    "FTX",
    "Binance",
    "Kraken",
    "Gemini",
    "BlockFi",
    "eToro",
    "Robinhood Crypto",
    "Bitfinex",
  ],
  Technology: ["Apple", "Microsoft", "Google", "Amazon", "Meta", "Tesla", "Netflix", "Samsung", "Intel", "Oracle"],
}

// Flatten all sponsors for data generation and filtering
const ALL_SPONSORS = Object.values(SPONSORS_BY_CATEGORY).flat()

// Placement Types hierarchical structure
const PLACEMENT_TYPES_STRUCTURE = {
  Spurs: {
    "In-Venue Exposures": ["Court Side", "LED-Fascia", "Stadium Banner", "Spurs LED"],
    "Broadcast Exposures": ["Jersey", "Courtside", "Sneakers", "Stadium Banner"],
    "Social Media Exposures": ["Facebook", "Instagram", "TikTok", "X", "YouTube"],
  },
}

// Flatten placement types for data generation and filtering
const ALL_PLACEMENT_TYPES = Object.values(PLACEMENT_TYPES_STRUCTURE).flatMap((category) =>
  Object.values(category).flat(),
)

const RIGHTSHOLDERS_STRUCTURE = {
  NBA: ["Lakers", "Warriors", "Celtics", "Heat", "Bulls", "Knicks", "Nets", "76ers"],
  NFL: ["Patriots", "Cowboys", "Packers", "Steelers", "49ers", "Giants", "Chiefs", "Rams"],
  MLB: ["Yankees", "Dodgers", "Red Sox", "Cubs", "Cardinals", "Astros", "Braves", "Mets"],
  NHL: ["Rangers", "Bruins", "Blackhawks", "Kings", "Penguins", "Capitals", "Lightning", "Maple Leafs"],
  MLS: [
    "LAFC",
    "Atlanta United",
    "Seattle Sounders",
    "Portland Timbers",
    "NYC FC",
    "LA Galaxy",
    "Inter Miami",
    "Toronto FC",
  ],
  "Premier League": [
    "Manchester United",
    "Liverpool",
    "Chelsea",
    "Arsenal",
    "Manchester City",
    "Tottenham",
    "Newcastle",
    "Brighton",
  ],
  "La Liga": [
    "Real Madrid",
    "Barcelona",
    "Atletico Madrid",
    "Sevilla",
    "Valencia",
    "Villarreal",
    "Real Sociedad",
    "Athletic Bilbao",
  ],
  Bundesliga: [
    "Bayern Munich",
    "Borussia Dortmund",
    "RB Leipzig",
    "Bayer Leverkusen",
    "Eintracht Frankfurt",
    "Wolfsburg",
    "Freiburg",
    "Union Berlin",
  ],
}

// Flatten all rightsholders for data generation and filtering
const ALL_RIGHTSHOLDERS = Object.values(RIGHTSHOLDERS_STRUCTURE).flat()

// Generate base data that will be filtered
const generateBaseData = () => {
  const generateRandomDate = () => {
    const year = 2023 + Math.floor(Math.random() * 3) // 2023, 2024, 2025
    const month = Math.floor(Math.random() * 12) + 1 // 1-12
    const day = Math.floor(Math.random() * 28) + 1 // 1-28 to avoid month-end issues
    return new Date(year, month - 1, day)
  }

  return Array.from({ length: 200 }, (_, index) => ({
    id: index + 1,
    dateObj: generateRandomDate(),
    rightsholders: ALL_RIGHTSHOLDERS[index % ALL_RIGHTSHOLDERS.length], // Add rightsholders to data
    sponsors: ALL_SPONSORS[index % ALL_SPONSORS.length], // Add sponsors to data
    placements: PLACEMENT_OPTIONS[index % PLACEMENT_OPTIONS.length],
    placementTypes: ALL_PLACEMENT_TYPES[index % ALL_PLACEMENT_TYPES.length],
    platforms: ["TikTok", "Instagram", "YouTube", "Twitter"][index % 4],
    smv: 55 + index * 5,
    fmv: 3 + index * 0.5,
    impressions: 12 + index,
    views: 55 + index * 5,
    videoViews: 125 + index * 10,
  }))
}

// Predefined filter categories
const FILTER_CATEGORIES = ["General", "Performance", "Engagement", "Sponsors", "RightsHolders"]

export default function Page() {
  const [filterType, setFilterType] = useState<"dateRange" | "years">("dateRange")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([])
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([])
  const [selectedPlacementTypes, setSelectedPlacementTypes] = useState<string[]>([])
  const [isFilterExpanded, setIsFilterExpanded] = useState(true)
  const [selectedRightsholders, setSelectedRightsholders] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>([])
  const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])
  const [selectedHandles, setSelectedHandles] = useState<string[]>([])
  const [selectedComparisonDates, setSelectedComparisonDates] = useState<string[]>([])
  const [groupBy, setGroupBy] = useState<string>("Date")
  const [showPageSpecificMetrics, setShowPageSpecificMetrics] = useState(false)
  const [mainTab, setMainTab] = useState("analytics")
  const [selectedInsightsTypes, setSelectedInsightsTypes] = useState<string[]>([])
  const [savedFilters, setSavedFilters] = useState<
    Array<{
      id: string
      name: string
      description?: string
      createdAt: Date
      category: string
      filters: {
        filterType: "dateRange" | "years"
        dateRange: { from: Date | undefined; to: Date | undefined }
        selectedYears: string[]
        selectedSponsors: string[]
        selectedPlacements: string[]
        selectedPlacementTypes: string[]
        selectedRightsholders: string[]
        selectedPlatforms: string[]
        selectedAccountTypes: string[]
        selectedMediaTypes: string[]
        selectedCollections: string[]
        selectedHashtags: string[]
        selectedHandles: string[]
        selectedComparisonDates: string[]
        groupBy: string
      }
    }>
  >([])
  const [showSaveFilterDrawer, setShowSaveFilterDrawer] = useState(false)
  const [showSavedFiltersDrawer, setShowSavedFiltersDrawer] = useState(false)
  const [filterNameToSave, setFilterNameToSave] = useState("")
  const [filterDescriptionToSave, setFilterDescriptionToSave] = useState("")
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null)
  const [filterCategoryToSave, setFilterCategoryToSave] = useState(FILTER_CATEGORIES[0])
  const [filterCategorySearch, setFilterCategorySearch] = useState("")

  const baseData = useMemo(() => generateBaseData(), [])

  const availableYears = ["2025", "2024", "2023", "2022", "2021"]

  const handleYearToggle = (year: string) => {
    setSelectedYears((prev) => (prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]))
  }

  // Sponsors handlers
  const handleSponsorToggle = (sponsor: string) => {
    setSelectedSponsors((prev) => (prev.includes(sponsor) ? prev.filter((s) => s !== sponsor) : [...prev, sponsor]))
  }

  const removeSponsor = (sponsor: string) => {
    setSelectedSponsors((prev) => prev.filter((s) => s !== sponsor))
  }

  const clearAllSponsors = () => {
    setSelectedSponsors([])
  }

  const handleSponsorCategorySelectAll = (categorySponsors: string[]) => {
    const allSelected = categorySponsors.every((sponsor) => selectedSponsors.includes(sponsor))
    if (allSelected) {
      // Deselect all sponsors in this category
      setSelectedSponsors((prev) => prev.filter((sponsor) => !categorySponsors.includes(sponsor)))
    } else {
      // Select all sponsors in this category
      setSelectedSponsors((prev) => [...new Set([...prev, ...categorySponsors])])
    }
  }

  const isSponsorCategoryFullySelected = (categorySponsors: string[]) => {
    return categorySponsors.every((sponsor) => selectedSponsors.includes(sponsor))
  }

  const isSponsorCategoryPartiallySelected = (categorySponsors: string[]) => {
    return (
      categorySponsors.some((sponsor) => selectedSponsors.includes(sponsor)) &&
      !isSponsorCategoryFullySelected(categorySponsors)
    )
  }

  const handlePlacementToggle = (placement: string) => {
    setSelectedPlacements((prev) =>
      prev.includes(placement) ? prev.filter((p) => p !== placement) : [...prev, placement],
    )
  }

  const removePlacement = (placement: string) => {
    setSelectedPlacements((prev) => prev.filter((p) => p !== placement))
  }

  const clearAllPlacements = () => {
    setSelectedPlacements([])
  }

  // Placement Types handlers
  const handlePlacementTypeToggle = (placementType: string) => {
    setSelectedPlacementTypes((prev) =>
      prev.includes(placementType) ? prev.filter((p) => p !== placementType) : [...prev, placementType],
    )
  }

  const removePlacementType = (placementType: string) => {
    setSelectedPlacementTypes((prev) => prev.filter((p) => p !== placementType))
  }

  const clearAllPlacementTypes = () => {
    setSelectedPlacementTypes([])
  }

  const handleCategorySelectAll = (categoryItems: string[]) => {
    const allSelected = categoryItems.every((item) => selectedPlacementTypes.includes(item))
    if (allSelected) {
      // Deselect all items in this category
      setSelectedPlacementTypes((prev) => prev.filter((item) => !categoryItems.includes(item)))
    } else {
      // Select all items in this category
      setSelectedPlacementTypes((prev) => [...new Set([...prev, ...categoryItems])])
    }
  }

  const isCategoryFullySelected = (categoryItems: string[]) => {
    return categoryItems.every((item) => selectedPlacementTypes.includes(item))
  }

  const isCategoryPartiallySelected = (categoryItems: string[]) => {
    return (
      categoryItems.some((item) => selectedPlacementTypes.includes(item)) && !isCategoryFullySelected(categoryItems)
    )
  }

  const handleRightsholderToggle = (rightsholder: string) => {
    setSelectedRightsholders((prev) =>
      prev.includes(rightsholder) ? prev.filter((r) => r !== rightsholder) : [...prev, rightsholder],
    )
  }

  const removeRightsholder = (rightsholder: string) => {
    setSelectedRightsholders((prev) => prev.filter((r) => r !== rightsholder))
  }

  const clearAllRightsholders = () => {
    setSelectedRightsholders([])
  }

  const handleRightsholderCategorySelectAll = (categoryRightsholders: string[]) => {
    const allSelected = categoryRightsholders.every((rightsholder) => selectedRightsholders.includes(rightsholder))
    if (allSelected) {
      // Deselect all rightsholders in this category
      setSelectedRightsholders((prev) => prev.filter((rightsholder) => !categoryRightsholders.includes(rightsholder)))
    } else {
      // Select all rightsholders in this category
      setSelectedRightsholders((prev) => [...new Set([...prev, ...categoryRightsholders])])
    }
  }

  const isRightsholderCategoryFullySelected = (categoryRightsholders: string[]) => {
    return categoryRightsholders.every((rightsholder) => selectedRightsholders.includes(rightsholder))
  }

  const isRightsholderCategoryPartiallySelected = (categoryRightsholders: string[]) => {
    return (
      categoryRightsholders.some((rightsholder) => selectedRightsholders.includes(rightsholder)) &&
      !isRightsholderCategoryFullySelected(categoryRightsholders)
    )
  }

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    let filtered = baseData

    // Filter by rightsholders
    if (selectedRightsholders.length > 0) {
      filtered = filtered.filter((item) => selectedRightsholders.includes(item.rightsholders))
    }

    // Filter by sponsors
    if (selectedSponsors.length > 0) {
      filtered = filtered.filter((item) => selectedSponsors.includes(item.sponsors))
    }

    // Filter by placements
    if (selectedPlacements.length > 0) {
      filtered = filtered.filter((item) => selectedPlacements.includes(item.placements))
    }

    // Filter by placement types
    if (selectedPlacementTypes.length > 0) {
      filtered = filtered.filter((item) => selectedPlacementTypes.includes(item.placementTypes))
    }

    // Filter by date/year
    if (filterType === "dateRange" && dateRange.from && dateRange.to) {
      filtered = filtered.filter((item) => {
        const itemDate = item.dateObj
        return itemDate >= dateRange.from! && itemDate <= dateRange.to!
      })
    } else if (filterType === "years" && selectedYears.length > 0) {
      filtered = filtered.filter((item) => {
        const itemYear = item.dateObj.getFullYear().toString()
        return selectedYears.includes(itemYear)
      })
    } else {
      // Default to current year if no date filters applied
      filtered = filtered.filter((item) => item.dateObj.getFullYear() === 2025)
    }

    return filtered
  }, [
    baseData,
    filterType,
    dateRange,
    selectedYears,
    selectedSponsors,
    selectedPlacements,
    selectedPlacementTypes,
    selectedRightsholders,
  ])

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = []

    if (filterType === "dateRange" && dateRange.from && dateRange.to) {
      filters.push(`From: ${format(dateRange.from, "yyyy-MM-dd")}`)
      filters.push(`To: ${format(dateRange.to, "yyyy-MM-dd")}`)
    }

    if (filterType === "years" && selectedYears.length > 0) {
      filters.push(`Years: ${selectedYears.join(", ")}`)
    }

    if (selectedRightsholders.length > 0) {
      filters.push(`Rightsholders: ${selectedRightsholders.length} selected`)
    }

    if (selectedSponsors.length > 0) {
      filters.push(`Sponsors: ${selectedSponsors.length} selected`)
    }

    if (selectedPlacements.length > 0) {
      filters.push(`Placements: ${selectedPlacements.length} selected`)
    }

    if (selectedPlacementTypes.length > 0) {
      filters.push(`Types: ${selectedPlacementTypes.length} selected`)
    }

    return filters
  }

  const activeFilters = getActiveFilters()

  const PLATFORMS_OPTIONS = ["TikTok", "Instagram", "YouTube", "Twitter", "Facebook", "LinkedIn", "Snapchat"]
  const ACCOUNT_TYPES_OPTIONS = ["Official", "Fan", "Media", "Influencer", "Athlete", "Team"]
  const MEDIA_TYPES_OPTIONS = ["Video", "Image", "Story", "Reel", "Live", "IGTV", "Carousel"]
  const COLLECTIONS_OPTIONS = ["Game Highlights", "Behind Scenes", "Training", "Interviews", "Fan Content"]
  const HASHTAGS_OPTIONS = ["#NBA", "#Basketball", "#Sports", "#GameDay", "#Playoffs", "#Finals"]
  const HANDLES_OPTIONS = ["@NBA", "@ESPN", "@SportsCenter", "@Bleacher", "@TheAthletic"]
  const COMPARISON_DATES_OPTIONS = ["Last Week", "Last Month", "Last Quarter", "Last Year", "Custom"]
  const GROUP_BY_OPTIONS = ["Date", "Platform", "Sponsor", "Placement", "Account Type"]
  const INSIGHTS_TYPE_OPTIONS = [
    "Automated Insights",
    "Custom Analysis",
    "Trending Metrics",
    "Performance Reports",
    "Comparative Analysis",
    "Predictive Insights",
    "Year over Year Benchmarking",
    "MVP % Evaluation",
  ]

  const clearAllFilters = () => {
    setFilterType("dateRange")
    setDateRange({ from: undefined, to: undefined })
    setSelectedYears([])
    setSelectedRightsholders([])
    setSelectedSponsors([])
    setSelectedPlacements([])
    setSelectedPlacementTypes([])
    setSelectedPlatforms([])
    setSelectedAccountTypes([])
    setSelectedMediaTypes([])
    setSelectedCollections([])
    setSelectedHashtags([])
    setSelectedHandles([])
    setSelectedComparisonDates([])
    setSelectedInsightsTypes([])
    setGroupBy("Date")
  }

  const applyFilters = () => {
    // Force re-render by updating a state that triggers filteredData recalculation
    // The filteredData useMemo will automatically recalculate based on current filter states
    console.log("Filters applied successfully!")

    // Optional: Show a success message or toast notification
    // You could add a toast notification here if you have a toast system
  }

  const handleInsightsTypeToggle = (insightsType: string) => {
    setSelectedInsightsTypes((prev) =>
      prev.includes(insightsType) ? prev.filter((i) => i !== insightsType) : [...prev, insightsType],
    )
  }

  const removeInsightsType = (insightsType: string) => {
    setSelectedInsightsTypes((prev) => prev.filter((i) => i !== insightsType))
  }

  const clearAllInsightsTypes = () => {
    setSelectedInsightsTypes([])
  }

  const saveCurrentFilters = () => {
    if (!filterNameToSave.trim()) return

    const newFilter = {
      id: editingFilterId || `filter_${Date.now()}`,
      name: filterNameToSave.trim(),
      description: filterDescriptionToSave.trim(),
      createdAt: editingFilterId
        ? savedFilters.find((f) => f.id === editingFilterId)?.createdAt || new Date()
        : new Date(),
      category: filterCategoryToSave,
      filters: {
        filterType,
        dateRange,
        selectedYears,
        selectedSponsors,
        selectedPlacements,
        selectedPlacementTypes,
        selectedRightsholders,
        selectedPlatforms,
        selectedAccountTypes,
        selectedMediaTypes,
        selectedCollections,
        selectedHashtags,
        selectedHandles,
        selectedComparisonDates,
        groupBy,
      },
    }

    if (editingFilterId) {
      setSavedFilters((prev) => prev.map((f) => (f.id === editingFilterId ? newFilter : f)))
    } else {
      setSavedFilters((prev) => [...prev, newFilter])
    }

    // Reset form
    setFilterNameToSave("")
    setFilterDescriptionToSave("")
    setEditingFilterId(null)
    setShowSaveFilterDrawer(false)
  }

  const applySavedFilter = (savedFilter: (typeof savedFilters)[0]) => {
    const { filters } = savedFilter
    setFilterType(filters.filterType)
    setDateRange(filters.dateRange)
    setSelectedYears(filters.selectedYears)
    setSelectedSponsors(filters.selectedSponsors)
    setSelectedPlacements(filters.selectedPlacements)
    setSelectedPlacementTypes(filters.selectedPlacementTypes)
    setSelectedRightsholders(filters.selectedRightsholders)
    setSelectedPlatforms(filters.selectedPlatforms)
    setSelectedAccountTypes(filters.selectedAccountTypes)
    setSelectedMediaTypes(filters.selectedMediaTypes)
    setSelectedCollections(filters.selectedCollections)
    setSelectedHashtags(filters.selectedHashtags)
    setSelectedHandles(filters.selectedHandles)
    setSelectedComparisonDates(filters.selectedComparisonDates)
    setGroupBy(filters.groupBy)
    setShowSavedFiltersDrawer(false)
  }

  const deleteSavedFilter = (filterId: string) => {
    setSavedFilters((prev) => prev.filter((f) => f.id !== filterId))
  }

  const editSavedFilter = (savedFilter: (typeof savedFilters)[0]) => {
    setFilterNameToSave(savedFilter.name)
    setFilterDescriptionToSave(savedFilter.description || "")
    setEditingFilterId(savedFilter.id)
    setFilterCategoryToSave(savedFilter.category)
    setShowSavedFiltersDrawer(false)
    setShowSaveFilterDrawer(true)
  }

  const openSaveFilterDrawer = () => {
    setFilterNameToSave("")
    setFilterDescriptionToSave("")
    setEditingFilterId(null)
    setShowSaveFilterDrawer(true)
  }

  const filteredSavedFilters = useMemo(() => {
    if (!filterCategorySearch) {
      return savedFilters
    }
    const searchTerm = filterCategorySearch.toLowerCase()
    return savedFilters.filter(
      (filter) =>
        filter.name.toLowerCase().includes(searchTerm) ||
        filter.description?.toLowerCase().includes(searchTerm) ||
        filter.category.toLowerCase().includes(searchTerm),
    )
  }, [savedFilters, filterCategorySearch])

  return (
    <div className="w-full">
      {/* Sticky Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-6 pb-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Relo Edge AI</h1>
          </div>

          {/* Main Tabs Section */}
          <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-auto">
              <TabsTrigger
                value="analytics"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <FontAwesomeIcon icon={faChartLine} className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>

            {/* Thin grey border that extends 100% across the page */}
            <div className="w-screen relative -ml-6 border-b border-gray-200 mt-4"></div>

            {/* Filter Bar for Analytics Tab */}
            <TabsContent value="analytics" className="mt-6 mb-0">
              <div className="p-5">
                {/* Active Filters Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                      <span className="text-sm font-medium">Sort Filters</span>
                      <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
                    </button>

                    {/* Active Filter Tags */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Time Period Tags */}
                      {filterType === "dateRange" && dateRange.from && dateRange.to && (
                        <>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            From: {format(dateRange.from, "yyyy-MM-dd")}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            To: {format(dateRange.to, "yyyy-MM-dd")}
                          </Badge>
                        </>
                      )}
                      {filterType === "years" && selectedYears.length > 0 && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                          Years: {selectedYears.join(", ")}
                        </Badge>
                      )}

                      {/* Rightsholders Tag */}
                      {selectedRightsholders.length > 0 && (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          {selectedRightsholders.length} Rightsholder{selectedRightsholders.length !== 1 ? "s" : ""}{" "}
                          Selected
                        </Badge>
                      )}

                      {/* Sponsors Tag */}
                      {selectedSponsors.length > 0 && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                          {selectedSponsors.length} Sponsor{selectedSponsors.length !== 1 ? "s" : ""} Selected
                        </Badge>
                      )}

                      {/* Placements Tag */}
                      {selectedPlacements.length > 0 && (
                        <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                          {selectedPlacements.length} Placement{selectedPlacements.length !== 1 ? "s" : ""} Selected
                        </Badge>
                      )}

                      {/* Placement Types Tag */}
                      {selectedPlacementTypes.length > 0 && (
                        <Badge className="bg-pink-100 text-pink-700 border-pink-300">
                          {selectedPlacementTypes.length} Placement Type{selectedPlacementTypes.length !== 1 ? "s" : ""}{" "}
                          Selected
                        </Badge>
                      )}

                      {/* Platforms Tag */}
                      {selectedPlatforms.length > 0 && (
                        <Badge className="bg-cyan-100 text-cyan-700 border-cyan-300">
                          {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? "s" : ""} Selected
                        </Badge>
                      )}

                      {/* Account Types Tag */}
                      {selectedAccountTypes.length > 0 && (
                        <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300">
                          {selectedAccountTypes.length} Account Type{selectedAccountTypes.length !== 1 ? "s" : ""}{" "}
                          Selected
                        </Badge>
                      )}

                      {/* Media Types Tag */}
                      {selectedMediaTypes.length > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                          {selectedMediaTypes.length} Media Type{selectedMediaTypes.length !== 1 ? "s" : ""} Selected
                        </Badge>
                      )}

                      {/* Collections Tag */}
                      {selectedCollections.length > 0 && (
                        <Badge className="bg-red-100 text-red-700 border-red-300">
                          {selectedCollections.length} Collection{selectedCollections.length !== 1 ? "s" : ""} Selected
                        </Badge>
                      )}

                      {/* Hashtags Tag */}
                      {selectedHashtags.length > 0 && (
                        <Badge className="bg-teal-100 text-teal-700 border-teal-300">
                          {selectedHashtags.length} Hashtag{selectedHashtags.length !== 1 ? "s" : ""} Selected
                        </Badge>
                      )}

                      {/* Handles Tag */}
                      {selectedHandles.length > 0 && (
                        <Badge className="bg-lime-100 text-lime-700 border-lime-300">
                          {selectedHandles.length} Handle{selectedHandles.length !== 1 ? "s" : ""} Selected
                        </Badge>
                      )}

                      {/* Comparison Dates Tag */}
                      {selectedComparisonDates.length > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                          {selectedComparisonDates.length} Comparison Date
                          {selectedComparisonDates.length !== 1 ? "s" : ""} Selected
                        </Badge>
                      )}

                      {/* Group By Tag - Keep as is */}
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">Group By: {groupBy}</Badge>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={isFilterExpanded ? faChevronUp : faChevronDown} className="h-4 w-4" />
                  </button>
                </div>

                {/* Main Filters Grid - Collapsible */}
                {isFilterExpanded && (
                  <div className="space-y-4">
                    {/* All the existing filter content remains the same */}
                    {/* Row 1: Primary Filters */}
                    <div className="grid grid-cols-5 gap-4">
                      {/* Rightsholders */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rightsholders
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span className="text-gray-500">Select Rightsholders</span>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Select Rightsholders</div>
                                {selectedRightsholders.length > 0 && (
                                  <button onClick={clearAllRightsholders} className="btn-tertiary btn-sm">
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Selected Rightsholders Tags */}
                              {selectedRightsholders.length > 0 && (
                                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                  {selectedRightsholders.map((rightsholder) => (
                                    <Badge
                                      key={rightsholder}
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {rightsholder}
                                      <button
                                        onClick={() => removeRightsholder(rightsholder)}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Hierarchical Rightsholders by League */}
                              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                {Object.entries(RIGHTSHOLDERS_STRUCTURE).map(([league, teams]) => (
                                  <div key={league} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`rightsholder-league-${league}`}
                                        checked={isRightsholderCategoryFullySelected(teams)}
                                        ref={(el) => {
                                          if (el) el.indeterminate = isRightsholderCategoryPartiallySelected(teams)
                                        }}
                                        onCheckedChange={() => handleRightsholderCategorySelectAll(teams)}
                                      />
                                      <label
                                        htmlFor={`rightsholder-league-${league}`}
                                        className="text-sm font-semibold text-gray-800 cursor-pointer border-b pb-1"
                                      >
                                        {league}
                                      </label>
                                      <span className="text-xs text-gray-500">({teams.length})</span>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                      {teams.map((team) => (
                                        <div key={team} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`rightsholder-${team}`}
                                            checked={selectedRightsholders.includes(team)}
                                            onCheckedChange={() => handleRightsholderToggle(team)}
                                          />
                                          <label htmlFor={`rightsholder-${team}`} className="text-sm cursor-pointer">
                                            {team}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}

                                <div className="pt-2 border-t">
                                  <button
                                    onClick={() => setSelectedRightsholders([...ALL_RIGHTSHOLDERS])}
                                    className="btn-secondary btn-sm w-full"
                                  >
                                    Select All
                                  </button>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Sponsors */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sponsors
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span className="text-gray-500">Select Sponsors</span>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Select Sponsors</div>
                                {selectedSponsors.length > 0 && (
                                  <button onClick={clearAllSponsors} className="btn-tertiary btn-sm">
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Selected Sponsors Tags */}
                              {selectedSponsors.length > 0 && (
                                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                  {selectedSponsors.map((sponsor) => (
                                    <Badge
                                      key={sponsor}
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {sponsor}
                                      <button
                                        onClick={() => removeSponsor(sponsor)}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Hierarchical Sponsors by Category */}
                              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                {Object.entries(SPONSORS_BY_CATEGORY).map(([category, sponsors]) => (
                                  <div key={category} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`sponsor-category-${category}`}
                                        checked={isSponsorCategoryFullySelected(sponsors)}
                                        ref={(el) => {
                                          if (el) el.indeterminate = isSponsorCategoryPartiallySelected(sponsors)
                                        }}
                                        onCheckedChange={() => handleSponsorCategorySelectAll(sponsors)}
                                      />
                                      <label
                                        htmlFor={`sponsor-category-${category}`}
                                        className="text-sm font-semibold text-gray-800 cursor-pointer border-b pb-1"
                                      >
                                        {category}
                                      </label>
                                      <span className="text-xs text-gray-500">({sponsors.length})</span>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                      {sponsors.map((sponsor) => (
                                        <div key={sponsor} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`sponsor-${sponsor}`}
                                            checked={selectedSponsors.includes(sponsor)}
                                            onCheckedChange={() => handleSponsorToggle(sponsor)}
                                          />
                                          <label htmlFor={`sponsor-${sponsor}`} className="text-sm cursor-pointer">
                                            {sponsor}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}

                                <div className="pt-2 border-t">
                                  <button
                                    onClick={() => setSelectedSponsors([...ALL_SPONSORS])}
                                    className="btn-secondary btn-sm w-full"
                                  >
                                    Select All
                                  </button>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Placement Types */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Placement Types
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span className="text-gray-500">Select Placement Types</span>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Select Placement Types</div>
                                {selectedPlacementTypes.length > 0 && (
                                  <button onClick={clearAllPlacementTypes} className="btn-tertiary btn-sm">
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Selected Placement Types Tags */}
                              {selectedPlacementTypes.length > 0 && (
                                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                  {selectedPlacementTypes.map((placementType) => (
                                    <Badge
                                      key={placementType}
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {placementType}
                                      <button
                                        onClick={() => removePlacementType(placementType)}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Hierarchical Placement Types */}
                              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                {Object.entries(PLACEMENT_TYPES_STRUCTURE).map(([mainCategory, categories]) => (
                                  <div key={mainCategory} className="space-y-2">
                                    <div className="font-semibold text-sm text-gray-800 border-b pb-1">
                                      {mainCategory}
                                    </div>
                                    {Object.entries(categories).map(([subCategory, items]) => (
                                      <div key={subCategory} className="ml-2 space-y-1">
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`category-${subCategory}`}
                                            checked={isCategoryFullySelected(items)}
                                            ref={(el) => {
                                              if (el) el.indeterminate = isCategoryPartiallySelected(items)
                                            }}
                                            onCheckedChange={() => handleCategorySelectAll(items)}
                                          />
                                          <label
                                            htmlFor={`category-${subCategory}`}
                                            className="text-sm font-medium cursor-pointer"
                                          >
                                            {subCategory}
                                          </label>
                                          <span className="text-xs text-gray-500">({items.length})</span>
                                        </div>
                                        <div className="ml-6 space-y-1">
                                          {items.map((item) => (
                                            <div key={item} className="flex items-center space-x-2">
                                              <Checkbox
                                                id={`item-${item}`}
                                                checked={selectedPlacementTypes.includes(item)}
                                                onCheckedChange={() => handlePlacementTypeToggle(item)}
                                              />
                                              <label htmlFor={`item-${item}`} className="text-sm cursor-pointer">
                                                {item}
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2 border-t">
                                <button
                                  onClick={() => setSelectedPlacementTypes([...ALL_PLACEMENT_TYPES])}
                                  className="btn-secondary btn-sm w-full"
                                >
                                  Select All
                                </button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Placements */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Placements
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span className="text-gray-500">Select Placements</span>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Select Placements</div>
                                {selectedPlacements.length > 0 && (
                                  <button onClick={clearAllPlacements} className="btn-tertiary btn-sm">
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Selected Placements Tags */}
                              {selectedPlacements.length > 0 && (
                                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md">
                                  {selectedPlacements.map((placement) => (
                                    <Badge
                                      key={placement}
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {placement}
                                      <button
                                        onClick={() => removePlacement(placement)}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Placement Options */}
                              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                {PLACEMENT_OPTIONS.map((placement) => (
                                  <div key={placement} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={placement}
                                      checked={selectedPlacements.includes(placement)}
                                      onCheckedChange={() => handlePlacementToggle(placement)}
                                    />
                                    <label htmlFor={placement} className="text-sm cursor-pointer flex-1">
                                      {placement}
                                    </label>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2 border-t">
                                <button
                                  onClick={() => setSelectedPlacements([...PLACEMENT_OPTIONS])}
                                  className="btn-secondary btn-sm w-full"
                                >
                                  Select All
                                </button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Season Year or Date Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Period
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span
                                className={`truncate pr-2 min-w-0 flex-1 ${
                                  (filterType === "dateRange" && dateRange.from && dateRange.to) ||
                                  (filterType === "years" && selectedYears.length > 0)
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-500"
                                }`}
                              >
                                {filterType === "dateRange" && dateRange.from && dateRange.to
                                  ? `${format(dateRange.from, "MMM dd")} → ${format(dateRange.to, "MMM dd, yyyy")}`
                                  : filterType === "years" && selectedYears.length > 0
                                    ? selectedYears.length === 1
                                      ? `${selectedYears[0]} Season`
                                      : `${selectedYears.length} Seasons Selected`
                                    : "Select time period"}
                              </span>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                className="h-4 w-4 text-gray-400 flex-shrink-0 ml-1"
                              />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] min-w-[420px]"
                            align="start"
                          >
                            <div className="space-y-6">
                              {/* Header */}
                              <div className="border-b pb-3">
                                <h3 className="font-semibold text-gray-900">Select Time Period</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  Choose between specific seasons or a custom date range
                                </p>
                              </div>

                              {/* Mode Selection - Radio Buttons */}
                              <div className="space-y-3">
                                <div className="flex items-center space-x-4">
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="filterType"
                                      value="years"
                                      checked={filterType === "years"}
                                      onChange={() => setFilterType("years")}
                                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Season Years</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="filterType"
                                      value="dateRange"
                                      checked={filterType === "dateRange"}
                                      onChange={() => setFilterType("dateRange")}
                                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Custom Date Range</span>
                                  </label>
                                </div>
                              </div>

                              {/* Content Area */}
                              <div className="min-h-[300px]">
                                {filterType === "years" ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-900">Available Seasons</h4>
                                      {selectedYears.length > 0 && (
                                        <button
                                          onClick={() => setSelectedYears([])}
                                          className="text-xs text-red-600 hover:text-red-700 underline"
                                        >
                                          Clear Selection
                                        </button>
                                      )}
                                    </div>

                                    {/* Selected Years Display */}
                                    {selectedYears.length > 0 && (
                                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="text-sm font-medium text-green-900 mb-1">Selected Seasons</div>
                                        <div className="text-green-800">
                                          {selectedYears
                                            .sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
                                            .join(", ")}
                                        </div>
                                        <div className="text-xs text-green-600 mt-1">
                                          {selectedYears.length} season{selectedYears.length !== 1 ? "s" : ""} selected
                                        </div>
                                      </div>
                                    )}

                                    {/* Year Selection Grid */}
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium text-gray-700">Select Seasons (up to 5)</div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {availableYears.map((year) => (
                                          <div key={year} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`year-${year}`}
                                              checked={selectedYears.includes(year)}
                                              onCheckedChange={() => handleYearToggle(year)}
                                              disabled={!selectedYears.includes(year) && selectedYears.length >= 5}
                                            />
                                            <label htmlFor={`year-${year}`} className="text-sm cursor-pointer flex-1">
                                              {year} Season
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                      {selectedYears.length >= 5 && (
                                        <div className="text-xs text-amber-600 mt-2">
                                          Maximum of 5 seasons can be selected
                                        </div>
                                      )}
                                    </div>

                                    <div className="pt-2 border-t">
                                      <button
                                        onClick={() => setSelectedYears([...availableYears])}
                                        className="btn-secondary btn-sm w-full"
                                        disabled={selectedYears.length >= 5}
                                      >
                                        Select All Available
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-900">Select Date Range</h4>
                                      {dateRange.from && dateRange.to && (
                                        <button
                                          onClick={() => setDateRange({ from: undefined, to: undefined })}
                                          className="text-xs text-red-600 hover:text-red-700 underline"
                                        >
                                          Clear Dates
                                        </button>
                                      )}
                                    </div>

                                    {/* Selected Date Range Display */}
                                    {dateRange.from && dateRange.to && (
                                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="text-sm font-medium text-green-900 mb-1">Selected Range</div>
                                        <div className="text-green-800">
                                          {format(dateRange.from, "MMMM dd, yyyy")} →{" "}
                                          {format(dateRange.to, "MMMM dd, yyyy")}
                                        </div>
                                        <div className="text-xs text-green-600 mt-1">
                                          {Math.ceil(
                                            (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24),
                                          )}{" "}
                                          days selected
                                        </div>
                                      </div>
                                    )}

                                    {/* Quick Preset Options */}
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium text-gray-700">Quick Presets</div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {[
                                          { label: "Last 30 Days", days: 30 },
                                          { label: "Last 90 Days", days: 90 },
                                          { label: "Last 6 Months", days: 180 },
                                          { label: "Last Year", days: 365 },
                                        ].map((preset) => (
                                          <button
                                            key={preset.label}
                                            onClick={() => {
                                              const to = new Date()
                                              const from = new Date()
                                              from.setDate(from.getDate() - preset.days)
                                              setDateRange({ from, to })
                                            }}
                                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-left"
                                          >
                                            {preset.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Calendar */}
                                    <div className="border-t pt-4">
                                      <div className="text-sm font-medium text-gray-700 mb-3">Custom Selection</div>
                                      <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={(range) => {
                                          setDateRange({ from: range?.from, to: range?.to })
                                        }}
                                        numberOfMonths={1}
                                        initialFocus
                                        className="w-full"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Footer Actions */}
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-xs text-gray-500">
                                  {filterType === "years"
                                    ? `${selectedYears.length} season${selectedYears.length !== 1 ? "s" : ""} selected`
                                    : dateRange.from && dateRange.to
                                      ? "Date range selected"
                                      : "No dates selected"}
                                </div>
                                <button
                                  onClick={() => {
                                    if (filterType === "years") {
                                      setSelectedYears([])
                                    } else {
                                      setDateRange({ from: undefined, to: undefined })
                                    }
                                  }}
                                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                  Clear All
                                </button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Page Specific Metrics - Collapsible */}
                    <div className="border-t pt-4">
                      <button
                        onClick={() => setShowPageSpecificMetrics(!showPageSpecificMetrics)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3"
                      >
                        <FontAwesomeIcon
                          icon={showPageSpecificMetrics ? faChevronDown : faChevronUp}
                          className="h-3 w-3"
                        />
                        Page Specific Metrics
                      </button>

                      {showPageSpecificMetrics && (
                        <div className="space-y-4">
                          {/* Row 2: Page Specific Metrics */}
                          <div className="grid grid-cols-3 gap-4">
                            {/* Platforms */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Platforms
                                <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <span className="text-gray-500">Select Platforms</span>
                                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                                  <div className="space-y-2">
                                    {PLATFORMS_OPTIONS.map((option) => (
                                      <div key={option} className="flex items-center space-x-2">
                                        <Checkbox id={option} />
                                        <label htmlFor={option} className="text-sm">
                                          {option}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Account Types */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Types
                                <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <span className="text-gray-500">Select Account Types</span>
                                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                                  <div className="space-y-2">
                                    {ACCOUNT_TYPES_OPTIONS.map((option) => (
                                      <div key={option} className="flex items-center space-x-2">
                                        <Checkbox id={option} />
                                        <label htmlFor={option} className="text-sm">
                                          {option}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Media Types */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Media Types
                                <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <span className="text-gray-500">Select Media Types</span>
                                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                                  <div className="space-y-2">
                                    {MEDIA_TYPES_OPTIONS.map((option) => (
                                      <div key={option} className="flex items-center space-x-2">
                                        <Checkbox id={option} />
                                        <label htmlFor={option} className="text-sm">
                                          {option}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          {/* Row 3: Additional Filters */}
                          <div className="grid grid-cols-3 gap-4">
                            {/* Collections */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Collections
                                <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <span className="text-gray-500">Select Collections</span>
                                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                                  <div className="space-y-2">
                                    {COLLECTIONS_OPTIONS.map((option) => (
                                      <div key={option} className="flex items-center space-x-2">
                                        <Checkbox id={option} />
                                        <label htmlFor={option} className="text-sm">
                                          {option}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Hashtags */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hashtags
                                <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <span className="text-gray-500">
                                      {selectedHashtags.length > 0
                                        ? `${selectedHashtags.length} hashtags selected`
                                        : "Enter hashtags"}
                                    </span>
                                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium text-sm">Add Hashtags</div>
                                      {selectedHashtags.length > 0 && (
                                        <button onClick={() => setSelectedHashtags([])} className="btn-tertiary btn-sm">
                                          Clear All
                                        </button>
                                      )}
                                    </div>

                                    {/* Input for adding hashtags */}
                                    <div className="space-y-2">
                                      <input
                                        type="text"
                                        placeholder="Enter hashtag (e.g., #NBA, #Basketball)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            const value = e.currentTarget.value.trim()
                                            if (value && !selectedHashtags.includes(value)) {
                                              const hashtag = value.startsWith("#") ? value : `#${value}`
                                              setSelectedHashtags((prev) => [...prev, hashtag])
                                              e.currentTarget.value = ""
                                            }
                                          }
                                        }}
                                      />
                                      <div className="text-xs text-gray-500">Press Enter to add hashtag</div>
                                    </div>

                                    {/* Selected Hashtags */}
                                    {selectedHashtags.length > 0 && (
                                      <div className="space-y-2">
                                        <div className="text-sm font-medium">Selected Hashtags:</div>
                                        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                          {selectedHashtags.map((hashtag, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="flex items-center gap-1 text-xs"
                                            >
                                              {hashtag}
                                              <button
                                                onClick={() =>
                                                  setSelectedHashtags((prev) => prev.filter((_, i) => i !== index))
                                                }
                                                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                              >
                                                <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                              </button>
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Suggested hashtags */}
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium">Suggested:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {["#NBA", "#Basketball", "#Sports", "#GameDay", "#Playoffs", "#Finals"].map(
                                          (suggestion) => (
                                            <button
                                              key={suggestion}
                                              onClick={() => {
                                                if (!selectedHashtags.includes(suggestion)) {
                                                  setSelectedHashtags((prev) => [...prev, suggestion])
                                                }
                                              }}
                                              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                              disabled={selectedHashtags.includes(suggestion)}
                                            >
                                              {suggestion}
                                            </button>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          {/* Row 4: Comparison Dates */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comparison Dates
                                <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <span className="text-gray-500">Select Comparison Dates</span>
                                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                                  <div className="space-y-2">
                                    {COMPARISON_DATES_OPTIONS.map((option) => (
                                      <div key={option} className="flex items-center space-x-2">
                                        <Checkbox id={option} />
                                        <label htmlFor={option} className="text-sm">
                                          {option}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Group By
                                  <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                                </label>
                                <button
                                  onClick={() => {
                                    // Set current groupBy as default
                                    console.log(`Setting ${groupBy} as default Group By`)
                                  }}
                                  className="text-xs text-blue-500 hover:text-blue-700 underline"
                                >
                                  Set as default Group By
                                </button>
                              </div>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <span className="text-gray-700">{groupBy}</span>
                                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                                  <div className="space-y-2">
                                    {GROUP_BY_OPTIONS.map((option) => (
                                      <div key={option} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`groupby-${option}`}
                                          checked={groupBy === option}
                                          onCheckedChange={() => setGroupBy(option)}
                                        />
                                        <label htmlFor={`groupby-${option}`} className="text-sm cursor-pointer flex-1">
                                          {option}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>

                              {/* Group By Tag Display */}
                              {groupBy && (
                                <div className="mt-2">
                                  <Badge variant="secondary" className="flex items-center gap-1 text-xs w-fit">
                                    Group By {groupBy}
                                    <button
                                      onClick={() => setGroupBy("Date")}
                                      className="ml-1 hover:bg-gray-300 rounded-full p-1 flex items-center justify-center"
                                    >
                                      <FontAwesomeIcon icon={faTimes} className="h-2.5 w-2.5" />
                                    </button>
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                      <button onClick={openSaveFilterDrawer} className="btn-secondary flex items-center gap-2">
                        <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                        Save Filter
                      </button>
                      <button
                        onClick={() => setShowSavedFiltersDrawer(true)}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faFolderOpen} className="h-4 w-4" />
                        Saved Filters ({savedFilters.length})
                      </button>
                      <button onClick={clearAllFilters} className="btn-utility flex items-center gap-2">
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                        Clear All Filters
                      </button>
                      <button onClick={applyFilters} className="btn-primary flex items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
                        Update Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Filter Bar for Insights Tab */}
            <TabsContent value="insights" className="mt-6 mb-0">
              <div className="p-5">
                {/* Sort Filters Header with Active Tags */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                      <span className="text-sm font-medium">Sort Filters</span>
                      <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
                    </button>

                    {/* Active Filter Tags for Insights Tab */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Time Period Tags */}
                      {filterType === "dateRange" && dateRange.from && dateRange.to && (
                        <>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            From: {format(dateRange.from, "yyyy-MM-dd")}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            To: {format(dateRange.to, "yyyy-MM-dd")}
                          </Badge>
                        </>
                      )}
                      {filterType === "years" && selectedYears.length > 0 && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                          Years: {selectedYears.join(", ")}
                        </Badge>
                      )}
                      {/* Default to current year if no time period is selected */}
                      {filterType === "years" && selectedYears.length === 0 && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">Years: 2025</Badge>
                      )}
                      {filterType === "dateRange" && (!dateRange.from || !dateRange.to) && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">Years: 2025</Badge>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={isFilterExpanded ? faChevronUp : faChevronDown} className="h-4 w-4" />
                  </button>
                </div>

                {/* Main Filters Grid - Collapsible */}
                {isFilterExpanded && (
                  <div className="space-y-4">
                    {/* Main Filter Row - 5 Filters */}
                    <div className="grid grid-cols-5 gap-4">
                      {/* Sponsors */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sponsors
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span className="text-gray-500">Select Sponsors</span>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Select Sponsors</div>
                                {selectedSponsors.length > 0 && (
                                  <button onClick={clearAllSponsors} className="btn-tertiary btn-sm">
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Selected Sponsors Tags */}
                              {selectedSponsors.length > 0 && (
                                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                  {selectedSponsors.map((sponsor) => (
                                    <Badge
                                      key={sponsor}
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {sponsor}
                                      <button
                                        onClick={() => removeSponsor(sponsor)}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Hierarchical Sponsors by Category */}
                              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                {Object.entries(SPONSORS_BY_CATEGORY).map(([category, sponsors]) => (
                                  <div key={category} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`insights-sponsor-category-${category}`}
                                        checked={isSponsorCategoryFullySelected(sponsors)}
                                        ref={(el) => {
                                          if (el) el.indeterminate = isSponsorCategoryPartiallySelected(sponsors)
                                        }}
                                        onCheckedChange={() => handleSponsorCategorySelectAll(sponsors)}
                                      />
                                      <label
                                        htmlFor={`insights-sponsor-category-${category}`}
                                        className="text-sm font-semibold text-gray-800 cursor-pointer border-b pb-1"
                                      >
                                        {category}
                                      </label>
                                      <span className="text-xs text-gray-500">({sponsors.length})</span>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                      {sponsors.map((sponsor) => (
                                        <div key={sponsor} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`insights-sponsor-${sponsor}`}
                                            checked={selectedSponsors.includes(sponsor)}
                                            onCheckedChange={() => handleSponsorToggle(sponsor)}
                                          />
                                          <label
                                            htmlFor={`insights-sponsor-${sponsor}`}
                                            className="text-sm cursor-pointer"
                                          >
                                            {sponsor}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}

                                <div className="pt-2 border-t">
                                  <button
                                    onClick={() => setSelectedSponsors([...ALL_SPONSORS])}
                                    className="btn-secondary btn-sm w-full"
                                  >
                                    Select All
                                  </button>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Rightsholders */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rightsholders
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span className="text-gray-500">Select Rightsholders</span>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Select Rightsholders</div>
                                {selectedRightsholders.length > 0 && (
                                  <button onClick={clearAllRightsholders} className="btn-tertiary btn-sm">
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Selected Rightsholders Tags */}
                              {selectedRightsholders.length > 0 && (
                                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                  {selectedRightsholders.map((rightsholder) => (
                                    <Badge
                                      key={rightsholder}
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {rightsholder}
                                      <button
                                        onClick={() => removeRightsholder(rightsholder)}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Hierarchical Rightsholders by League */}
                              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                {Object.entries(RIGHTSHOLDERS_STRUCTURE).map(([league, teams]) => (
                                  <div key={league} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`insights-rightsholder-league-${league}`}
                                        checked={isRightsholderCategoryFullySelected(teams)}
                                        ref={(el) => {
                                          if (el) el.indeterminate = isRightsholderCategoryPartiallySelected(teams)
                                        }}
                                        onCheckedChange={() => handleRightsholderCategorySelectAll(teams)}
                                      />
                                      <label
                                        htmlFor={`insights-rightsholder-league-${league}`}
                                        className="text-sm font-semibold text-gray-800 cursor-pointer border-b pb-1"
                                      >
                                        {league}
                                      </label>
                                      <span className="text-xs text-gray-500">({teams.length})</span>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                      {teams.map((team) => (
                                        <div key={team} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`insights-rightsholder-${team}`}
                                            checked={selectedRightsholders.includes(team)}
                                            onCheckedChange={() => handleRightsholderToggle(team)}
                                          />
                                          <label
                                            htmlFor={`insights-rightsholder-${team}`}
                                            className="text-sm cursor-pointer"
                                          >
                                            {team}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}

                                <div className="pt-2 border-t">
                                  <button
                                    onClick={() => setSelectedRightsholders([...ALL_RIGHTSHOLDERS])}
                                    className="btn-secondary btn-sm w-full"
                                  >
                                    Select All
                                  </button>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Placements */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Placements
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span className="text-gray-500">Select Placements</span>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Select Placements</div>
                                {selectedPlacements.length > 0 && (
                                  <button onClick={clearAllPlacements} className="btn-tertiary btn-sm">
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Selected Placements Tags */}
                              {selectedPlacements.length > 0 && (
                                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md">
                                  {selectedPlacements.map((placement) => (
                                    <Badge
                                      key={placement}
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {placement}
                                      <button
                                        onClick={() => removePlacement(placement)}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Placement Options */}
                              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                {PLACEMENT_OPTIONS.map((placement) => (
                                  <div key={placement} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`insights-placement-${placement}`}
                                      checked={selectedPlacements.includes(placement)}
                                      onCheckedChange={() => handlePlacementToggle(placement)}
                                    />
                                    <label
                                      htmlFor={`insights-placement-${placement}`}
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      {placement}
                                    </label>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2 border-t">
                                <button
                                  onClick={() => setSelectedPlacements([...PLACEMENT_OPTIONS])}
                                  className="btn-secondary btn-sm w-full"
                                >
                                  Select All
                                </button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Insights Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Insights Type
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span className="text-gray-500">Select Insights Type</span>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Select Insights Type</div>
                                {selectedInsightsTypes.length > 0 && (
                                  <button onClick={clearAllInsightsTypes} className="btn-tertiary btn-sm">
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Selected Insights Types Tags */}
                              {selectedInsightsTypes.length > 0 && (
                                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                  {selectedInsightsTypes.map((insightsType) => (
                                    <Badge
                                      key={insightsType}
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {insightsType}
                                      <button
                                        onClick={() => removeInsightsType(insightsType)}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Insights Type Options */}
                              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                {INSIGHTS_TYPE_OPTIONS.map((insightsType) => (
                                  <div key={insightsType} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`insights-type-${insightsType}`}
                                      checked={selectedInsightsTypes.includes(insightsType)}
                                      onCheckedChange={() => handleInsightsTypeToggle(insightsType)}
                                    />
                                    <label
                                      htmlFor={`insights-type-${insightsType}`}
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      {insightsType}
                                    </label>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2 border-t">
                                <button
                                  onClick={() => setSelectedInsightsTypes([...INSIGHTS_TYPE_OPTIONS])}
                                  className="btn-secondary btn-sm w-full"
                                >
                                  Select All
                                </button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Time Period */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Period
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span
                                className={`truncate pr-2 min-w-0 flex-1 ${
                                  (filterType === "dateRange" && dateRange.from && dateRange.to) ||
                                  (filterType === "years" && selectedYears.length > 0)
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-500"
                                }`}
                              >
                                {filterType === "dateRange" && dateRange.from && dateRange.to
                                  ? `${format(dateRange.from, "MMM dd")} → ${format(dateRange.to, "MMM dd, yyyy")}`
                                  : filterType === "years" && selectedYears.length > 0
                                    ? selectedYears.length === 1
                                      ? `${selectedYears[0]} Season`
                                      : `${selectedYears.length} Seasons Selected`
                                    : "Select time period"}
                              </span>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                className="h-4 w-4 text-gray-400 flex-shrink-0 ml-1"
                              />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] min-w-[420px]"
                            align="start"
                          >
                            <div className="space-y-6">
                              {/* Header */}
                              <div className="border-b pb-3">
                                <h3 className="font-semibold text-gray-900">Select Time Period</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  Choose between specific seasons or a custom date range
                                </p>
                              </div>

                              {/* Mode Selection - Radio Buttons */}
                              <div className="space-y-3">
                                <div className="flex items-center space-x-4">
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="insightsFilterType"
                                      value="years"
                                      checked={filterType === "years"}
                                      onChange={() => setFilterType("years")}
                                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Season Years</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="insightsFilterType"
                                      value="dateRange"
                                      checked={filterType === "dateRange"}
                                      onChange={() => setFilterType("dateRange")}
                                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Custom Date Range</span>
                                  </label>
                                </div>
                              </div>

                              {/* Content Area */}
                              <div className="min-h-[300px]">
                                {filterType === "years" ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-900">Available Seasons</h4>
                                      {selectedYears.length > 0 && (
                                        <button
                                          onClick={() => setSelectedYears([])}
                                          className="text-xs text-red-600 hover:text-red-700 underline"
                                        >
                                          Clear Selection
                                        </button>
                                      )}
                                    </div>

                                    {/* Selected Years Display */}
                                    {selectedYears.length > 0 && (
                                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="text-sm font-medium text-green-900 mb-1">Selected Seasons</div>
                                        <div className="text-green-800">
                                          {selectedYears
                                            .sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
                                            .join(", ")}
                                        </div>
                                        <div className="text-xs text-green-600 mt-1">
                                          {selectedYears.length} season{selectedYears.length !== 1 ? "s" : ""} selected
                                        </div>
                                      </div>
                                    )}

                                    {/* Year Selection Grid */}
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium text-gray-700">Select Seasons (up to 5)</div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {availableYears.map((year) => (
                                          <div key={year} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`insights-year-${year}`}
                                              checked={selectedYears.includes(year)}
                                              onCheckedChange={() => handleYearToggle(year)}
                                              disabled={!selectedYears.includes(year) && selectedYears.length >= 5}
                                            />
                                            <label
                                              htmlFor={`insights-year-${year}`}
                                              className="text-sm cursor-pointer flex-1"
                                            >
                                              {year} Season
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                      {selectedYears.length >= 5 && (
                                        <div className="text-xs text-amber-600 mt-2">
                                          Maximum of 5 seasons can be selected
                                        </div>
                                      )}
                                    </div>

                                    <div className="pt-2 border-t">
                                      <button
                                        onClick={() => setSelectedYears([...availableYears])}
                                        className="btn-secondary btn-sm w-full"
                                        disabled={selectedYears.length >= 5}
                                      >
                                        Select All Available
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-900">Select Date Range</h4>
                                      {dateRange.from && dateRange.to && (
                                        <button
                                          onClick={() => setDateRange({ from: undefined, to: undefined })}
                                          className="text-xs text-red-600 hover:text-red-700 underline"
                                        >
                                          Clear Dates
                                        </button>
                                      )}
                                    </div>

                                    {/* Selected Date Range Display */}
                                    {dateRange.from && dateRange.to && (
                                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="text-sm font-medium text-green-900 mb-1">Selected Range</div>
                                        <div className="text-green-800">
                                          {format(dateRange.from, "MMMM dd, yyyy")} →{" "}
                                          {format(dateRange.to, "MMMM dd, yyyy")}
                                        </div>
                                        <div className="text-xs text-green-600 mt-1">
                                          {Math.ceil(
                                            (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24),
                                          )}{" "}
                                          days selected
                                        </div>
                                      </div>
                                    )}

                                    {/* Quick Preset Options */}
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium text-gray-700">Quick Presets</div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {[
                                          { label: "Last 30 Days", days: 30 },
                                          { label: "Last 90 Days", days: 90 },
                                          { label: "Last 6 Months", days: 180 },
                                          { label: "Last Year", days: 365 },
                                        ].map((preset) => (
                                          <button
                                            key={preset.label}
                                            onClick={() => {
                                              const to = new Date()
                                              const from = new Date()
                                              from.setDate(from.getDate() - preset.days)
                                              setDateRange({ from, to })
                                            }}
                                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-left"
                                          >
                                            {preset.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Calendar */}
                                    <div className="border-t pt-4">
                                      <div className="text-sm font-medium text-gray-700 mb-3">Custom Selection</div>
                                      <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={(range) => {
                                          setDateRange({ from: range?.from, to: range?.to })
                                        }}
                                        numberOfMonths={1}
                                        initialFocus
                                        className="w-full"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Footer Actions */}
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-xs text-gray-500">
                                  {filterType === "years"
                                    ? `${selectedYears.length} season${selectedYears.length !== 1 ? "s" : ""} selected`
                                    : dateRange.from && dateRange.to
                                      ? "Date range selected"
                                      : "No dates selected"}
                                </div>
                                <button
                                  onClick={() => {
                                    if (filterType === "years") {
                                      setSelectedYears([])
                                    } else {
                                      setDateRange({ from: undefined, to: undefined })
                                    }
                                  }}
                                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                  Clear All
                                </button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                      <button onClick={clearAllFilters} className="btn-utility flex items-center gap-2">
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                        Clear All Filters
                      </button>
                      <button onClick={applyFilters} className="btn-primary flex items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
                        Update Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="p-6 pt-0">
        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
          {/* Content based on selected tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            {/* Analytics Sub-tabs Section */}
            <Tabs defaultValue="breakdown" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-auto">
                  <TabsTrigger
                    value="breakdown"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <FontAwesomeIcon icon={faTable} className="h-4 w-4 mr-2" />
                    Breakdown
                  </TabsTrigger>
                  <TabsTrigger
                    value="visualization"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <FontAwesomeIcon icon={faChartColumn} className="h-4 w-4 mr-2" />
                    Visualization
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="breakdown" className="space-y-6">
                <DataTable data={filteredData} />
              </TabsContent>

              <TabsContent value="visualization" className="space-y-6">
                <DataBarChart data={filteredData} />
                <MultiMetricChart data={filteredData} />
                <ComparisonLineChart data={filteredData} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 mt-6">
            {/* Insights Content */}
            <AutomatedInsights data={filteredData} />
          </TabsContent>
        </Tabs>
      </div>
      {/* Save Filter Drawer */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden ${showSaveFilterDrawer || showSavedFiltersDrawer ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
            showSaveFilterDrawer || showSavedFiltersDrawer ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => {
            setShowSaveFilterDrawer(false)
            setShowSavedFiltersDrawer(false)
          }}
        />
        <div
          className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            showSaveFilterDrawer || showSavedFiltersDrawer ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {showSaveFilterDrawer && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingFilterId ? "Edit Filter" : "Save Filter"}
                </h2>
                <button
                  onClick={() => setShowSaveFilterDrawer(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter Name *</label>
                    <input
                      type="text"
                      value={filterNameToSave}
                      onChange={(e) => setFilterNameToSave(e.target.value)}
                      placeholder="Enter filter name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={filterDescriptionToSave}
                      onChange={(e) => setFilterDescriptionToSave(e.target.value)}
                      placeholder="Enter filter description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                          <span className="text-gray-700">{filterCategoryToSave}</span>
                          <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                        <div className="space-y-2">
                          {FILTER_CATEGORIES.map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                              <Checkbox
                                id={`category-${category}`}
                                checked={filterCategoryToSave === category}
                                onCheckedChange={() => setFilterCategoryToSave(category)}
                              />
                              <label htmlFor={`category-${category}`} className="text-sm cursor-pointer flex-1">
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Filter Summary */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Filter Summary</h3>
                    <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      <div>
                        <span className="font-medium text-gray-800">Time Period:</span>{" "}
                        <span className="text-gray-700">
                          {filterType === "dateRange" && dateRange.from && dateRange.to
                            ? `${format(dateRange.from, "MMM dd")} → ${format(dateRange.to, "MMM dd, yyyy")}`
                            : filterType === "years" && selectedYears.length > 0
                              ? `${selectedYears.join(", ")} Season${selectedYears.length > 1 ? "s" : ""}`
                              : "2025 Season (Default)"}
                        </span>
                      </div>
                      {selectedRightsholders.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-800">Rightsholders:</span>{" "}
                          <span className="text-gray-700">{selectedRightsholders.length} selected</span>
                        </div>
                      )}
                      {selectedSponsors.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-800">Sponsors:</span>{" "}
                          <span className="text-gray-700">{selectedSponsors.length} selected</span>
                        </div>
                      )}
                      {selectedPlacements.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-800">Placements:</span>{" "}
                          <span className="text-gray-700">{selectedPlacements.length} selected</span>
                        </div>
                      )}
                      {selectedPlacementTypes.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-800">Placement Types:</span>{" "}
                          <span className="text-gray-700">{selectedPlacementTypes.length} selected</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-800">Group By:</span>{" "}
                        <span className="text-gray-700">{groupBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t p-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSaveFilterDrawer(false)}
                    className="flex-1 btn-secondary transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCurrentFilters}
                    disabled={!filterNameToSave.trim()}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {editingFilterId ? "Update Filter" : "Save Filter"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showSavedFiltersDrawer && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold text-gray-900">Saved Filters ({savedFilters.length})</h2>
                <button
                  onClick={() => setShowSavedFiltersDrawer(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4">
                <Input
                  type="text"
                  placeholder="Search saved filters..."
                  value={filterCategorySearch}
                  onChange={(e) => setFilterCategorySearch(e.target.value)}
                  className="mb-4"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {savedFilters.length === 0 ? (
                  <div className="text-center py-8">
                    <FontAwesomeIcon icon={faBookmark} className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">No saved filters yet</p>
                    <p className="text-sm text-gray-400 mt-1">Save your current filters to quickly access them later</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSavedFilters
                      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                      .map((savedFilter) => (
                        <div
                          key={savedFilter.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors duration-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{savedFilter.name}</h3>
                              {savedFilter.description && (
                                <p className="text-sm text-gray-600 mt-1">{savedFilter.description}</p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200">
                                  <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4 text-gray-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => applySavedFilter(savedFilter)}>
                                  <FontAwesomeIcon icon={faFilter} className="mr-2 h-4 w-4" />
                                  Apply Filter
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => editSavedFilter(savedFilter)}>
                                  <FontAwesomeIcon icon={faEdit} className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteSavedFilter(savedFilter.id)}
                                  className="text-red-600"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="text-xs text-gray-500 mb-3">
                            Created: {savedFilter.createdAt.toLocaleDateString()} at{" "}
                            {savedFilter.createdAt.toLocaleTimeString()}
                          </div>

                          {/* Filter Preview */}
                          <div className="space-y-1 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Time:</span>{" "}
                              {savedFilter.filters.filterType === "dateRange" &&
                              savedFilter.filters.dateRange.from &&
                              savedFilter.filters.dateRange.to
                                ? `${format(savedFilter.filters.dateRange.from, "MMM dd")} → ${format(savedFilter.filters.dateRange.to, "MMM dd, yyyy")}`
                                : savedFilter.filters.filterType === "years" &&
                                    savedFilter.filters.selectedYears.length > 0
                                  ? `${savedFilter.filters.selectedYears.join(", ")} Season${savedFilter.filters.selectedYears.length > 1 ? "s" : ""}`
                                  : "2025 Season"}
                            </div>
                            {savedFilter.filters.selectedRightsholders.length > 0 && (
                              <div>
                                <span className="font-medium">Rightsholders:</span>{" "}
                                {savedFilter.filters.selectedRightsholders.length}
                              </div>
                            )}
                            {savedFilter.filters.selectedSponsors.length > 0 && (
                              <div>
                                <span className="font-medium">Sponsors:</span>{" "}
                                {savedFilter.filters.selectedSponsors.length}
                              </div>
                            )}
                            {savedFilter.filters.selectedPlacements.length > 0 && (
                              <div>
                                <span className="font-medium">Placements:</span>{" "}
                                {savedFilter.filters.selectedPlacements.length}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Group By:</span> {savedFilter.filters.groupBy}
                            </div>
                          </div>

                          <button
                            onClick={() => applySavedFilter(savedFilter)}
                            className="w-full mt-3 btn-primary btn-sm transition-colors duration-200"
                          >
                            Apply This Filter
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {savedFilters.length > 0 && (
                <div className="border-t p-4">
                  <button
                    onClick={() => {
                      setSavedFilters([])
                      setShowSavedFiltersDrawer(false)
                    }}
                    className="w-full btn-utility text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    Clear All Saved Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
