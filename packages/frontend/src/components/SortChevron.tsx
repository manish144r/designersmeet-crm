// BRIEF-21 — Sort indicator for table column headers.
// Drop inside an existing <th> — does NOT change the th or its className.
// Pattern: <th className={...}>Name <SortChevron field="name" sort={sort} order={order} onSort={setSort} /></th>
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface SortChevronProps {
  field: string;
  sort: string;
  order: "asc" | "desc";
  onSort: (field: string) => void;
}

export function SortChevron({ field, sort, order, onSort }: SortChevronProps) {
  const active = sort === field;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    onSort(field);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="ml-1 inline-flex align-middle opacity-40 hover:opacity-100 focus-visible:outline-none"
      aria-label={`Sort by ${field} ${active && order === "asc" ? "descending" : "ascending"}`}
    >
      {!active ? (
        <ChevronsUpDown size={12} />
      ) : order === "asc" ? (
        <ChevronUp size={12} />
      ) : (
        <ChevronDown size={12} />
      )}
    </button>
  );
}
