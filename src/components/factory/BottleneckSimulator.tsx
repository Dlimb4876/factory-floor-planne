import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Warning, CheckCircle, ArrowUp, Scales, PlusCircle, Scissors } from '@phosphor-icons/react'
import { BayConfig, BottleneckReport, ImprovementSuggestion } from '@/lib/types'
import { simulateFlowLineBottlenecks } from '@/lib/calculations'

interface BottleneckSimulatorProps {
  bays: Record<string, BayConfig>
}

function priorityColor(priority: ImprovementSuggestion['priority']) {
  if (priority === 'high') return 'destructive'
  if (priority === 'medium') return 'default'
  return 'secondary'
}

function suggestionIcon(type: ImprovementSuggestion['type']) {
  switch (type) {
    case 'reduce-cycle-time': return <ArrowUp className="h-4 w-4 shrink-0" />
    case 'add-capacity': return <PlusCircle className="h-4 w-4 shrink-0" />
    case 'rebalance': return <Scales className="h-4 w-4 shrink-0" />
    case 'combine-stations': return <Scissors className="h-4 w-4 shrink-0" />
  }
}

interface LineTargetMap {
  [lineId: string]: string
}

export function BottleneckSimulator({ bays }: BottleneckSimulatorProps) {
  const [targetInputs, setTargetInputs] = useState<LineTargetMap>({})

  // Deduplicate flow lines and build reports
  const reports = useMemo<BottleneckReport[]>(() => {
    const seen = new Set<string>()
    const result: BottleneckReport[] = []

    Object.values(bays).forEach(config => {
      if (config.type !== 'flow') return
      if (seen.has(config.lineId)) return
      seen.add(config.lineId)

      const targetRaw = targetInputs[config.lineId]
      const parsedTarget = targetRaw ? parseInt(targetRaw, 10) : NaN
      const target = Number.isFinite(parsedTarget) && parsedTarget > 0 ? parsedTarget : undefined

      result.push(
        simulateFlowLineBottlenecks(
          config.lineName,
          config.stationTimings,
          config.stationNames ?? [],
          config.taktTime,
          config.lineId,
          target,
        )
      )
    })

    return result
  }, [bays, targetInputs])

  const hasFlowLines = reports.length > 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Assembly Line Simulator</h2>
        <p className="text-muted-foreground mt-1">
          Simulate bottlenecks in your flow lines and get actionable improvement suggestions.
        </p>
      </div>

      {!hasFlowLines && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No flow lines configured yet. Go to the <span className="font-semibold">Layout</span> tab, select cells
            and click <span className="font-semibold">Configure Flow Line</span>.
          </CardContent>
        </Card>
      )}

      {reports.map(report => (
        <Card key={report.lineId} className="overflow-hidden">
          <CardHeader className="bg-muted/40 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{report.lineName}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {report.stations.length} station{report.stations.length !== 1 ? 's' : ''}
                  {report.bottleneckStationName && (
                    <> · Bottleneck: <span className="text-destructive font-medium">{report.bottleneckStationName}</span></>
                  )}
                </p>
              </div>
              <div className="flex items-end gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono">{report.currentThroughput}</div>
                  <div className="text-xs text-muted-foreground">units/day</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="space-y-1 min-w-[140px]">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Target (units/day)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Optional goal"
                    className="h-8 font-mono text-sm w-36"
                    value={targetInputs[report.lineId ?? ''] ?? ''}
                    onChange={e =>
                      setTargetInputs(prev => ({
                        ...prev,
                        [report.lineId ?? '']: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Station load bars */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Station Load
              </h3>
              <div className="space-y-3">
                {report.stations.map(station => (
                  <div key={station.stationIndex} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {station.isBottleneck && (
                          <Warning className="h-4 w-4 text-destructive" weight="fill" />
                        )}
                        {!station.isBottleneck && (
                          <CheckCircle className="h-4 w-4 text-muted-foreground" weight="regular" />
                        )}
                        <span className={station.isBottleneck ? 'font-semibold text-destructive' : ''}>
                          {station.stationName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                        <span>{station.cycleTime} min</span>
                        <span
                          className={
                            station.utilizationPct === 100
                              ? 'text-destructive font-semibold'
                              : station.utilizationPct >= 80
                              ? 'text-amber-500'
                              : 'text-green-600'
                          }
                        >
                          {station.utilizationPct}%
                        </span>
                        {station.idleTimePerCycle > 0 && (
                          <span className="text-muted-foreground">
                            ({station.idleTimePerCycle.toFixed(1)} min idle)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          station.utilizationPct === 100
                            ? 'bg-destructive'
                            : station.utilizationPct >= 80
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${station.utilizationPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {report.suggestions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Improvement Suggestions
                  </h3>
                  <div className="space-y-3">
                    {report.suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg border p-3 bg-muted/20"
                      >
                        <div className="mt-0.5 text-muted-foreground">{suggestionIcon(s.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{s.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Estimated gain: <span className="font-medium text-foreground">{s.estimatedGain}</span>
                          </p>
                        </div>
                        <Badge variant={priorityColor(s.priority)} className="shrink-0 capitalize text-xs">
                          {s.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {report.suggestions.length === 0 && report.stations.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" weight="fill" />
                Line is well balanced — no critical bottlenecks detected.
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
