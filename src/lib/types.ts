export type BayType = 'static' | 'flow' | 'empty'

export interface Position {
  row: number
  col: number
}

export interface StaticBayConfig {
  type: 'static'
  bayName: string
  productName: string
  cycleTime: number
  capacity: number
}

export interface FlowLineConfig {
  type: 'flow'
  lineName: string
  lineId: string
  stationTimings: number[]
  stationNames: string[]
  taktTime: number
}

export type BayConfig = StaticBayConfig | FlowLineConfig | { type: 'empty' }

export interface Bay {
  position: Position
  config: BayConfig
}

export interface ProductionOrder {
  id: string
  productName: string
  quantity: number
  bayId: string
  startDate: Date
  endDate: Date
}

export interface ThroughputMetrics {
  dailyCapacity: number
  weeklyCapacity: number
  monthlyCapacity: number
  bottleneck?: string
  utilizationRate: number
}

export interface BottleneckStation {
  stationIndex: number
  stationName: string
  cycleTime: number
  idleTimePerCycle: number
  utilizationPct: number
  isBottleneck: boolean
}

export type SuggestionType = 'rebalance' | 'add-capacity' | 'reduce-cycle-time' | 'combine-stations'
export type SuggestionPriority = 'high' | 'medium' | 'low'

export interface ImprovementSuggestion {
  priority: SuggestionPriority
  type: SuggestionType
  description: string
  estimatedGain: string
}

export interface BottleneckReport {
  lineId?: string
  lineName: string
  stations: BottleneckStation[]
  currentThroughput: number
  targetThroughput?: number
  bottleneckStationName?: string
  suggestions: ImprovementSuggestion[]
}
