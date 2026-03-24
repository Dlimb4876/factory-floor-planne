import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { X, Check } from '@phosphor-icons/react'

interface FlowLineConfigPanelProps {
  stationCount: number
  onSave: (lineName: string, stationTimings: number[], stationNames: string[], taktTime: number) => void
  onCancel: () => void
  initialData?: {
    lineName: string
    stationTimings: number[]
    stationNames: string[]
    taktTime: number
  }
}

export function FlowLineConfigPanel({ stationCount, onSave, onCancel, initialData }: FlowLineConfigPanelProps) {
  const [lineName, setLineName] = useState(initialData?.lineName || '')
  const [stationTimings, setStationTimings] = useState<string[]>(
    initialData?.stationTimings.map(t => t.toString()) || Array(stationCount).fill('5')
  )
  const [stationNames, setStationNames] = useState<string[]>(
    initialData?.stationNames || Array(stationCount).fill('')
  )
  const [taktTime, setTaktTime] = useState(initialData?.taktTime.toString() || '10')

  const handleSave = () => {
    const timings = stationTimings.map(t => parseFloat(t)).filter(t => t > 0)
    const takt = parseFloat(taktTime)
    
    if (lineName && timings.length === stationCount && takt > 0) {
      onSave(lineName, timings, stationNames, takt)
    }
  }

  const updateStationTime = (index: number, value: string) => {
    const newTimings = [...stationTimings]
    newTimings[index] = value
    setStationTimings(newTimings)
  }

  const updateStationName = (index: number, value: string) => {
    const newNames = [...stationNames]
    newNames[index] = value
    setStationNames(newNames)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="text-lg font-semibold">Configure Flow Line</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="line-name" className="text-xs uppercase tracking-wider font-medium">
            Flow Line Name
          </Label>
          <Input
            id="line-name"
            value={lineName}
            onChange={(e) => setLineName(e.target.value)}
            placeholder="e.g., Assembly Line A"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider font-medium">
            Station Configuration
          </Label>
          <p className="text-xs text-muted-foreground">Name each station and set its cycle time.</p>
          <div className="space-y-4">
            {stationTimings.map((time, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-muted-foreground w-6">{index + 1}</span>
                  <Input
                    value={stationNames[index]}
                    onChange={(e) => updateStationName(index, e.target.value)}
                    placeholder={`Station ${index + 1} name`}
                    className="flex-1 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 pl-8">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">Cycle time (min):</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={time}
                    onChange={(e) => updateStationTime(index, e.target.value)}
                    className="font-mono w-24"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="takt-time" className="text-xs uppercase tracking-wider font-medium">
            Takt Time (minutes)
          </Label>
          <Input
            id="takt-time"
            type="number"
            min="0.1"
            step="0.1"
            value={taktTime}
            onChange={(e) => setTaktTime(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">Target time between units (customer demand rate)</p>
        </div>
      </div>

      <Separator />

      <div className="p-6 flex gap-3">
        <Button onClick={handleSave} className="flex-1">
          <Check className="mr-2" />
          Save Configuration
        </Button>
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </div>
  )
}
