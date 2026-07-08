import type { Feature } from './genome-types'

const featureCache = new Map<string, Feature[]>()

export function getMockFeatures(contigId: string, contigLength: number, geneCount: number): Feature[] {
  if (featureCache.has(contigId)) return featureCache.get(contigId)!

  const features: Feature[] = []
  const step = Math.floor(contigLength / geneCount)

  for (let i = 0; i < geneCount; i++) {
    const jitter = (i * 7919 + 3) % Math.max(1, Math.floor(step * 0.3))
    const start = i * step + jitter + 50
    const geneLen = Math.floor(step * 0.35 + (i * 3571) % Math.max(1, Math.floor(step * 0.3)))
    const end = Math.min(start + geneLen, contigLength)
    if (end <= start) continue
    const strand: '+' | '-' = (i * 1723) % 3 === 0 ? '-' : '+'

    features.push({
      id: `${contigId}-g${i}`,
      name: `PST_${String(i + 1).padStart(5, '0')}`,
      start,
      end,
      strand,
    })
  }

  featureCache.set(contigId, features)
  return features
}

export const mockOrganisms = [
  {
    id: 'org-1',
    name: 'Puccinia striiformis',
    isolates: [
      {
        id: 'iso-1',
        name: 'Pst_104E',
        assemblies: [
          { id: 'asm-1', name: 'v1.0' },
          { id: 'asm-2', name: 'v2.0' },
        ],
      },
      {
        id: 'iso-2',
        name: 'Pst_108',
        assemblies: [
          { id: 'asm-3', name: 'v1.0' },
        ],
      },
    ],
  },
  {
    id: 'org-2',
    name: 'Blumeria graminis',
    isolates: [
      {
        id: 'iso-3',
        name: 'Bgt_96224',
        assemblies: [
          { id: 'asm-4', name: 'v1.0' },
        ],
      },
    ],
  },
]

export const mockAssemblies: Record<string, {
  id: string
  name: string
  isolateName: string
  organismName: string
  stats: { totalLength: number; contigCount: number; n50: number; gcPercent: number }
  contigs: {
    id: string
    name: string
    length: number
    gcPercent: number
    geneCount: number
    coverage: number | null
  }[]
}> = {
  'asm-1': {
    id: 'asm-1',
    name: 'v1.0',
    isolateName: 'Pst_104E',
    organismName: 'Puccinia striiformis',
    stats: { totalLength: 64_100_000, contigCount: 18, n50: 5_200_000, gcPercent: 44.2 },
    contigs: [
      { id: 'ctg-1', name: 'contig_001', length: 8_420_000, gcPercent: 44.1, geneCount: 2104, coverage: 32 },
      { id: 'ctg-2', name: 'contig_002', length: 7_830_000, gcPercent: 43.8, geneCount: 1987, coverage: 31 },
      { id: 'ctg-3', name: 'contig_003', length: 6_950_000, gcPercent: 44.5, geneCount: 1743, coverage: 33 },
      { id: 'ctg-4', name: 'contig_004', length: 5_200_000, gcPercent: 44.0, geneCount: 1302, coverage: 30 },
      { id: 'ctg-5', name: 'contig_005', length: 4_880_000, gcPercent: 44.3, geneCount: 1221, coverage: 32 },
      { id: 'ctg-6', name: 'contig_006', length: 4_210_000, gcPercent: 43.9, geneCount: 1054, coverage: 31 },
      { id: 'ctg-7', name: 'contig_007', length: 3_760_000, gcPercent: 44.6, geneCount: 940, coverage: 34 },
      { id: 'ctg-8', name: 'contig_008', length: 3_120_000, gcPercent: 43.7, geneCount: 780, coverage: 30 },
      { id: 'ctg-9', name: 'contig_009', length: 2_840_000, gcPercent: 44.2, geneCount: 711, coverage: 31 },
      { id: 'ctg-10', name: 'contig_010', length: 2_450_000, gcPercent: 44.4, geneCount: 612, coverage: 32 },
      { id: 'ctg-11', name: 'contig_011', length: 1_980_000, gcPercent: 43.8, geneCount: 495, coverage: 29 },
      { id: 'ctg-12', name: 'contig_012', length: 1_650_000, gcPercent: 44.1, geneCount: 412, coverage: 31 },
      { id: 'ctg-13', name: 'contig_013', length: 1_290_000, gcPercent: 44.7, geneCount: 322, coverage: 33 },
      { id: 'ctg-14', name: 'contig_014', length: 980_000, gcPercent: 43.6, geneCount: 245, coverage: 30 },
      { id: 'ctg-15', name: 'contig_015', length: 720_000, gcPercent: 44.0, geneCount: 180, coverage: 31 },
      { id: 'ctg-16', name: 'contig_016', length: 510_000, gcPercent: 44.3, geneCount: 127, coverage: 32 },
      { id: 'ctg-17', name: 'contig_017', length: 340_000, gcPercent: 43.9, geneCount: 85, coverage: 30 },
      { id: 'ctg-18', name: 'contig_018', length: 120_000, gcPercent: 44.5, geneCount: 30, coverage: 28 },
    ],
  },
  'asm-2': {
    id: 'asm-2',
    name: 'v2.0',
    isolateName: 'Pst_104E',
    organismName: 'Puccinia striiformis',
    stats: { totalLength: 64_500_000, contigCount: 12, n50: 7_100_000, gcPercent: 44.3 },
    contigs: [
      { id: 'ctg-a1', name: 'contig_001', length: 9_800_000, gcPercent: 44.2, geneCount: 2450, coverage: null },
      { id: 'ctg-a2', name: 'contig_002', length: 8_600_000, gcPercent: 44.0, geneCount: 2150, coverage: null },
      { id: 'ctg-a3', name: 'contig_003', length: 7_100_000, gcPercent: 44.5, geneCount: 1775, coverage: null },
      { id: 'ctg-a4', name: 'contig_004', length: 6_400_000, gcPercent: 43.8, geneCount: 1600, coverage: null },
      { id: 'ctg-a5', name: 'contig_005', length: 5_900_000, gcPercent: 44.1, geneCount: 1475, coverage: null },
      { id: 'ctg-a6', name: 'contig_006', length: 5_200_000, gcPercent: 44.4, geneCount: 1300, coverage: null },
    ],
  },
}
