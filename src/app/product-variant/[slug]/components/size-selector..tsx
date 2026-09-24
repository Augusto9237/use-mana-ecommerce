
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

interface SizeSelectorProps {
  sizes: Array<{ size: string; stock: number }> | null;
  setSelectedSize: (size: string) => void;
}

export function SizeSelector({ sizes, setSelectedSize }: SizeSelectorProps) {
  return (
    <ToggleGroup variant="outline"  type="single" defaultValue="center" >
      {sizes?.map((item) => (
        <ToggleGroupItem 
          value={item.size} 
          key={item.size} 
          aria-label={`Toggle ${item.size}`}
          disabled={item.stock === 0}
          onClick={() => setSelectedSize(item.size)}
        >
          {item.size}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
