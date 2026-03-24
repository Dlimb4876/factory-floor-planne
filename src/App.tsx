import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { Factory, GridFour, ChartBar, CalendarBlank, Trash, ChartLineUp } from '@phosphor-icons/react'
import { FactoryGrid } from '@/components/factory/FactoryGrid'
import { StaticBayConfigPanel } from '@/components/factory/StaticBayConfigPanel'
import { FlowLineConfigPanel } from '@/components/factory/FlowLineConfigPanel'
import { ThroughputDisplay } from '@/components/factory/ThroughputDisplay'
import { ScheduleView } from '@/components/factory/ScheduleView'
import { BottleneckSimulator } from '@/components/factory/BottleneckSimulator'
import { BayConfig } from '@/lib/types'
import { calculateTotalThroughput, calculateStaticBayThroughput, calculateFlowLineThroughput, positionToKey, keyToPosition } from '@/lib/calculations'
import { toast } from 'sonner'

const GRID_ROWS = 10
const GRID_COLS = 12

type ConfigMode = 'none' | 'static' | 'flow'

function App() {
  const [bays, setBays] = useKV<Record<string, BayConfig>>('factory-bays', {})
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  const [configMode, setConfigMode] = useState<ConfigMode>('none')
  const [activeTab, setActiveTab] = useState('layout')

  const baysMap = useMemo(() => new Map(Object.entries(bays || {})), [bays])
  
  const handleCellClick = (row: number, col: number) => {
    const key = positionToKey(row, col)
    setSelectedCells(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const clearSelection = () => {
    setSelectedCells(new Set())
    setConfigMode('none')
  }

  const handleStaticBayConfig = (bayName: string, productName: string, cycleTime: number, capacity: number) => {
    if (selectedCells.size === 0) {
      toast.error('No cells selected')
      return
    }

    setBays(current => {
      const updated = { ...(current || {}) }
      selectedCells.forEach(key => {
        updated[key] = {
          type: 'static',
          bayName,
          productName,
          cycleTime,
          capacity,
        }
      })
      return updated
    })

    toast.success(`Configured ${selectedCells.size} static build bay(s)`)
    clearSelection()
  }

  const handleFlowLineConfig = (lineName: string, stationTimings: number[], stationNames: string[], taktTime: number) => {
    if (selectedCells.size === 0) {
      toast.error('No cells selected')
      return
    }

    const lineId = Date.now().toString()

    setBays(current => {
      const updated = { ...(current || {}) }
      selectedCells.forEach(key => {
        updated[key] = {
          type: 'flow',
          lineName,
          lineId,
          stationTimings,
          stationNames,
          taktTime,
        }
      })
      return updated
    })

    toast.success(`Configured flow line: ${lineName}`)
    clearSelection()
  }

  const handleDeleteSelected = () => {
    if (selectedCells.size === 0) {
      toast.error('No cells selected')
      return
    }

    setBays(current => {
      const updated = { ...(current || {}) }
      selectedCells.forEach(key => {
        delete updated[key]
      })
      return updated
    })

    toast.success(`Deleted ${selectedCells.size} bay(s)`)
    clearSelection()
  }

  const metrics = useMemo(() => {
    const bayList = Object.entries(bays || {}).map(([key, config]) => {
      const pos = keyToPosition(key)
      return { position: pos, config }
    })
    return calculateTotalThroughput(bayList)
  }, [bays])

  const bayOptions = useMemo(() => {
    const options: Array<{ id: string; name: string }> = []
    Object.entries(bays || {}).forEach(([key, config]) => {
      if (config.type === 'static') {
        const label = config.bayName ? `${config.bayName} — ${config.productName}` : `${config.productName} (${key})`
        options.push({ id: key, name: label })
      } else if (config.type === 'flow') {
        const existing = options.find(o => o.id === config.lineId)
        if (!existing) {
          options.push({ id: config.lineId, name: config.lineName })
        }
      }
    })
    return options
  }, [bays])

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      <header className="border-b bg-card">
        <div className="container mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Factory className="h-8 w-8 text-primary" weight="duotone" />
            <h1 className="text-3xl font-bold tracking-tight">Factory Planner</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="layout" className="gap-2">
              <GridFour className="h-4 w-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="throughput" className="gap-2">
              <ChartBar className="h-4 w-4" />
              Throughput
            </TabsTrigger>
            <TabsTrigger value="simulate" className="gap-2">
              <ChartLineUp className="h-4 w-4" />
              Simulate
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <CalendarBlank className="h-4 w-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-6">
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => setConfigMode('static')}
                disabled={selectedCells.size === 0}
                variant={configMode === 'static' ? 'default' : 'secondary'}
              >
                Configure Static Build
              </Button>
              <Button
                onClick={() => setConfigMode('flow')}
                disabled={selectedCells.size === 0}
                variant={configMode === 'flow' ? 'default' : 'secondary'}
              >
                Configure Flow Line
              </Button>
              <Button
                onClick={handleDeleteSelected}
                disabled={selectedCells.size === 0}
                variant="destructive"
              >
                <Trash className="mr-2" />
                Delete Selected
              </Button>
              <Button onClick={clearSelection} variant="outline">
                Clear Selection ({selectedCells.size})
              </Button>
            </div>

            <div className="bg-card rounded-lg border shadow-sm">
              <FactoryGrid
                rows={GRID_ROWS}
                cols={GRID_COLS}
                bays={baysMap}
                selectedCells={selectedCells}
                onCellClick={handleCellClick}
              />
            </div>
          </TabsContent>

          <TabsContent value="throughput" className="space-y-6">
            <ThroughputDisplay metrics={metrics} />
            
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Bay Details</h2>
              {Object.keys(bays || {}).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No bays configured yet. Switch to Layout tab to configure bays.
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(bays || {}).map(([key, config]) => {
                    if (config.type === 'static') {
                      const m = calculateStaticBayThroughput(config.cycleTime, config.capacity)
                      return (
                        <div key={key} className="border rounded p-4 bg-[var(--static-bay)]/10">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{config.bayName || config.productName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {config.bayName ? `${config.productName} · ` : ''}Bay {key} · Static Build
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-lg font-bold">{m.dailyCapacity}</div>
                              <div className="text-xs text-muted-foreground">units/day</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                            <div>Cycle Time: <span className="font-mono">{config.cycleTime}m</span></div>
                            <div>Capacity: <span className="font-mono">{config.capacity}</span></div>
                          </div>
                        </div>
                      )
                    } else if (config.type === 'flow') {
                      const m = calculateFlowLineThroughput(config.stationTimings, config.taktTime)
                      return (
                        <div key={key} className="border rounded p-4 bg-[var(--flow-bay)]/10">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{config.lineName}</h3>
                              <p className="text-sm text-muted-foreground">Bay {key} · Flow Line</p>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-lg font-bold">{m.dailyCapacity}</div>
                              <div className="text-xs text-muted-foreground">units/day</div>
                            </div>
                          </div>
                          {m.bottleneck && (
                            <div className="mt-2 text-sm text-accent">
                              Bottleneck: {m.bottleneck}
                            </div>
                          )}
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="simulate" className="space-y-6">
            <BottleneckSimulator bays={bays || {}} />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleView bayOptions={bayOptions} />
          </TabsContent>
        </Tabs>
      </main>

      <Sheet open={configMode !== 'none'} onOpenChange={() => setConfigMode('none')}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0">
          {configMode === 'static' && (
            <StaticBayConfigPanel
              onSave={handleStaticBayConfig}
              onCancel={() => setConfigMode('none')}
            />
          )}
          {configMode === 'flow' && (
            <FlowLineConfigPanel
              stationCount={selectedCells.size}
              onSave={handleFlowLineConfig}
              onCancel={() => setConfigMode('none')}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default App