import { cn } from '@/lib/utils'
import { BayConfig } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface GridCellProps {
  row: number
  col: number
  config: BayConfig
  isSelected: boolean
  onClick: () => void
  onHover?: () => void
}

export function GridCell({ row, col, config, isSelected, onClick, onHover }: GridCellProps) {
  const getCellStyle = () => {
    if (config.type === 'static') {
      return 'bg-[var(--static-bay)] text-[var(--static-bay-foreground)] border-[var(--static-bay)]'
    } else if (config.type === 'flow') {
      return 'bg-[var(--flow-bay)] text-[var(--flow-bay-foreground)] border-[var(--flow-bay)]'
    }
    return 'bg-card hover:bg-muted/50'
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      className={cn(
        'aspect-square border-2 rounded transition-all duration-200 relative',
        'hover:scale-105 hover:shadow-md active:scale-95',
        getCellStyle(),
        isSelected && 'ring-2 ring-primary ring-offset-2 scale-105'
      )}
    >
      {config.type === 'static' && (
        <div className="p-1 flex flex-col items-center justify-center h-full text-xs">
          <div className="font-semibold truncate w-full text-center font-[var(--font-body)]">
            {config.productName}
          </div>
          <div className="font-mono text-[10px] mt-0.5">{config.cycleTime}m</div>
        </div>
      )}
      {config.type === 'flow' && (
        <div className="p-1 flex flex-col items-center justify-center h-full text-xs">
          <Badge variant="secondary" className="text-[9px] px-1 py-0">
            {config.lineName}
          </Badge>
        </div>
      )}
      {config.type === 'empty' && (
        <div className="text-muted-foreground text-[10px] font-mono absolute bottom-0.5 right-0.5">
          {row},{col}
        </div>
      )}
    </button>
  )
}
