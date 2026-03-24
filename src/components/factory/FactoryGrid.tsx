import { GridCell } from './GridCell'
import { BayConfig } from '@/lib/types'

interface FactoryGridProps {
  rows: number
  cols: number
  bays: Map<string, BayConfig>
  selectedCells: Set<string>
  onCellClick: (row: number, col: number) => void
}

export function FactoryGrid({ rows, cols, bays, selectedCells, onCellClick }: FactoryGridProps) {
  const positionToKey = (row: number, col: number) => `${row}-${col}`

  return (
    <div className="w-full h-full overflow-auto p-6">
      <div
        className="grid gap-1 w-fit mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(60px, 1fr))`,
        }}
      >
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const key = positionToKey(row, col)
            const config = bays.get(key) || { type: 'empty' as const }
            const isSelected = selectedCells.has(key)

            return (
              <GridCell
                key={key}
                row={row}
                col={col}
                config={config}
                isSelected={isSelected}
                onClick={() => onCellClick(row, col)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
