import { useState, useRef, useEffect } from 'react'
import { Settings, ChevronDown, Moon, BedDouble, Key, AlertTriangle, Ban, X } from 'lucide-react'

// ─── COLOR MODES ──────────────────────────────────────────────────────────────

const COLOR_MODES = {
  demand: {
    label: 'Demand',
    swatches: [
      { id: 'low',     label: 'Low',         color: '#E8F5E0', border: '#d1ebb3' },
      { id: 'normal',  label: 'Normal',       color: '#C8E6B2', border: '#a8d87e' },
      { id: 'good',    label: 'Good',         color: '#DCEEFB', border: '#b3d9f5' },
      { id: 'high',    label: 'High',         color: '#A9D2F0', border: '#7dbde8' },
      { id: 'unavail', label: 'Unavailable',  color: '#E5E7EB', border: '#d1d5db' },
    ],
  },
  adr: {
    label: 'ADR vs Last Year',
    swatches: [
      { id: 'above',  label: 'Recommended > Last Year ADR', color: '#BAD9F5', border: '#93c4ee' },
      { id: 'below',  label: 'Recommended < Last Year ADR', color: '#FBCFC9', border: '#f5a89f' },
      { id: 'unavail',label: 'Last Year ADR Unavailable',   color: '#FFFFFF', border: '#D1D5DB' },
    ],
  },
  pickup: {
    label: 'Pickup',
    swatches: [
      { id: 'p3',      label: 'Last 3d',   color: '#2471A3', border: '#1a5c87' },
      { id: 'p7',      label: 'Last 7d',   color: '#5B9EC9', border: '#4487b5' },
      { id: 'p14',     label: 'Last 14d',  color: '#8DC4E6', border: '#6eaed8' },
      { id: 'p30',     label: 'Last 30d',  color: '#BCDBF0', border: '#9acbe7' },
      { id: 'p30plus', label: '30+ days',  color: '#E0EFF9', border: '#c4dff0' },
    ],
  },
  quotes: {
    label: 'Listing Quotes',
    swatches: [
      { id: 'q_low',    label: 'Low',             color: '#EBF4FB', border: '#c8dff0' },
      { id: 'q_normal', label: 'Normal',           color: '#C5DFF4', border: '#9bcbe8' },
      { id: 'q_good',   label: 'Good',             color: '#7DB8E3', border: '#5aa0d4' },
      { id: 'q_high',   label: 'High',             color: '#2471A3', border: '#1a5c87' },
      { id: 'q_none',   label: 'No Quotes',        color: '#FFFFFF', border: '#D1D5DB' },
      { id: 'q_unavail',label: 'Data Unavailable', color: '#F5E6C8', border: '#e8d09a' },
    ],
  },
}

