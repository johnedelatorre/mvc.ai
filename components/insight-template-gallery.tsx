"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowTrendUp } from "@fortawesome/free-solid-svg-icons"
import {
  faLightbulb,
  faChevronDown,
  faChevronUp,
  faSearch,
  faChartLine,
  faUsers,
  faEye,
  faDollarSign,
  faCalendarAlt,
  faPlay,
} from "@fortawesome/free-solid-svg-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

interface InsightTemplate {
  id: string
  title: string
  description: string
  category: string
  prompt: string
  sampleMetrics: {
    smv?: string
    impressions?: string
    engagement?: string
    growth?: string
  }
  tags: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  estimatedTime: string
}

const INSIGHT_TEMPLATES: InsightTemplate[] = [
  {
    id: "nike-q4-analysis",
    title: "Nike Q4 Performance Analysis",
    description:
      "Comprehensive analysis of Nike's social media performance in Q4 2024, including engagement rates, reach, and ROI metrics.",
    category: "ROI Analysis",
    prompt:
      "Analyze Nike's social media performance in Q4 2024. Show me engagement rates, reach metrics, top-performing content types, and calculate ROI across all platforms. Include comparisons with Q3 2024 and identify key growth drivers.",
    sampleMetrics: {
      smv: "$2.4M",
      impressions: "45.2M",
      engagement: "8.7%",
      growth: "+23%",
    },
    tags: ["Nike", "Q4", "Performance", "ROI"],
    difficulty: "Intermediate",
    estimatedTime: "3-5 min",
  },
  {
    id: "adidas-tiktok-instagram",
    title: "Adidas: TikTok vs Instagram Comparison",
    description: "Compare Adidas's engagement rates and performance metrics between TikTok and Instagram platforms.",
    category: "Platform Performance",
    prompt:
      "Compare Adidas's engagement rates on TikTok vs Instagram. Show me metrics for reach, impressions, video views, and audience demographics. Identify which platform performs better for different content types and provide recommendations for platform-specific strategies.",
    sampleMetrics: {
      smv: "$1.8M",
      impressions: "32.1M",
      engagement: "12.3%",
      growth: "+18%",
    },
    tags: ["Adidas", "TikTok", "Instagram", "Comparison"],
    difficulty: "Beginner",
    estimatedTime: "2-3 min",
  },
  {
    id: "under-armour-placements",
    title: "Under Armour Top Placements",
    description:
      "Identify the top 3 performing placements for Under Armour this month with detailed performance metrics.",
    category: "Trend Comparison",
    prompt:
      "Identify the top 3 performing placements for Under Armour this month. Show me SMV, impressions, and engagement metrics for each placement. Include trend analysis and recommendations for optimizing placement strategy.",
    sampleMetrics: {
      smv: "$950K",
      impressions: "18.7M",
      engagement: "6.4%",
      growth: "+15%",
    },
    tags: ["Under Armour", "Placements", "Performance", "Monthly"],
    difficulty: "Beginner",
    estimatedTime: "2-4 min",
  },
  {
    id: "puma-brand-sentiment",
    title: "Puma Brand Sentiment Analysis",
    description:
      "Analyze Puma's brand sentiment across all social media platforms with sentiment scoring and trend analysis.",
    category: "ROI Analysis",
    prompt:
      "What is Puma's brand sentiment across all platforms? Analyze sentiment scores, mention volume, positive vs negative sentiment trends, and identify key sentiment drivers. Include recommendations for improving brand perception.",
    sampleMetrics: {
      smv: "$1.2M",
      impressions: "28.4M",
      engagement: "7.8%",
      growth: "+12%",
    },
    tags: ["Puma", "Sentiment", "Brand Analysis", "Social Media"],
    difficulty: "Advanced",
    estimatedTime: "4-6 min",
  },
  {
    id: "new-balance-youtube-demographics",
    title: "New Balance YouTube Demographics",
    description: "Deep dive into New Balance's YouTube audience demographics and engagement patterns.",
    category: "Platform Performance",
    prompt:
      "Show me New Balance's audience demographics on YouTube. Include age groups, geographic distribution, engagement patterns by demographic, and content preferences. Provide insights for targeted content strategy.",
    sampleMetrics: {
      smv: "$680K",
      impressions: "15.2M",
      engagement: "9.1%",
      growth: "+8%",
    },
    tags: ["New Balance", "YouTube", "Demographics", "Audience"],
    difficulty: "Intermediate",
    estimatedTime: "3-4 min",
  },
  {
    id: "jordan-brand-yoy",
    title: "Jordan Brand Year-over-Year",
    description: "Compare Jordan Brand's social media performance with the previous year across all key metrics.",
    category: "Trend Comparison",
    prompt:
      "How does Jordan Brand's social media performance compare to last year? Show me year-over-year metrics for SMV, impressions, engagement, and growth rates. Identify seasonal trends and performance drivers.",
    sampleMetrics: {
      smv: "$3.1M",
      impressions: "52.8M",
      engagement: "11.2%",
      growth: "+31%",
    },
    tags: ["Jordan Brand", "Year-over-Year", "Comparison", "Trends"],
    difficulty: "Intermediate",
    estimatedTime: "4-5 min",
  },
  {
    id: "reebok-content-trends",
    title: "Reebok Content Trends",
    description: "Identify key trends in Reebok's social media content and their performance impact.",
    category: "Trend Comparison",
    prompt:
      "What are the key trends in Reebok's social media content? Analyze content types, posting frequency, hashtag performance, and engagement patterns. Identify trending topics and content formats that drive the most engagement.",
    sampleMetrics: {
      smv: "$420K",
      impressions: "12.1M",
      engagement: "5.9%",
      growth: "+7%",
    },
    tags: ["Reebok", "Content Trends", "Social Media", "Engagement"],
    difficulty: "Beginner",
    estimatedTime: "2-3 min",
  },
  {
    id: "asics-influencer-campaign",
    title: "ASICS Influencer Campaign ROI",
    description: "Analyze the performance and ROI of ASICS's recent influencer marketing campaigns.",
    category: "ROI Analysis",
    prompt:
      "Analyze ASICS's influencer marketing campaign performance. Show me ROI metrics, reach and engagement from influencer partnerships, cost per engagement, and campaign effectiveness. Compare with organic content performance.",
    sampleMetrics: {
      smv: "$1.5M",
      impressions: "35.6M",
      engagement: "13.4%",
      growth: "+25%",
    },
    tags: ["ASICS", "Influencer Marketing", "ROI", "Campaigns"],
    difficulty: "Advanced",
    estimatedTime: "5-7 min",
  },
  {
    id: "converse-platform-comparison",
    title: "Converse Multi-Platform Analysis",
    description: "Compare Converse's video views and engagement across different social media platforms.",
    category: "Platform Performance",
    prompt:
      "Compare Converse's video views on different platforms. Show me performance metrics for TikTok, Instagram Reels, YouTube Shorts, and Twitter videos. Analyze engagement rates, view completion rates, and audience overlap.",
    sampleMetrics: {
      smv: "$890K",
      impressions: "22.3M",
      engagement: "8.5%",
      growth: "+14%",
    },
    tags: ["Converse", "Video Performance", "Multi-Platform", "Engagement"],
    difficulty: "Intermediate",
    estimatedTime: "3-4 min",
  },
  {
    id: "vans-content-optimization",
    title: "Vans Content Type Optimization",
    description: "Identify Vans's most engaging content types and optimization opportunities.",
    category: "ROI Analysis",
    prompt:
      "What is Vans's most engaging content type? Analyze performance by content format (videos, images, stories, reels), posting times, caption length, and hashtag usage. Provide optimization recommendations for maximum engagement.",
    sampleMetrics: {
      smv: "$750K",
      impressions: "19.8M",
      engagement: "10.2%",
      growth: "+16%",
    },
    tags: ["Vans", "Content Optimization", "Engagement", "Strategy"],
    difficulty: "Beginner",
    estimatedTime: "2-4 min",
  },
  {
    id: "coca-cola-seasonal-trends",
    title: "Coca-Cola Seasonal Performance",
    description:
      "Analyze Coca-Cola's seasonal marketing performance and identify peak engagement periods across different campaigns.",
    category: "Trend Comparison",
    prompt:
      "Analyze Coca-Cola's seasonal marketing performance. Show me engagement patterns during holidays, summer campaigns, and special events. Identify peak performance periods and seasonal content strategies that drive maximum engagement.",
    sampleMetrics: {
      smv: "$4.2M",
      impressions: "78.5M",
      engagement: "15.6%",
      growth: "+42%",
    },
    tags: ["Coca-Cola", "Seasonal", "Campaigns", "Holidays"],
    difficulty: "Advanced",
    estimatedTime: "6-8 min",
  },
  {
    id: "pepsi-influencer-roi",
    title: "Pepsi Influencer Partnership ROI",
    description:
      "Evaluate the return on investment for Pepsi's celebrity and micro-influencer partnerships across platforms.",
    category: "ROI Analysis",
    prompt:
      "Evaluate Pepsi's influencer partnership ROI. Compare celebrity endorsements vs micro-influencer campaigns. Show me cost per engagement, reach amplification, and brand sentiment impact from different influencer tiers.",
    sampleMetrics: {
      smv: "$3.8M",
      impressions: "65.3M",
      engagement: "11.4%",
      growth: "+28%",
    },
    tags: ["Pepsi", "Influencers", "Celebrity", "ROI"],
    difficulty: "Intermediate",
    estimatedTime: "4-6 min",
  },
  {
    id: "red-bull-extreme-sports",
    title: "Red Bull Extreme Sports Content",
    description:
      "Analyze Red Bull's extreme sports content performance and audience engagement across adventure sports categories.",
    category: "Platform Performance",
    prompt:
      "Analyze Red Bull's extreme sports content performance. Show me engagement rates for different sports categories (skateboarding, snowboarding, BMX, etc.), video completion rates, and audience demographics for each sport type.",
    sampleMetrics: {
      smv: "$2.1M",
      impressions: "41.7M",
      engagement: "18.9%",
      growth: "+35%",
    },
    tags: ["Red Bull", "Extreme Sports", "Video Content", "Adventure"],
    difficulty: "Beginner",
    estimatedTime: "3-4 min",
  },
  {
    id: "monster-energy-gaming",
    title: "Monster Energy Gaming Partnerships",
    description: "Examine Monster Energy's esports and gaming community engagement strategies and their effectiveness.",
    category: "Platform Performance",
    prompt:
      "Examine Monster Energy's gaming and esports partnerships. Analyze engagement from gaming content, esports event sponsorships, and gaming influencer collaborations. Show platform performance across Twitch, YouTube Gaming, and social media.",
    sampleMetrics: {
      smv: "$1.6M",
      impressions: "29.8M",
      engagement: "22.1%",
      growth: "+51%",
    },
    tags: ["Monster Energy", "Gaming", "Esports", "Twitch"],
    difficulty: "Advanced",
    estimatedTime: "5-7 min",
  },
  {
    id: "gatorade-athlete-endorsements",
    title: "Gatorade Athlete Endorsement Impact",
    description: "Measure the impact of Gatorade's athlete endorsements on brand engagement and sales correlation.",
    category: "ROI Analysis",
    prompt:
      "Measure Gatorade's athlete endorsement impact. Analyze engagement spikes during athlete partnerships, correlation with sports seasons, and ROI from different athlete tier partnerships (superstar vs emerging athletes).",
    sampleMetrics: {
      smv: "$2.7M",
      impressions: "48.2M",
      engagement: "13.8%",
      growth: "+19%",
    },
    tags: ["Gatorade", "Athletes", "Endorsements", "Sports"],
    difficulty: "Intermediate",
    estimatedTime: "4-5 min",
  },
  {
    id: "powerade-vs-competitors",
    title: "Powerade Competitive Analysis",
    description: "Compare Powerade's social media performance against key competitors in the sports drink market.",
    category: "Trend Comparison",
    prompt:
      "Compare Powerade's performance against Gatorade and other sports drink competitors. Show market share of voice, engagement rate comparisons, content strategy differences, and competitive positioning analysis.",
    sampleMetrics: {
      smv: "$1.3M",
      impressions: "24.6M",
      engagement: "9.7%",
      growth: "+14%",
    },
    tags: ["Powerade", "Competitive Analysis", "Market Share", "Sports Drinks"],
    difficulty: "Advanced",
    estimatedTime: "6-8 min",
  },
]

