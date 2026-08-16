
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

interface SizeSelectorProps {
  sizes: string[] | null;
}

export function SizeSelector({ sizes }: SizeSelectorProps) {
  return (
    <ToggleGroup variant="outline"  type="single" defaultValue="center" >
      {sizes?.map((size) => (
        <ToggleGroupItem value={size} key={size} aria-label={`Toggle ${size}`}>
          {size}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