// Derive cell bg+border from a day + active color mode
function getCellColors(day, colorMode) {
  const mode = COLOR_MODES[colorMode]
  const key = day[colorMode] // e.g. day.demand, day.adr, day.pickup, day.quotes
  const swatch = mode.swatches.find(s => s.id === key)
  return swatch
    ? { bg: swatch.color, border: swatch.border }
    : { bg: '#fff', border: '#e5e7eb' }
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const DAYS = [
  { date: 29, label: '29', isCurrentMonth: false },
  { date: 30, label: '30', isCurrentMonth: false },
  { date: 31, label: '31', isCurrentMonth: false },
  { date: 1,  label: '1',  isCurrentMonth: true },
  { date: 2,  label: '2',  isCurrentMonth: true },
  { date: 3,  label: '3',  isCurrentMonth: true },
  { date: 4,  label: '4',  isCurrentMonth: true },
  { date: 5,  label: '5',  isCurrentMonth: true },
  { date: 6,  label: '6',  isCurrentMonth: true,  demand:'low',    adr:'above', pickup:'p30plus',price:1000, minStay:2 },
  { date: 7,  label: '7',  isCurrentMonth: true,  demand:'normal', adr:'above', pickup:'p30',   price:1767, minStay:2 },
  { date: 8,  label: '8',  isCurrentMonth: true,  demand:'normal', adr:'above', pickup:'p30',   price:1767, minStay:2, unbookable:true },
  { date: 9,  label: '9',  isCurrentMonth: true,  demand:'low',    adr:'below', pickup:'p14',   price:1800, minStay:3 },
  { date: 10, label:'10',  isCurrentMonth: true,  demand:'unavail',adr:'above', pickup:'p7',    price:2130, minStay:3, restricted:true, booked:true, adrVal:2000 },
  { date: 11, label:'11',  isCurrentMonth: true,  demand:'unavail',adr:'above', pickup:'p7',    price:2130, minStay:3, restricted:true, booked:true, adrVal:2000 },
  { date: 12, label:'12',  isCurrentMonth: true,  demand:'unavail',adr:'above', pickup:'p3',    price:2130, minStay:3, restricted:true, booked:true, adrVal:2000 },
  { date: 13, label:'13',  isCurrentMonth: true,  demand:'unavail',adr:'above', pickup:'p3',    price:2130, minStay:3, booked:true, adrVal:2000 },
  { date: 14, label:'14',  isCurrentMonth: true,  demand:'unavail',adr:'above', pickup:'p14',   price:2130, minStay:3, booked:true, adrVal:2000 },
  { date: 15, label:'15',  isCurrentMonth: true,  demand:'low',    adr:'below', pickup:'p30',   price:2130, minStay:2 },
  { date: 16, label:'16',  isCurrentMonth: true,  demand:'low',    adr:'below', pickup:'p30',   price:2130, minStay:2, guestCheckin:true },
  { date: 17, label:'17',  isCurrentMonth: true,  demand:'good',   adr:'above', pickup:'p14',   price:2130, minStay:3, groupOverride:true, accountOverride:true, minPricePill:true },
  { date: 18, label:'18',  isCurrentMonth: true,  demand:'good',   adr:'above', pickup:'p14',   price:2130, minStay:3, restricted:true },
  { date: 19, label:'19',  isCurrentMonth: true,  demand:'low',    adr:'below', pickup:'p30',   price:2130, minStay:2, restricted:true },
  { date: 20, label:'20',  isCurrentMonth: true,  demand:'normal', adr:'above', pickup:'p30',   price:2130, minStay:2 },
  { date: 21, label:'21',  isCurrentMonth: true,  demand:'normal', adr:'above', pickup:'p30plus',price:2130, minStay:2 },
  { date: 22, label:'22',  isCurrentMonth: true,  demand:'normal', adr:'above', pickup:'p30plus',price:2130, minStay:2 },
  { date: 23, label:'23',  isCurrentMonth: true,  demand:'unavail',adr:'unavail',pickup:'p30plus',price:2130, minStay:2, blocked:true },
  { date: 24, label:'24',  isCurrentMonth: true,  demand:'unavail',adr:'unavail',pickup:'p30plus',price:2130, minStay:3, blocked:true },
  { date: 25, label:'25',  isCurrentMonth: true,  demand:'high',   adr:'above', pickup:'p7',    price:2130, minStay:3, restricted:true, unbookable:true, minPricePill:true },
  { date: 26, label:'26',  isCurrentMonth: true,  demand:'unavail',adr:'above', pickup:'p3',    price:1400, minStay:2, restricted:true, booked:true, adrVal:2000, guestCheckin:true },
  { date: 27, label:'27',  isCurrentMonth: true,  demand:'unavail',adr:'above', pickup:'p3',    price:1345, minStay:2, booked:true, adrVal:2000 },
  { date: 28, label:'28',  isCurrentMonth: true,  demand:'unavail',adr:'below', pickup:'p7',    price:1312, minStay:2, booked:true, adrVal:2000, groupOverride:true },
  { date: 29, label:'29',  isCurrentMonth: true,  demand:'high',   adr:'above', pickup:'p14',   price:2130, minStay:2 },
  { date: 30, label:'30',  isCurrentMonth: true,  demand:'good',   adr:'above', pickup:'p14',   price:2130, minStay:2, restricted:true, unbookable:true, groupOverride:true },
  { date: 1,  label: '1',  isCurrentMonth: false, isMay: true },
  { date: 2,  label: '2',  isCurrentMonth: false, isMay: true },
]

// Assign quotes mode based on demand
const DEMAND_TO_QUOTES = { low:'q_low', normal:'q_normal', good:'q_good', high:'q_high', unavail:'q_none' }
DAYS.forEach(d => {
  if (d.isCurrentMonth && d.demand) d.quotes = DEMAND_TO_QUOTES[d.demand] || 'q_unavail'
  else if (d.isCurrentMonth) d.quotes = 'q_unavail'
})

// ─── LEGEND ITEM DEFINITIONS ──────────────────────────────────────────────────
// group: 'minStay' | 'demand' | 'booking' | 'other'

const LEGEND_DEFS = [
  { id: 'minStay',     group: 'minStay',  label: 'Min Stay',                        defaultOn: true  },
  // demand swatches are rendered dynamically from COLOR_MODES[colorMode].swatches
  { id: 'unbookable',  group: 'booking',  label: 'Unbookable',                      defaultOn: true  },
  { id: 'booked',      group: 'booking',  label: 'Booked',                          defaultOn: true  },
  { id: 'guestCheckin',group: 'booking',  label: 'Guest Check-in',                  defaultOn: true  },
  { id: 'multiUnit',   group: 'booking',  label: 'Multi-Unit Occupancy',            defaultOn: false },
  { id: 'restricted',  group: 'other',    label: 'Check-in/Check-out Restricted',   defaultOn: false },
  { id: 'override',    group: 'other',    label: 'Account/Group Override',          defaultOn: false },
  { id: 'minMaxPrice', group: 'other',    label: 'Min/Max Price Limit Reached',     defaultOn: false },
]

// ─── SMALL ICONS ─────────────────────────────────────────────────────────────

function MoonIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function MultiUnitIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="6" fill="none" stroke="#6B7280" strokeWidth="1.5" />
      <path d="M7 1 A6 6 0 0 1 7 13 Z" fill="#6B7280" />
    </svg>
  )
}

