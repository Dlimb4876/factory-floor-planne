import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThroughputMetrics } from '@/lib/types'

interface MetricsCardProps {
  metrics: ThroughputMetrics
}

export function ThroughputDisplay({ metrics }: MetricsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
            Daily Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono">{metrics.dailyCapacity}</div>
          <p className="text-xs text-muted-foreground mt-1">units per day</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
            Weekly Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono">{metrics.weeklyCapacity}</div>
          <p className="text-xs text-muted-foreground mt-1">units per week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
            Monthly Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono">{metrics.monthlyCapacity}</div>
          <p className="text-xs text-muted-foreground mt-1">units per month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
            Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono">{metrics.utilizationRate}%</div>
          {metrics.bottleneck && (
            <p className="text-xs text-accent mt-1">Bottleneck: {metrics.bottleneck}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
