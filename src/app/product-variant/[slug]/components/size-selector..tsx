
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export function SizeSelector() {
  return (
    <ToggleGroup variant="outline"  type="single" defaultValue="center" >
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        P
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        M
      </ToggleGroupItem>
      <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">
        G
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