function BadgeLetter({ letter }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full text-white font-bold"
      style={{ width: 16, height: 16, fontSize: 9, background: '#111', lineHeight: 1, flexShrink: 0 }}>
      {letter}
    </span>
  )
}

function MinMaxIcon() {
  return (
    <span className="inline-flex flex-col items-center justify-center" style={{ width: 14, height: 14 }}>
      <svg width="12" height="6" viewBox="0 0 12 6"><polygon points="6,0 12,6 0,6" fill="#dc2626" /></svg>
      <svg width="12" height="6" viewBox="0 0 12 6"><polygon points="6,6 12,0 0,0" fill="#2563EB" /></svg>
    </span>
  )
}

function LegendIcon({ id, size = 11 }) {
  if (id === 'minStay')     return <Moon size={size} className="text-gray-500" />
  if (id === 'unbookable')  return <AlertTriangle size={size} className="text-yellow-500" />
  if (id === 'booked')      return <BedDouble size={size} className="text-gray-500" />
  if (id === 'guestCheckin')return <Key size={size} className="text-gray-500" />
  if (id === 'multiUnit')   return <MultiUnitIcon size={size + 2} />
  if (id === 'restricted')  return <span className="inline-flex items-center gap-0.5" style={{ color: '#dc2626', fontSize: size }}>⊘→ ⊘←</span>
  if (id === 'override')    return <span className="inline-flex gap-0.5"><BadgeLetter letter="A" /><BadgeLetter letter="G" /></span>
  if (id === 'minMaxPrice') return <MinMaxIcon />
  return null
}

// ─── CALENDAR CELL ────────────────────────────────────────────────────────────

