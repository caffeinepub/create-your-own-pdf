import { useState } from 'react';
import { FileText } from 'lucide-react';

interface PageSelectorProps {
  totalPages: number;
  selectedPages: number[];
  onSelectionChange: (pages: number[]) => void;
}

export default function PageSelector({
  totalPages,
  selectedPages,
  onSelectionChange,
}: PageSelectorProps) {
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const togglePage = (page: number) => {
    if (selectedPages.includes(page)) {
      onSelectionChange(selectedPages.filter((p) => p !== page));
    } else {
      onSelectionChange([...selectedPages, page].sort((a, b) => a - b));
    }
  };

  const selectRange = () => {
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);

    if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
      return;
    }

    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const newSelection = [...new Set([...selectedPages, ...range])].sort((a, b) => a - b);
    onSelectionChange(newSelection);
    setRangeStart('');
    setRangeEnd('');
  };

  const selectAll = () => {
    onSelectionChange(Array.from({ length: totalPages }, (_, i) => i + 1));
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Pages</h3>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Select All
          </button>
          <button
            onClick={clearSelection}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">From Page</label>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={rangeStart}
            onChange={(e) => setRangeStart(e.target.value)}
            placeholder="1"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">To Page</label>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={rangeEnd}
            onChange={(e) => setRangeEnd(e.target.value)}
            placeholder={totalPages.toString()}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={selectRange}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Add Range
        </button>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => togglePage(page)}
            className={`aspect-[3/4] rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${
              selectedPages.includes(page)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50 hover:bg-accent'
            }`}
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm font-medium">{page}</span>
          </button>
        ))}
      </div>

      {selectedPages.length > 0 && (
        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm font-medium">
            Selected: {selectedPages.length} page(s) - {selectedPages.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
