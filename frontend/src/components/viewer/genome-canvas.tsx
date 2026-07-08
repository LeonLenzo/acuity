'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import type { Feature } from '@/lib/genome-types'
import { renderFrame, hitTestFeature, hitTestMinimap } from '@/lib/renderer'

interface Props {
  contigLength: number
  features: Feature[]
  onHoverFeature: (f: Feature | null) => void
  onClickFeature: (f: Feature) => void
  jumpTo: { start: number; end: number } | null
}

export function GenomeCanvas({ contigLength, features, onHoverFeature, onClickFeature, jumpTo }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewRef = useRef({ start: 0, end: contigLength })
  const [, forceRender] = useState(0)
  const dragRef = useRef<{ clientX: number; start: number; end: number } | null>(null)
  const hoveredIdRef = useRef<string | null>(null)

  const getView = () => viewRef.current
  const setView = (start: number, end: number) => {
    viewRef.current = { start, end }
    forceRender((n) => n + 1)
  }

  // Reset when contig changes
  useEffect(() => {
    viewRef.current = { start: 0, end: contigLength }
    hoveredIdRef.current = null
    forceRender((n) => n + 1)
  }, [contigLength])

  // Jump to a feature location
  useEffect(() => {
    if (!jumpTo) return
    const pad = Math.max((jumpTo.end - jumpTo.start) * 0.5, 1000)
    const start = Math.max(0, jumpTo.start - pad)
    const end = Math.min(contigLength, jumpTo.end + pad)
    setView(start, end)
  }, [jumpTo, contigLength])

  // Render
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    if (!W || !H) return
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    const { start, end } = getView()
    renderFrame(ctx, W, H, start, end, contigLength, features, hoveredIdRef.current)
  })

  // Wheel zoom — attached imperatively to get passive:false
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const W = canvas.clientWidth
      const cursorRatio = (e.clientX - rect.left) / W
      const { start, end } = getView()
      const range = end - start
      const cursorPos = start + cursorRatio * range
      const factor = e.deltaY > 0 ? 1.18 : 1 / 1.18
      const newRange = Math.min(contigLength, Math.max(300, range * factor))
      let newStart = cursorPos - cursorRatio * newRange
      let newEnd = newStart + newRange
      if (newStart < 0) { newStart = 0; newEnd = newRange }
      if (newEnd > contigLength) { newEnd = contigLength; newStart = contigLength - newRange }
      setView(Math.round(newStart), Math.round(newEnd))
    }
    canvas.addEventListener('wheel', handler, { passive: false })
    return () => canvas.removeEventListener('wheel', handler)
  }, [contigLength])

  const clientXY = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = clientXY(e)
    const W = e.currentTarget.clientWidth
    const miniPos = hitTestMinimap(x, y, W, contigLength)
    if (miniPos !== null) {
      const { start, end } = getView()
      const half = (end - start) / 2
      const newStart = Math.max(0, miniPos - half)
      const newEnd = Math.min(contigLength, miniPos + half)
      setView(Math.round(newStart), Math.round(newEnd))
      return
    }
    const { start, end } = getView()
    dragRef.current = { clientX: e.clientX, start, end }
  }, [contigLength])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const W = e.currentTarget.clientWidth
    const { x, y } = clientXY(e)

    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.clientX
      const range = dragRef.current.end - dragRef.current.start
      const bpPerPx = range / W
      const shift = -dx * bpPerPx
      let newStart = Math.round(dragRef.current.start + shift)
      let newEnd = Math.round(dragRef.current.end + shift)
      if (newStart < 0) { newStart = 0; newEnd = range }
      if (newEnd > contigLength) { newEnd = contigLength; newStart = contigLength - range }
      setView(newStart, newEnd)
      return
    }

    const { start, end } = getView()
    const hit = hitTestFeature(x, y, W, start, end, features)
    const newId = hit?.id ?? null
    if (newId !== hoveredIdRef.current) {
      hoveredIdRef.current = newId
      onHoverFeature(hit ?? null)
      forceRender((n) => n + 1)
    }
  }, [features, contigLength, onHoverFeature])

  const handleMouseUp = useCallback(() => { dragRef.current = null }, [])

  const handleMouseLeave = useCallback(() => {
    dragRef.current = null
    if (hoveredIdRef.current) {
      hoveredIdRef.current = null
      onHoverFeature(null)
      forceRender((n) => n + 1)
    }
  }, [onHoverFeature])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current) return
    const { x, y } = clientXY(e)
    const W = e.currentTarget.clientWidth
    const { start, end } = getView()
    const hit = hitTestFeature(x, y, W, start, end, features)
    if (hit) onClickFeature(hit)
  }, [features, onClickFeature])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ cursor: dragRef.current ? 'grabbing' : 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  )
}