function CalendarCell({ day, colorMode }) {
  if (!day.isCurrentMonth) {
    return (
      <div className="border border-gray-200 relative" style={{ minHeight: 110, background: '#f9fafb' }}>
        <span className="absolute top-1 right-1.5 text-xs text-gray-300">{day.label}</span>
      </div>
    )
  }

  const { bg, border } = getCellColors(day, colorMode)

  return (
    <div className="relative border flex flex-col" style={{ minHeight: 110, background: bg, borderColor: border }}>
      <div className="absolute top-1 left-1.5 flex items-center gap-0.5" style={{ color: '#6B7280', fontSize: 11 }}>
        {day.minStay && <><span>{day.minStay}</span><MoonIcon size={10} /></>}
      </div>
      <div className="absolute top-1 right-1 flex items-center gap-0.5">
        {day.restricted && <span style={{ color: '#dc2626', fontSize: 13, lineHeight: 1 }}>🚫</span>}
        <span className="text-xs font-medium text-gray-500 ml-0.5">{day.label}</span>
      </div>
      <div className="flex-1 flex flex-col justify-center px-1 pt-5 pb-1 gap-0.5">
        {day.booked && (
          <div className="flex items-center gap-1" style={{ fontSize: 10, color: '#374151' }}>
            <BedDouble size={10} className="text-gray-500" /><span>ADR: {day.adrVal}</span>
          </div>
        )}
        {day.guestCheckin && !day.booked && (
          <div className="flex items-center gap-1" style={{ fontSize: 10, color: '#374151' }}>
            <Key size={10} className="text-gray-500" /><span style={{ fontSize: 9, color: '#6B7280' }}>Guest Check-in</span>
          </div>
        )}
        {day.guestCheckin && day.booked && (
          <div className="flex items-center" style={{ fontSize: 10 }}><Key size={10} className="text-gray-500" /></div>
        )}
        {day.unbookable && (
          <div className="flex items-center gap-1" style={{ fontSize: 10, color: '#dc2626' }}>
            <AlertTriangle size={10} /><span>Unbookable</span>
          </div>
        )}
        {day.blocked && (
          <div className="flex items-center gap-1" style={{ fontSize: 10, color: '#374151' }}>
            <Ban size={10} /><span>Blocked</span>
          </div>
        )}
        {(day.groupOverride || day.accountOverride) && (
          <div className="flex items-center gap-0.5">
            {day.groupOverride   && <BadgeLetter letter="G" />}
            {day.accountOverride && <BadgeLetter letter="A" />}
          </div>
        )}
        {day.minPricePill && (
          <div className="rounded text-white text-center" style={{ background: '#7C5CBF', fontSize: 9, padding: '2px 4px', marginTop: 2 }}>
            min price : 2000 fixed
          </div>
        )}
      </div>
      {day.price && (
        <div className="text-center pb-1 font-medium" style={{ fontSize: 15, color: '#4B5563' }}>{day.price}</div>
      )}
    </div>
  )
}

// ─── LEGEND ROW ───────────────────────────────────────────────────────────────

function LegendChip({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 flex-shrink-0">
      {icon}
      <span>{label}</span>
    </span>
  )
}

function SwatchChip({ color, border, label }) {
  return (
    <span className="inline-flex items-center gap-1 flex-shrink-0">
      <span className="inline-block rounded-sm" style={{ width: 12, height: 12, background: color, border: `1px solid ${border}`, flexShrink: 0 }} />
      <span>{label}</span>
    </span>
  )
}

