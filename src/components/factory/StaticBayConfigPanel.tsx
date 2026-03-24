import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { X, Check } from '@phosphor-icons/react'

interface StaticBayConfigPanelProps {
  onSave: (bayName: string, productName: string, cycleTime: number, capacity: number) => void
  onCancel: () => void
  initialData?: {
    bayName: string
    productName: string
    cycleTime: number
    capacity: number
  }
}

export function StaticBayConfigPanel({ onSave, onCancel, initialData }: StaticBayConfigPanelProps) {
  const [bayName, setBayName] = useState(initialData?.bayName || '')
  const [productName, setProductName] = useState(initialData?.productName || '')
  const [cycleTime, setCycleTime] = useState(initialData?.cycleTime.toString() || '10')
  const [capacity, setCapacity] = useState(initialData?.capacity.toString() || '1')

  const handleSave = () => {
    const ct = parseFloat(cycleTime)
    const cap = parseInt(capacity, 10)
    
    if (bayName && productName && ct > 0 && cap > 0) {
      onSave(bayName, productName, ct, cap)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="text-lg font-semibold">Configure Static Build Bay</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bay-name" className="text-xs uppercase tracking-wider font-medium">
            Bay Name
          </Label>
          <Input
            id="bay-name"
            value={bayName}
            onChange={(e) => setBayName(e.target.value)}
            placeholder="e.g., Bay Alpha, North Wing Bay 1"
          />
          <p className="text-xs text-muted-foreground">Unique identifier for this physical bay</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-name" className="text-xs uppercase tracking-wider font-medium">
            Product Name
          </Label>
          <Input
            id="product-name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Engine Assembly"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cycle-time" className="text-xs uppercase tracking-wider font-medium">
            Cycle Time (minutes)
          </Label>
          <Input
            id="cycle-time"
            type="number"
            min="0.1"
            step="0.1"
            value={cycleTime}
            onChange={(e) => setCycleTime(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">Time to produce one unit</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-xs uppercase tracking-wider font-medium">
            Capacity
          </Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            step="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">Number of parallel workstations</p>
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