const CATEGORIES = ["All", "ROI Analysis", "Platform Performance", "Trend Comparison"]

const DIFFICULTY_COLORS = {
  Beginner: "bg-green-100 text-green-700 border-green-300",
  Intermediate: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Advanced: "bg-red-100 text-red-700 border-red-300",
}

const CATEGORY_ICONS = {
  "ROI Analysis": faDollarSign,
  "Platform Performance": faChartLine,
  "Trend Comparison": faArrowTrendUp,
}

interface InsightTemplateGalleryProps {
  onTemplateSelect: (prompt: string) => void
}

export default function InsightTemplateGallery({ onTemplateSelect }: InsightTemplateGalleryProps) {
  const [expanded, setExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All")
  const [currentPage, setCurrentPage] = useState(1)
  const templatesPerPage = 6

  const filteredTemplates = INSIGHT_TEMPLATES.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "All" || template.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage)
  const startIndex = (currentPage - 1) * templatesPerPage
  const endIndex = startIndex + templatesPerPage
  const displayedTemplates = filteredTemplates.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedDifficulty])

  const handleTemplateClick = (template: InsightTemplate) => {
    onTemplateSelect(template.prompt)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
            <span className="text-base sm:text-lg">Insight Template Gallery</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {INSIGHT_TEMPLATES.length} Templates
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="self-start sm:self-auto">
            <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {expanded && (
          <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Choose from pre-built insight templates to quickly generate comprehensive analytics. Each template
              includes sample metrics and estimated completion time.
            </p>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400"
                />
                <Input
                  placeholder="Search templates by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 text-xs sm:text-sm py-2"
                />
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-xs sm:text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 flex items-center justify-between whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                      <span className="text-gray-700">{selectedCategory}</span>
                      <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="end">
                    <div className="space-y-2 min-w-[140px] sm:min-w-[160px]">
                      {CATEGORIES.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategory === category}
                            onCheckedChange={() => setSelectedCategory(category)}
                          />
                          <label
                            htmlFor={`category-${category}`}
                            className="text-xs sm:text-sm cursor-pointer flex-1 whitespace-nowrap"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-xs sm:text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 flex items-center justify-between whitespace-nowrap min-w-[90px] sm:min-w-[110px]">
                      <span className="text-gray-700">
                        {selectedDifficulty === "All" ? "All Levels" : selectedDifficulty}
                      </span>
                      <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="end">
                    <div className="space-y-2 min-w-[100px] sm:min-w-[120px]">
                      {["All", "Beginner", "Intermediate", "Advanced"].map((difficulty) => (
                        <div key={difficulty} className="flex items-center space-x-2">
                          <Checkbox
                            id={`difficulty-${difficulty}`}
                            checked={selectedDifficulty === difficulty}
                            onCheckedChange={() => setSelectedDifficulty(difficulty)}
                          />
                          <label
                            htmlFor={`difficulty-${difficulty}`}
                            className="text-xs sm:text-sm cursor-pointer flex-1 whitespace-nowrap"
                          >
                            {difficulty === "All" ? "All Levels" : difficulty}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-gray-600 gap-2 sm:gap-0">
              <span>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredTemplates.length)} of {filteredTemplates.length}{" "}
                templates
                {filteredTemplates.length !== INSIGHT_TEMPLATES.length &&
                  ` (filtered from ${INSIGHT_TEMPLATES.length})`}
              </span>
              {(searchTerm || selectedCategory !== "All" || selectedDifficulty !== "All") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("All")
                    setSelectedDifficulty("All")
                  }}
                  className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm self-start sm:self-auto"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      {expanded && (
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <FontAwesomeIcon icon={faSearch} className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {displayedTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-blue-300 group"
                  onClick={() => handleTemplateClick(template)}
                >
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FontAwesomeIcon
                          icon={CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS] || faLightbulb}
                          className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600"
                        />
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <Badge className={`text-xs ${DIFFICULTY_COLORS[template.difficulty]}`}>
                        {template.difficulty}
                      </Badge>
                    </div>

                    <CardTitle className="text-sm sm:text-base leading-tight group-hover:text-blue-600 transition-colors">
                      {template.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 sm:space-y-4">
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">{template.description}</p>

                    {/* Sample Metrics */}
                    <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs">
                      {template.sampleMetrics.smv && (
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faDollarSign} className="h-2 w-2 sm:h-3 sm:w-3 text-green-600" />
                          <span className="text-gray-600">SMV:</span>
                          <span className="font-medium">{template.sampleMetrics.smv}</span>
                        </div>
                      )}
                      {template.sampleMetrics.impressions && (
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faEye} className="h-2 w-2 sm:h-3 sm:w-3 text-blue-600" />
                          <span className="text-gray-600">Impressions:</span>
                          <span className="font-medium">{template.sampleMetrics.impressions}</span>
                        </div>
                      )}
                      {template.sampleMetrics.engagement && (
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faUsers} className="h-2 w-2 sm:h-3 sm:w-3 text-purple-600" />
                          <span className="text-gray-600">Engagement:</span>
                          <span className="font-medium">{template.sampleMetrics.engagement}</span>
                        </div>
                      )}
                      {template.sampleMetrics.growth && (
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faArrowTrendUp} className="h-2 w-2 sm:h-3 sm:w-3 text-orange-600" />
                          <span className="text-gray-600">Growth:</span>
                          <span className="font-medium text-green-600">{template.sampleMetrics.growth}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-1.5 sm:px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-1.5 sm:px-2 py-0.5">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FontAwesomeIcon icon={faCalendarAlt} className="h-2 w-2 sm:h-3 sm:w-3" />
                        {template.estimatedTime}
                      </div>
                      <Button
                        size="sm"
                        className="group-hover:bg-blue-600 group-hover:text-white transition-colors text-xs px-2 sm:px-3 py-1"
                      >
                        <FontAwesomeIcon icon={faPlay} className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                        Generate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-end mt-4 sm:mt-6 space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <FontAwesomeIcon icon={faChevronDown} className="h-2 w-2 sm:h-3 sm:w-3 rotate-90" />
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm ${currentPage === page ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
                    >
                      {page}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    {totalPages > 6 && <span className="text-gray-400 text-xs sm:text-sm">...</span>}
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm ${
                        currentPage === totalPages ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                Next
                <FontAwesomeIcon icon={faChevronDown} className="h-2 w-2 sm:h-3 sm:w-3 -rotate-90" />
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
