export type FeatureType = 'gene' | 'repeat' | 'trna' | 'rrna' | 'pseudogene'

export interface Exon {
  start: number
  end: number
}

export interface Feature {
  id: string
  name: string
  start: number
  end: number
  strand: '+' | '-'
  type: FeatureType
  exons: Exon[]       // CDS positions; empty = draw as simple block
  product?: string    // e.g. "hypothetical protein", "effector"
}
