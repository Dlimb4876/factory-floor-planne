import { useState } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, CalendarBlank, Trash } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { ProductionOrder } from '@/lib/types'
import { toast } from 'sonner'

interface ScheduleViewProps {
  bayOptions: Array<{ id: string; name: string }>
}

export function ScheduleView({ bayOptions }: ScheduleViewProps) {
  const [orders, setOrders] = useLocalStorage<ProductionOrder[]>('production-orders', [])
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [selectedBay, setSelectedBay] = useState('')
  const [startDate, setStartDate] = useState<Date>()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const handleAddOrder = () => {
    if (!productName || !quantity || !selectedBay || !startDate) {
      toast.error('Please fill in all fields')
      return
    }

    const qty = parseInt(quantity, 10)
    if (qty <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    const estimatedDays = Math.ceil(qty / 100)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + estimatedDays)

    const newOrder: ProductionOrder = {
      id: Date.now().toString(),
      productName,
      quantity: qty,
      bayId: selectedBay,
      startDate,
      endDate,
    }

    setOrders(current => [...(current || []), newOrder])
    
    setProductName('')
    setQuantity('')
    setSelectedBay('')
    setStartDate(undefined)
    
    toast.success('Production order scheduled')
  }

  const handleDeleteOrder = (orderId: string) => {
    setOrders(current => (current || []).filter(o => o.id !== orderId))
    toast.success('Order deleted')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Production Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-product" className="text-xs uppercase tracking-wider font-medium">
                Product Name
              </Label>
              <Input
                id="schedule-product"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Widget A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-quantity" className="text-xs uppercase tracking-wider font-medium">
                Quantity
              </Label>
              <Input
                id="schedule-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="font-mono"
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-bay" className="text-xs uppercase tracking-wider font-medium">
                Assign to Bay
              </Label>
              <select
                id="schedule-bay"
                value={selectedBay}
                onChange={(e) => setSelectedBay(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select a bay...</option>
                {bayOptions.map(bay => (
                  <option key={bay.id} value={bay.id}>
                    {bay.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-medium">
                Start Date
              </Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    <CalendarBlank className="mr-2" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date)
                      setIsDatePickerOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button onClick={handleAddOrder} className="w-full md:w-auto">
            <Plus className="mr-2" />
            Schedule Order
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Production Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {!orders || orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No production orders scheduled yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Bay</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(orders || []).map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.productName}</TableCell>
                    <TableCell className="font-mono">{order.quantity}</TableCell>
                    <TableCell>
                      {bayOptions.find(b => b.id === order.bayId)?.name || order.bayId}
                    </TableCell>
                    <TableCell>{format(new Date(order.startDate), 'PP')}</TableCell>
                    <TableCell>{format(new Date(order.endDate), 'PP')}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