function LegendPopover({ colorMode, onClose }) {
  const ref = useRef()
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  const modeSwatches = COLOR_MODES[colorMode].swatches
  const modeLabel = COLOR_MODES[colorMode].label

  return (
    <div ref={ref} className="absolute z-50 bg-white shadow-xl rounded-lg border border-gray-200 p-4"
      style={{ bottom: '110%', right: 0, minWidth: 290 }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-700 text-sm">All Legends</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
      </div>
      <div className="space-y-2" style={{ fontSize: 12 }}>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Min Stay</div>
        <span className="flex items-center gap-1.5"><Moon size={12} className="text-gray-500" /><span>Min Stay</span></span>

        <div className="border-t border-gray-100 my-1" />
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{modeLabel}</div>
        {modeSwatches.map(s => (
          <SwatchChip key={s.id} color={s.color} border={s.border} label={s.label} />
        ))}

        <div className="border-t border-gray-100 my-1" />
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Booking Info</div>
        {LEGEND_DEFS.filter(d => d.group === 'booking').map(d => (
          <span key={d.id} className="flex items-center gap-1.5"><LegendIcon id={d.id} size={12} /><span>{d.label}</span></span>
        ))}

        <div className="border-t border-gray-100 my-1" />
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Restrictions &amp; Overrides</div>
        {LEGEND_DEFS.filter(d => d.group === 'other').map(d => (
          <span key={d.id} className="flex items-center gap-1.5"><LegendIcon id={d.id} size={12} /><span>{d.label}</span></span>
        ))}
      </div>
    </div>
  )
}

function LegendRow({ visibleIds, colorMode }) {
  const [showPopover, setShowPopover] = useState(false)
  const mode = COLOR_MODES[colorMode]

  // Which demand swatches are visible (individual demand swatch toggles use their id)
  const demandSwatches = mode.swatches.filter(s => visibleIds.has(s.id))

  const bookingItems = LEGEND_DEFS.filter(d => d.group === 'booking' && visibleIds.has(d.id))
  const otherItems   = LEGEND_DEFS.filter(d => d.group === 'other'   && visibleIds.has(d.id))
  const showMinStay  = visibleIds.has('minStay')

  return (
    <div className="relative border-t border-gray-200 bg-white px-3 py-2" style={{ fontSize: 11, color: '#6B7280' }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">

        {showMinStay && (
          <>
            <span className="font-semibold text-gray-600 flex-shrink-0">Min Stay:</span>
            <LegendChip icon={<Moon size={11} className="text-gray-500" />} label="Min Stay" />
            {(demandSwatches.length > 0 || bookingItems.length > 0 || otherItems.length > 0) &&
              <span className="text-gray-300 flex-shrink-0">|</span>}
          </>
        )}

        {demandSwatches.length > 0 && (
          <>
            <span className="font-semibold text-gray-600 flex-shrink-0">{mode.label}:</span>
            {demandSwatches.map(s => (
              <SwatchChip key={s.id} color={s.color} border={s.border} label={s.label} />
            ))}
            {(bookingItems.length > 0 || otherItems.length > 0) &&
              <span className="text-gray-300 flex-shrink-0">|</span>}
          </>
        )}

        {bookingItems.length > 0 && (
          <>
            <span className="font-semibold text-gray-600 flex-shrink-0">Booking Info:</span>
            {bookingItems.map(d => (
              <LegendChip key={d.id} icon={<LegendIcon id={d.id} />} label={d.label} />
            ))}
            {otherItems.length > 0 && <span className="text-gray-300 flex-shrink-0">|</span>}
          </>
        )}

        {otherItems.length > 0 && (
          <>
            {otherItems.map(d => (
              <LegendChip key={d.id} icon={<LegendIcon id={d.id} />} label={d.label} />
            ))}
          </>
        )}

        <div className="ml-auto relative flex-shrink-0">
          <button className="text-blue-600 hover:underline" style={{ fontSize: 11 }}
            onClick={() => setShowPopover(v => !v)}>
            View All Legends
          </button>
          {showPopover && <LegendPopover colorMode={colorMode} onClose={() => setShowPopover(false)} />}
        </div>
      </div>
    </div>
  )
}

// ─── TOGGLE ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, size = 'md' }) {
  const w = size === 'sm' ? 28 : 36, h = size === 'sm' ? 16 : 20
  const knob = size === 'sm' ? 12 : 16, travel = size === 'sm' ? 14 : 18
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="inline-flex items-center rounded-full transition-colors focus:outline-none flex-shrink-0"
      style={{ width: w, height: h, background: checked ? '#2563EB' : '#D1D5DB' }}>
      <span className="inline-block rounded-full bg-white shadow transition-transform"
        style={{ width: knob, height: knob, transform: checked ? `translateX(${travel}px)` : 'translateX(2px)' }} />
    </button>
  )
}

// ─── CONTROL PANEL ────────────────────────────────────────────────────────────

const MODE_OPTIONS = [
  { key: 'demand',  label: 'Demand' },
  { key: 'adr',     label: 'ADR vs Last Year' },
  { key: 'pickup',  label: 'Pickup' },
  { key: 'quotes',  label: 'Listing Quotes' },
]

