'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { mockAssemblies, getMockFeatures } from '@/lib/mock-data'
import { GenomeCanvas } from './genome-canvas'
import type { Feature } from '@/lib/genome-types'

function formatBp(bp: number): string {
  if (bp >= 1_000_000) return `${(bp / 1_000_000).toFixed(2)} Mb`
  if (bp >= 1_000) return `${(bp / 1_000).toFixed(1)} kb`
  return `${bp} bp`
}

export function ContigViewer() {
  const { selectedAssemblyId, selectedContigId, selectFeature } = useAppStore()
  const [hoveredFeature, setHoveredFeature] = useState<Feature | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [jumpTo, setJumpTo] = useState<{ start: number; end: number } | null>(null)

  const assembly = selectedAssemblyId ? mockAssemblies[selectedAssemblyId] : null
  const contig = assembly?.contigs.find((c) => c.id === selectedContigId)
  const features = contig
    ? getMockFeatures(contig.id, contig.length, contig.geneCount)
    : []

  if (!contig) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select a contig from the table below
      </div>
    )
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !searchQuery) return
    const hit = features.find((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (hit) setJumpTo({ start: hit.start, end: hit.end })
  }

  const handleClickFeature = (f: Feature) => {
    selectFeature(f.id)
    setJumpTo({ start: f.start, end: f.end })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 border-b px-4 py-2 flex items-center gap-3 text-xs">
        <span className="font-mono text-muted-foreground">{assembly?.name}</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-mono font-medium">{contig.name}</span>
        <span className="text-muted-foreground">{formatBp(contig.length)}</span>

        {hoveredFeature && (
          <div className="ml-2 flex items-center gap-2 border-l pl-3">
            <span className="font-mono font-medium">{hoveredFeature.name}</span>
            <span className="text-muted-foreground">
              {hoveredFeature.start.toLocaleString()}–{hoveredFeature.end.toLocaleString()}
            </span>
            <span className={hoveredFeature.strand === '+' ? 'text-blue-500' : 'text-orange-500'}>
              {hoveredFeature.strand === '+' ? '→' : '←'}
            </span>
            <span className="text-muted-foreground">
              {formatBp(hoveredFeature.end - hoveredFeature.start)}
            </span>
          </div>
        )}

        <div className="ml-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleSearchKey}
            placeholder="Search genes (↵ to jump)"
            className="h-7 w-52 rounded border border-input bg-background px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0">
        <GenomeCanvas
          contigLength={contig.length}
          features={features}
          onHoverFeature={setHoveredFeature}
          onClickFeature={handleClickFeature}
          jumpTo={jumpTo}
        />
      </div>
    </div>
  )
}
