"use client"
import React, { useRef, useState } from "react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpToLine,
  Check,
  Circle,
  Copy,
  Diamond,
  Droplet,
  Ellipsis,
  GripVertical,
  ImageIcon,
  Layers,
  Lock,
  Minus,
  Palette,
  Pencil,
  Square,
  Trash2,
  Type,
  Unlock,
  X,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Props = {
  selectedElement: any
  position: {
    left: number
    top: number
  }
  onDelete?: () => void
  onDuplicate?: () => void
  onLock?: () => void
  onBringToFront?: () => void
  onSendToBack?: () => void
  onPropertyChange?: (property: string, value: any) => void
}

const COLORS = [
  "#1e1e1e",
  "#e03131",
  "#f08c00",
  "#2f9e44",
  "#1971c2",
  "#7048e8",
]

function FloatingProperties({
  selectedElement,
  position,
  onDelete,
  onDuplicate,
  onLock,
  onBringToFront,
  onSendToBack,
  onPropertyChange,
}: Props) {
  // dragOffset lets users move the floating toolbar without changing the selected canvas element.
  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0,
  })

  const [moreOpen, setMoreOpen] = useState(false)

  const dragStart = useRef({
    mouseX: 0,
    mouseY: 0,
    offsetX: 0,
    offsetY: 0,
  })

  if (!selectedElement) {
    return null
  }

  const type = selectedElement.type

  // These flags decide which controls are relevant for the selected Excalidraw element type.
  const isText = type === "text"
  const isShape = ["rectangle", "ellipse", "diamond"].includes(type)
  const isLine = type === "line"
  const isArrow = type === "arrow"
  const isLinear = isLine || isArrow
  const isFreeDraw = type === "freedraw"
  const isImage = type === "image"

  const handleDragStart = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Capture pointer movement on the handle so dragging continues even if the pointer leaves the button.
    e.preventDefault()
    e.stopPropagation()

    e.currentTarget.setPointerCapture(e.pointerId)

    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: dragOffset.x,
      offsetY: dragOffset.y,
    }
  }

  const handleDragMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
      return
    }

    const deltaX = e.clientX - dragStart.current.mouseX
    const deltaY = e.clientY - dragStart.current.mouseY

    setDragOffset({
      x: dragStart.current.offsetX + deltaX,
      y: dragStart.current.offsetY + deltaY,
    })
  }

  const handleDragEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const ElementIcon = () => {
    // Mirror the selected element type so users can quickly see what the toolbar is editing.
    if (type === "rectangle") {
      return <Square size={18} />
    }
    if (type === "ellipse") {
      return <Circle size={18} />
    }
    if (type === "diamond") {
      return <Diamond size={18} />
    }
    if (isText) {
      return <Type size={18} />
    }
    if (isLine) {
      return <Minus size={18} />
    }
    if (isArrow) {
      return <ArrowRight size={18} />
    }
    if (isFreeDraw) {
      return <Pencil size={18} />
    }
    if (isImage) {
      return <ImageIcon size={18} />
    }
    return <Layers size={18} />
  }

  const getMoreTitle = () => {
    // Match the overflow popover title to the control group users will see.
    if (isText) {
      return "Text options"
    }
    if (isShape) {
      return "Shape options"
    }
    if (isLinear) {
      return "Line options"
    }
    if (isFreeDraw) {
      return "Drawing options"
    }
    if (isImage) {
      return "Image options"
    }
    return "More options"
  }

  return (
    <div
      className="absolute z-[500] flex items-center gap-0.5 -translate-x-1/2 -translate-y-full rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-[0_12px_35px_rgba(15,23,42,0.14)] backdrop-blur-xl"
      style={{
        left: position.left + dragOffset.x,
        top: position.top + dragOffset.y,
      }}
    >
      {/* Drag handle moves only this toolbar, not the selected drawing element. */}
      <button
        type="button"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        className="flex h-9 w-7 touch-none cursor-grab items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>

      <ToolbarDivider />

      {/* Read-only indicator for the selected element type. */}
      <ToolbarButton title="Element" active>
        <ElementIcon />
      </ToolbarButton>

      {/* Stroke color also acts as text color for Excalidraw text elements. */}
      {!isImage && (
        <Popover>
          <PopoverTrigger asChild>
            <ToolbarButton
              title={isText ? "Text color" : "Stroke color"}
            >
              <div className="relative">
                <Palette size={18} />
                <span
                  className="absolute -bottom-[4px] left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full"
                  style={{
                    backgroundColor:
                      selectedElement.strokeColor || "#1e1e1e",
                  }}
                />
              </div>
            </ToolbarButton>
          </PopoverTrigger>

          <PopoverContent
            side="bottom"
            align="center"
            sideOffset={8}
            className="z-[9999] w-[220px] rounded-xl border border-slate-200 p-2.5 shadow-xl"
          >
            <PropertyLabel>
              {isText ? "Text color" : "Stroke color"}
            </PropertyLabel>

            <div className="mt-2 grid grid-cols-6 gap-1.5">
              {COLORS.map((color) => {
                const selected =
                  selectedElement.strokeColor === color
                return (
                  <ColorCircle
                    key={color}
                    color={color}
                    active={selected}
                    onClick={() =>
                      onPropertyChange?.("strokeColor", color)
                    }
                  />
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Fill controls are only meaningful for closed shapes. */}
      {isShape && (
        <Popover>
          <PopoverTrigger asChild>
            <ToolbarButton title="Fill color">
              <div className="relative">
                <Droplet size={18} />
                <span
                  className="absolute -bottom-[4px] left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full border border-slate-200"
                  style={{
                    backgroundColor:
                      selectedElement.backgroundColor === "transparent"
                        ? "#ffffff"
                        : selectedElement.backgroundColor || "#ffffff",
                  }}
                />
              </div>
            </ToolbarButton>
          </PopoverTrigger>

          <PopoverContent
            side="bottom"
            align="center"
            sideOffset={8}
            className="z-[9999] w-[220px] rounded-xl border border-slate-200 p-2.5 shadow-xl"
          >
            <PropertyLabel>Fill color</PropertyLabel>

            <div className="mt-2 grid grid-cols-6 gap-1.5">
              {COLORS.map((color) => (
                <ColorSquare
                  key={color}
                  color={color}
                  active={
                    selectedElement.backgroundColor === color
                  }
                  onClick={() =>
                    onPropertyChange?.("backgroundColor", color)
                  }
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                onPropertyChange?.(
                  "backgroundColor",
                  "transparent"
                )
              }
              className="mt-2 flex h-8 w-full items-center justify-center rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
            >
              No fill
            </button>
          </PopoverContent>
        </Popover>
      )}

      {/* Alignment controls appear only when editing text. */}
      {isText && (
        <Popover>
          <PopoverTrigger asChild>
            <ToolbarButton title="Alignment">
              {selectedElement.textAlign === "center" ? (
                <AlignCenter size={18} />
              ) : selectedElement.textAlign === "right" ? (
                <AlignRight size={18} />
              ) : (
                <AlignLeft size={18} />
              )}
            </ToolbarButton>
          </PopoverTrigger>

          <PopoverContent
            side="bottom"
            align="center"
            sideOffset={8}
            className="z-[9999] w-auto rounded-xl p-1 shadow-xl"
          >
            <div className="flex gap-0.5">
              <MiniButton
                active={
                  !selectedElement.textAlign ||
                  selectedElement.textAlign === "left"
                }
                onClick={() =>
                  onPropertyChange?.("textAlign", "left")
                }
              >
                <AlignLeft size={17} />
              </MiniButton>

              <MiniButton
                active={selectedElement.textAlign === "center"}
                onClick={() =>
                  onPropertyChange?.("textAlign", "center")
                }
              >
                <AlignCenter size={17} />
              </MiniButton>

              <MiniButton
                active={selectedElement.textAlign === "right"}
                onClick={() =>
                  onPropertyChange?.("textAlign", "right")
                }
              >
                <AlignRight size={17} />
              </MiniButton>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* ================================================= */}
      {/* LINE WIDTH QUICK ACTION */}
      {/* ================================================= */}
      {(isLinear || isFreeDraw) && (
        <Popover>
          <PopoverTrigger asChild>
            <ToolbarButton title="Stroke width">
              <Minus size={19} strokeWidth={2.5} />
            </ToolbarButton>
          </PopoverTrigger>

          <PopoverContent
            side="bottom"
            align="center"
            sideOffset={8}
            className="z-[9999] w-[170px] rounded-xl p-2 shadow-xl"
          >
            <PropertyLabel>Stroke width</PropertyLabel>

            <div className="mt-2 grid grid-cols-3 gap-1">
              {[1, 2, 4].map((width) => (
                <button
                  key={width}
                  type="button"
                  onClick={() =>
                    onPropertyChange?.("strokeWidth", width)
                  }
                  className={`flex h-8 items-center justify-center rounded-lg border ${
                    selectedElement.strokeWidth === width
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className="w-7 rounded-full bg-slate-700"
                    style={{
                      height: width,
                    }}
                  />
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      <ToolbarDivider />

      {/* ================================================= */}
      {/* DUPLICATE */}
      {/* ================================================= */}
      <ToolbarButton title="Duplicate" onClick={onDuplicate}>
        <Copy size={18} />
      </ToolbarButton>

      {/* ================================================= */}
      {/* LOCK */}
      {/* ================================================= */}
      <ToolbarButton
        title={selectedElement.locked ? "Unlock" : "Lock"}
        onClick={onLock}
      >
        {selectedElement.locked ? (
          <Unlock size={18} />
        ) : (
          <Lock size={18} />
        )}
      </ToolbarButton>

      {/* ================================================= */}
      {/* DELETE */}
      {/* ================================================= */}
      <ToolbarButton title="Delete" danger onClick={onDelete}>
        <Trash2 size={18} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* ================================================= */}
      {/* MORE OPTIONS */}
      {/* ================================================= */}
      <Popover open={moreOpen} onOpenChange={setMoreOpen}>
        <PopoverTrigger asChild>
          <ToolbarButton title="More options" active={moreOpen}>
            <Ellipsis size={19} />
          </ToolbarButton>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-[9999] w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
        >
          {/* ========================================= */}
          {/* HEADER */}
          {/* ========================================= */}
          <div className="flex h-9 items-center justify-between px-2.5">
            <span className="text-[13px] font-semibold text-slate-900">
              {getMoreTitle()}
            </span>

            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={14} />
            </button>
          </div>

          <SectionDivider />

          {/* ================================================= */}
          {/* TEXT OPTIONS */}
          {/* ================================================= */}
          {isText && (
            <TextOptions
              selectedElement={selectedElement}
              onPropertyChange={onPropertyChange}
              onBringToFront={onBringToFront}
              onSendToBack={onSendToBack}
            />
          )}

          {/* ================================================= */}
          {/* SHAPE OPTIONS */}
          {/* ================================================= */}
          {isShape && (
            <ShapeOptions
              selectedElement={selectedElement}
              onPropertyChange={onPropertyChange}
              onBringToFront={onBringToFront}
              onSendToBack={onSendToBack}
            />
          )}

          {/* ================================================= */}
          {/* LINE / ARROW / DRAW OPTIONS */}
          {/* ================================================= */}
          {(isLinear || isFreeDraw) && (
            <LinearOptions
              selectedElement={selectedElement}
              onPropertyChange={onPropertyChange}
              onBringToFront={onBringToFront}
              onSendToBack={onSendToBack}
            />
          )}

          {/* ================================================= */}
          {/* IMAGE OPTIONS */}
          {/* ================================================= */}
          {isImage && (
            <ImageOptions
              selectedElement={selectedElement}
              onPropertyChange={onPropertyChange}
              onBringToFront={onBringToFront}
              onSendToBack={onSendToBack}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ============================================================
// TEXT OPTIONS
// ============================================================
function TextOptions({
  selectedElement,
  onPropertyChange,
  onBringToFront,
  onSendToBack,
}: {
  selectedElement: any
  onPropertyChange?: (property: string, value: any) => void
  onBringToFront?: () => void
  onSendToBack?: () => void
}) {
  return (
    <>
      {/* ARRANGE */}
      <div className="p-1.5">
        <div className="grid grid-cols-2 gap-1">
          <QuickAction
            icon={<ArrowUpToLine size={16} />}
            label="Bring front"
            onClick={onBringToFront}
          />
          <QuickAction
            icon={<ArrowDownToLine size={16} />}
            label="Send back"
            onClick={onSendToBack}
          />
        </div>
      </div>

      <SectionDivider />

      {/* FONT */}
      <div className="px-2.5 py-2">
        <PropertyLabel>Font</PropertyLabel>

        <div className="mt-1.5 grid grid-cols-3 gap-1">
          <TextOptionButton
            active={
              !selectedElement.fontFamily ||
              selectedElement.fontFamily === 1
            }
            onClick={() => onPropertyChange?.("fontFamily", 1)}
          >
            Hand
          </TextOptionButton>

          <TextOptionButton
            active={selectedElement.fontFamily === 2}
            onClick={() => onPropertyChange?.("fontFamily", 2)}
          >
            Normal
          </TextOptionButton>

          <TextOptionButton
            active={selectedElement.fontFamily === 3}
            onClick={() => onPropertyChange?.("fontFamily", 3)}
          >
            Mono
          </TextOptionButton>
        </div>
      </div>

      <SectionDivider />

      {/* SIZE + ALIGN */}
      <div className="px-2.5 py-2">
        <div className="grid grid-cols-[85px_1fr] gap-2">
          <div>
            <PropertyLabel>Size</PropertyLabel>

            <select
              value={selectedElement.fontSize || 20}
              onChange={(e) =>
                onPropertyChange?.("fontSize", Number(e.target.value))
              }
              className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-blue-400"
            >
              <option value={12}>12 px</option>
              <option value={16}>16 px</option>
              <option value={20}>20 px</option>
              <option value={24}>24 px</option>
              <option value={32}>32 px</option>
              <option value={40}>40 px</option>
              <option value={48}>48 px</option>
              <option value={64}>64 px</option>
            </select>
          </div>

          <div>
            <PropertyLabel>Alignment</PropertyLabel>

            <div className="mt-1 grid grid-cols-3 gap-1">
              <TextIconButton
                active={
                  !selectedElement.textAlign ||
                  selectedElement.textAlign === "left"
                }
                onClick={() => onPropertyChange?.("textAlign", "left")}
              >
                <AlignLeft size={16} />
              </TextIconButton>

              <TextIconButton
                active={selectedElement.textAlign === "center"}
                onClick={() =>
                  onPropertyChange?.("textAlign", "center")
                }
              >
                <AlignCenter size={16} />
              </TextIconButton>

              <TextIconButton
                active={selectedElement.textAlign === "right"}
                onClick={() => onPropertyChange?.("textAlign", "right")}
              >
                <AlignRight size={16} />
              </TextIconButton>
            </div>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* TEXT COLOR */}
      <div className="px-2.5 py-2">
        <PropertyLabel>Text color</PropertyLabel>

        <div className="mt-1.5 flex items-center gap-1">
          {COLORS.map((color) => (
            <ColorCircle
              key={color}
              color={color}
              active={selectedElement.strokeColor === color}
              onClick={() => onPropertyChange?.("strokeColor", color)}
            />
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* OPACITY */}
      <OpacityControl
        selectedElement={selectedElement}
        onPropertyChange={onPropertyChange}
      />
    </>
  )
}

// ============================================================
// SHAPE OPTIONS
// ============================================================
function ShapeOptions({
  selectedElement,
  onPropertyChange,
  onBringToFront,
  onSendToBack,
}: {
  selectedElement: any
  onPropertyChange?: (property: string, value: any) => void
  onBringToFront?: () => void
  onSendToBack?: () => void
}) {
  return (
    <>
      {/* ARRANGE */}
      <div className="p-1.5">
        <div className="grid grid-cols-2 gap-1">
          <QuickAction
            icon={<ArrowUpToLine size={16} />}
            label="Bring front"
            onClick={onBringToFront}
          />
          <QuickAction
            icon={<ArrowDownToLine size={16} />}
            label="Send back"
            onClick={onSendToBack}
          />
        </div>
      </div>

      <SectionDivider />

      {/* STROKE */}
      <div className="px-2.5 py-2">
        <div className="flex items-center justify-between">
          <PropertyLabel>Stroke</PropertyLabel>
          <span className="text-[10px] text-slate-400">
            Style & width
          </span>
        </div>

        <StrokeControls
          selectedElement={selectedElement}
          onPropertyChange={onPropertyChange}
        />
      </div>

      <SectionDivider />

      {/* FILL */}
      <div className="px-2.5 py-2">
        <PropertyLabel>Fill</PropertyLabel>

        <div className="mt-1.5 flex items-center gap-1">
          {COLORS.map((color) => (
            <ColorSquare
              key={color}
              color={color}
              active={selectedElement.backgroundColor === color}
              onClick={() =>
                onPropertyChange?.("backgroundColor", color)
              }
            />
          ))}

          <button
            type="button"
            title="No fill"
            onClick={() =>
              onPropertyChange?.("backgroundColor", "transparent")
            }
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <SectionDivider />

      <OpacityControl
        selectedElement={selectedElement}
        onPropertyChange={onPropertyChange}
      />
    </>
  )
}

// ============================================================
// LINE / ARROW OPTIONS
// ============================================================
function LinearOptions({
  selectedElement,
  onPropertyChange,
  onBringToFront,
  onSendToBack,
}: {
  selectedElement: any
  onPropertyChange?: (property: string, value: any) => void
  onBringToFront?: () => void
  onSendToBack?: () => void
}) {
  return (
    <>
      <div className="p-1.5">
        <div className="grid grid-cols-2 gap-1">
          <QuickAction
            icon={<ArrowUpToLine size={16} />}
            label="Bring front"
            onClick={onBringToFront}
          />
          <QuickAction
            icon={<ArrowDownToLine size={16} />}
            label="Send back"
            onClick={onSendToBack}
          />
        </div>
      </div>

      <SectionDivider />

      <div className="px-2.5 py-2">
        <PropertyLabel>Stroke</PropertyLabel>

        <StrokeControls
          selectedElement={selectedElement}
          onPropertyChange={onPropertyChange}
        />
      </div>

      <SectionDivider />

      <div className="px-2.5 py-2">
        <PropertyLabel>Color</PropertyLabel>

        <div className="mt-1.5 flex items-center gap-1">
          {COLORS.map((color) => (
            <ColorCircle
              key={color}
              color={color}
              active={selectedElement.strokeColor === color}
              onClick={() => onPropertyChange?.("strokeColor", color)}
            />
          ))}
        </div>
      </div>

      <SectionDivider />

      <OpacityControl
        selectedElement={selectedElement}
        onPropertyChange={onPropertyChange}
      />
    </>
  )
}

// ============================================================
// IMAGE OPTIONS
// ============================================================
function ImageOptions({
  selectedElement,
  onPropertyChange,
  onBringToFront,
  onSendToBack,
}: {
  selectedElement: any
  onPropertyChange?: (property: string, value: any) => void
  onBringToFront?: () => void
  onSendToBack?: () => void
}) {
  return (
    <>
      <div className="p-1.5">
        <div className="grid grid-cols-2 gap-1">
          <QuickAction
            icon={<ArrowUpToLine size={16} />}
            label="Bring front"
            onClick={onBringToFront}
          />
          <QuickAction
            icon={<ArrowDownToLine size={16} />}
            label="Send back"
            onClick={onSendToBack}
          />
        </div>
      </div>

      <SectionDivider />

      <OpacityControl
        selectedElement={selectedElement}
        onPropertyChange={onPropertyChange}
      />
    </>
  )
}

// ============================================================
// STROKE CONTROLS
// ============================================================
function StrokeControls({
  selectedElement,
  onPropertyChange,
}: {
  selectedElement: any
  onPropertyChange?: (property: string, value: any) => void
}) {
  const isSharpShape = (selectedElement.roughness ?? 1) === 0

  return (
    <>
      <div className="mt-1.5 grid grid-cols-3 gap-1">
        <StrokeStyleButton
          styleType="solid"
          selected={
            !selectedElement.strokeStyle ||
            selectedElement.strokeStyle === "solid"
          }
          onClick={() => onPropertyChange?.("strokeStyle", "solid")}
        />

        <StrokeStyleButton
          styleType="dashed"
          selected={selectedElement.strokeStyle === "dashed"}
          onClick={() => onPropertyChange?.("strokeStyle", "dashed")}
        />

        <StrokeStyleButton
          styleType="dotted"
          selected={selectedElement.strokeStyle === "dotted"}
          onClick={() => onPropertyChange?.("strokeStyle", "dotted")}
        />
      </div>

      <select
        value={selectedElement.strokeWidth || 1}
        onChange={(e) =>
          onPropertyChange?.("strokeWidth", Number(e.target.value))
        }
        className="mt-1.5 h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-blue-400"
      >
        <option value={1}>1 px — Thin</option>
        <option value={2}>2 px — Medium</option>
        <option value={4}>4 px — Thick</option>
      </select>

      <div className="mt-1.5 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => onPropertyChange?.("shapeMode", "sharp")}
          className={`flex h-8 items-center justify-center rounded-lg border text-xs font-medium transition ${
            isSharpShape
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          Sharp
        </button>

        <button
          type="button"
          onClick={() => onPropertyChange?.("shapeMode", "drawn")}
          className={`flex h-8 items-center justify-center rounded-lg border text-xs font-medium transition ${
            !isSharpShape
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          Hand drawn
        </button>
      </div>
    </>
  )
}

// ============================================================
// OPACITY
// ============================================================
function OpacityControl({
  selectedElement,
  onPropertyChange,
}: {
  selectedElement: any
  onPropertyChange?: (property: string, value: any) => void
}) {
  return (
    <div className="px-2.5 py-2">
      <div className="flex items-center justify-between">
        <PropertyLabel>Opacity</PropertyLabel>

        <span className="text-[10px] font-medium text-slate-400">
          {selectedElement.opacity ?? 100}%
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={selectedElement.opacity ?? 100}
        onChange={(e) =>
          onPropertyChange?.("opacity", Number(e.target.value))
        }
        className="mt-1 block h-4 w-full cursor-pointer accent-blue-600"
      />
    </div>
  )
}

// ============================================================
// TOOLBAR BUTTON
// ============================================================
const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  {
    children: React.ReactNode
    active?: boolean
    danger?: boolean
    title?: string
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    className?: string
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(
  (
    {
      children,
      active = false,
      danger = false,
      title,
      onClick,
      className = "",
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        title={title}
        onClick={onClick}
        {...rest}
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 ${
          danger
            ? "text-red-500 hover:bg-red-50 hover:text-red-600"
            : active
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        } ${className}`}
      >
        {children}
      </button>
    )
  }
)
ToolbarButton.displayName = "ToolbarButton"

// ============================================================
// QUICK ACTION
// ============================================================
function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 text-[10px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}

// ============================================================
// TEXT OPTION
// ============================================================
function TextOptionButton({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 items-center justify-center rounded-lg border text-[11px] font-medium transition ${
        active
          ? "border-blue-300 bg-blue-50 text-blue-600"
          : "border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  )
}

// ============================================================
// TEXT ICON BUTTON
// ============================================================
function TextIconButton({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 items-center justify-center rounded-lg border transition ${
        active
          ? "border-blue-300 bg-blue-50 text-blue-600"
          : "border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  )
}

// ============================================================
// MINI BUTTON
// ============================================================
function MiniButton({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
        active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  )
}

// ============================================================
// COLOR CIRCLE
// ============================================================
function ColorCircle({
  color,
  active,
  onClick,
}: {
  color: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 transition hover:scale-110"
      style={{
        backgroundColor: color,
      }}
    >
      {active && <Check size={12} className="text-white" />}
    </button>
  )
}

// ============================================================
// COLOR SQUARE
// ============================================================
function ColorSquare({
  color,
  active,
  onClick,
}: {
  color: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-7 w-7 items-center justify-center rounded-md border transition hover:scale-110 ${
        active
          ? "border-blue-400 ring-1 ring-blue-200"
          : "border-slate-200"
      }`}
      style={{
        backgroundColor: color,
      }}
    >
      {active && <Check size={12} className="text-white" />}
    </button>
  )
}

// ============================================================
// STROKE STYLE BUTTON
// ============================================================
function StrokeStyleButton({
  styleType,
  selected,
  onClick,
}: {
  styleType: "solid" | "dashed" | "dotted"
  selected?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 items-center justify-center rounded-lg border transition ${
        selected
          ? "border-blue-300 bg-blue-50"
          : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div
        className={`w-8 border-t-2 border-slate-600 ${
          styleType === "solid"
            ? "border-solid"
            : styleType === "dashed"
            ? "border-dashed"
            : "border-dotted"
        }`}
      />
    </button>
  )
}

// ============================================================
// PROPERTY LABEL
// ============================================================
function PropertyLabel({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <span className="text-[11px] font-semibold text-slate-500">
      {children}
    </span>
  )
}

// ============================================================
// TOOLBAR DIVIDER
// ============================================================
function ToolbarDivider() {
  return <div className="mx-0.5 h-6 w-px bg-slate-200" />
}

// ============================================================
// SECTION DIVIDER
// ============================================================
function SectionDivider() {
  return <div className="h-px bg-slate-100" />
}

export default FloatingProperties