function ControlPanel({ colorMode, setColorMode, legendToggles, setLegendToggles }) {
  function toggleItem(id) {
    setLegendToggles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleModeChange(key) {
    setColorMode(key)
    // Reset demand swatch toggles to all-on for new mode
    const newSwatches = COLOR_MODES[key].swatches
    setLegendToggles(prev => {
      const next = { ...prev }
      // clear old swatch ids
      Object.values(COLOR_MODES).forEach(m => m.swatches.forEach(s => { next[s.id] = false }))
      // enable new ones
      newSwatches.forEach(s => { next[s.id] = true })
      return next
    })
  }

  const modeSwatches = COLOR_MODES[colorMode].swatches
  const bookingDefs  = LEGEND_DEFS.filter(d => d.group === 'booking')
  const otherDefs    = LEGEND_DEFS.filter(d => d.group === 'other')

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
      style={{ minWidth: 265, width: 265, flexShrink: 0, alignSelf: 'flex-start' }}>

      {/* Color mode selector */}
      <div className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Color Mode</h2>
        <div className="flex flex-col gap-1">
          {MODE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => handleModeChange(opt.key)}
              className="flex items-center gap-2 py-1 px-2 rounded text-left w-full transition-colors"
              style={{ background: colorMode === opt.key ? '#EFF6FF' : 'transparent', border: colorMode === opt.key ? '1px solid #BFDBFE' : '1px solid transparent' }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 14, height: 14, border: '2px solid', borderColor: colorMode === opt.key ? '#2563EB' : '#9CA3AF', background: colorMode === opt.key ? '#2563EB' : 'white' }}
              >
                {colorMode === opt.key && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', display: 'block' }} />}
              </span>
              <span className="text-sm" style={{ color: colorMode === opt.key ? '#1D4ED8' : '#374151', fontWeight: colorMode === opt.key ? 500 : 400 }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Legend visibility */}
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 pt-3 border-t border-gray-100">
        Legend Visibility
      </h2>

      {/* Min Stay */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-400 mb-1">Min Stay</div>
        <div className="flex items-center justify-between py-0.5">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-700">
            <Moon size={11} className="text-gray-500" /> Min Stay
          </span>
          <Toggle size="sm" checked={!!legendToggles['minStay']} onChange={() => toggleItem('minStay')} />
        </div>
      </div>

      {/* Demand / color mode swatches */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-400 mb-1">{COLOR_MODES[colorMode].label}</div>
        {modeSwatches.map(s => (
          <div key={s.id} className="flex items-center justify-between py-0.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-700">
              <span className="inline-block rounded-sm" style={{ width: 11, height: 11, background: s.color, border: `1px solid ${s.border}`, flexShrink: 0 }} />
              {s.label}
            </span>
            <Toggle size="sm" checked={!!legendToggles[s.id]} onChange={() => toggleItem(s.id)} />
          </div>
        ))}
      </div>

      {/* Booking Info */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-400 mb-1">Booking Info</div>
        {bookingDefs.map(d => (
          <div key={d.id} className="flex items-center justify-between py-0.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-700">
              <LegendIcon id={d.id} size={10} /> {d.label}
            </span>
            <Toggle size="sm" checked={!!legendToggles[d.id]} onChange={() => toggleItem(d.id)} />
          </div>
        ))}
      </div>

      {/* Restrictions & Overrides */}
      <div>
        <div className="text-xs font-medium text-gray-400 mb-1">Restrictions &amp; Overrides</div>
        {otherDefs.map(d => (
          <div key={d.id} className="flex items-center justify-between py-0.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-700">
              <LegendIcon id={d.id} size={10} /> {d.label}
            </span>
            <Toggle size="sm" checked={!!legendToggles[d.id]} onChange={() => toggleItem(d.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildDefaultToggles(colorMode) {
  const toggles = {}
  // Min Stay + booking + other
  LEGEND_DEFS.forEach(d => { toggles[d.id] = d.defaultOn })
  // All swatch ids for all modes start false, then enable the active mode
  Object.values(COLOR_MODES).forEach(m => m.swatches.forEach(s => { toggles[s.id] = false }))
  COLOR_MODES[colorMode].swatches.forEach(s => { toggles[s.id] = true })
  return toggles
}

export default function App() {
  const [colorMode, setColorMode] = useState('demand')
  const [legendToggles, setLegendToggles] = useState(() => buildDefaultToggles('demand'))

  const visibleIds = new Set(Object.entries(legendToggles).filter(([, v]) => v).map(([k]) => k))

  const rows = []
  for (let i = 0; i < DAYS.length; i += 7) rows.push(DAYS.slice(i, i + 7))

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex gap-4" style={{ minWidth: 900 }}>

        {/* ── Calendar ── */}
        <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium">Today</button>
            <div className="flex-1" />
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700">
              June 2024 <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700">
              Monthly <ChevronDown size={14} />
            </button>
            <button className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-600">
              <Settings size={16} />
            </button>
          </div>

          <div className="text-center py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-500">April 2024</span>
          </div>

          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {WEEKDAYS.map(d => (
              <div key={d} className="py-1.5 text-center text-xs font-medium text-gray-500 border-r border-gray-200 last:border-r-0">{d}</div>
            ))}
          </div>

          <div>
            {rows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
                {row.map((day, di) => (
                  <div key={di} className="border-r border-gray-200 last:border-r-0">
                    <CalendarCell day={day} colorMode={colorMode} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <LegendRow visibleIds={visibleIds} colorMode={colorMode} />
        </div>

        {/* ── Control Panel ── */}
        <ControlPanel
          colorMode={colorMode}
          setColorMode={setColorMode}
          legendToggles={legendToggles}
          setLegendToggles={setLegendToggles}
        />
      </div>
    </div>
  )
}
