export type BayType = 'static' | 'flow' | 'empty'

export interface Position {
  row: number
  col: number
}

export interface StaticBayConfig {
  type: 'static'
  productName: string
  cycleTime: number
  capacity: number
}

export interface FlowLineConfig {
  type: 'flow'
  lineName: string
  lineId: string
  stationTimings: number[]
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
