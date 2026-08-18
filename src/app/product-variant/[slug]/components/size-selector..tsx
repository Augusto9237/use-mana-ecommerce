
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

interface SizeSelectorProps {
  sizes: Array<{ size: string; stock: number }> | null;
}

export function SizeSelector({ sizes }: SizeSelectorProps) {
  return (
    <ToggleGroup variant="outline"  type="single" defaultValue="center" >
      {sizes?.map((item) => (
        <ToggleGroupItem 
          value={item.size} 
          key={item.size} 
          aria-label={`Toggle ${item.size}`}
          disabled={item.stock === 0}
        >
          {item.size}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
