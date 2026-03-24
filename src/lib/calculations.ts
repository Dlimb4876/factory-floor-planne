import { Bay, ThroughputMetrics } from './types'

const MINUTES_PER_DAY = 8 * 60
const DAYS_PER_WEEK = 5
const DAYS_PER_MONTH = 22

export function calculateStaticBayThroughput(cycleTime: number, capacity: number): ThroughputMetrics {
  const dailyCapacity = capacity > 0 ? Math.floor((MINUTES_PER_DAY / cycleTime) * capacity) : 0
  
  return {
    dailyCapacity,
    weeklyCapacity: dailyCapacity * DAYS_PER_WEEK,
    monthlyCapacity: dailyCapacity * DAYS_PER_MONTH,
    utilizationRate: 100,
  }
}

export function calculateFlowLineThroughput(stationTimings: number[], taktTime: number): ThroughputMetrics {
  const bottleneckTime = Math.max(...stationTimings)
  const effectiveTaktTime = Math.max(taktTime, bottleneckTime)
  const dailyCapacity = effectiveTaktTime > 0 ? Math.floor(MINUTES_PER_DAY / effectiveTaktTime) : 0
  
  const bottleneckStation = stationTimings.findIndex(time => time === bottleneckTime)
  
  return {
    dailyCapacity,
    weeklyCapacity: dailyCapacity * DAYS_PER_WEEK,
    monthlyCapacity: dailyCapacity * DAYS_PER_MONTH,
    bottleneck: bottleneckStation >= 0 ? `Station ${bottleneckStation + 1}` : undefined,
    utilizationRate: effectiveTaktTime > 0 ? Math.round((bottleneckTime / effectiveTaktTime) * 100) : 0,
  }
}

export function calculateTotalThroughput(bays: Bay[]): ThroughputMetrics {
  let totalDaily = 0
  const metrics: ThroughputMetrics[] = []

  bays.forEach(bay => {
    if (bay.config.type === 'static') {
      const metric = calculateStaticBayThroughput(bay.config.cycleTime, bay.config.capacity)
      metrics.push(metric)
      totalDaily += metric.dailyCapacity
    } else if (bay.config.type === 'flow') {
      const metric = calculateFlowLineThroughput(bay.config.stationTimings, bay.config.taktTime)
      metrics.push(metric)
      totalDaily += metric.dailyCapacity
    }
  })

  const avgUtilization = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + m.utilizationRate, 0) / metrics.length)
    : 0

  return {
    dailyCapacity: totalDaily,
    weeklyCapacity: totalDaily * DAYS_PER_WEEK,
    monthlyCapacity: totalDaily * DAYS_PER_MONTH,
    utilizationRate: avgUtilization,
  }
}

export function positionToKey(row: number, col: number): string {
  return `${row}-${col}`
}

export function keyToPosition(key: string): { row: number; col: number } {
  const [row, col] = key.split('-').map(Number)
  return { row, col }
}
