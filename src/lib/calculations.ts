import { Bay, BottleneckReport, BottleneckStation, ImprovementSuggestion, ThroughputMetrics } from './types'

const MINUTES_PER_DAY = 8 * 60
const DAYS_PER_WEEK = 5
const DAYS_PER_MONTH = 22

// Bottleneck simulation thresholds
const PARALLEL_CAPACITY_THRESHOLD = 1.4  // bottleneck is this multiple of takt → suggest parallel station
const OVERLOAD_THRESHOLD = 1.25          // station is this multiple of avg time → considered overloaded
const UNDERLOAD_THRESHOLD = 0.75         // station is below this multiple of avg time → considered underloaded
const LOW_UTIL_THRESHOLD = 40            // utilization % below which a station is considered low-utilization
const MIN_STATIONS_FOR_COMBINE = 2       // minimum stations needed before suggesting combine

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

export function simulateFlowLineBottlenecks(
  lineName: string,
  stationTimings: number[],
  stationNames: string[],
  taktTime: number,
  lineId?: string,
  targetThroughput?: number,
): BottleneckReport {
  if (stationTimings.length === 0) {
    return { lineId, lineName, stations: [], currentThroughput: 0, targetThroughput, suggestions: [] }
  }

  const bottleneckTime = Math.max(...stationTimings)
  const effectiveTaktTime = Math.max(taktTime, bottleneckTime)
  const dailyCapacity = effectiveTaktTime > 0 ? Math.floor(MINUTES_PER_DAY / effectiveTaktTime) : 0
  const maxIdleTime = bottleneckTime

  const stations: BottleneckStation[] = stationTimings.map((time, i) => ({
    stationIndex: i,
    stationName: stationNames[i] || `Station ${i + 1}`,
    cycleTime: time,
    idleTimePerCycle: maxIdleTime - time,
    utilizationPct: maxIdleTime > 0 ? Math.round((time / maxIdleTime) * 100) : 100,
    isBottleneck: time === bottleneckTime,
  }))

  const bottleneckSt = stations.find(s => s.isBottleneck)
  const suggestions: ImprovementSuggestion[] = []

  // Suggestion: reduce bottleneck cycle time to meet takt
  if (bottleneckSt && bottleneckSt.cycleTime > taktTime) {
    const reduction = +(bottleneckSt.cycleTime - taktTime).toFixed(1)
    const potentialCapacity = Math.floor(MINUTES_PER_DAY / taktTime)
    suggestions.push({
      priority: 'high',
      type: 'reduce-cycle-time',
      description: `Reduce "${bottleneckSt.stationName}" cycle time by ${reduction} min to meet takt time of ${taktTime} min.`,
      estimatedGain: `+${potentialCapacity - dailyCapacity} units/day (${potentialCapacity} total)`,
    })
  }

  // Suggestion: add parallel capacity at bottleneck
  if (bottleneckSt && bottleneckSt.cycleTime > taktTime * PARALLEL_CAPACITY_THRESHOLD) {
    const parallelCapacity = Math.floor(MINUTES_PER_DAY / (bottleneckTime / 2))
    suggestions.push({
      priority: 'high',
      type: 'add-capacity',
      description: `Add a parallel workstation at "${bottleneckSt.stationName}" to halve its effective cycle time.`,
      estimatedGain: `Up to ${parallelCapacity} units/day potential`,
    })
  }

  // Suggestion: rebalance overloaded vs. underloaded stations
  const avgTime = stationTimings.reduce((a, b) => a + b, 0) / stationTimings.length
  const overloaded = stations.filter(s => s.cycleTime > avgTime * OVERLOAD_THRESHOLD && !s.isBottleneck)
  const underloaded = stations.filter(s => s.cycleTime < avgTime * UNDERLOAD_THRESHOLD)
  if (overloaded.length > 0 && underloaded.length > 0) {
    suggestions.push({
      priority: 'medium',
      type: 'rebalance',
      description: `Rebalance work from overloaded (${overloaded.map(s => s.stationName).join(', ')}) to underloaded stations (${underloaded.map(s => s.stationName).join(', ')}).`,
      estimatedGain: 'Improved line balance and reduced idle time',
    })
  }

  // Suggestion: combine stations with very low utilisation
  const lowUtil = stations.filter(s => s.utilizationPct < LOW_UTIL_THRESHOLD && stations.length > MIN_STATIONS_FOR_COMBINE)
  if (lowUtil.length >= 2) {
    suggestions.push({
      priority: 'low',
      type: 'combine-stations',
      description: `Consider combining low-utilization stations (${lowUtil.map(s => s.stationName).join(', ')}) to reduce headcount.`,
      estimatedGain: `Potential to eliminate ${lowUtil.length - 1} station(s)`,
    })
  }

  // Suggestion: check if target throughput is achievable
  if (targetThroughput && targetThroughput > dailyCapacity) {
    const requiredTakt = +(MINUTES_PER_DAY / targetThroughput).toFixed(2)
    suggestions.push({
      priority: 'high',
      type: 'reduce-cycle-time',
      description: `Target of ${targetThroughput} units/day requires a takt time of ≤${requiredTakt} min. Current effective takt is ${effectiveTaktTime} min.`,
      estimatedGain: `+${targetThroughput - dailyCapacity} units/day needed`,
    })
  }

  return {
    lineId,
    lineName,
    stations,
    currentThroughput: dailyCapacity,
    targetThroughput,
    bottleneckStationName: bottleneckSt?.stationName,
    suggestions,
  }
}

export function positionToKey(row: number, col: number): string {
  return `${row}-${col}`
}

export function keyToPosition(key: string): { row: number; col: number } {
  const [row, col] = key.split('-').map(Number)
  return { row, col }
}
