import { Search, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@shadcn-ui/components/ui/input-group";

type ExerciseSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export const ExerciseSearch = ({ value, onChange }: ExerciseSearchProps) => {
  return (
    <InputGroup>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        placeholder="Search exercises"
        aria-label="Search exercises"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="Clear search"
            onClick={() => onChange("")}
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
};
