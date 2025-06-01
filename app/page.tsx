"use client"
import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import DataTable from "../data-table"
import DataBarChart from "../bar-chart"
import MultiMetricChart from "../multi-metric-chart"
import ComparisonLineChart from "../line-chart"
import AutomatedInsights from "../automated-insights"
import {
  faTable,
  faChartColumn,
  faTimes,
  faChevronDown,
  faChartLine,
  faLightbulb,
  faFilter,
  faChevronUp,
  faSave,
  faFolderOpen,
  faSliders,
} from "@fortawesome/free-solid-svg-icons"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

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
  const [chatInput, setChatInput] = useState("")
  const [activeTab, setActiveTab] = useState("generate")
  const [isSecondaryFiltersExpanded, setIsSecondaryFiltersExpanded] = useState(false)
  const [isTemplateGalleryExpanded, setIsTemplateGalleryExpanded] = useState(true)

  // Template Gallery state
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Template data
  const templateData = [
    {
      id: 1,
      title: "ROI Trend Analysis",
      description:
        "Analyze return on investment trends across different time periods and identify optimization opportunities.",
      category: "ROI Analysis",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=ROI+Chart",
      prompt:
        "Analyze ROI trends for the selected sponsors and time period. Show me the return on investment patterns, identify the best and worst performing periods, and provide recommendations for optimization.",
    },
    {
      id: 2,
      title: "Top Platform Comparison",
      description:
        "Compare performance metrics across different social media platforms to identify the most effective channels.",
      category: "Platform Performance",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Platform+Chart",
      prompt:
        "Compare performance across all selected platforms. Show me which platforms generate the highest engagement, reach, and conversion rates. Include recommendations for platform-specific strategies.",
    },
    {
      id: 3,
      title: "Sponsor Engagement Overview",
      description: "Get a comprehensive view of sponsor engagement metrics and performance indicators.",
      category: "Audience Insights",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Engagement+Chart",
      prompt:
        "Provide a comprehensive sponsor engagement analysis. Show me engagement rates, audience interaction patterns, and identify which sponsors are performing best in terms of audience connection.",
    },
    {
      id: 4,
      title: "Seasonal Performance Trends",
      description: "Identify seasonal patterns and trends in your sponsorship performance data.",
      category: "Trend Comparison",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Seasonal+Chart",
      prompt:
        "Analyze seasonal performance trends in the data. Show me how sponsorship performance varies by season, identify peak and low periods, and provide insights for seasonal strategy optimization.",
    },
    {
      id: 5,
      title: "Placement Effectiveness Analysis",
      description: "Evaluate the effectiveness of different placement types and locations for maximum impact.",
      category: "Custom Metrics",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Placement+Chart",
      prompt:
        "Analyze placement effectiveness across all selected placement types. Show me which placements generate the highest SMV, impressions, and engagement. Include recommendations for placement optimization.",
    },
    {
      id: 6,
      title: "Audience Demographics Breakdown",
      description: "Deep dive into audience demographics and behavior patterns for targeted insights.",
      category: "Audience Insights",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Demographics+Chart",
      prompt:
        "Provide a detailed audience demographics breakdown. Show me audience composition, behavior patterns, and engagement preferences. Include insights for targeted marketing strategies.",
    },
    {
      id: 7,
      title: "Competitive Benchmarking",
      description: "Compare your performance against industry benchmarks and competitor analysis.",
      category: "Trend Comparison",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Benchmark+Chart",
      prompt:
        "Perform competitive benchmarking analysis. Compare our performance metrics against industry standards and identify areas where we outperform or underperform compared to competitors.",
    },
    {
      id: 8,
      title: "Revenue Attribution Model",
      description: "Track and attribute revenue to specific sponsorship activities and campaigns.",
      category: "ROI Analysis",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Revenue+Chart",
      prompt:
        "Create a revenue attribution analysis. Show me how different sponsorship activities contribute to revenue generation and identify the highest value sponsorship investments.",
    },
    {
      id: 9,
      title: "Content Performance Matrix",
      description: "Analyze content performance across different formats and platforms for optimization.",
      category: "Platform Performance",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Content+Chart",
      prompt:
        "Analyze content performance across different formats and platforms. Show me which content types perform best, optimal posting times, and content strategy recommendations.",
    },
    {
      id: 10,
      title: "Brand Sentiment Analysis",
      description: "Monitor and analyze brand sentiment trends across all sponsorship activities.",
      category: "Audience Insights",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Sentiment+Chart",
      prompt:
        "Perform brand sentiment analysis across all sponsorship activities. Show me sentiment trends, identify positive and negative drivers, and provide recommendations for brand perception improvement.",
    },
    {
      id: 11,
      title: "Campaign Lifecycle Analysis",
      description: "Track campaign performance from launch to completion with detailed lifecycle insights.",
      category: "Custom Metrics",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Lifecycle+Chart",
      prompt:
        "Analyze campaign lifecycle performance. Show me how campaigns perform from launch through completion, identify optimal campaign durations, and provide insights for campaign timing optimization.",
    },
    {
      id: 12,
      title: "Cross-Platform Synergy",
      description: "Identify synergies and cross-platform effects in your multi-channel sponsorship strategy.",
      category: "Platform Performance",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Synergy+Chart",
      prompt:
        "Analyze cross-platform synergy effects. Show me how different platforms work together, identify complementary platform combinations, and provide recommendations for integrated multi-platform strategies.",
    },
  ]

  const categories = [
    "All",
    "ROI Analysis",
    "Trend Comparison",
    "Platform Performance",
    "Audience Insights",
    "Custom Metrics",
  ]

  // Template gallery helper functions
  const filteredTemplates = useMemo(() => {
    let filtered = templateData

    if (selectedCategory !== "All") {
      filtered = filtered.filter((template) => template.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return filtered
  }, [searchQuery, selectedCategory])

  const totalPages = Math.ceil(filteredTemplates.length / 6)
  const visibleTemplates = filteredTemplates.slice((currentPage - 1) * 6, currentPage * 6)

  const handleUseTemplate = (template: (typeof templateData)[0]) => {
    setChatInput(template.prompt)
    setMainTab("insights")
    setActiveTab("generate")

    // Focus the input after a brief delay to ensure tab switch completes
    setTimeout(() => {
      const inputElement = document.querySelector('input[placeholder*="Ask about your data"]') as HTMLInputElement
      if (inputElement) {
        inputElement.focus()
      }
    }, 100)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

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
    const filters: string[] = []

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
  const HASHTAGS_OPTIONS = ["#NBA", "#Basketball", "Sports", "#GameDay", "#Playoffs", "#Finals"]
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

  // Add animation states for drawers
  const [saveFilterDrawerAnimating, setSaveFilterDrawerAnimating] = useState(false)
  const [savedFiltersDrawerAnimating, setSavedFiltersDrawerAnimating] = useState(false)

  // Update the openSaveFilterDrawer function
  const openSaveFilterDrawer = () => {
    setFilterNameToSave("")
    setFilterDescriptionToSave("")
    setEditingFilterId(null)
    setShowSaveFilterDrawer(true)
    // Use requestAnimationFrame for smooth animation
    requestAnimationFrame(() => {
      setSaveFilterDrawerAnimating(true)
    })
  }

  // Add close functions with animation
  const closeSaveFilterDrawer = () => {
    setSaveFilterDrawerAnimating(false)
    setTimeout(() => setShowSaveFilterDrawer(false), 300)
  }

  const closeSavedFiltersDrawer = () => {
    setSavedFiltersDrawerAnimating(false)
    setTimeout(() => setShowSavedFiltersDrawer(false), 300)
  }

  // Update the openSavedFiltersDrawer function
  const openSavedFiltersDrawer = () => {
    setShowSavedFiltersDrawer(true)
    // Use requestAnimationFrame for smooth animation
    requestAnimationFrame(() => {
      setSavedFiltersDrawerAnimating(true)
    })
  }

  // Update the saveCurrentFilters function to use the new close function
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

    // Reset form and close with animation
    setFilterNameToSave("")
    setFilterDescriptionToSave("")
    setEditingFilterId(null)
    closeSaveFilterDrawer()
  }

  // Update applySavedFilter function
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
    closeSavedFiltersDrawer()
  }

  // Update editSavedFilter function
  const editSavedFilter = (savedFilter: (typeof savedFilters)[0]) => {
    setFilterNameToSave(savedFilter.name)
    setFilterDescriptionToSave(savedFilter.description || "")
    setEditingFilterId(savedFilter.id)
    setFilterCategoryToSave(savedFilter.category)
    closeSavedFiltersDrawer()
    // Open save drawer after closing saved filters drawer
    setTimeout(() => openSaveFilterDrawer(), 300)
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

  const deleteSavedFilter = (id: string) => {
    setSavedFilters((prev) => prev.filter((filter) => filter.id !== id))
  }

  // Add new state for insights sub-tabs
  const [insightsSubTab, setInsightsSubTab] = useState("automated")

  const handleGenerateFromTemplate = (template: (typeof templateData)[0]) => {
    // Simulate generating an automated insight based on the template
    console.log(`Generating automated insight from template: ${template.title}`)

    // You can add logic here to trigger specific insight generation
    // For now, we'll just scroll to the automated insights section
    setTimeout(() => {
      const insightsElement = document.getElementById("automated-insights-metrics")
      if (insightsElement) {
        insightsElement.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }

  // Add handlers for missing filters
  const handleComparisonDateToggle = (date: string) => {
    setSelectedComparisonDates([date]) // Only allow single selection
  }

  const removeComparisonDate = (date: string) => {
    setSelectedComparisonDates((prev) => prev.filter((d) => d !== date))
  }

  const clearAllComparisonDates = () => {
    setSelectedComparisonDates([])
  }

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

            {/* Analytics Tab Content */}
            <TabsContent value="analytics" className="mt-6 mb-0">
              <div className="p-5">
                {/* Active Filters Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                      className="flex items-center justify-between w-auto min-w-0 text-gray-600 hover:text-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faSliders} className="h-4 w-4" />
                        <span className="text-sm font-medium">Sort Filters</span>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">Group By: {groupBy}</Badge>
                      </div>
                    </button>

                    <button
                      onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                      className="ml-auto text-gray-600 hover:text-gray-800"
                    >
                      <FontAwesomeIcon icon={isFilterExpanded ? faChevronUp : faChevronDown} className="h-4 w-4" />
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

                      {/* Comparison Dates Tag */}
                      {selectedComparisonDates.length > 0 && (
                        <Badge className="bg-teal-100 text-teal-700 border-teal-300">
                          Comparison: {selectedComparisonDates[0]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Filters Grid - Collapsible */}
                {isFilterExpanded && (
                  <div className="space-y-4">
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

                    {/* Row 2: Secondary Filters - Collapsible */}
                    <div className="border-t pt-4 -mx-5">
                      <div className="px-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              onClick={() => setIsSecondaryFiltersExpanded(!isSecondaryFiltersExpanded)}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors border border-gray-200 w-full justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faChartLine} className="h-3 w-3" />
                                <span>Page Specific Metrics</span>
                              </div>
                              <FontAwesomeIcon
                                icon={isSecondaryFiltersExpanded ? faChevronUp : faChevronDown}
                                className="h-3 w-3"
                              />
                            </button>
                          </div>
                        </div>

                        {isSecondaryFiltersExpanded && (
                          <div className="grid grid-cols-2 gap-4">
                            {/* Comparison Dates */}
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
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium text-sm">Select Comparison Dates</div>
                                      {selectedComparisonDates.length > 0 && (
                                        <button onClick={clearAllComparisonDates} className="btn-tertiary btn-sm">
                                          Clear All
                                        </button>
                                      )}
                                    </div>

                                    {/* Selected Comparison Dates Tags */}
                                    {selectedComparisonDates.length > 0 && (
                                      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md">
                                        {selectedComparisonDates.map((date) => (
                                          <Badge
                                            key={date}
                                            variant="secondary"
                                            className="flex items-center gap-1 text-xs"
                                          >
                                            {date}
                                            <button
                                              onClick={() => removeComparisonDate(date)}
                                              className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                            >
                                              <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                            </button>
                                          </Badge>
                                        ))}
                                      </div>
                                    )}

                                    {/* Comparison Date Options */}
                                    <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                      {COMPARISON_DATES_OPTIONS.map((date) => (
                                        <div key={date} className="flex items-center space-x-2">
                                          <input
                                            type="radio"
                                            id={`comparison-date-${date}`}
                                            name="comparison-date"
                                            checked={selectedComparisonDates.includes(date)}
                                            onChange={() => handleComparisonDateToggle(date)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                          />
                                          <label
                                            htmlFor={`comparison-date-${date}`}
                                            className="text-sm cursor-pointer flex-1"
                                          >
                                            {date}
                                          </label>
                                        </div>
                                      ))}
                                    </div>

                                    {selectedComparisonDates.length > 0 && (
                                      <div className="pt-2 border-t">
                                        <button
                                          onClick={() => setSelectedComparisonDates([])}
                                          className="btn-secondary btn-sm w-full"
                                        >
                                          Clear Selection
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Group By */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Group By
                                <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <span className="text-gray-700">{groupBy}</span>
                                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)]">
                                  <div className="space-y-1">
                                    {GROUP_BY_OPTIONS.map((option) => (
                                      <button
                                        key={option}
                                        onClick={() => {
                                          setGroupBy(option)
                                          // Close the popover
                                          document.body.click()
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                          groupBy === option
                                            ? "bg-blue-100 text-blue-900"
                                            : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                      >
                                        {option}
                                      </button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                      <button onClick={openSaveFilterDrawer} className="btn-secondary flex items-center gap-2">
                        <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                        Save Filter
                      </button>
                      <button onClick={openSavedFiltersDrawer} className="btn-secondary flex items-center gap-2">
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

            {/* Insights Tab Content */}
            <TabsContent value="insights" className="mt-6 mb-0">
              <div className="w-full">
                <div className="space-y-8">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Insight Template Gallery</h2>
                        <p className="text-sm text-gray-600">
                          Choose from pre-built templates to quickly generate automated insights for your data
                        </p>
                      </div>
                      <button
                        onClick={() => setIsTemplateGalleryExpanded(!isTemplateGalleryExpanded)}
                        className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={isTemplateGalleryExpanded ? faChevronUp : faChevronDown}
                          className="h-4 w-4"
                        />
                      </button>
                    </div>

                    {isTemplateGalleryExpanded && (
                      <>
                        {/* Search and Filter Toolbar */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex-1 max-w-md">
                            <Input
                              type="text"
                              placeholder="Search Templates..."
                              value={searchQuery}
                              onChange={(e) => handleSearchChange(e.target.value)}
                              className="h-10"
                            />
                          </div>
                          <div className="w-48">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="w-full flex items-center justify-between px-3 py-2 h-10 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                  <span className="text-gray-700">{selectedCategory}</span>
                                  <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48" align="start">
                                <div className="space-y-1">
                                  {categories.map((category) => (
                                    <button
                                      key={category}
                                      onClick={() => handleCategoryChange(category)}
                                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                        selectedCategory === category
                                          ? "bg-blue-100 text-blue-900"
                                          : "hover:bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {category}
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {/* Template Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                          {visibleTemplates.map((template) => (
                            <div
                              key={template.id}
                              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                              {/* Metrics Preview */}
                              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <div className="text-gray-500">SMV</div>
                                    <div className="font-semibold text-green-600">$2.4M</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Growth</div>
                                    <div className="font-semibold text-blue-600">+15.3%</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Impressions</div>
                                    <div className="font-semibold text-purple-600">1.2M</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Insights</div>
                                    <div className="font-semibold text-orange-600">8</div>
                                  </div>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="mb-4">
                                <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed mb-3">{template.description}</p>

                                {/* Key Insights Preview */}
                                <div className="text-xs text-gray-500">
                                  <div className="font-medium mb-1">Key Insights:</div>
                                  <ul className="space-y-1">
                                    <li>• Top performing sponsor identified</li>
                                    <li>• 23% increase in engagement</li>
                                    <li>• Optimal placement recommendations</li>
                                  </ul>
                                </div>
                              </div>

                              {/* Category Badge */}
                              <div className="mb-4">
                                <Badge variant="secondary" className="text-xs">
                                  {template.category}
                                </Badge>
                              </div>

                              {/* Generate Insight Button */}
                              <button
                                onClick={() => handleGenerateFromTemplate(template)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                              >
                                <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4" />
                                Generate Insight
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronLeftIcon className="h-4 w-4" />
                              Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "border-gray-300 text-gray-700 hover:border-blue-500"
                                }`}
                              >
                                {page}
                              </button>
                            ))}

                            <button
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Next
                              <ChevronRightIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Automated Insights Metrics Section */}
                  <div id="automated-insights-metrics">
                    <AutomatedInsights data={filteredData} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Save Filter Drawer */}
          {showSaveFilterDrawer && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ease-out ${saveFilterDrawerAnimating ? "bg-opacity-50" : "bg-opacity-0"}`}
                onClick={closeSaveFilterDrawer}
              ></div>
              <div
                className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transition-transform duration-300 ease-out ${saveFilterDrawerAnimating ? "translate-x-0" : "translate-x-full"}`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {editingFilterId ? "Edit Filter" : "Save Filter"}
                    </h2>
                    <button onClick={closeSaveFilterDrawer} className="text-gray-400 hover:text-gray-600">
                      <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter Name</label>
                      <Input
                        type="text"
                        value={filterNameToSave}
                        onChange={(e) => setFilterNameToSave(e.target.value)}
                        placeholder="Enter filter name"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                      <textarea
                        value={filterDescriptionToSave}
                        onChange={(e) => setFilterDescriptionToSave(e.target.value)}
                        placeholder="Enter filter description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        rows={3}
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
                        <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]" align="start" side="bottom">
                          <div className="space-y-1">
                            {FILTER_CATEGORIES.map((category) => (
                              <button
                                key={category}
                                onClick={() => {
                                  setFilterCategoryToSave(category)
                                  // Close the popover automatically
                                  const popoverTrigger = document.querySelector('[data-state="open"]')
                                  if (popoverTrigger) {
                                    ;(popoverTrigger as HTMLElement).click()
                                  }
                                }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                  filterCategoryToSave === category
                                    ? "bg-blue-100 text-blue-900"
                                    : "hover:bg-gray-100 text-gray-700"
                                }`}
                              >
                                {category}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex gap-3">
                        <button
                          onClick={closeSaveFilterDrawer}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveCurrentFilters}
                          disabled={!filterNameToSave.trim()}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {editingFilterId ? "Update Filter" : "Save Filter"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Saved Filters Drawer */}
          {showSavedFiltersDrawer && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ease-out ${savedFiltersDrawerAnimating ? "bg-opacity-50" : "bg-opacity-0"}`}
                onClick={closeSavedFiltersDrawer}
              ></div>
              <div
                className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transition-transform duration-300 ease-out ${savedFiltersDrawerAnimating ? "translate-x-0" : "translate-x-full"}`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Saved Filters</h2>
                    <button onClick={closeSavedFiltersDrawer} className="text-gray-400 hover:text-gray-600">
                      <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <Input
                      type="text"
                      value={filterCategorySearch}
                      onChange={(e) => setFilterCategorySearch(e.target.value)}
                      placeholder="Search saved filters..."
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredSavedFilters.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No saved filters found</p>
                      </div>
                    ) : (
                      filteredSavedFilters.map((filter) => (
                        <div key={filter.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-gray-900">{filter.name}</h3>
                              {filter.description && <p className="text-sm text-gray-600 mt-1">{filter.description}</p>}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => editSavedFilter(filter)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteSavedFilter(filter.id)}
                                className="text-red-600 hover:text-red-800 text-sm ml-2"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              <Badge variant="outline" className="mr-2">
                                {filter.category}
                              </Badge>
                              {format(filter.createdAt, "MMM dd, yyyy")}
                            </div>
                            <button
                              onClick={() => applySavedFilter(filter)}
                              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
