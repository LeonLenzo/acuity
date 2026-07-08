'use client'

import { mockAssemblies } from '@/lib/mock-data'
import { useAppStore } from '@/store/app-store'

function formatLength(bp: number): string {
  if (bp >= 1_000_000) return `${(bp / 1_000_000).toFixed(1)} Mb`
  if (bp >= 1_000) return `${(bp / 1_000).toFixed(0)} kb`
  return `${bp} bp`
}

export function AssemblyOverview() {
  const { selectedAssemblyId, selectedContigId, selectContig } = useAppStore()

  const assembly = selectedAssemblyId ? mockAssemblies[selectedAssemblyId] : null
  if (!assembly) return null

  const { stats, contigs } = assembly

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-4">
        <p className="text-xs text-muted-foreground mb-0.5">
          {assembly.organismName} / {assembly.isolateName}
        </p>
        <h1 className="font-semibold text-lg">{assembly.name}</h1>
        <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
          <span>{formatLength(stats.totalLength)}</span>
          <span>{stats.contigCount} contigs</span>
          <span>N50 {formatLength(stats.n50)}</span>
          <span>GC {stats.gcPercent}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-background border-b">
            <tr className="text-left text-muted-foreground text-xs">
              <th className="px-6 py-2 font-medium">Contig</th>
              <th className="px-4 py-2 font-medium">Length</th>
              <th className="px-4 py-2 font-medium">GC%</th>
              <th className="px-4 py-2 font-medium">Genes</th>
              <th className="px-4 py-2 font-medium">Coverage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contigs.map((contig) => (
              <tr
                key={contig.id}
                onClick={() => selectContig(contig.id)}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedContigId === contig.id ? 'bg-muted' : ''
                }`}
              >
                <td className="px-6 py-2.5 font-mono text-xs">{contig.name}</td>
                <td className="px-4 py-2.5 tabular-nums">{formatLength(contig.length)}</td>
                <td className="px-4 py-2.5 tabular-nums">{contig.gcPercent.toFixed(1)}</td>
                <td className="px-4 py-2.5 tabular-nums">{contig.geneCount.toLocaleString()}</td>
                <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                  {contig.coverage != null ? `${contig.coverage}×` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
