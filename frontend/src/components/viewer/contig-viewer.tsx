'use client'

import { useAppStore } from '@/store/app-store'
import { mockAssemblies } from '@/lib/mock-data'

export function ContigViewer() {
  const { selectedAssemblyId, selectedContigId } = useAppStore()

  const assembly = selectedAssemblyId ? mockAssemblies[selectedAssemblyId] : null
  const contig = assembly?.contigs.find((c) => c.id === selectedContigId)

  if (!contig) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select a contig from the table below
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-2 flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">{assembly?.name}</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-mono text-xs font-medium">{contig.name}</span>
        <div className="ml-auto">
          <input
            type="text"
            placeholder="Search genes..."
            className="h-7 w-48 rounded border border-input bg-background px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* canvas viewer placeholder */}
      <div className="flex-1 bg-muted/20 flex items-center justify-center text-muted-foreground text-sm">
        <span>Canvas viewer — coming next</span>
      </div>
    </div>
  )
}
