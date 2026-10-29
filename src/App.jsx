import { isValidElement, useCallback, useEffect, useState } from 'react'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
const paidLayoutFeeThreshold = 1
const minimumLayoutFee = 700
const localDateInputValue = () => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

const emptyFabricEntry = {
  fabric: '',
  gsm: '',
  roll_quantity: '',
  measurement_type: 'meter',
  meters_per_roll: '',
  kilo_per_meter: '',
  kilo_per_roll: '',
  entry_date: localDateInputValue(),
}

const consumableCatalog = [
  { code: 'subli_ink_cyan_atexco', business_unit: 'sublimation', label: 'Sublimation ink · Atexco · Cyan', unit: 'L' },
  { code: 'subli_ink_magenta_atexco', business_unit: 'sublimation', label: 'Sublimation ink · Atexco · Magenta', unit: 'L' },
  { code: 'subli_ink_yellow_atexco', business_unit: 'sublimation', label: 'Sublimation ink · Atexco · Yellow', unit: 'L' },
  { code: 'subli_ink_black_atexco', business_unit: 'sublimation', label: 'Sublimation ink · Atexco · Black', unit: 'L' },
  { code: 'subli_paper_atexco', business_unit: 'sublimation', label: 'Sublimation paper · Atexco', unit: 'm' },
  { code: 'subli_solution_atexco', business_unit: 'sublimation', label: 'Sublimation solution · Atexco', unit: 'L' },
  { code: 'subli_ink_cyan_creons', business_unit: 'sublimation', label: 'Sublimation ink · Creons · Cyan', unit: 'L' },
  { code: 'subli_ink_magenta_creons', business_unit: 'sublimation', label: 'Sublimation ink · Creons · Magenta', unit: 'L' },
  { code: 'subli_ink_yellow_creons', business_unit: 'sublimation', label: 'Sublimation ink · Creons · Yellow', unit: 'L' },
  { code: 'subli_ink_black_creons', business_unit: 'sublimation', label: 'Sublimation ink · Creons · Black', unit: 'L' },
  { code: 'subli_paper_creons', business_unit: 'sublimation', label: 'Sublimation paper · Creons', unit: 'm' },
  { code: 'subli_solution_creons', business_unit: 'sublimation', label: 'Sublimation solution · Creons', unit: 'L' },
  { code: 'dtf_ink_cyan', business_unit: 'dtf', label: 'DTF ink · Cyan', unit: 'L' },
  { code: 'dtf_ink_magenta', business_unit: 'dtf', label: 'DTF ink · Magenta', unit: 'L' },
  { code: 'dtf_ink_yellow', business_unit: 'dtf', label: 'DTF ink · Yellow', unit: 'L' },
  { code: 'dtf_ink_black', business_unit: 'dtf', label: 'DTF ink · Black', unit: 'L' },
  { code: 'dtf_ink_white', business_unit: 'dtf', label: 'DTF ink · White', unit: 'L' },
  { code: 'dtf_film', business_unit: 'dtf', label: 'DTF film', unit: 'm' },
  { code: 'dtf_solution', business_unit: 'dtf', label: 'DTF solution', unit: 'L' },
  { code: 'subli_ink_legacy_atexco', business_unit: 'sublimation', label: 'Sublimation ink · Atexco · legacy (color not recorded)', unit: 'L', legacy: true },
  { code: 'subli_ink_legacy_creons', business_unit: 'sublimation', label: 'Sublimation ink · Creons · legacy (color not recorded)', unit: 'L', legacy: true },
]

function calculateFabricTotalMeters(form) {
  const rollQuantity = Number(form.roll_quantity)
  if (form.measurement_type === 'meter') {
    return rollQuantity * Number(form.meters_per_roll)
  }
  return rollQuantity * Number(form.kilo_per_roll) * Number(form.kilo_per_meter)
}

function getButtonLabel(children) {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(getButtonLabel).join(' ')
  return isValidElement(children) ? getButtonLabel(children.props.children) : ''
}

function buttonIcon(children) {
  const label = getButtonLabel(children).trim()
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(label)) return ''
  const text = label.toLocaleLowerCase()
  if (/search|filter/.test(text)) return '🔍'
  if (/delete|remove/.test(text)) return '🗑️'
  if (/request revision|revision/.test(text)) return '↩️'
  if (/edit|change|revise/.test(text)) return '✏️'
  if (/cancel|close/.test(text)) return '✖️'
  if (/sign in|log in/.test(text)) return '🔐'
  if (/sign out|logout/.test(text)) return '🚪'
  if (/print/.test(text)) return '🖨️'
  if (/payment/.test(text)) return '💵'
  if (/upload|attach|replace|submit/.test(text)) return '📤'
  if (/download|open|review|view/.test(text)) return '📂'
  if (/approve/.test(text)) return '✅'
  if (/save|create|add|done/.test(text)) return '💾'
  if (/dismiss|hide/.test(text)) return '✖️'
  if (/complete|hand off/.test(text)) return '🏁'
  if (/start/.test(text)) return '▶️'
  if (/stop/.test(text)) return '⏹️'
  if (/log|save payments/.test(text)) return '📝'
  if (/lineup|spreadsheet|column|row/.test(text)) return '📊'
  if (/notification/.test(text)) return '🔔'
  if (/light|dark|theme/.test(text)) return '🌗'
  if (/select/.test(text)) return '☑️'
  if (/client/.test(text)) return '🏢'
  if (/user|staff|artist/.test(text)) return '👤'
  if (/order/.test(text)) return '📋'
  return '🔘'
}

function IconButton({ children, ...props }) {
  const icon = buttonIcon(
    getButtonLabel(children) || props['aria-label'] || props.title || '',
  )
  return (
    <button {...props}>
      {icon && <span aria-hidden="true" className="mr-1.5">{icon}</span>}
      {children}
    </button>
  )
}

function decodeVapidPublicKey(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function uppercaseTextEntry(event) {
  const field = event.target
  if (
    field instanceof HTMLInputElement &&
    !['text', 'search', 'tel', 'url'].includes(field.type)
  ) {
    return
  }
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return
  if (
    field.type === 'password' ||
    field.autocomplete === 'username' ||
    field.hasAttribute('data-preserve-case')
  ) return
  field.value = field.value.toLocaleUpperCase()
}

function selectAllTableCells(event, setLineupEditor) {
  if (!(event.ctrlKey || event.metaKey) || event.key.toLocaleLowerCase() !== 'a') return
  const target = event.target
  const lineupTable = target instanceof Element ? target.closest('table[data-lineup-grid]') : null
  if (lineupTable) {
    setLineupEditor((current) => current && ({
      ...current,
      selectedRows: current.rows.map((_, index) => index),
      selectedColumns: current.headers.map((_, index) => index),
    }))
    event.preventDefault()
    return
  }
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLButtonElement
  ) return
  const selection = window.getSelection()
  const anchor = selection?.anchorNode
  const anchorElement = anchor instanceof Element ? anchor : anchor?.parentElement
  const table = target instanceof Element ? target.closest('table') : null
  const selectedTable = table || anchorElement?.closest('table')
  if (!selectedTable) return
  const range = document.createRange()
  range.selectNodeContents(selectedTable)
  selection?.removeAllRanges()
  selection?.addRange(range)
  event.preventDefault()
}

function copySelectedTableCells(event, lineupEditor) {
  const target = event.target
  const lineupTable = target instanceof Element ? target.closest('table[data-lineup-grid]') : null
  if (
    lineupTable &&
    lineupEditor &&
    (lineupEditor.selectedRows.length > 0 || lineupEditor.selectedColumns.length > 0)
  ) {
    const rows = lineupEditor.selectedRows.length > 0
      ? lineupEditor.selectedRows
      : lineupEditor.rows.map((_, index) => index)
    const columns = lineupEditor.selectedColumns.length > 0
      ? lineupEditor.selectedColumns
      : lineupEditor.headers.map((_, index) => index)
    const clipboardRows = [
      columns.map((index) => lineupEditor.headers[index] ?? ''),
      ...rows.map((rowIndex) => columns.map((columnIndex) =>
        lineupEditor.rows[rowIndex]?.[columnIndex] ?? '',
      )),
    ]
    event.clipboardData.setData(
      'text/plain',
      clipboardRows.map((row) => row.map((value) => String(value).replace(/\t|\r?\n/g, ' ').trim()).join('\t')).join('\n'),
    )
    event.preventDefault()
    return
  }
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed) return
  const anchor = selection.anchorNode
  const anchorElement = anchor instanceof Element ? anchor : anchor?.parentElement
  const table = anchorElement?.closest('table')
  if (!table) return
  const range = selection.getRangeAt(0)
  const selectedRows = Array.from(table.querySelectorAll('tr'))
    .map((row) => {
      const cells = Array.from(row.children).filter((cell) =>
        cell.matches('th, td') && range.intersectsNode(cell),
      )
      if (cells.length === 0) return null
      return cells.map((cell) => {
        const fields = Array.from(cell.querySelectorAll('input:not([type="checkbox"]), textarea, select'))
        const value = fields.length > 0
          ? fields.map((field) => field.value).join(' ')
          : cell.innerText
        return value.replace(/\t|\r?\n/g, ' ').trim()
      }).join('\t')
    })
    .filter((row) => row !== null)
  if (selectedRows.length === 0) return
  event.clipboardData.setData('text/plain', selectedRows.join('\n'))
  event.preventDefault()
}

const roleLabels = {
  admin: 'Admin / Owner',
  supervisor: 'Supervisor',
  sales: 'Sales',
  artist: 'Artist',
  print_operator: 'Printing',
  pressing_operator: 'Pressing',
  cutting_operator: 'Cutting',
  sewing_operator: 'Sewing',
  packing_operator: 'Packing',
}

const stageLabels = {
  mockup: 'Artist mock-up',
  sales_approval: 'Sales approval',
  sizing: 'Artist sizing',
  printing: 'Printing',
  pressing: 'Pressing',
  cutting: 'Cutting',
  sewing: 'Sewing',
  packing: 'Packing',
  complete: 'Complete',
  pickup_delivered: 'Pick-up / Delivered',
}

const stageSequence = [
  'mockup',
  'sales_approval',
  'sizing',
  'printing',
  'pressing',
  'cutting',
  'sewing',
  'packing',
  'complete',
  'pickup_delivered',
]

function getSizeRank(value) {
  const size = String(value ?? '').trim().toUpperCase()
  const sizeOrder = { XXS: 0, XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6 }
  if (Object.hasOwn(sizeOrder, size)) return sizeOrder[size]
  const extraLargeSize = size.match(/^([3-9])XL$/)
  if (extraLargeSize) return 5 + Number(extraLargeSize[1])
  const numericSize = Number(size)
  return size && Number.isFinite(numericSize) ? numericSize : null
}

function compareSizes(leftValue, rightValue) {
  const leftRank = getSizeRank(leftValue)
  const rightRank = getSizeRank(rightValue)
  if (leftRank !== null && rightRank === null) return -1
  if (leftRank === null && rightRank !== null) return 1
  if (leftRank !== null && rightRank !== null && leftRank !== rightRank) {
    return leftRank - rightRank
  }
  if (leftRank === null) return 0
  return String(leftValue).localeCompare(String(rightValue), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

function sortLineupRowsBySize(headers, rows) {
  const sizeColumn = headers.findIndex((header) => /^size(?:\b|$)/i.test(header.trim()))
  if (sizeColumn < 0) return rows

  return rows
    .map((row, index) => ({ row, index, size: String(row[sizeColumn] ?? '').trim() }))
    .sort((left, right) =>
      compareSizes(left.size, right.size) ||
      left.index - right.index,
    )
    .map(({ row }) => row)
}

const stationByRole = {
  print_operator: 'printing',
  pressing_operator: 'pressing',
  cutting_operator: 'cutting',
  sewing_operator: 'sewing',
  packing_operator: 'packing',
}

const stationLabelByCategory = {
  printing: 'Printing',
  pressing: 'Pressing',
  cutting: 'Cutting',
}

const defaultViewByRole = {
  admin: 'all',
  supervisor: 'reports',
  sales: 'all',
  artist: 'mockup',
  print_operator: 'printing',
  pressing_operator: 'pressing',
  cutting_operator: 'cutting',
  sewing_operator: 'sewing',
  packing_operator: 'packing',
}

const emptyOrder = {
  client_id: '',
  team_project_name: '',
  due_date: '',
  style_number: '',
  category: 'Sports',
  style: '',
  cut: 'Unisex',
  neck: 'Round Neck',
  sleeve_type: 'Raglan',
  sleeve_length: 'Short Sleeve',
  fabric: '',
  gsm: '160',
  item: '',
  other_details: '',
  layout_fee: '0',
  per_piece_price: '',
  down_payment: '0',
  assigned_artist_id: '',
  printer_machine: '',
  pressing_machine: '',
  cutting_machine: '',
  sales_rep_id: '',
  style_option_ids: {
    product_category: '',
    product_style: '',
    product_cut: '',
    product_neck: '',
    product_sleeve: '',
    product_length: '',
    product_others: '',
  },
}

const styleNumberFields = [
  { category: 'product_category', field: 'category', label: 'Product Category', code: 'C1' },
  { category: 'product_style', field: 'style', label: 'Product Style', code: 'C2' },
  { category: 'product_cut', field: 'cut', label: 'Product Cut', code: 'C3' },
  { category: 'product_neck', field: 'neck', label: 'Product Neck', code: 'C4' },
  { category: 'product_sleeve', field: 'sleeve_type', label: 'Product Sleeve', code: 'C5' },
  { category: 'product_length', field: 'sleeve_length', label: 'Product Length', code: 'C6' },
  { category: 'product_others', field: 'other_details', label: 'Product Others', code: 'C7' },
]

function buildStyleNumber(options, selectedIds = {}) {
  const selected = styleNumberFields.map(({ category }) => {
    const optionId = Number(selectedIds[category])
    return options.find((option) => option.id === optionId && option.category === category)
  })
  if (!selected.every(Boolean)) return ''
  const codes = selected.map((option) => option.code)
  return `${codes.slice(0, 3).join('')}-${codes[3]}-${codes.slice(4).join('')}`
}

function formatItemPart(value) {
  return String(value ?? '')
    .toLocaleLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_, separator, letter) => `${separator}${letter.toLocaleUpperCase()}`)
}

function deriveItem(category, neck) {
  const formattedNeck = String(neck ?? '').toLocaleUpperCase() === 'ROUND'
    ? 'Round Neck'
    : formatItemPart(neck)
  return category && neck ? `${formatItemPart(category)} o ${formattedNeck}` : ''
}

function getOrderFormItem(form) {
  const selectedIds = form.style_option_ids || {}
  return selectedIds.product_category && selectedIds.product_neck
    ? deriveItem(form.category, form.neck)
    : form.item || ''
}

function calculateLineupQuantity(headers = [], rows = []) {
  const sizeColumns = headers.flatMap((header, index) =>
    /^(xxs|xs|s|m|l|xl|xxl|[2-9]xl)$/i.test(String(header).trim()) ? [index] : [],
  )
  const quantityColumn = headers.findIndex((header) =>
    /^(qty|quantity|total quantity)$/i.test(String(header).trim()),
  )
  const numericValue = (value) => {
    const quantity = Number(value)
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 0
  }
  return rows.reduce((total, row) => {
    if (sizeColumns.length) {
      return total + sizeColumns.reduce((rowTotal, column) => rowTotal + numericValue(row[column]), 0)
    }
    if (quantityColumn >= 0) return total + numericValue(row[quantityColumn])
    return total + (row.some((value) => String(value ?? '').trim()) ? 1 : 0)
  }, 0)
}

function OrderPriceFields({ form, onChange, quantity, layoutFeePaid }) {
  const feeRequiresPrice = Number(form.layout_fee) > 0
  const rawPrice = form.per_piece_price ?? ''
  const perPiecePrice = Number(rawPrice)
  const totalAmount = perPiecePrice * Number(quantity || 0)
  const hasPrice = rawPrice !== '' && Number.isFinite(perPiecePrice) && perPiecePrice >= 0
  const hasQuantity = quantity != null && Number.isFinite(Number(quantity))
  return (
    <>
      <Field label="Per-piece price">
        <input
          className={inputClass}
          min="0"
          onChange={(event) => onChange('per_piece_price', event.target.value)}
          readOnly={!layoutFeePaid}
          required={feeRequiresPrice}
          step="0.01"
          type="number"
          value={rawPrice}
        />
        {!layoutFeePaid && (
          <span className="mt-1 block text-xs text-slate-500">Editable after the layout fee is paid.</span>
        )}
      </Field>
      <Field label="Total amount">
        <output className="mt-1 block rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold">
          {hasPrice && hasQuantity ? totalAmount.toFixed(2) : '—'}
        </output>
        <span className="mt-1 block text-xs text-slate-500">
          {hasQuantity
            ? `Per-piece price × ${Number(quantity).toLocaleString()} pieces.`
            : 'Load the lineup to calculate the order total.'}
        </span>
      </Field>
    </>
  )
}

function printOrder(orderId) {
  const popup = window.open('', '_blank', 'width=900,height=700')
  if (!popup) return false
  popup.opener = null

  const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character])
  popup.document.open()
  popup.document.write('<!doctype html><html><head><title>Order form</title><style>body{font:14px Arial,sans-serif;padding:24px;color:#111827}</style></head><body>Preparing order form…</body></html>')
  popup.document.close()
  api(`/api/orders/${encodeURIComponent(orderId)}/print-data`)
    .then(({ order, client, artist_name, lineup }) => {
      const field = (label, value, className = '') => `
        <div class="field ${className}">
          <span class="label">${escapeHtml(label)}</span>
          <span class="value">${escapeHtml(value || '—')}</span>
        </div>`
      const lineupHeaders = lineup.headers || []
      const lineupRows = sortLineupRowsBySize(lineupHeaders, lineup.rows || [])
      const sizeColumn = lineupHeaders.findIndex((header) => /^sizes?$/i.test(header.trim()))
      const quantityColumn = lineupHeaders.findIndex((header) => /^(qty|quantity|total quantity)$/i.test(header.trim()))
      const standardSizeColumns = lineupHeaders.flatMap((header, index) =>
        /^(xxs|xs|s|m|l|xl|xxl|[2-9]xl)$/i.test(header.trim())
          ? [{ index, size: header.trim() }]
          : [],
      )
      const sizeTotals = new Map()
      const addSizeTotal = (size, quantity) => {
        const label = String(size ?? '').trim()
        if (!label) return
        const key = label.toLocaleUpperCase()
        const count = Number(quantity)
        const previous = sizeTotals.get(key)
        sizeTotals.set(key, {
          size: previous?.size || label,
          quantity: (previous?.quantity || 0) +
            (Number.isFinite(count) && count > 0 ? count : 0),
        })
      }
      if (sizeColumn >= 0) {
        lineupRows.forEach((row) => {
          const size = row[sizeColumn]
          addSizeTotal(size, quantityColumn >= 0 ? row[quantityColumn] : 1)
        })
      } else {
        standardSizeColumns.forEach(({ index, size }) => {
          const quantity = lineupRows.reduce((total, row) => {
            const count = Number(row[index])
            return total + (Number.isFinite(count) && count > 0 ? count : 0)
          }, 0)
          addSizeTotal(size, quantity)
        })
      }
      const sizeSummaryRows = [...sizeTotals.values()]
        .map((entry, index) => ({ ...entry, index }))
        .sort((left, right) =>
          compareSizes(left.size, right.size) || left.index - right.index,
        )
      const sizeLabels = lineupRows.map((row) =>
        String(row[sizeColumn] ?? '').trim().toLocaleUpperCase(),
      )
      const hasOneRowPerSize =
        sizeLabels.every(Boolean) &&
        new Set(sizeLabels).size === sizeLabels.length
      const sizeOnlyColumns =
        sizeColumn >= 0 &&
        hasOneRowPerSize &&
        lineupHeaders.length === (quantityColumn >= 0 ? 2 : 1) &&
        lineupHeaders.every((header, index) =>
          index === sizeColumn ||
          (index === quantityColumn && /^(qty|quantity|total quantity)$/i.test(header.trim())),
        )
      const sizeMatrixOnly =
        standardSizeColumns.length > 0 &&
        standardSizeColumns.length === lineupHeaders.length
      const lineupDuplicatesSizeSummary = sizeOnlyColumns || sizeMatrixOnly
      const measureCanvas = popup.document.createElement('canvas')
      const measureContext = measureCanvas.getContext('2d')
      if (measureContext) measureContext.font = '8pt Arial'
      const lineupColumnWidths = lineupHeaders.map((header, columnIndex) => {
        const widestText = lineupRows.reduce((widest, row) => {
          const value = String(row[columnIndex] ?? '')
          return value.length > widest.length ? value : widest
        }, header)
        const measuredWidth = measureContext
          ? measureContext.measureText(widestText).width
          : widestText.length * 4
        return Math.min(180, Math.max(28, measuredWidth + 16))
      })
      const lineupColumnWidthTotal = lineupColumnWidths.reduce((total, width) => total + width, 0)
      const lineupColumnWidthsPercent = lineupColumnWidths.map((width) =>
        lineupColumnWidthTotal ? (width / lineupColumnWidthTotal) * 100 : 100 / Math.max(lineupHeaders.length, 1),
      )
      const printableImage = (kind, filename, alt) =>
        /\.(png|jpe?g|gif|webp)$/i.test(filename || '')
          ? `<img src="${new URL(`/api/orders/${encodeURIComponent(order.order_id)}/files/${kind}`, window.location.origin)}" alt="${alt}">`
          : `<div class="image-empty">${escapeHtml(alt)}</div>`
      const styleFields = [
        ['Category', order.category],
        ['Style', order.style],
        ['Cut', order.cut],
        ['Neck', order.neck],
        ['Sleeve type', order.sleeve_type],
        ['Sleeve length', order.sleeve_length],
        ['Other details', order.other_details],
      ]
      popup.document.open()
      popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(order.order_id)} order form</title><style>
        *{box-sizing:border-box}html,body{margin:0;color:#171717;font-family:Arial,Helvetica,sans-serif}
        body{padding:4mm;background:#e5e7eb}.sheet{width:100%;max-width:198mm;min-height:285mm;margin:0 auto;padding:0;background:#fff;border:1px solid #555}
        .titlebar{position:relative;height:13mm;display:flex;align-items:center;border:1px solid #555}
        .title{padding-left:4mm;font-size:15pt;font-weight:700}.brand{position:absolute;left:50%;transform:translateX(-50%);font-size:13pt;font-weight:700}
        .order-id{position:absolute;right:2mm;top:50%;transform:translateY(-50%);font-size:8pt;font-weight:700}
        .meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-left:1px solid #555;border-top:0}
        .field{display:flex;min-width:0;border-bottom:1px solid #555;border-right:1px solid #555;min-height:9mm}
        .field.wide{grid-column:span 2}
        .label{width:22mm;flex:none;padding:2mm 1.5mm;font-size:7.2pt;font-weight:bold;text-transform:uppercase}
        .value{flex:1;min-width:0;padding:2mm 1.5mm;font-size:8pt;overflow-wrap:anywhere}
        .meta .label{border-right:1px solid #777}.meta .value{color:#8d2834;font-weight:600}
        .style-number{font-size:17pt!important;text-align:center}
        .attribute-head,.attribute-values{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}
        .attribute-head div{padding:2mm 1mm;text-align:center;border-right:1px solid #555;border-bottom:1px solid #555;border-top:1px solid #555;background:#e6c84f;font-size:6.5pt;font-weight:bold;text-transform:uppercase}
        .attribute-values div{min-height:8mm;padding:1.5mm 1mm;text-align:center;border-right:1px solid #555;border-bottom:1px solid #555;font-size:7pt;overflow-wrap:anywhere}
        .overview-grid{display:grid;grid-template-columns:minmax(0,32%) minmax(0,68%);align-items:stretch}
        .size-summary{border-left:1px solid #555;border-bottom:1px solid #555}
        .size-summary table,.lineup table{width:100%;border-collapse:collapse;font-size:8pt}
        .size-summary th,.size-summary td,.lineup th,.lineup td{height:7mm;padding:1mm 1.5mm;border-right:1px solid #555;border-bottom:1px solid #555;text-align:left}
        .size-summary th,.lineup th{background:#e6c84f;text-transform:uppercase}
        .size-summary th:last-child,.size-summary td:last-child,.lineup th:last-child,.lineup td:last-child{border-right:0}
        .size-summary-total{font-weight:bold;background:#f4d94c}
        .lineup{border-left:1px solid #555;border-right:1px solid #555;border-bottom:1px solid #555;break-inside:auto}
        .lineup table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:8pt}
        .lineup th,.lineup td{overflow-wrap:anywhere}
        .lineup thead{display:table-header-group}
        .lineup tfoot{display:table-footer-group}
        .lineup tr{break-inside:avoid}
        .lineup-title{padding:2mm 3mm;border-bottom:1px solid #555;background:#f3f4f6;font-size:8pt;font-weight:bold;text-transform:uppercase}
        .images{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2mm;padding:2mm;border-right:1px solid #555;align-content:center;align-items:center}
        .images img,.image-empty{display:block;width:100%;height:62mm;object-fit:contain;background:#f3f4f6}
        .image-empty{display:flex;align-items:center;justify-content:center;text-align:center;padding:4mm;color:#6b7280;font-size:8pt}
        .image-caption{text-align:center;font-size:7pt;font-weight:bold;text-transform:uppercase}
        @page{size:A4 portrait;margin:6mm}
        @media print{body{padding:0;background:#fff}.sheet{width:auto;max-width:none;min-height:285mm;margin:0}.images img,.image-empty{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
        </style></head><body><main class="sheet">
          <div class="titlebar"><div class="title">ORDER FORM</div><div class="brand">B-POWER</div><div class="order-id">ORDER NO: ${escapeHtml(order.order_id)}</div></div>
          <div class="meta">
            ${field('Date', order.order_date, 'wide')}${field('Deadline', order.due_date)}${field('Artist', artist_name)}
            ${field('Client name', client?.company_name || order.client_id, 'wide')}${field('Fabric', order.fabric)}${field('GSM', order.gsm)}
            ${field('Team / project', order.team_project_name, 'wide')}${field('Total qty', order.total_quantity)}${field('Neck label', 'SIZE ONLY')}
            ${field('Printer', order.printer_machine, 'wide')}${field('Rotary press', order.pressing_machine)}${field('Cutting', order.cutting_machine)}
            ${field('Item', order.item, 'wide')}${field('Style number', order.style_number, 'wide')}
          </div>
          <div class="attribute-head">${styleFields.map(([label]) => `<div>${escapeHtml(label)}</div>`).join('')}</div>
          <div class="attribute-values">${styleFields.map(([, value]) => `<div>${escapeHtml(value)}</div>`).join('')}</div>
          <div class="overview-grid">
            <section class="size-summary"><table>
              <thead><tr><th>Size</th><th>Total count</th></tr></thead>
              <tbody>${sizeSummaryRows.length
                ? sizeSummaryRows.map(({ size, quantity }) => `<tr><td>${escapeHtml(size)}</td><td>${escapeHtml(quantity)}</td></tr>`).join('')
                : '<tr><td colspan="2">&nbsp;</td></tr>'}
              </tbody>
              <tfoot><tr><td class="size-summary-total">TOTAL</td><td class="size-summary-total">${escapeHtml(order.total_quantity)}</td></tr></tfoot>
            </table></section>
            <section class="images">
              <div>${printableImage('mockup', order.mockup_path, 'Mock-up')}<div class="image-caption">Mock-up</div></div>
              <div>${printableImage('swatch', order.swatch_path, 'Swatch')}<div class="image-caption">Swatch</div></div>
            </section>
          </div>
          ${lineupDuplicatesSizeSummary ? '' : `<section class="lineup">
            <div class="lineup-title">Lineup list</div>
            <table>
              <colgroup>${lineupColumnWidthsPercent.map((width) => `<col style="width:${width.toFixed(2)}%">`).join('')}</colgroup>
              <thead><tr>${lineupHeaders.length ? lineupHeaders.map((header) => `<th>${escapeHtml(header)}</th>`).join('') : '<th>Name</th><th>Size</th>'}</tr></thead>
              <tbody>${lineupRows.length
                ? lineupRows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')
                : '<tr><td>&nbsp;</td><td>&nbsp;</td></tr>'.repeat(3)}
              </tbody>
            </table>
          </section>`}
        </main><script>
          window.addEventListener('load',()=>{Promise.all(Array.from(document.images).map(image=>image.complete?Promise.resolve():new Promise(resolve=>{image.onload=resolve;image.onerror=resolve}))).then(()=>window.print())});
        </script></body></html>`)
      popup.document.close()
    })
    .catch((error) => {
      popup.document.open()
      popup.document.write(`<p style="font:14px Arial;color:#b91c1c;padding:24px">Unable to prepare the order form: ${escapeHtml(error.message)}</p>`)
      popup.document.close()
    })
  return true
}

async function api(url, options = {}) {
  const response = await fetch(url, options)
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(
      `The API returned an unexpected response (${response.status}). Check that the backend is running and restart both servers.`,
    )
  }

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`)
  }
  return data
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  )
}

function OrderEditFields({ form, onChange, clients, staff, artistOptions, machines, styleNumberOptions, includeFinancials, isAdmin }) {
  const selectFields = {
    client_id: ['Client', clients.map((client) => [client.client_id, client.company_name])],
    assigned_artist_id: [
      'Assigned artist',
      artistOptions.map((artist) => [String(artist.id), artist.name]),
    ],
    printer_machine: ['Printer machine', machines.filter((machine) => machine.category === 'printing').map((machine) => [machine.name, machine.name])],
    pressing_machine: ['Pressing machine', machines.filter((machine) => machine.category === 'pressing').map((machine) => [machine.name, machine.name])],
    cutting_machine: ['Cutting machine', machines.filter((machine) => machine.category === 'cutting').map((machine) => [machine.name, machine.name])],
  }
  const textFields = [
    ...(includeFinancials
      ? [['down_payment', 'Down payment (for sizing)', 'number']]
      : []),
  ]
  const styleNumber = buildStyleNumber(styleNumberOptions, form.style_option_ids)
  const layoutFeePaid = Number(form.layout_fee) >= paidLayoutFeeThreshold

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {includeFinancials && (
        <Field label="Layout fee">
          <input className={inputClass} min="0" onChange={(event) => onChange('layout_fee', event.target.value)} step="0.01" type="number" value={form.layout_fee ?? '0'} />
          <span className="mt-1 block text-xs text-slate-500">Enter 0 or at least 700. A fee of at least 1 unlocks assignments.</span>
        </Field>
      )}
      {includeFinancials && (
        <OrderPriceFields
          form={form}
          layoutFeePaid={layoutFeePaid}
          onChange={onChange}
          quantity={form.total_quantity}
        />
      )}
      {isAdmin && (
        <Field label="Sales representative">
          <select
            className={inputClass}
            onChange={(event) => onChange('sales_rep_id', event.target.value)}
            required
            value={form.sales_rep_id ?? ''}
          >
            <option value="">Select a sales representative</option>
            {staff.filter((member) => member.role === 'sales').map((member) => (
              <option key={member.id} value={String(member.id)}>{member.name}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Due date">
        <input className={inputClass} onChange={(event) => onChange('due_date', event.target.value)} required type="date" value={form.due_date ?? ''} />
      </Field>
      <Field label="Team / project name">
        <input className={inputClass} onChange={(event) => onChange('team_project_name', event.target.value)} required value={form.team_project_name ?? ''} />
      </Field>
      <Field label="Item">
        <input className={inputClass} readOnly required value={getOrderFormItem(form)} />
      </Field>
      <Field label="Style number (C1-C7)">
        <input className={inputClass} readOnly value={styleNumber || form.style_number || ''} />
      </Field>
      {styleNumberFields.map(({ category, field, label, code }) => {
        const options = styleNumberOptions.filter((option) => option.category === category)
        const selectedId = form.style_option_ids?.[category] || ''
        const hasCurrentOption = options.some((option) => String(option.id) === String(selectedId))
        return (
          <Field key={category} label={`${label} (${code})`}>
            <select
              className={inputClass}
              onChange={(event) => {
                const option = options.find((entry) => String(entry.id) === event.target.value)
                onChange(field, option?.name ?? form[field])
                if (field === 'category' || field === 'neck') {
                  onChange('item', deriveItem(
                    field === 'category' ? option?.name : form.category,
                    field === 'neck' ? option?.name : form.neck,
                  ))
                }
                onChange('style_option_ids', {
                  ...form.style_option_ids,
                  [category]: option?.id ? String(option.id) : '',
                })
              }}
              required
              value={hasCurrentOption ? String(selectedId) : form[field] ? 'legacy' : ''}
            >
              <option value="">Select {label.toLowerCase()}</option>
              {!hasCurrentOption && form[field] && <option value="legacy">{form[field]} (existing)</option>}
              {options.map((option) => (
                <option key={option.id} value={String(option.id)}>{option.name} ({option.code})</option>
              ))}
            </select>
          </Field>
        )
      })}
      {Object.entries(selectFields).map(([name, [label, options]]) => (
        <Field key={name} label={label}>
          <select
            className={inputClass}
            disabled={
              !layoutFeePaid &&
              ['assigned_artist_id', 'printer_machine', 'pressing_machine', 'cutting_machine'].includes(name)
            }
            onChange={(event) => onChange(name, event.target.value)}
            required={
              name === 'client_id' ||
              (name === 'assigned_artist_id' && layoutFeePaid) ||
              (name === 'printer_machine' && layoutFeePaid) ||
              (name === 'pressing_machine' && layoutFeePaid)
            }
            value={form[name] ?? ''}
          >
            {name === 'client_id' && <option value="">Select a client</option>}
            {name === 'assigned_artist_id' && <option value="">Select an artist</option>}
            {['printer_machine', 'pressing_machine', 'cutting_machine'].includes(name) && <option value="">Not specified</option>}
            {options.map(([value, optionLabel]) => (
              <option key={value} value={value}>{optionLabel}</option>
            ))}
          </select>
        </Field>
      ))}
      <Field label="Fabric">
        <input className={inputClass} onChange={(event) => onChange('fabric', event.target.value)} required value={form.fabric ?? ''} />
      </Field>
      <Field label="GSM">
        <input className={inputClass} min="1" onChange={(event) => onChange('gsm', event.target.value)} required type="number" value={form.gsm ?? ''} />
      </Field>
      {textFields.map(([name, label, type]) => (
        <Field key={name} label={label}>
          <input
            className={inputClass}
            disabled={name === 'down_payment' && !layoutFeePaid}
            min={name === 'gsm' || name === 'layout_fee' || name === 'down_payment' ? '0' : undefined}
            onChange={(event) => onChange(name, event.target.value)}
            required={!['layout_fee', 'down_payment', 'other_details'].includes(name)}
            step={name === 'layout_fee' || name === 'down_payment' ? '0.01' : undefined}
            type={type}
            value={form[name] ?? ''}
          />
        </Field>
      ))}
    </div>
  )
}

function OrderEntryForm({
  orderForm,
  setOrderForm,
  clients,
  staff,
  artistOptions,
  machines,
  styleNumberOptions,
  isAdmin,
  isSalesOrAdmin,
  setLineupFile,
  lineupInputKey,
  onOpenLineup,
  lineupDraft,
  onSubmit,
  busy,
  selectedClient,
  onCancel,
}) {
  const setField = (field, value) =>
    setOrderForm((current) => field === 'layout_fee' && Number(value) < paidLayoutFeeThreshold
      ? {
          ...current,
          layout_fee: value,
          down_payment: '0',
          assigned_artist_id: '',
          printer_machine: '',
          pressing_machine: '',
          cutting_machine: '',
        }
      : { ...current, [field]: value })
  const styleNumber = buildStyleNumber(styleNumberOptions, orderForm.style_option_ids)
  const layoutFeePaid = Number(orderForm.layout_fee) >= paidLayoutFeeThreshold
  const lineupEnabled = Number(orderForm.down_payment) >= paidLayoutFeeThreshold
  const lineupQuantity = lineupDraft
    ? calculateLineupQuantity(lineupDraft.headers, lineupDraft.rows)
    : null

  return (
    <form className="grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
      <Field label="Client">
        <select
          className={inputClass}
          disabled={Boolean(selectedClient)}
          onChange={(event) => setField('client_id', event.target.value)}
          required
          value={orderForm.client_id}
        >
          <option value="">Select a client</option>
          {clients.map((client) => <option key={client.client_id} value={client.client_id}>{client.company_name}</option>)}
        </select>
      </Field>
      {isSalesOrAdmin && (
        <Field label="Layout fee">
          <input className={inputClass} min="0" onChange={(event) => setField('layout_fee', event.target.value)} step="0.01" type="number" value={orderForm.layout_fee} />
          <span className="mt-1 block text-xs text-slate-500">Enter 0 or at least 700. A fee of at least 1 unlocks assignments.</span>
        </Field>
      )}
      {isSalesOrAdmin && (
        <OrderPriceFields
          form={orderForm}
          layoutFeePaid={layoutFeePaid}
          onChange={setField}
          quantity={lineupQuantity}
        />
      )}
      <Field label="Due date">
        <input className={inputClass} onChange={(event) => setField('due_date', event.target.value)} required type="date" value={orderForm.due_date} />
      </Field>
      <Field label="Team / project name">
        <input className={inputClass} onChange={(event) => setField('team_project_name', event.target.value)} required value={orderForm.team_project_name} />
      </Field>
      <Field label="Item">
        <input className={inputClass} readOnly required value={getOrderFormItem(orderForm)} />
      </Field>
      <Field label="Style number (C1-C7)">
        <input className={inputClass} readOnly value={styleNumber} />
      </Field>
      {styleNumberFields.map(({ category, field, label, code }) => {
        const options = styleNumberOptions.filter((option) => option.category === category)
        return (
          <Field key={category} label={`${label} (${code})`}>
            <select
              className={inputClass}
              onChange={(event) => {
                const option = options.find((entry) => String(entry.id) === event.target.value)
                setOrderForm((current) => {
                  const next = {
                  ...current,
                  [field]: option?.name ?? '',
                  style_option_ids: {
                    ...current.style_option_ids,
                    [category]: option ? String(option.id) : '',
                  },
                  }
                  if (field === 'category' || field === 'neck') {
                    next.item = deriveItem(
                      field === 'category' ? option?.name : current.category,
                      field === 'neck' ? option?.name : current.neck,
                    )
                  }
                  return next
                })
              }}
              required
              value={orderForm.style_option_ids?.[category] || ''}
            >
              <option value="">Select {label.toLowerCase()}</option>
              {options.map((option) => <option key={option.id} value={String(option.id)}>{option.name} ({option.code})</option>)}
            </select>
          </Field>
        )
      })}
      <Field label="Fabric">
        <input className={inputClass} onChange={(event) => setField('fabric', event.target.value)} required value={orderForm.fabric} />
      </Field>
      <Field label="GSM">
        <input className={inputClass} min="1" onChange={(event) => setField('gsm', event.target.value)} required type="number" value={orderForm.gsm} />
      </Field>
      {isAdmin && (
        <Field label="Sales representative">
          <select className={inputClass} onChange={(event) => setField('sales_rep_id', event.target.value)} value={orderForm.sales_rep_id}>
            <option value="">Created by me</option>
            {staff.filter((member) => member.role === 'sales').map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
        </Field>
      )}
      <Field label="Assigned artist">
        <select className={inputClass} disabled={!layoutFeePaid} onChange={(event) => setField('assigned_artist_id', event.target.value)} required={layoutFeePaid} value={orderForm.assigned_artist_id}>
          <option value="">Select an artist</option>
          {artistOptions.map((artist) => <option key={artist.id} value={artist.id}>{artist.name}</option>)}
        </select>
      </Field>
      <Field label="Printer machine">
        <select className={inputClass} disabled={!layoutFeePaid} onChange={(event) => setField('printer_machine', event.target.value)} required={layoutFeePaid} value={orderForm.printer_machine}>
          <option value="">Select a printer machine</option>
          {machines.filter((machine) => machine.category === 'printing').map((machine) => <option key={machine.id} value={machine.name}>{machine.name}</option>)}
        </select>
      </Field>
      <Field label="Pressing machine">
        <select className={inputClass} disabled={!layoutFeePaid} onChange={(event) => setField('pressing_machine', event.target.value)} required={layoutFeePaid} value={orderForm.pressing_machine}>
          <option value="">Select a pressing machine</option>
          {machines.filter((machine) => machine.category === 'pressing').map((machine) => <option key={machine.id} value={machine.name}>{machine.name}</option>)}
        </select>
      </Field>
      <Field label="Cutting machine">
        <select className={inputClass} disabled={!layoutFeePaid} onChange={(event) => setField('cutting_machine', event.target.value)} value={orderForm.cutting_machine}>
          <option value="">Select a cutting machine</option>
          {machines.filter((machine) => machine.category === 'cutting').map((machine) => <option key={machine.id} value={machine.name}>{machine.name}</option>)}
        </select>
      </Field>
      {isSalesOrAdmin && (
        <>
          <Field label="Down payment (for sizing)">
            <input className={inputClass} disabled={!layoutFeePaid} min="0" onChange={(event) => setField('down_payment', event.target.value)} step="0.01" type="number" value={orderForm.down_payment} />
          </Field>
        </>
      )}
      <Field label="Lineup spreadsheet (CSV / XLSX)">
        <div className="flex items-start gap-2">
          <input accept=".csv,.xlsx" className={inputClass} disabled={!lineupEnabled} key={lineupInputKey} onChange={(event) => setLineupFile(event.target.files?.[0] || null)} type="file" />
          <IconButton
            className="shrink-0 rounded-lg border border-cyan-300 px-3 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-50 disabled:opacity-50"
            disabled={!lineupEnabled}
            onClick={onOpenLineup}
            title={lineupEnabled ? 'Edit lineup' : 'Down payment must be at least 1 to edit the lineup'}
            type="button"
          >
            Lineup
          </IconButton>
        </div>
        {!lineupEnabled && (
          <span className="mt-1 block text-xs text-slate-500">
            The lineup can be attached after the down payment is at least 1.
          </span>
        )}
      </Field>
      <div className={`flex gap-2 ${onCancel ? 'justify-end md:col-span-3' : 'md:col-span-3'}`}>
        {onCancel && (
          <IconButton className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50" onClick={onCancel} type="button">
            Cancel
          </IconButton>
        )}
        <IconButton className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60" disabled={busy || clients.length === 0} type="submit">
          {clients.length === 0 ? 'Add a client before creating an order' : 'Create order'}
        </IconButton>
      </div>
    </form>
  )
}

function printCompletedOrder(order, activity) {
  const popup = window.open('', '_blank', 'width=900,height=700')
  if (!popup) return false
  popup.opener = null
  const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character])
  const field = (label, value) => `
    <div class="field"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || '—')}</dd></div>`
  const stageLabelsForPrint = {
    mockup: 'Artist mock-up',
    sales_approval: 'Sales approval',
    sizing: 'Artist sizing',
    printing: 'Printing',
    pressing: 'Pressing',
    cutting: 'Cutting',
    sewing: 'Sewing',
    packing: 'Packing',
    complete: 'Complete',
    pickup_delivered: 'Pick-up / Delivered',
  }
  const logs = activity.station_logs || []
  const events = activity.events || []
  const fileImage = (kind, filePath, label) =>
    filePath && /\.(png|jpe?g)$/i.test(filePath)
      ? `<figure><img src="/api/orders/${encodeURIComponent(order.order_id)}/files/${kind}" alt="${escapeHtml(label)}"><figcaption>${escapeHtml(label)}</figcaption></figure>`
      : ''
  popup.document.open()
  popup.document.write(`<!doctype html><html><head><title>Completed order ${escapeHtml(order.order_id)}</title>
    <style>
      *{box-sizing:border-box}body{font:12px Arial,sans-serif;color:#111827;margin:0;padding:16mm}
      h1{font-size:20px;margin:0 0 4px}h2{font-size:14px;margin:18px 0 8px}
      p{margin:0 0 12px;color:#4b5563}.details{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 14px}
      .field{border-bottom:1px solid #d1d5db;padding:5px 0}.field dt{font-size:9px;color:#6b7280;text-transform:uppercase}
      .field dd{margin:3px 0 0;font-weight:600;overflow-wrap:anywhere}
      table{border-collapse:collapse;width:100%;font-size:10px}th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;vertical-align:top}
      th{background:#f1f5f9}figure{display:inline-block;width:48%;margin:0 1% 8px 0;vertical-align:top}
      figure img{width:100%;height:65mm;object-fit:contain;border:1px solid #cbd5e1}figcaption{text-align:center;font-weight:bold}
      .files{margin-top:8px}.file-link{font-size:10px;margin-right:10px}
      @page{size:A4 portrait;margin:8mm}@media print{body{padding:0}tr{break-inside:avoid}h2{break-after:avoid}}
    </style></head><body>
    <h1>Completed Order · ${escapeHtml(order.order_id)}</h1>
    <p>${escapeHtml(order.team_project_name)} · ${escapeHtml(stageLabelsForPrint[order.order_status] || order.order_status)}</p>
    <h2>Order details</h2><dl class="details">
      ${[
        ['Client', order.client_company_name || order.client_id],
        ['Team / project', order.team_project_name],
        ['Order date', order.order_date],
        ['Due date', order.due_date],
        ['Style number', order.style_number],
        ['Style / cut', `${order.style} / ${order.cut}`],
        ['Neck', order.neck],
        ['Sleeve', `${order.sleeve_type} / ${order.sleeve_length}`],
        ['Item / category', `${order.item} / ${order.category}`],
        ['Fabric / GSM', `${order.fabric} / ${order.gsm} GSM`],
        ['Order quantity', `${order.total_quantity} pieces`],
        ...(order.per_piece_price == null ? [] : [
          ['Per-piece price', Number(order.per_piece_price).toFixed(2)],
          ['Total amount', (Number(order.per_piece_price) * Number(order.total_quantity)).toFixed(2)],
          ['Balance amount', (Number(order.per_piece_price) * Number(order.total_quantity) - Number(order.layout_fee || 0) - Number(order.down_payment || 0)).toFixed(2)],
        ]),
        ['Packed pieces', order.packed_quantity ?? '—'],
        ['Sales representative', order.sales_rep_name || '—'],
        ['Printer machine', order.printer_machine || '—'],
        ['Pressing machine', order.pressing_machine || '—'],
        ['Cutting machine', order.cutting_machine || '—'],
        ['Sizing notes', order.sizing_notes || '—'],
        ['Other details', order.other_details || '—'],
      ].map(([label, value]) => field(label, value)).join('')}
    </dl>
    <div class="files">
      ${fileImage('mockup', order.mockup_path, 'Mock-up')}
      ${fileImage('swatch', order.swatch_path, 'Swatch')}
      ${order.spreadsheet_path
        ? `<a class="file-link" href="/api/orders/${encodeURIComponent(order.order_id)}/files/lineup">Open line-up file</a>`
        : ''}
    </div>
    <h2>TRD history</h2>
    ${events.length ? `<table><thead><tr><th>Event</th><th>Stage transition</th><th>By</th><th>Date</th><th>Details</th></tr></thead><tbody>
      ${events.map((event) => `<tr><td>${escapeHtml(event.event_type.replaceAll('_', ' '))}</td>
        <td>${escapeHtml(event.from_stage ? `${stageLabelsForPrint[event.from_stage] || event.from_stage} → ${stageLabelsForPrint[event.to_stage] || event.to_stage}` : '—')}</td>
        <td>${escapeHtml(event.actor_name)}</td><td>${escapeHtml(event.created_at)}</td><td>${escapeHtml(event.details || '—')}</td></tr>`).join('')}
      </tbody></table>` : '<p>No TRD events recorded.</p>'}
    <h2>Order consumption</h2>
    ${logs.length ? `<table><thead><tr><th>Stage</th><th>Fabric used</th><th>Paper used</th><th>Operator</th><th>Date</th><th>Defect / issue</th></tr></thead><tbody>
      ${logs.map((entry) => `<tr><td>${escapeHtml(stageLabelsForPrint[entry.station] || entry.station)}</td>
        <td>${escapeHtml(entry.fabric_used || '—')}</td><td>${escapeHtml(`${Number(entry.paper_meters || 0)} m`)}</td>
        <td>${escapeHtml(entry.operator)}</td><td>${escapeHtml(entry.created_at)}</td>
        <td>${escapeHtml(entry.defect_description || '—')}</td></tr>`).join('')}
      </tbody></table>` : '<p>No production consumption has been recorded.</p>'}
    <script>window.addEventListener('load',()=>Promise.all(Array.from(document.images).map(image=>image.complete?Promise.resolve():new Promise(resolve=>{image.onload=resolve;image.onerror=resolve}))).then(()=>window.print()))</script>
    </body></html>`)
  popup.document.close()
  return true
}

function App() {
  const [user, setUser] = useState(null)
  const [machineSelection, setMachineSelection] = useState(null)
  const [theme, setTheme] = useState('light')
  const [themeLoadedForUser, setThemeLoadedForUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [pageError, setPageError] = useState('')
  const [notice, setNotice] = useState('')
  const [orders, setOrders] = useState([])
  const [activeView, setActiveView] = useState('all')
  const [artistMockupStage, setArtistMockupStage] = useState('creating')
  const [printingStage, setPrintingStage] = useState('printing')
  const [pressingProcess, setPressingProcess] = useState('orders')
  const [reportTab, setReportTab] = useState('overview')
  const [clients, setClients] = useState([])
  const [clientSearch, setClientSearch] = useState('')
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [orderSearch, setOrderSearch] = useState('')
  const [staff, setStaff] = useState([])
  const [artistOptions, setArtistOptions] = useState([])
  const [machines, setMachines] = useState([])
  const [fabricEntries, setFabricEntries] = useState([])
  const [fabricFilters, setFabricFilters] = useState({ date: '', fabric: '' })
  const [fabricEntryForm, setFabricEntryForm] = useState(emptyFabricEntry)
  const [editingFabricEntryId, setEditingFabricEntryId] = useState(null)
  const [isFabricEntryModalOpen, setIsFabricEntryModalOpen] = useState(false)
  const [styleNumberOptions, setStyleNumberOptions] = useState([])
  const [newStyleOptions, setNewStyleOptions] = useState({})
  const [newMachineNames, setNewMachineNames] = useState({
    printing: '',
    pressing: '',
    cutting: '',
  })
  const [editingMachineId, setEditingMachineId] = useState(null)
  const [editingMachineName, setEditingMachineName] = useState('')
  const [report, setReport] = useState(null)
  const [reportDrilldown, setReportDrilldown] = useState(null)
  const [consumablesReport, setConsumablesReport] = useState({ inventory: [], transactions: [] })
  const [consumableForm, setConsumableForm] = useState({
    business_unit: 'sublimation',
    consumable_code: 'subli_ink_cyan_atexco',
    transaction_type: 'stock_in',
    quantity: '',
    entry_date: localDateInputValue(),
    note: '',
  })
  const [reprints, setReprints] = useState([])
  const [testPrintJobs, setTestPrintJobs] = useState([])
  const [orderForm, setOrderForm] = useState(emptyOrder)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [orderModalClient, setOrderModalClient] = useState(null)
  const [clientForm, setClientForm] = useState({
    company_name: '',
    contact_person: '',
    contact_number: '',
    shipping_address: '',
    sales_rep_id: '',
  })
  const [editingClientId, setEditingClientId] = useState(null)
  const [clientEditForm, setClientEditForm] = useState({
    company_name: '',
    contact_person: '',
    contact_number: '',
    shipping_address: '',
    sales_rep_id: '',
  })
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [orderEditForm, setOrderEditForm] = useState(emptyOrder)
  const [staffForm, setStaffForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'sales',
    business_unit: '',
  })
  const [editingStaffId, setEditingStaffId] = useState(null)
  const [staffEditForm, setStaffEditForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'sales',
    business_unit: '',
  })
  const [lineupFile, setLineupFile] = useState(null)
  const [lineupInputKey, setLineupInputKey] = useState(0)
  const [lineupEditor, setLineupEditor] = useState(null)
  const [lineupDraft, setLineupDraft] = useState(null)
  const [paymentOrder, setPaymentOrder] = useState(null)
  const [paymentForm, setPaymentForm] = useState({ layout_fee: '0', down_payment: '0' })
  const [mockupFiles, setMockupFiles] = useState({})
  const [sizingNotes, setSizingNotes] = useState({})
  const [pressingNotes, setPressingNotes] = useState({})
  const [stationForms, setStationForms] = useState({})
  const [packedQuantityForms, setPackedQuantityForms] = useState({})
  const [reprintImageInputVersion, setReprintImageInputVersion] = useState({})
  const [activity, setActivity] = useState({})
  const [completedOrderDetails, setCompletedOrderDetails] = useState(null)
  const [busy, setBusy] = useState(false)

  function restoreUserTheme(currentUser) {
    const savedTheme = window.localStorage.getItem(`bpsms-theme-${currentUser.id}`)
    setTheme(savedTheme === 'dark' ? 'dark' : 'light')
    setThemeLoadedForUser(currentUser.id)
  }

  async function initializeUser(currentUser) {
    setActiveView(defaultViewByRole[currentUser.role] || 'all')
    const supervisorBusinessUnit = currentUser.business_unit === 'dtf' ? 'dtf' : 'sublimation'
    setReportTab(currentUser.role === 'supervisor' ? supervisorBusinessUnit : 'overview')
    if (currentUser.role === 'supervisor') {
      const firstProduct = consumableCatalog.find(
        (product) => product.business_unit === supervisorBusinessUnit,
      )
      setConsumableForm((current) => ({
        ...current,
        business_unit: supervisorBusinessUnit,
        consumable_code: firstProduct.code,
      }))
    }
    restoreUserTheme(currentUser)
    if (['print_operator', 'pressing_operator', 'cutting_operator'].includes(currentUser.role)) {
      const category = stationByRole[currentUser.role]
      setMachineSelection({
        category,
        machineName: '',
        machines: [],
        loading: true,
        error: '',
        complete: false,
      })
      setUser(currentUser)
      try {
        const result = await api('/api/settings/machines')
        setMachineSelection((current) => current?.category === category
          ? { ...current, machines: result.machines, loading: false }
          : current)
      } catch (error) {
        setMachineSelection((current) => current?.category === category
          ? { ...current, loading: false, error: error.message }
          : current)
      }
      return
    }
    setMachineSelection(null)
    setUser(currentUser)
  }

  async function reloadMachineOptions() {
    if (!machineSelection) return
    setMachineSelection((current) => current
      ? { ...current, loading: true, error: '' }
      : current)
    try {
      const result = await api('/api/settings/machines')
      setMachineSelection((current) => current
        ? { ...current, machines: result.machines, loading: false }
        : current)
    } catch (error) {
      setMachineSelection((current) => current
        ? { ...current, loading: false, error: error.message }
        : current)
    }
  }

  async function savePackedQuantity(order) {
    const form = packedQuantityForms[order.order_id] || {}
    const rawQuantity = form.packed_quantity ??
      (order.packed_quantity == null ? '' : String(order.packed_quantity))
    const rawPerPiecePrice = form.per_piece_price ??
      (order.per_piece_price == null ? '' : String(order.per_piece_price))
    const packedQuantity = Number(rawQuantity)
    if (rawQuantity === '' || !Number.isInteger(packedQuantity) ||
      packedQuantity !== Number(order.total_quantity)) {
      setPageError(`Packed pieces must equal the designated order quantity of ${order.total_quantity}.`)
      return
    }
    const perPiecePrice = Number(rawPerPiecePrice)
    if (rawPerPiecePrice === '' || !Number.isFinite(perPiecePrice) || perPiecePrice < 0) {
      setPageError('Enter a valid non-negative per-piece price.')
      return
    }
    const saved = await runAction(
      () => api(`/api/orders/${encodeURIComponent(order.order_id)}/packed-quantity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packed_quantity: packedQuantity, per_piece_price: perPiecePrice }),
      }),
      'Packed quantity and price saved.',
    )
    if (saved) {
      setPackedQuantityForms((current) => ({
        ...current,
        [order.order_id]: {
          ...current[order.order_id],
          packed_quantity: String(packedQuantity),
          per_piece_price: String(perPiecePrice),
        },
      }))
    }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    if (user?.id && themeLoadedForUser === user.id) {
      window.localStorage.setItem(`bpsms-theme-${user.id}`, theme)
    }
  }, [theme, user?.id, themeLoadedForUser])

  const loadWorkspace = useCallback(async (currentUser) => {
    const [ordersData, fabricData] = await Promise.all([
      currentUser.role === 'supervisor'
        ? Promise.resolve({ orders: [] })
        : api('/api/orders'),
      ['admin', 'pressing_operator'].includes(currentUser.role) ||
        (currentUser.role === 'supervisor' && currentUser.business_unit === 'sublimation')
        ? api('/api/fabric-inventory')
        : Promise.resolve({ entries: [] }),
    ])
    setOrders(ordersData.orders)
    setFabricEntries(fabricData.entries)

    const isSalesOrAdmin = ['admin', 'sales'].includes(currentUser.role)
    if (isSalesOrAdmin) {
      const [clientsData, reportsData, peopleData, artistsData, machinesData, styleOptionsData, consumablesData] = await Promise.all([
        api('/api/clients'),
        api('/api/reports'),
        currentUser.role === 'admin' ? api('/api/staff') : api('/api/artists'),
        api('/api/artists'),
        api('/api/settings/machines'),
        api('/api/settings/style-number-options'),
        currentUser.role === 'admin'
          ? api('/api/consumables')
          : Promise.resolve({ inventory: [], transactions: [] }),
      ])
      setClients(clientsData.clients)
      setReport(reportsData.report)
      setStaff(peopleData.staff || peopleData.artists)
      setArtistOptions(artistsData.artists)
      setMachines(machinesData.machines)
      setStyleNumberOptions(styleOptionsData.options)
      setConsumablesReport(consumablesData)
    } else if (currentUser.role === 'supervisor') {
      const consumablesData = await api('/api/consumables')
      setClients([])
      setReport(null)
      setStaff([])
      setArtistOptions([])
      setMachines([])
      setStyleNumberOptions([])
      setConsumablesReport(consumablesData)
    } else {
      setClients([])
      setReport(null)
      setStaff([])
      setArtistOptions([])
      setMachines([])
      setStyleNumberOptions([])
      setConsumablesReport({ inventory: [], transactions: [] })
    }

    if (['admin', 'print_operator'].includes(currentUser.role)) {
      const [reprintData, testPrintData] = await Promise.all([
        api('/api/reprints'),
        api('/api/test-prints'),
      ])
      setReprints(reprintData.reprints)
      setTestPrintJobs(testPrintData.jobs)
    } else {
      setReprints([])
      setTestPrintJobs([])
    }

  }, [])

  useEffect(() => {
    api('/api/auth/me')
      .then(({ user: currentUser }) => initializeUser(currentUser))
      .catch((error) => {
        if (!error.message.includes('Authentication required') &&
          !error.message.includes('Session expired')) {
          setLoginError(error.message)
        }
      })
      .finally(() => setCheckingSession(false))
  }, [])

  useEffect(() => {
    if (!user) return
    let active = true
    async function refreshWorkspace() {
      try {
        await loadWorkspace(user)
      } catch (error) {
        if (active) setPageError(error.message)
      }
    }
    refreshWorkspace()
    return () => {
      active = false
    }
  }, [user, loadWorkspace])

  useEffect(() => {
    if (!user) return undefined

    let refreshing = false
    const refreshVisibleWorkspace = async () => {
      if (
        refreshing ||
        busy ||
        document.visibilityState !== 'visible'
      ) return
      refreshing = true
      try {
        await loadWorkspace(user)
      } catch (error) {
        setPageError(`Unable to refresh workspace data: ${error.message}`)
      } finally {
        refreshing = false
      }
    }

    const intervalId = window.setInterval(refreshVisibleWorkspace, 5000)
    return () => window.clearInterval(intervalId)
  }, [user, loadWorkspace, busy])

  useEffect(() => {
    if (!user || !window.isSecureContext || !('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return undefined
    let active = true
    async function enableBrowserPushNotifications() {
      const permission = Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission
      if (permission !== 'granted') return
      const registration = await navigator.serviceWorker.register('/sw.js')
      const existingSubscription = await registration.pushManager.getSubscription()
      const { publicKey } = await api('/api/notifications/public-key')
      const subscription = existingSubscription || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeVapidPublicKey(publicKey),
      })
      await api('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })
    }
    enableBrowserPushNotifications().catch((error) => {
      if (active) setPageError(`Unable to restore browser notifications: ${error.message}`)
    })
    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (!isClientModalOpen && !isOrderModalOpen && !isStaffModalOpen && !isFabricEntryModalOpen) return undefined

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsClientModalOpen(false)
        setIsOrderModalOpen(false)
        setIsStaffModalOpen(false)
        setIsFabricEntryModalOpen(false)
        setEditingFabricEntryId(null)
        setEditingStaffId(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isClientModalOpen, isOrderModalOpen, isStaffModalOpen, isFabricEntryModalOpen])

  async function handleLogin(event) {
    event.preventDefault()
    setLoginError('')
    setBusy(true)
    try {
      const result = await api('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      setPassword('')
      await initializeUser(result.user)
    } catch (error) {
      setLoginError(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    try {
      await api('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setMachineSelection(null)
      setOrders([])
      setUsername('')
      setPassword('')
      setNotice('')
    } catch (error) {
      setPageError(error.message)
    }
  }

  async function runAction(action, successMessage) {
    setBusy(true)
    setPageError('')
    try {
      await action()
      if (user) await loadWorkspace(user)
      setNotice(successMessage)
      return true
    } catch (error) {
      let message = error.message
      if (user) {
        try {
          await loadWorkspace(user)
        } catch (refreshError) {
          message = `${message} Workspace refresh failed: ${refreshError.message}`
        }
      }
      setPageError(message)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function createClient(event) {
    event.preventDefault()
    await runAction(async () => {
      await api('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm),
      })
      setClientForm({
        company_name: '',
        contact_person: '',
        contact_number: '',
        shipping_address: '',
        sales_rep_id: '',
      })
      setIsClientModalOpen(false)
    }, 'Client profile created.')
  }

  function startEditingClient(client) {
    setEditingClientId(client.client_id)
    setClientEditForm({
      company_name: client.company_name,
      contact_person: client.contact_person,
      contact_number: client.contact_number,
      shipping_address: client.shipping_address,
      sales_rep_id: String(client.sales_rep_id ?? ''),
    })
  }

  async function updateClient(event) {
    event.preventDefault()
    await runAction(async () => {
      await api(`/api/clients/${editingClientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientEditForm),
      })
      setEditingClientId(null)
    }, 'Client profile updated.')
  }

  async function deleteClient(client) {
    if (!window.confirm(`Delete the client ${client.company_name}? This cannot be undone.`)) {
      return
    }
    await runAction(
      () => api(`/api/clients/${client.client_id}`, { method: 'DELETE' }),
      'Client profile deleted.',
    )
  }

  async function createOrder(event) {
    event.preventDefault()
    const layoutFee = Number(orderForm.layout_fee || 0)
    if (!Number.isFinite(layoutFee) || layoutFee < 0 ||
      (layoutFee > 0 && layoutFee < minimumLayoutFee)) {
      window.alert('Layout fee must be 0 or at least 700. The order was not saved.')
      return
    }
    if (layoutFee > 0 &&
      (orderForm.per_piece_price === '' ||
        !Number.isFinite(Number(orderForm.per_piece_price)) ||
        Number(orderForm.per_piece_price) < 0)) {
      window.alert('Enter a valid per-piece price before saving this order.')
      return
    }
    await runAction(async () => {
      const layoutFeePaid = layoutFee >= paidLayoutFeeThreshold
      const body = {
        ...orderForm,
        gsm: Number(orderForm.gsm),
        layout_fee: layoutFee,
        per_piece_price: layoutFeePaid ? Number(orderForm.per_piece_price) : null,
        down_payment: layoutFeePaid ? Number(orderForm.down_payment || 0) : 0,
        assigned_artist_id: layoutFeePaid && orderForm.assigned_artist_id
          ? Number(orderForm.assigned_artist_id)
          : null,
        printer_machine: layoutFeePaid ? orderForm.printer_machine : '',
        pressing_machine: layoutFeePaid ? orderForm.pressing_machine : '',
        cutting_machine: layoutFeePaid ? orderForm.cutting_machine : '',
        sales_rep_id: orderForm.sales_rep_id
          ? Number(orderForm.sales_rep_id)
          : undefined,
      }
      const { order } = await api('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const selectedLineup =
        Number(orderForm.down_payment) >= paidLayoutFeeThreshold
          ? lineupFile
          : null
      const selectedDraft =
        Number(orderForm.down_payment) >= paidLayoutFeeThreshold
          ? lineupDraft
          : null
      setOrderForm(emptyOrder)
      setLineupFile(null)
      setLineupInputKey((key) => key + 1)
      if (selectedDraft) {
        await api(`/api/orders/${order.order_id}/lineup`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            headers: selectedDraft.headers,
            rows: selectedDraft.rows,
            extension: selectedDraft.extension,
          }),
        })
      } else if (selectedLineup) {
        const formData = new FormData()
        formData.append('file', selectedLineup)
        await api(`/api/orders/${order.order_id}/lineup`, {
          method: 'POST',
          body: formData,
        })
      }
      setIsOrderModalOpen(false)
      setOrderModalClient(null)
      setLineupDraft(null)
    }, 'Order saved. It will remain out of the Artist mock-up queue until the layout fee is paid.')
  }

  function openOrderModalForClient(client) {
    setOrderForm({
      ...emptyOrder,
      client_id: client.client_id,
      sales_rep_id: String(client.sales_rep_id ?? ''),
    })
    setLineupFile(null)
    setLineupDraft(null)
    setLineupInputKey((key) => key + 1)
    setOrderModalClient(client)
    setIsOrderModalOpen(true)
  }

  function closeOrderModal() {
    setIsOrderModalOpen(false)
    setOrderModalClient(null)
    setOrderForm(emptyOrder)
    setLineupFile(null)
    setLineupDraft(null)
    setLineupInputKey((key) => key + 1)
  }

  function startEditingOrder(order) {
    setEditingOrderId(order.order_id)
    setOrderEditForm({
      ...emptyOrder,
      ...order,
      style_option_ids: Object.fromEntries(
        styleNumberFields.map(({ category, field }) => [
          category,
          String(styleNumberOptions.find((option) => option.category === category && option.name === order[field])?.id || ''),
        ]),
      ),
      gsm: String(order.gsm),
      layout_fee: String(order.layout_fee ?? 0),
      per_piece_price: order.per_piece_price == null ? '' : String(order.per_piece_price),
      down_payment: String(order.down_payment ?? 0),
      assigned_artist_id: String(order.assigned_artist_id ?? ''),
      sales_rep_id: String(order.sales_rep_id ?? ''),
    })
  }

  async function updateOrder(event) {
    event.preventDefault()
    const layoutFee = Number(orderEditForm.layout_fee || 0)
    if (!Number.isFinite(layoutFee) || layoutFee < 0 ||
      (layoutFee > 0 && layoutFee < minimumLayoutFee)) {
      window.alert('Layout fee must be 0 or at least 700. The order was not saved.')
      return
    }
    if (layoutFee > 0 &&
      (orderEditForm.per_piece_price === '' ||
        !Number.isFinite(Number(orderEditForm.per_piece_price)) ||
        Number(orderEditForm.per_piece_price) < 0)) {
      window.alert('Enter a valid per-piece price before saving this order.')
      return
    }
    await runAction(async () => {
      await api(`/api/orders/${editingOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderEditForm,
          gsm: Number(orderEditForm.gsm),
          layout_fee: layoutFee,
          per_piece_price: orderEditForm.per_piece_price === ''
            ? null
            : Number(orderEditForm.per_piece_price),
          down_payment: Number(orderEditForm.down_payment || 0),
          assigned_artist_id: Number(orderEditForm.assigned_artist_id),
        }),
      })
      setEditingOrderId(null)
    }, 'Order details updated.')
  }

  function openPaymentEditor(order) {
    setPaymentOrder(order)
    setPaymentForm({
      layout_fee: String(order.layout_fee ?? 0),
      down_payment: String(order.down_payment ?? 0),
    })
  }

  async function updateOrderPayments(event) {
    event.preventDefault()
    if (!paymentOrder) return
    const layoutFee = Number(paymentForm.layout_fee)
    if (!Number.isFinite(layoutFee) || layoutFee < minimumLayoutFee) {
      window.alert('Layout fee must be at least 700. Payments were not saved.')
      return
    }
    const updated = await runAction(
      () => api(`/api/orders/${paymentOrder.order_id}/payments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout_fee: layoutFee,
          down_payment: Number(paymentForm.down_payment),
        }),
      }),
      'Order payments updated.',
    )
    if (updated) setPaymentOrder(null)
  }

  async function deleteOrder(order) {
    if (!window.confirm(`Permanently delete order ${order.order_id} (${order.team_project_name}), including its production history and uploaded files? This cannot be undone.`)) {
      return
    }
    await runAction(
      () => api(`/api/orders/${order.order_id}`, { method: 'DELETE' }),
      'Order deleted.',
    )
  }

  async function openLineupEditor(order) {
    setLineupEditor({
      order,
      headers: order.spreadsheet_path ? [] : ['Name', 'Quantity'],
      rows: order.spreadsheet_path ? [] : [['', '']],
      filename: '',
      extension: '.xlsx',
      file: null,
      loading: Boolean(order.spreadsheet_path),
      error: '',
      draft: false,
      selectedRows: [],
      selectedColumns: [],
    })
    if (!order.spreadsheet_path) return
    try {
      const table = await api(`/api/orders/${order.order_id}/lineup`)
      setLineupEditor((current) => current?.order.order_id === order.order_id
        ? {
            ...current,
            ...table,
            rows: sortLineupRowsBySize(table.headers, table.rows),
            loading: false,
          }
        : current)
    } catch (error) {
      setLineupEditor((current) => current?.order.order_id === order.order_id
        ? { ...current, loading: false, error: error.message }
        : current)
    }
  }

  async function openDraftLineupEditor() {
    const selectedFile = lineupFile
    setLineupEditor({
      order: { ...orderForm, order_id: null, spreadsheet_path: null, total_quantity: 0, order_status: 'mockup' },
      headers: ['Name', 'Quantity'],
      rows: [['', '']],
      filename: selectedFile?.name || 'New lineup table',
      extension: selectedFile?.name.toLowerCase().endsWith('.csv') ? '.csv' : '.xlsx',
      file: selectedFile,
      loading: Boolean(selectedFile),
      error: '',
      draft: true,
      selectedRows: [],
      selectedColumns: [],
    })
    if (!selectedFile) return
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const table = await api('/api/lineup/preview', { method: 'POST', body: formData })
      setLineupEditor((current) => current?.draft
        ? { ...current, ...table, loading: false }
        : current)
    } catch (error) {
      setLineupEditor((current) => current?.draft
        ? { ...current, loading: false, error: error.message }
        : current)
    }
  }

  function updateLineupEditor(update) {
    setLineupEditor((current) => current ? { ...current, ...update } : current)
  }

  async function uploadLineupFromEditor() {
    if (lineupEditor?.draft) {
      if (!lineupEditor.file) {
        updateLineupEditor({ error: 'Choose a CSV or XLSX spreadsheet first.' })
        return
      }
      try {
        const formData = new FormData()
        formData.append('file', lineupEditor.file)
        const table = await api('/api/lineup/preview', { method: 'POST', body: formData })
        setLineupEditor((current) => current?.draft
          ? { ...current, ...table, error: '', selectedRows: [], selectedColumns: [] }
          : current)
      } catch (error) {
        updateLineupEditor({ error: error.message })
      }
      return
    }
    if (!lineupEditor?.file) {
      updateLineupEditor({ error: 'Choose a CSV or XLSX spreadsheet first.' })
      return
    }
    let table
    let uploadedOrder
    const succeeded = await runAction(async () => {
      const formData = new FormData()
      formData.append('file', lineupEditor.file)
      const uploadResult = await api(`/api/orders/${lineupEditor.order.order_id}/lineup`, {
        method: 'POST',
        body: formData,
      })
      uploadedOrder = uploadResult.order
      table = await api(`/api/orders/${lineupEditor.order.order_id}/lineup`)
    }, 'Lineup uploaded and total quantity calculated.')
    if (succeeded) setLineupEditor((current) => current ? { ...current, ...table, order: uploadedOrder, file: null, error: '' } : current)
  }

  async function saveLineupEditor() {
    if (!lineupEditor) return
    if (lineupEditor.draft) {
      setLineupDraft({
        headers: lineupEditor.headers,
        rows: lineupEditor.rows,
        extension: lineupEditor.extension,
        filename: lineupEditor.filename,
      })
      setLineupFile(null)
      setLineupInputKey((key) => key + 1)
      setLineupEditor(null)
      setNotice('Lineup edits saved and will be attached when the order is created.')
      return
    }
    let result
    const succeeded = await runAction(async () => {
      result = await api(`/api/orders/${lineupEditor.order.order_id}/lineup`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headers: lineupEditor.headers,
          rows: lineupEditor.rows,
          extension: lineupEditor.extension,
        }),
      })
    }, 'Lineup spreadsheet updated.')
    if (succeeded) setLineupEditor((current) => current ? { ...current, ...result, order: result.order, error: '' } : current)
  }

  async function createStaff(event) {
    event.preventDefault()
    const succeeded = await runAction(async () => {
      await api('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm),
      })
      setStaffForm({
        name: '',
        username: '',
        password: '',
        role: 'sales',
        business_unit: '',
      })
    }, 'Staff account created.')
    if (succeeded) setIsStaffModalOpen(false)
  }

  function openNewStaffModal() {
    setEditingStaffId(null)
    setStaffForm({
      name: '',
      username: '',
      password: '',
      role: 'sales',
      business_unit: '',
    })
    setPageError('')
    setIsStaffModalOpen(true)
  }

  function closeStaffModal() {
    setIsStaffModalOpen(false)
    setEditingStaffId(null)
  }

  function startEditingStaff(member) {
    setEditingStaffId(member.id)
    setStaffEditForm({
      name: member.name,
      username: member.username,
      password: '',
      role: member.role,
      business_unit: member.business_unit || '',
    })
    setPageError('')
    setIsStaffModalOpen(true)
  }

  async function updateStaff(event) {
    event.preventDefault()
    const succeeded = await runAction(async () => {
      await api(`/api/staff/${editingStaffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffEditForm),
      })
    }, 'Staff account updated.')
    if (succeeded) closeStaffModal()
  }

  async function deleteStaff(member) {
    if (!window.confirm(`Delete the account for ${member.name}? This cannot be undone.`)) {
      return
    }
    await runAction(
      () => api(`/api/staff/${member.id}`, { method: 'DELETE' }),
      'Staff account deleted.',
    )
  }

  async function addMachine(event, category) {
    event.preventDefault()
    const name = newMachineNames[category].trim()
    if (!name) return
    await runAction(async () => {
      await api('/api/settings/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, name }),
      })
      setNewMachineNames((current) => ({ ...current, [category]: '' }))
    }, 'Machine added.')
  }

  async function updateMachine(event, machine) {
    event.preventDefault()
    const succeeded = await runAction(
      () => api(`/api/settings/machines/${machine.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingMachineName }),
      }),
      'Machine updated.',
    )
    if (succeeded) {
      setEditingMachineId(null)
      setEditingMachineName('')
    }
  }

  async function deleteMachine(machine) {
    if (!window.confirm(`Delete ${machine.name} from ${machine.category} machines?`)) return
    await runAction(
      () => api(`/api/settings/machines/${machine.id}`, { method: 'DELETE' }),
      'Machine deleted.',
    )
  }

  function openFabricEntryModal(entry = null) {
    setEditingFabricEntryId(entry?.id ?? null)
    setFabricEntryForm(entry
      ? {
          fabric: entry.fabric,
          gsm: String(entry.gsm),
          roll_quantity: String(entry.roll_quantity),
          measurement_type: entry.measurement_type,
          meters_per_roll: entry.meters_per_roll == null ? '' : String(entry.meters_per_roll),
          kilo_per_meter: entry.kilo_per_meter == null ? '' : String(entry.kilo_per_meter),
          kilo_per_roll: entry.kilo_per_roll == null ? '' : String(entry.kilo_per_roll),
          entry_date: entry.entry_date,
        }
      : { ...emptyFabricEntry, entry_date: localDateInputValue() })
    setPageError('')
    setIsFabricEntryModalOpen(true)
  }

  function closeFabricEntryModal() {
    setIsFabricEntryModalOpen(false)
    setEditingFabricEntryId(null)
    setFabricEntryForm({ ...emptyFabricEntry, entry_date: localDateInputValue() })
  }

  async function saveFabricEntry(event) {
    event.preventDefault()
    const totalMeter = calculateFabricTotalMeters(fabricEntryForm)
    if (!Number.isFinite(totalMeter) || totalMeter <= 0) {
      setPageError('Fabric measurements must calculate to more than zero meters.')
      return
    }
    const saved = await runAction(
      () => api(
        editingFabricEntryId
          ? `/api/fabric-inventory/${editingFabricEntryId}`
          : '/api/fabric-inventory',
        {
          method: editingFabricEntryId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...fabricEntryForm,
            gsm: Number(fabricEntryForm.gsm),
            roll_quantity: Number(fabricEntryForm.roll_quantity),
            meters_per_roll: fabricEntryForm.meters_per_roll === ''
              ? null
              : Number(fabricEntryForm.meters_per_roll),
            kilo_per_meter: fabricEntryForm.kilo_per_meter === ''
              ? null
              : Number(fabricEntryForm.kilo_per_meter),
            kilo_per_roll: fabricEntryForm.kilo_per_roll === ''
              ? null
              : Number(fabricEntryForm.kilo_per_roll),
          }),
        },
      ),
      editingFabricEntryId ? 'Fabric entry updated.' : 'Fabric entry saved.',
    )
    if (saved) closeFabricEntryModal()
  }

  async function saveConsumableTransaction(event) {
    event.preventDefault()
    const quantity = Number(consumableForm.quantity)
    if (!Number.isFinite(quantity) ||
      (consumableForm.transaction_type === 'stock_in' && quantity <= 0) ||
      (consumableForm.transaction_type === 'adjustment' && quantity === 0)) {
      setPageError('Enter a valid non-zero consumable quantity.')
      return
    }
    const saved = await runAction(
      () => api('/api/consumables/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...consumableForm, quantity }),
      }),
      consumableForm.transaction_type === 'stock_in'
        ? 'Consumable stock receipt recorded.'
        : 'Consumable stock adjusted.',
    )
    if (saved) {
      setConsumableForm((current) => ({
        ...current,
        quantity: '',
        entry_date: localDateInputValue(),
        note: '',
      }))
    }
  }

  async function addStyleOption(event, category) {
    event.preventDefault()
    const option = newStyleOptions[category] || { name: '', code: '' }
    await runAction(async () => {
      await api('/api/settings/style-number-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, name: option.name, code: option.code }),
      })
      setNewStyleOptions((current) => ({ ...current, [category]: { name: '', code: '' } }))
    }, 'Style number option added.')
  }

  async function deleteStyleOption(option) {
    if (!window.confirm(`Delete ${option.name} (${option.code})?`)) return
    await runAction(
      () => api(`/api/settings/style-number-options/${option.id}`, { method: 'DELETE' }),
      'Style number option deleted.',
    )
  }

  async function uploadMockup(orderId) {
    const files = mockupFiles[orderId] || {}
    if (!files.mockup) {
      setPageError('Choose a concept mock-up file before submitting.')
      return
    }
    await runAction(async () => {
      const formData = new FormData()
      formData.append('mockup', files.mockup)
      await api(`/api/orders/${orderId}/design`, {
        method: 'POST',
        body: formData,
      })
      setMockupFiles((current) => ({ ...current, [orderId]: {} }))
    }, 'Mock-up submitted to Sales approval.')
  }

  async function uploadSwatch(orderId) {
    const swatch = mockupFiles[orderId]?.swatch
    if (!swatch) {
      setPageError('Choose a swatch file before uploading.')
      return
    }
    await runAction(async () => {
      const formData = new FormData()
      formData.append('file', swatch)
      await api(`/api/orders/${orderId}/swatch`, { method: 'POST', body: formData })
      setMockupFiles((current) => ({
        ...current,
        [orderId]: { ...current[orderId], swatch: null },
      }))
    }, 'Swatch uploaded.')
  }

  async function changePassword(event) {
    event.preventDefault()
    setLoginError('')
    setBusy(true)
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      setNewPassword('')
      setUser({ ...user, must_change_password: 0 })
    } catch (error) {
      setLoginError(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function approveMockup(orderId, approved) {
    await runAction(async () => {
      await api(`/api/orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })
    }, approved ? 'Mock-up approved; order moved to sizing.' : 'Mock-up returned to the Artist.')
  }

  async function stationAction(order, action) {
    await runAction(async () => {
      if (action === 'station-log') {
        const values = stationForms[order.order_id] || {}
        const consumableQuantities = Object.entries(values.consumable_usage || {})
        if (consumableQuantities.some(([, quantity]) =>
          quantity !== '' && (!Number.isFinite(Number(quantity)) || Number(quantity) < 0),
        )) {
          throw new Error('Consumable usage quantities must be zero or greater.')
        }
        const consumables = consumableQuantities
          .filter(([, quantity]) => Number(quantity) > 0)
          .map(([code, quantity]) => ({ code, quantity: Number(quantity) }))
        await api(`/api/orders/${order.order_id}/station-log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fabric_used: values.fabric_used || '',
            paper_meters: 0,
            consumables,
            defect_description: values.defect_description || '',
          }),
        })
        setStationForms((current) => ({
          ...current,
          [order.order_id]: {
            fabric_used: '',
            defect_description: '',
            consumable_process: 'sublimation',
            consumable_brand: 'atexco',
            consumable_usage: {},
          },
        }))
        return
      }

      if (action === 'reprint-log') {
        const values = stationForms[order.order_id] || {}
        const body = new FormData()
        body.append('fabric_used', values.fabric_used || '')
        body.append('defect_description', values.defect_description || '')
        if (values.reprint_image) body.append('image', values.reprint_image)
        await api(`/api/orders/${order.order_id}/reprint-log`, {
          method: 'POST',
          body,
        })
        setStationForms((current) => ({
          ...current,
          [order.order_id]: {
            ...current[order.order_id],
            fabric_used: '',
            defect_description: '',
            reprint_image: null,
          },
        }))
        setReprintImageInputVersion((current) => ({
          ...current,
          [order.order_id]: (current[order.order_id] || 0) + 1,
        }))
        return
      }

      const requestOptions = { method: 'POST' }
      if (action === 'complete-stage' && order.order_status === 'printing') {
        requestOptions.headers = { 'Content-Type': 'application/json' }
        requestOptions.body = JSON.stringify({
          pressing_note: pressingNotes[`printing-${order.order_id}`] || '',
        })
      }
      await api(`/api/orders/${order.order_id}/${action}`, requestOptions)
    },
    action === 'complete-stage'
      ? 'Production stage completed.'
      : action === 'reprint-log'
        ? 'Reprint request saved.'
        : 'Production data saved.')
  }

  async function updateReprint(id, action) {
    await runAction(async () => {
      await api(`/api/reprints/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pressing_note: pressingNotes[`reprint-${id}`] || '',
        }),
      })
    }, action === 'complete' ? 'Reprint marked complete.' : 'Reprint started.')
  }

  async function updateTestPrint(id, action) {
    await runAction(async () => {
      await api(`/api/test-prints/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pressing_note: pressingNotes[`test-print-${id}`] || '',
        }),
      })
    }, action === 'complete' ? 'Test print completed.' : 'Test print started.')
  }

  async function logReprintProduction(job) {
    const formKey = `reprint-${job.id}`
    const values = stationForms[formKey] || {}
    await runAction(async () => {
      const consumables = Object.entries(values.consumable_usage || {})
        .filter(([, quantity]) => Number(quantity) > 0)
        .map(([code, quantity]) => ({ code, quantity: Number(quantity) }))
      if (Object.values(values.consumable_usage || {}).some((quantity) =>
        quantity !== '' && (!Number.isFinite(Number(quantity)) || Number(quantity) < 0),
      )) {
        throw new Error('Consumable usage quantities must be zero or greater.')
      }
      await api(`/api/reprints/${job.id}/station-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fabric_used: values.fabric_used || '',
          paper_meters: 0,
          consumables,
          defect_description: values.defect_description || '',
        }),
      })
      setStationForms((current) => ({
        ...current,
        [formKey]: {
          ...current[formKey],
          fabric_used: '',
          consumable_usage: {},
          defect_description: '',
        },
      }))
    }, 'Reprint production data saved.')
  }

  async function toggleActivity(orderId) {
    if (activity[orderId]) {
      setActivity((current) => ({ ...current, [orderId]: null }))
      return
    }
    try {
      const result = await api(`/api/orders/${orderId}/activity`)
      setActivity((current) => ({ ...current, [orderId]: result }))
    } catch (error) {
      setPageError(error.message)
    }
  }

  async function openCompletedOrderDetails(order) {
    setCompletedOrderDetails({
      orderId: order.order_id,
      activity: null,
      loading: true,
      error: '',
    })
    try {
      const result = await api(`/api/orders/${encodeURIComponent(order.order_id)}/activity`)
      setCompletedOrderDetails((current) => current?.orderId === order.order_id
        ? { ...current, activity: result, loading: false }
        : current)
    } catch (error) {
      setCompletedOrderDetails((current) => current?.orderId === order.order_id
        ? { ...current, loading: false, error: error.message }
        : current)
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Loading BPSMS...
      </main>
    )
  }

  if (user?.must_change_password) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12 text-slate-900">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">B-POWER</p>
          <h1 className="text-3xl font-bold tracking-tight">Set your password</h1>
          <p className="mt-2 text-sm text-slate-600">Change the temporary password before continuing.</p>
          <form className="mt-8 space-y-5" onSubmit={changePassword}>
            <Field label="New password (at least 8 characters)">
              <input
                autoComplete="new-password"
                className={inputClass}
                minLength="8"
                onChange={(event) => setNewPassword(event.target.value)}
                required
                type="password"
                value={newPassword}
              />
            </Field>
            {loginError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{loginError}</p>}
            <IconButton className="w-full rounded-lg bg-violet-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60" disabled={busy} type="submit">
              {busy ? 'Saving…' : 'Set password and continue'}
            </IconButton>
          </form>
        </section>
      </main>
    )
  }

  if (machineSelection && !machineSelection.complete) {
    const stationLabel = stationLabelByCategory[machineSelection.category]
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12 text-slate-900">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">B-POWER</p>
          <h1 className="text-2xl font-bold">{stationLabel} machine</h1>
          <p className="mt-2 text-sm text-slate-600">
            Select the machine you are using to continue to the {stationLabel} workspace.
          </p>
          {machineSelection.error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {machineSelection.error}
            </p>
          )}
          {machineSelection.loading ? (
            <p className="mt-6 text-sm text-slate-500">Loading available machines…</p>
          ) : machineSelection.machines.length === 0 ? (
            <div className="mt-6 space-y-4">
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                No {stationLabel.toLocaleLowerCase()} machines are configured. Contact an administrator to add one.
              </p>
              <IconButton
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                onClick={reloadMachineOptions}
                type="button"
              >
                Try again
              </IconButton>
            </div>
          ) : (
            <form
              className="mt-6 space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                if (!machineSelection.machineName) return
                setMachineSelection((current) => current
                  ? { ...current, complete: true }
                  : current)
              }}
            >
              <Field label={`${stationLabel} machine name`}>
                <select
                  autoFocus
                  className={inputClass}
                  onChange={(event) => setMachineSelection((current) => current
                    ? { ...current, machineName: event.target.value }
                    : current)}
                  required
                  value={machineSelection.machineName}
                >
                  <option value="">Select a machine</option>
                  {machineSelection.machines.map((machine) => (
                    <option key={machine.id} value={machine.name}>{machine.name}</option>
                  ))}
                </select>
              </Field>
              <IconButton
                className="w-full rounded-lg bg-violet-600 px-4 py-2.5 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                disabled={!machineSelection.machineName}
                type="submit"
              >
                Continue to {stationLabel}
              </IconButton>
            </form>
          )}
          <button
            className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            onClick={handleLogout}
            type="button"
          >
            Sign out
          </button>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12 text-slate-900">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            B-POWER SUBLIMATION MANAGEMENT
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with your company account to open your assigned workspace.
          </p>
          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            <Field label="Username">
              <input
                autoComplete="username"
                className={inputClass}
                onChange={(event) => setUsername(event.target.value)}
                required
                type="text"
                value={username}
              />
            </Field>
            <Field label="Password">
              <input
                autoComplete="current-password"
                autoCapitalize="none"
                className={`${inputClass} normal-case`}
                onChange={(event) => setPassword(event.target.value)}
                required
                spellCheck={false}
                type="password"
                value={password}
              />
            </Field>
            {loginError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {loginError}
              </p>
            )}
            <IconButton
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              disabled={busy}
              type="submit"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </IconButton>
          </form>
        </section>
      </main>
    )
  }

  const isSalesOrAdmin = ['admin', 'sales'].includes(user.role)
  const isAdmin = user.role === 'admin'
  const isSupervisor = user.role === 'supervisor'
  const isBPowerSupervisor = isSupervisor && user.business_unit === 'sublimation'
  const isArtist = user.role === 'artist'
  const isStationRole = Boolean(stationByRole[user.role])
  const stageNavigation = [
    { label: 'Artist mock-up', view: 'mockup' },
    { label: 'Sales approval', view: 'sales_approval' },
    { label: 'Artist sizing', view: 'sizing' },
    { label: 'Printing', view: 'printing' },
    { label: 'Pressing', view: 'pressing' },
    { label: 'Cutting', view: 'cutting' },
    { label: 'Sewing', view: 'sewing' },
    { label: 'Packing', view: 'packing' },
    { label: 'Complete', view: 'complete' },
  ]
  const navigationByRole = {
    admin: [
      { label: 'All orders', view: 'all' },
      { label: 'Clients', view: 'clients' },
      ...stageNavigation,
      { label: 'Reports', view: 'reports' },
      { label: 'Settings', view: 'settings' },
    ],
    sales: [
      { label: 'My orders', view: 'all' },
      { label: 'Clients', view: 'clients' },
      stageNavigation[1],
      stageNavigation[8],
      { label: 'Reports', view: 'reports' },
    ],
    supervisor: [
      { label: 'Reports', view: 'reports' },
    ],
    artist: [
      stageNavigation[0],
      stageNavigation[2],
      { label: 'Assigned orders', view: 'all' },
    ],
    print_operator: [
      stageNavigation[3],
    ],
    pressing_operator: [stageNavigation[4]],
    cutting_operator: [stageNavigation[5]],
    sewing_operator: [stageNavigation[6]],
    packing_operator: [stageNavigation[7]],
  }
  const navigationItems = navigationByRole[user.role] || [
    { label: 'Orders', view: 'all' },
  ]
  const orderViews = new Set([
    'all',
    ...stageNavigation.map((stage) => stage.view),
  ])
  const currentStage = stageNavigation.find((stage) => stage.view === activeView)
  const isArtistMockupQueue = activeView === 'mockup' && (isArtist || isAdmin)
  const isArtistSizingQueue = activeView === 'sizing' && (isArtist || isAdmin)
  const isSalesApprovalQueue = activeView === 'sales_approval' && isSalesOrAdmin
  const isPrintingReprints = activeView === 'printing' && printingStage === 'reprints'
  const isPrintingTestPrints = activeView === 'printing' && printingStage === 'test_prints'
  const reportNavigation = [
    { view: 'overview', label: 'Overview', visible: isSalesOrAdmin },
    { view: 'fabric', label: 'Fabric inventory', visible: isAdmin || isBPowerSupervisor },
    { view: 'sublimation', label: 'Sublimation consumables', visible: isAdmin || user.business_unit === 'sublimation' },
    { view: 'dtf', label: 'DTF consumables', visible: isAdmin || user.business_unit === 'dtf' },
  ].filter((tab) => tab.visible)
  const canEditFabricInventory = isAdmin || user.role === 'pressing_operator' || isBPowerSupervisor
  const showingFabricInventory =
    (activeView === 'pressing' && pressingProcess === 'fabric') ||
    (activeView === 'reports' && reportTab === 'fabric')
  const normalizedOrderSearch = orderSearch.trim().toLocaleLowerCase()
  const machineFieldByCategory = {
    printing: 'printer_machine',
    pressing: 'pressing_machine',
    cutting: 'cutting_machine',
  }
  const artistMockupOrders = orders.filter((order) => {
    if (order.order_status === 'sales_approval') return true
    return order.order_status === 'mockup'
  })
  const artistMockupStageOrders = artistMockupOrders.filter((order) => {
    if (artistMockupStage === 'for-approval') return order.order_status === 'sales_approval'
    if (artistMockupStage === 'revision') return order.order_status === 'mockup' && Boolean(order.mockup_path)
    return order.order_status === 'mockup' && !order.mockup_path
  })
  const visibleOrders =
    orders.filter((order) => {
      const matchesStage = activeView === 'all' || (
        activeView === 'printing'
          ? !isPrintingReprints && !isPrintingTestPrints && order.order_status === 'printing'
          : activeView === 'mockup' && (isArtist || isAdmin)
            ? artistMockupStageOrders.some((entry) => entry.order_id === order.order_id)
            : order.order_status === activeView
      )
      const selectedMachineField = machineFieldByCategory[activeView]
      const matchesMachine = !machineSelection?.complete ||
        machineSelection.category !== activeView ||
        order[selectedMachineField] === machineSelection.machineName
      if (!matchesStage || !matchesMachine || !normalizedOrderSearch) {
        return matchesStage && matchesMachine
      }

      const clientName =
        order.client_company_name ||
        clients.find((client) => client.client_id === order.client_id)?.company_name ||
        ''
      return [
        order.order_id,
        order.client_id,
        clientName,
        order.team_project_name,
        order.due_date,
        order.total_quantity,
      ].some((value) => String(value ?? '').toLocaleLowerCase().includes(normalizedOrderSearch))
    })
  const normalizedFabricFilter = fabricFilters.fabric.trim().toLocaleLowerCase()
  const visibleFabricEntries = fabricEntries.filter((entry) =>
    (!fabricFilters.date || entry.entry_date === fabricFilters.date) &&
    (!normalizedFabricFilter || entry.fabric.toLocaleLowerCase().includes(normalizedFabricFilter)),
  )
  const activeConsumableUnit = reportTab === 'dtf' ? 'dtf' : 'sublimation'
  const visibleConsumableInventory = consumablesReport.inventory.filter(
    (entry) => entry.business_unit === activeConsumableUnit,
  )
  const visibleConsumableTransactions = consumablesReport.transactions.filter(
    (entry) => entry.business_unit === activeConsumableUnit,
  )
  const activeConsumableOptions = consumableCatalog.filter(
    (entry) => entry.business_unit === activeConsumableUnit && !entry.legacy,
  )
  const fabricComputedTotalMeters = calculateFabricTotalMeters(fabricEntryForm)
  const normalizedClientSearch = clientSearch.trim().toLocaleLowerCase()
  const visibleClients = clients.filter((client) =>
    [
      client.client_id,
      client.company_name,
      client.contact_person,
      isAdmin ? client.sales_rep_name : '',
    ].some((value) => String(value ?? '').toLocaleLowerCase().includes(normalizedClientSearch)),
  )
  const matchesSelectedPrintingMachine = (job) =>
    !machineSelection?.complete ||
    machineSelection.category !== 'printing' ||
    job.printer_machine === machineSelection.machineName
  const visibleReprints = reprints.filter((job) =>
    matchesSelectedPrintingMachine(job) &&
    [job.order_id, job.team_project_name, job.defect_description]
      .some((value) => String(value ?? '').toLocaleLowerCase().includes(normalizedOrderSearch)),
  )
  const visibleTestPrintJobs = testPrintJobs.filter((job) =>
    matchesSelectedPrintingMachine(job) &&
    [job.order_id, job.team_project_name, job.artist_name]
      .some((value) => String(value ?? '').toLocaleLowerCase().includes(normalizedOrderSearch)),
  )
  const queueTitle =
    activeView === 'all'
      ? user.role === 'artist'
        ? 'Assigned orders'
        : user.role === 'sales'
          ? 'My orders'
          : 'All orders'
      : isPrintingReprints
        ? 'Reprints queue'
        : isPrintingTestPrints
          ? 'Test Print queue'
        : `${currentStage?.label || stageLabels[activeView]} queue`

  return (
    <main
      className={`min-h-screen bg-slate-100 text-slate-900 ${theme === 'dark' ? 'theme-dark' : ''}`}
      onChangeCapture={uppercaseTextEntry}
      onCopyCapture={(event) => copySelectedTableCells(event, lineupEditor)}
      onKeyDownCapture={(event) => selectAllTableCells(event, setLineupEditor)}
    >
      <div className="sticky top-0 z-30">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <img alt="B-POWER logo" className="h-12 w-12 object-contain" src="/bps-logo-mark.png" />
              <img alt="MassPrints logo" className="h-12 w-auto max-w-[10rem] object-contain" src="/massprints-logo.png" />
              <h1 className="text-base font-bold sm:text-xl">Order and Processing Management System</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-slate-500">{roleLabels[user.role] || user.role}</p>
                {machineSelection?.complete && (
                  <p className="text-xs text-violet-700">
                    {machineSelection.category === 'printing'
                      ? 'Printer'
                      : `${stationLabelByCategory[machineSelection.category]} machine`}: {machineSelection.machineName}
                  </p>
                )}
              </div>
              <IconButton
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
                type="button"
              >
                {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
              </IconButton>
              <IconButton
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                onClick={handleLogout}
                type="button"
              >
                Sign out
              </IconButton>
            </div>
          </div>
        </header>
        <div className="border-b border-slate-200 bg-slate-100">
          <nav className="mx-auto flex w-full flex-nowrap gap-2 overflow-x-auto px-4 py-4 text-sm sm:px-6 lg:px-8" aria-label="Available modules">
            {navigationItems.map((module) => (
              <IconButton
                aria-current={activeView === module.view ? 'page' : undefined}
                className={`shrink-0 rounded-full px-4 py-2 font-medium ring-1 ring-slate-200 ${
                  activeView === module.view
                    ? 'bg-violet-600 text-white ring-violet-600'
                    : 'bg-white text-slate-700'
                }`}
                key={module.label}
                onClick={() => setActiveView(module.view)}
                type="button"
              >
                <span aria-hidden="true" className="mr-2">
                  {{
                    clients: '🏢',
                    mockup: '🎨',
                    sales_approval: '✅',
                    sizing: '📐',
                    printing: '🖨️',
                    pressing: '🔥',
                    reprints: '🔁',
                    cutting: '✂️',
                    sewing: '🧵',
                    packing: '📦',
                    complete: '🏁',
                    all: '📋',
                    reports: '📊',
                    settings: '⚙️',
                  }[module.view] || '•'}
                </span>
                {module.label}
              </IconButton>
            ))}
          </nav>
          {orderViews.has(activeView) &&
            !(activeView === 'pressing' && pressingProcess === 'fabric') && (
            <label className="mx-auto block w-full bg-slate-100 px-4 pb-3 sm:px-6 lg:px-8">
              <span className="sr-only">
                {isPrintingReprints
                  ? 'Search reprint jobs'
                  : isPrintingTestPrints
                    ? 'Search test print requests'
                    : 'Search orders'}
              </span>
              <input
                aria-label={isPrintingReprints
                  ? 'Search reprint jobs by order, project, or defect'
                  : isPrintingTestPrints
                    ? 'Search test print requests by order, project, or artist'
                    : 'Search orders by order ID, client ID, client name, project, due date, or quantity'}
                className={`${inputClass} mt-0 max-w-xl`}
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder={isPrintingReprints
                  ? 'Search reprints by order, project, or defect'
                  : isPrintingTestPrints
                    ? 'Search test prints by order, project, or artist'
                    : 'Search orders by ID, client, project, due date, or quantity'}
                type="search"
                value={orderSearch}
              />
            </label>
          )}
        </div>
      </div>

      <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        {(pageError || notice) && (
          <div
            className={`mb-5 rounded-lg px-4 py-3 text-sm ${pageError ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}
            role={pageError ? 'alert' : 'status'}
          >
            {pageError || notice}
            <IconButton
              className="float-right font-semibold"
              onClick={() => {
                setPageError('')
                setNotice('')
              }}
              type="button"
            >
              Dismiss
            </IconButton>
          </div>
        )}

        {activeView === 'reports' && (
          <nav aria-label="Reports sections" className="mb-6 flex flex-wrap gap-2">
            {reportNavigation.map((tab) => (
              <IconButton
                aria-current={reportTab === tab.view ? 'page' : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-medium ring-1 ${
                  reportTab === tab.view
                    ? 'bg-violet-600 text-white ring-violet-600'
                    : 'bg-white text-slate-700 ring-slate-200'
                }`}
                key={tab.view}
                onClick={() => {
                  setReportTab(tab.view)
                  if (tab.view === 'dtf' || tab.view === 'sublimation') {
                    const businessUnit = tab.view
                    const firstProduct = consumableCatalog.find((product) => product.business_unit === businessUnit)
                    setConsumableForm((current) => ({
                      ...current,
                      business_unit: businessUnit,
                      consumable_code: firstProduct.code,
                    }))
                  }
                }}
                type="button"
              >
                {tab.label}
              </IconButton>
            ))}
          </nav>
        )}

        {activeView === 'pressing' && ['admin', 'pressing_operator'].includes(user.role) && (
          <nav aria-label="Pressing processes" className="mb-6 flex flex-wrap gap-2">
            {[
              ['orders', 'Order processing'],
              ['fabric', 'Fabric inventory'],
            ].map(([process, label]) => (
              <IconButton
                aria-current={pressingProcess === process ? 'page' : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-medium ring-1 ${
                  pressingProcess === process
                    ? 'bg-violet-600 text-white ring-violet-600'
                    : 'bg-white text-slate-700 ring-slate-200'
                }`}
                key={process}
                onClick={() => setPressingProcess(process)}
                type="button"
              >
                {label}
              </IconButton>
            ))}
          </nav>
        )}

        {activeView === 'reports' && report && reportTab === 'overview' && (
          <section className="mb-8 scroll-mt-48" id="reports">
            <h2 className="mb-3 text-lg font-bold">Production overview</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { key: 'active', label: 'Active orders', value: report.active_orders || 0, type: 'summary-orders' },
                { key: 'completed', label: 'Completed orders', value: report.completed_orders || 0, type: 'summary-orders' },
                { key: 'garments', label: 'Garments', value: Number(report.total_quantity || 0).toLocaleString(), type: 'summary-orders' },
                { key: 'current', label: 'Current orders', value: report.order_count || 0, type: 'summary-orders' },
                { key: 'paper', label: 'Paper used (m)', value: Number(report.paper_meters || 0).toFixed(2), type: 'summary-consumption' },
                { key: 'defects', label: 'Recorded defects', value: report.defects || 0, type: 'summary-consumption' },
              ].map((card, index) => (
                <button
                  aria-expanded={reportDrilldown?.type === card.type && reportDrilldown.key === card.key}
                  aria-label={`Show details for ${card.label}: ${card.value}`}
                  className={`report-summary-card rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 ${
                    reportDrilldown?.type === card.type && reportDrilldown.key === card.key
                      ? 'ring-2 ring-violet-500'
                      : ''
                  }`}
                  key={card.key}
                  onClick={() => setReportDrilldown((current) =>
                    current?.type === card.type && current.key === card.key
                      ? null
                      : { type: card.type, key: card.key },
                  )}
                  style={{ animationDelay: `${index * 55}ms` }}
                  type="button"
                >
                  <span className="block text-sm text-slate-500">{card.label}</span>
                  <span className="mt-1 block text-2xl font-bold">{card.value}</span>
                  <span className="mt-2 block text-xs text-violet-700">Click to view details</span>
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <section className="overflow-x-auto rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <h3 className="mb-3 text-sm font-bold">Orders by TRD stage</h3>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">TRD stage</th>
                      <th className="px-3 py-2">Orders</th>
                      <th className="px-3 py-2">Garments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...(report.by_stage || [])]
                      .sort((left, right) =>
                        stageSequence.indexOf(left.order_status) - stageSequence.indexOf(right.order_status),
                      )
                      .map((stage) => (
                        <tr
                          className={`border-t border-slate-100 ${
                            reportDrilldown?.type === 'stage' && reportDrilldown.key === stage.order_status
                              ? 'bg-violet-50'
                              : ''
                          }`}
                          key={stage.order_status}
                        >
                          <td className="px-3 py-2">
                            <button
                              aria-expanded={reportDrilldown?.type === 'stage' && reportDrilldown.key === stage.order_status}
                              className="font-medium text-violet-700 underline decoration-dotted underline-offset-2 hover:text-violet-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600"
                              onClick={() => setReportDrilldown((current) =>
                                current?.type === 'stage' && current.key === stage.order_status
                                  ? null
                                  : { type: 'stage', key: stage.order_status },
                              )}
                              type="button"
                            >
                              {stageLabels[stage.order_status] || stage.order_status}
                            </button>
                          </td>
                          <td className="px-3 py-2">{stage.count}</td>
                          <td className="px-3 py-2">{Number(stage.total_quantity || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    {(report.by_stage || []).length === 0 && (
                      <tr><td className="px-3 py-3 text-slate-500" colSpan="3">No orders to report.</td></tr>
                    )}
                  </tbody>
                </table>
              </section>
              <section className="overflow-x-auto rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <h3 className="mb-3 text-sm font-bold">Consumption by TRD stage</h3>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">TRD stage</th>
                      <th className="px-3 py-2">Logs</th>
                      <th className="px-3 py-2">Paper (m)</th>
                      <th className="px-3 py-2">Defects</th>
                      <th className="px-3 py-2">Fabric recorded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.consumption_by_stage || []).map((entry) => (
                      <tr
                        className={`border-t border-slate-100 ${
                          reportDrilldown?.type === 'consumption' && reportDrilldown.key === entry.station
                            ? 'bg-violet-50'
                            : ''
                        }`}
                        key={entry.station}
                      >
                        <td className="px-3 py-2">
                          <button
                            aria-expanded={reportDrilldown?.type === 'consumption' && reportDrilldown.key === entry.station}
                            className="font-medium text-violet-700 underline decoration-dotted underline-offset-2 hover:text-violet-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600"
                            onClick={() => setReportDrilldown((current) =>
                              current?.type === 'consumption' && current.key === entry.station
                                ? null
                                : { type: 'consumption', key: entry.station },
                            )}
                            type="button"
                          >
                            {stageLabels[entry.station] || entry.station}
                          </button>
                        </td>
                        <td className="px-3 py-2">{entry.entries}</td>
                        <td className="px-3 py-2">{Number(entry.paper_meters || 0).toFixed(2)}</td>
                        <td className="px-3 py-2">{entry.defects || 0}</td>
                        <td className="px-3 py-2">{(entry.fabric_used || '').split(',').filter(Boolean).join(', ') || '—'}</td>
                      </tr>
                    ))}
                    {(report.consumption_by_stage || []).length === 0 && (
                      <tr><td className="px-3 py-3 text-slate-500" colSpan="5">No production consumption recorded.</td></tr>
                    )}
                  </tbody>
                </table>
              </section>
            </div>
            {reportDrilldown && (
              <section className="report-drilldown mt-5 overflow-hidden rounded-xl border border-violet-200 bg-white p-4 shadow-sm">
                {reportDrilldown.type === 'stage' || reportDrilldown.type === 'summary-orders' ? (() => {
                  const summaryOrderFilters = {
                    active: (order) => !['complete', 'pickup_delivered'].includes(order.order_status),
                    completed: (order) => ['complete', 'pickup_delivered'].includes(order.order_status),
                    garments: () => true,
                    current: () => true,
                  }
                  const stageOrders = reportDrilldown.type === 'stage'
                    ? orders.filter((order) => order.order_status === reportDrilldown.key)
                    : orders.filter(summaryOrderFilters[reportDrilldown.key])
                  const title = reportDrilldown.type === 'stage'
                    ? `${stageLabels[reportDrilldown.key] || reportDrilldown.key} orders`
                    : {
                        active: 'Active orders',
                        completed: 'Completed orders',
                        garments: 'Orders included in garment total',
                        current: 'All current orders',
                      }[reportDrilldown.key]
                  return (
                    <>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold">{title}</h3>
                        <button
                          className="text-sm font-medium text-violet-700 hover:text-violet-900"
                          onClick={() => setReportDrilldown(null)}
                          type="button"
                        >
                          Close details
                        </button>
                      </div>
                      {stageOrders.length === 0 ? (
                        <p className="text-sm text-slate-500">No orders are available for this report.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[600px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                              <tr>
                                <th className="px-3 py-2">Order</th>
                                <th className="px-3 py-2">Client</th>
                                <th className="px-3 py-2">Project</th>
                                <th className="px-3 py-2">Quantity</th>
                                <th className="px-3 py-2">Due date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stageOrders.map((order) => (
                                <tr className="border-t border-slate-100" key={order.order_id}>
                                  <td className="px-3 py-2 font-semibold">{order.order_id}</td>
                                  <td className="px-3 py-2">{order.client_company_name || order.client_id}</td>
                                  <td className="px-3 py-2">{order.team_project_name}</td>
                                  <td className="px-3 py-2">{order.total_quantity}</td>
                                  <td className="px-3 py-2">{order.due_date}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )
                })() : (() => {
                  const stationLogs = orders.flatMap((order) =>
                    (order.station_logs || [])
                      .filter((entry) => reportDrilldown.type === 'consumption'
                        ? entry.station === reportDrilldown.key
                        : reportDrilldown.key === 'paper'
                          ? Number(entry.paper_meters) > 0
                          : Boolean(entry.defect_description?.trim()))
                      .map((entry) => ({ ...entry, order })),
                  )
                  const title = reportDrilldown.type === 'consumption'
                    ? `${stageLabels[reportDrilldown.key] || reportDrilldown.key} consumption details`
                    : reportDrilldown.key === 'paper'
                      ? 'Production logs with paper usage'
                      : 'Production logs with recorded defects'
                  return (
                    <>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold">{title}</h3>
                        <button
                          className="text-sm font-medium text-violet-700 hover:text-violet-900"
                          onClick={() => setReportDrilldown(null)}
                          type="button"
                        >
                          Close details
                        </button>
                      </div>
                      {stationLogs.length === 0 ? (
                        <p className="text-sm text-slate-500">No production logs are available for this report.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[800px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                              <tr>
                                <th className="px-3 py-2">Order</th>
                                <th className="px-3 py-2">Fabric used</th>
                                <th className="px-3 py-2">Paper (m)</th>
                                <th className="px-3 py-2">Operator</th>
                                <th className="px-3 py-2">Recorded</th>
                                <th className="px-3 py-2">Defect / issue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stationLogs.map((entry) => (
                                <tr className="border-t border-slate-100" key={entry.id}>
                                  <td className="px-3 py-2">
                                    <span className="font-semibold">{entry.order.order_id}</span>
                                    <span className="block text-xs text-slate-500">{entry.order.team_project_name}</span>
                                  </td>
                                  <td className="px-3 py-2">{entry.fabric_used || '—'}</td>
                                  <td className="px-3 py-2">{Number(entry.paper_meters || 0).toFixed(2)}</td>
                                  <td className="px-3 py-2">{entry.operator || '—'}</td>
                                  <td className="whitespace-nowrap px-3 py-2">{entry.created_at}</td>
                                  <td className="px-3 py-2">{entry.defect_description || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )
                })()}
              </section>
            )}
          </section>
        )}

        {activeView === 'reports' && ['dtf', 'sublimation'].includes(reportTab) && (
          <section className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5">
              <h2 className="text-xl font-bold">
                {reportTab === 'dtf' ? 'DTF consumables' : 'Sublimation consumables'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Stock on hand is calculated from receipts, adjustments, and usage recorded on Printing production logs.
              </p>
            </div>
            {['admin', 'supervisor'].includes(user.role) && (
              <form className="mb-6 grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-3" onSubmit={saveConsumableTransaction}>
                <Field label="Transaction">
                  <select
                    className={inputClass}
                    onChange={(event) => setConsumableForm((current) => ({ ...current, transaction_type: event.target.value }))}
                    value={consumableForm.transaction_type}
                  >
                    <option value="stock_in">Receive stock</option>
                    <option value="adjustment">Adjust stock</option>
                  </select>
                </Field>
                <Field label="Consumable">
                  <select
                    className={inputClass}
                    onChange={(event) => setConsumableForm((current) => ({ ...current, consumable_code: event.target.value }))}
                    required
                    value={consumableForm.consumable_code}
                  >
                    {activeConsumableOptions.map((product) => (
                      <option key={product.code} value={product.code}>{product.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label={`Quantity (${consumableCatalog.find((product) => product.code === consumableForm.consumable_code)?.unit || ''})`}>
                  <input
                    className={inputClass}
                    min={consumableForm.transaction_type === 'stock_in' ? '0.001' : undefined}
                    onChange={(event) => setConsumableForm((current) => ({ ...current, quantity: event.target.value }))}
                    placeholder={consumableForm.transaction_type === 'adjustment' ? 'Use a negative value to reduce stock' : ''}
                    required
                    step="0.001"
                    type="number"
                    value={consumableForm.quantity}
                  />
                </Field>
                <Field label="Date">
                  <input
                    className={inputClass}
                    onChange={(event) => setConsumableForm((current) => ({ ...current, entry_date: event.target.value }))}
                    required
                    type="date"
                    value={consumableForm.entry_date}
                  />
                </Field>
                <Field label={consumableForm.transaction_type === 'adjustment' ? 'Adjustment reason' : 'Note (optional)'}>
                  <input
                    className={inputClass}
                    onChange={(event) => setConsumableForm((current) => ({ ...current, note: event.target.value }))}
                    required={consumableForm.transaction_type === 'adjustment'}
                    value={consumableForm.note}
                  />
                </Field>
                <IconButton
                  className="self-end rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                  disabled={busy}
                  type="submit"
                >
                  {consumableForm.transaction_type === 'stock_in' ? 'Record receipt' : 'Save adjustment'}
                </IconButton>
              </form>
            )}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Consumable</th>
                    <th className="px-3 py-2">Unit</th>
                    <th className="px-3 py-2">Received</th>
                    <th className="px-3 py-2">Used</th>
                    <th className="px-3 py-2">On hand</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleConsumableInventory.map((entry) => (
                    <tr className="border-t border-slate-100" key={entry.code}>
                      <td className="px-3 py-2 font-medium">{entry.label}</td>
                      <td className="px-3 py-2">{entry.unit}</td>
                      <td className="px-3 py-2">{Number(entry.stock_received).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2">{Number(entry.used).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 font-semibold">{Number(entry.on_hand).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="mb-2 mt-6 font-bold">Stock and usage history</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Consumable</th>
                    <th className="px-3 py-2">Transaction</th>
                    <th className="px-3 py-2">Quantity</th>
                    <th className="px-3 py-2">Order</th>
                    <th className="px-3 py-2">Recorded by</th>
                    <th className="px-3 py-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleConsumableTransactions.map((entry) => (
                    <tr className="border-t border-slate-100" key={entry.id}>
                      <td className="whitespace-nowrap px-3 py-2">{entry.entry_date}</td>
                      <td className="px-3 py-2">{entry.consumable_label}</td>
                      <td className="px-3 py-2 capitalize">{entry.transaction_type.replace('_', ' ')}</td>
                      <td className="px-3 py-2">
                        {entry.transaction_type === 'usage' ? '−' : ''}
                        {Number(entry.quantity).toLocaleString(undefined, { maximumFractionDigits: 2 })} {entry.unit}
                      </td>
                      <td className="px-3 py-2">{entry.order_id || '—'}</td>
                      <td className="px-3 py-2">{entry.recorded_by}</td>
                      <td className="px-3 py-2">{entry.note || '—'}</td>
                    </tr>
                  ))}
                  {visibleConsumableTransactions.length === 0 && (
                    <tr><td className="px-3 py-3 text-slate-500" colSpan="7">No stock or usage transactions recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeView === 'clients' && isSalesOrAdmin && (
          <section className="mb-8 scroll-mt-48 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200" id="clients">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Client profiles</h2>
                <p className="mt-1 text-sm text-slate-500">Manage your clients and their contact details.</p>
              </div>
              <IconButton
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                onClick={() => setIsClientModalOpen(true)}
                type="button"
              >
                New client
              </IconButton>
            </div>
            {editingClientId && (
              <form className="mt-6 rounded-lg border border-violet-200 bg-violet-50 p-4" onSubmit={updateClient}>
                <h3 className="font-semibold">Edit client profile</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Field label="Company name">
                    <input className={inputClass} onChange={(e) => setClientEditForm({ ...clientEditForm, company_name: e.target.value })} required value={clientEditForm.company_name} />
                  </Field>
                  <Field label="Contact person">
                    <input className={inputClass} onChange={(e) => setClientEditForm({ ...clientEditForm, contact_person: e.target.value })} required value={clientEditForm.contact_person} />
                  </Field>
                  <Field label="Contact number">
                    <input className={inputClass} onChange={(e) => setClientEditForm({ ...clientEditForm, contact_number: e.target.value })} required value={clientEditForm.contact_number} />
                  </Field>
                  <Field label="Shipping address">
                    <input className={inputClass} onChange={(e) => setClientEditForm({ ...clientEditForm, shipping_address: e.target.value })} required value={clientEditForm.shipping_address} />
                  </Field>
                  {isAdmin && (
                    <Field label="Sales representative">
                      <select
                        className={inputClass}
                        onChange={(event) => setClientEditForm({ ...clientEditForm, sales_rep_id: event.target.value })}
                        required
                        value={clientEditForm.sales_rep_id}
                      >
                        <option value="">Select a sales representative</option>
                        {staff.filter((member) => member.role === 'sales').map((member) => (
                          <option key={member.id} value={String(member.id)}>{member.name}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                  <div className="flex gap-2 md:col-span-2">
                    <IconButton className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white" disabled={busy} type="submit">Save changes</IconButton>
                    <IconButton className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium" onClick={() => setEditingClientId(null)} type="button">Cancel</IconButton>
                  </div>
                </div>
              </form>
            )}
            <label className="mt-5 block max-w-xl text-sm font-medium text-slate-700">
              Search clients
              <input
                aria-label="Search clients by client ID, company name, or contact person"
                className={inputClass}
                onChange={(event) => setClientSearch(event.target.value)}
                placeholder="Client ID, company name, or contact person"
                type="search"
                value={clientSearch}
              />
            </label>
            <div className="mt-4 overflow-x-auto rounded-lg ring-1 ring-slate-200">
              <table className={`w-full ${isAdmin ? 'min-w-[900px]' : 'min-w-[760px]'} text-left text-sm`}>
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr><th className="px-3 py-3">Client ID</th><th className="px-3 py-3">Company</th>{isAdmin && <th className="px-3 py-3">Sales representative</th>}<th className="px-3 py-3">Contact</th><th className="px-3 py-3">Phone</th><th className="px-3 py-3">Shipping address</th><th className="px-3 py-3">Actions</th></tr>
                </thead>
                <tbody>
                  {visibleClients.length === 0 ? (
                    <tr><td className="px-3 py-4 text-slate-500" colSpan={isAdmin ? 7 : 6}>
                      {clients.length === 0 ? 'No client profiles yet.' : 'No clients match your search.'}
                    </td></tr>
                  ) : visibleClients.map((client) => (
                    <tr className="border-t border-slate-100 align-top" key={client.client_id}>
                      <td className="whitespace-nowrap px-3 py-3 font-medium">{client.client_id}</td>
                      <td className="px-3 py-3">{client.company_name}</td>
                      {isAdmin && <td className="px-3 py-3">{client.sales_rep_name || '—'}</td>}
                      <td className="px-3 py-3">{client.contact_person}</td>
                      <td className="whitespace-nowrap px-3 py-3">{client.contact_number}</td>
                      <td className="px-3 py-3">{client.shipping_address}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <IconButton className="whitespace-nowrap rounded border border-violet-300 px-2 py-1 text-xs font-medium text-violet-800 hover:bg-violet-50" onClick={() => openOrderModalForClient(client)} type="button">Create order</IconButton>
                          <IconButton className="rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50" onClick={() => startEditingClient(client)} type="button">Edit</IconButton>
                          <IconButton className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50" disabled={busy} onClick={() => deleteClient(client)} type="button">Delete</IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeView === 'clients' && isSalesOrAdmin && isClientModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) setIsClientModalOpen(false)
            }}
          >
            <section
              aria-labelledby="new-client-title"
              aria-modal="true"
              className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl"
              role="dialog"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold" id="new-client-title">New client</h2>
                  <p className="mt-1 text-sm text-slate-500">Enter the client company and contact details.</p>
                </div>
                <IconButton
                  aria-label="Close new client dialog"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                  onClick={() => setIsClientModalOpen(false)}
                  type="button"
                >
                  Close
                </IconButton>
              </div>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={createClient}>
                <Field label="Company name">
                  <input autoFocus className={inputClass} onChange={(e) => setClientForm({ ...clientForm, company_name: e.target.value })} required value={clientForm.company_name} />
                </Field>
                <Field label="Contact person">
                  <input className={inputClass} onChange={(e) => setClientForm({ ...clientForm, contact_person: e.target.value })} required value={clientForm.contact_person} />
                </Field>
                <Field label="Contact number">
                  <input className={inputClass} inputMode="numeric" onChange={(e) => setClientForm({ ...clientForm, contact_number: e.target.value })} pattern="0[0-9]{10}" required title="Enter an 11-digit contact number starting with 0." type="tel" value={clientForm.contact_number} />
                </Field>
                <Field label="Shipping address">
                  <input className={inputClass} onChange={(e) => setClientForm({ ...clientForm, shipping_address: e.target.value })} required value={clientForm.shipping_address} />
                </Field>
                {isAdmin && (
                  <Field label="Sales representative">
                    <select
                      className={inputClass}
                      onChange={(event) => setClientForm({ ...clientForm, sales_rep_id: event.target.value })}
                      required
                      value={clientForm.sales_rep_id}
                    >
                      <option value="">Select a sales representative</option>
                      {staff.filter((member) => member.role === 'sales').map((member) => (
                        <option key={member.id} value={String(member.id)}>{member.name}</option>
                      ))}
                    </select>
                  </Field>
                )}
                <div className="flex justify-end gap-2 sm:col-span-2">
                  <IconButton
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                    onClick={() => setIsClientModalOpen(false)}
                    type="button"
                  >
                    Cancel
                  </IconButton>
                  <IconButton className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60" disabled={busy} type="submit">
                    Add client
                  </IconButton>
                </div>
              </form>
            </section>
          </div>
        )}

        {activeView === 'clients' && isSalesOrAdmin && isOrderModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeOrderModal()
            }}
          >
            <section
              aria-labelledby="client-order-title"
              aria-modal="true"
              className="my-auto max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-7"
              role="dialog"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold" id="client-order-title">Create production order</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Client: {orderModalClient?.company_name} · Orders saved before the layout fee is paid remain out of the Artist mock-up queue. Down payment applies to sizing. Upload the lineup to calculate quantity.
                  </p>
                </div>
                <IconButton
                  aria-label="Close create order dialog"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                  onClick={closeOrderModal}
                  type="button"
                >
                  Close
                </IconButton>
              </div>
              {pageError && (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {pageError}
                </p>
              )}
              <OrderEntryForm
                busy={busy}
                clients={clients}
                isAdmin={isAdmin}
                isSalesOrAdmin={isSalesOrAdmin}
                machines={machines}
                styleNumberOptions={styleNumberOptions}
                lineupInputKey={lineupInputKey}
                onOpenLineup={openDraftLineupEditor}
                lineupDraft={lineupDraft}
                onCancel={closeOrderModal}
                onSubmit={createOrder}
                orderForm={orderForm}
                selectedClient={orderModalClient}
                setLineupFile={setLineupFile}
                setOrderForm={setOrderForm}
                staff={staff}
                artistOptions={artistOptions}
              />
            </section>
          </div>
        )}

        {activeView === 'settings' && isAdmin && (
          <section className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200" id="settings">
            <h2 className="text-lg font-bold">Production machine settings</h2>
            <p className="mt-1 text-sm text-slate-500">Manage the machine options available during Sales order entry. Machines assigned to an order cannot be renamed or removed.</p>
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              {[
                ['printing', 'Printing machines'],
                ['pressing', 'Pressing machines'],
                ['cutting', 'Cutting machines'],
              ].map(([category, title]) => (
                <div className="rounded-lg border border-slate-200 p-4" key={category}>
                  <h3 className="font-semibold">{title}</h3>
                  <form className="mt-3 flex gap-2" onSubmit={(event) => addMachine(event, category)}>
                    <input
                      aria-label={`New ${title.toLowerCase()} name`}
                      className={inputClass}
                      onChange={(event) => setNewMachineNames((current) => ({ ...current, [category]: event.target.value }))}
                      placeholder="Machine name"
                      required
                      value={newMachineNames[category]}
                    />
                    <IconButton className="mt-1 shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60" disabled={busy} type="submit">Add</IconButton>
                  </form>
                  <ul className="mt-3 divide-y divide-slate-100">
                    {machines.filter((machine) => machine.category === category).map((machine) => (
                      <li className="flex flex-wrap items-center justify-between gap-2 py-2" key={machine.id}>
                        {editingMachineId === machine.id ? (
                          <form className="flex w-full gap-2" onSubmit={(event) => updateMachine(event, machine)}>
                            <input className={inputClass} onChange={(event) => setEditingMachineName(event.target.value)} required value={editingMachineName} />
                            <IconButton className="rounded border border-violet-300 px-2 py-1 text-xs font-medium text-violet-800" disabled={busy} type="submit">Save</IconButton>
                            <IconButton className="rounded border border-slate-300 px-2 py-1 text-xs font-medium" onClick={() => setEditingMachineId(null)} type="button">Cancel</IconButton>
                          </form>
                        ) : (
                          <>
                            <span className="text-sm">{machine.name}</span>
                            <div className="flex gap-2">
                              <IconButton className="rounded border border-slate-300 px-2 py-1 text-xs font-medium" onClick={() => {
                                setEditingMachineId(machine.id)
                                setEditingMachineName(machine.name)
                              }} type="button">Edit</IconButton>
                              <IconButton className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-700" disabled={busy} onClick={() => deleteMachine(machine)} type="button">Delete</IconButton>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                    {machines.every((machine) => machine.category !== category) && (
                      <li className="py-2 text-sm text-slate-500">No machines configured.</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeView === 'settings' && isAdmin && (
          <section className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200" id="style-number">
            <h2 className="text-lg font-bold">Style Number</h2>
            <p className="mt-1 text-sm text-slate-500">
              Maintain the coded product choices shown in the TRD. Order entry combines the selected C1–C7 codes into the style number.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {styleNumberFields.map(({ category, label, code }) => {
                const categoryOptions = styleNumberOptions.filter((option) => option.category === category)
                const formValue = newStyleOptions[category] || { name: '', code: '' }
                return (
                  <div className="rounded-lg border border-slate-200 p-4" key={category}>
                    <h3 className="font-semibold">{label} <span className="text-sm font-normal text-slate-500">({code})</span></h3>
                    <form className="mt-3 grid grid-cols-[minmax(0,1fr)_5rem_auto] gap-2" onSubmit={(event) => addStyleOption(event, category)}>
                      <input
                        aria-label={`${label} option name`}
                        className={inputClass}
                        onChange={(event) => setNewStyleOptions((current) => ({
                          ...current,
                          [category]: { ...formValue, name: event.target.value },
                        }))}
                        placeholder="Name"
                        required
                        value={formValue.name}
                      />
                      <input
                        aria-label={`${label} option code`}
                        className={inputClass}
                        maxLength="6"
                        onChange={(event) => setNewStyleOptions((current) => ({
                          ...current,
                          [category]: { ...formValue, code: event.target.value.toUpperCase() },
                        }))}
                        placeholder="Code"
                        required
                        value={formValue.code}
                      />
                      <IconButton className="mt-1 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60" disabled={busy} type="submit">
                        Add
                      </IconButton>
                    </form>
                    <div className="mt-3 max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                          <tr><th className="px-2 py-2">Product option</th><th className="px-2 py-2">{code}</th><th className="px-2 py-2">Action</th></tr>
                        </thead>
                        <tbody>
                          {categoryOptions.map((option) => (
                            <tr className="border-t border-slate-100" key={option.id}>
                              <td className="px-2 py-2">{option.name}</td>
                              <td className="px-2 py-2 font-mono">{option.code}</td>
                              <td className="px-2 py-2">
                                <IconButton
                                  className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                                  disabled={busy}
                                  onClick={() => deleteStyleOption(option)}
                                  type="button"
                                >
                                  Remove
                                </IconButton>
                              </td>
                            </tr>
                          ))}
                          {categoryOptions.length === 0 && (
                            <tr><td className="px-2 py-3 text-slate-500" colSpan="3">No options configured.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {activeView === 'settings' && isAdmin && (
          <section className="mb-8 scroll-mt-48 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200" id="staff">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Staff and user accounts</h2>
                <p className="mt-1 text-sm text-slate-500">Admin creates accounts, assigns roles, and manages existing users. The protected bootstrap administrator cannot be edited or deleted.</p>
              </div>
              <IconButton
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                onClick={openNewStaffModal}
                type="button"
              >
                Add user
              </IconButton>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Name</th><th>Username</th><th>Role</th><th>Business unit</th><th>Station</th><th>Actions</th></tr></thead>
                <tbody>{staff.map((member) => (
                  <tr className="border-t border-slate-100" key={member.id}>
                    <td className="py-2">{member.name}</td>
                    <td>{member.username}</td>
                    <td>{roleLabels[member.role] || member.role}</td>
                    <td>{member.business_unit === 'dtf' ? 'Massprints · DTF' : member.business_unit === 'sublimation' ? 'B-POWER · Sublimation' : '—'}</td>
                    <td>{member.assigned_station || '—'}</td>
                    <td>
                      {member.is_protected ? (
                        <span className="text-xs font-medium text-slate-500">Protected</span>
                      ) : member.id === user.id ? (
                        <span className="text-xs font-medium text-slate-500">Current account</span>
                      ) : (
                        <div className="flex gap-2">
                          <IconButton className="rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50" onClick={() => startEditingStaff(member)} type="button">
                            Edit
                          </IconButton>
                          <IconButton className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50" disabled={busy} onClick={() => deleteStaff(member)} type="button">
                            Delete
                          </IconButton>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500">Accounts linked to client, order, or production history cannot be deleted, to preserve those records.</p>
          </section>
        )}

        {activeView === 'settings' && isAdmin && isStaffModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeStaffModal()
            }}
          >
            <section
              aria-labelledby="staff-modal-title"
              aria-modal="true"
              className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
              role="dialog"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold" id="staff-modal-title">
                    {editingStaffId === null ? 'Add user' : 'Edit user account'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {editingStaffId === null
                      ? 'Enter the new user details and assign a role.'
                      : 'Update account details or set a password for the next sign-in.'}
                  </p>
                </div>
                <IconButton
                  aria-label="Close user account dialog"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                  onClick={closeStaffModal}
                  type="button"
                >
                  Close
                </IconButton>
              </div>
              {pageError && (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {pageError}
                </p>
              )}
              {editingStaffId === null ? (
                <form className="grid gap-3 md:grid-cols-3" onSubmit={createStaff}>
                  <Field label="Name">
                    <input autoFocus className={inputClass} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} required value={staffForm.name} />
                  </Field>
                  <Field label="Username">
                    <input autoComplete="username" className={inputClass} onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })} required value={staffForm.username} />
                  </Field>
                  <Field label="Initial password (8+ characters)">
                    <input className={inputClass} minLength="8" onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} required type="password" value={staffForm.password} />
                  </Field>
                  <Field label="Role">
                    <select className={inputClass} onChange={(e) => setStaffForm((current) => ({
                      ...current,
                      role: e.target.value,
                      business_unit: e.target.value === 'supervisor' ? current.business_unit || 'dtf' : '',
                    }))} value={staffForm.role}>
                      {Object.entries(roleLabels).map(([role, label]) => <option key={role} value={role}>{label}</option>)}
                    </select>
                  </Field>
                  {staffForm.role === 'supervisor' && (
                    <Field label="Supervisor reports">
                      <select className={inputClass} onChange={(e) => setStaffForm((current) => ({ ...current, business_unit: e.target.value }))} required value={staffForm.business_unit}>
                        <option value="dtf">Massprints · DTF</option>
                        <option value="sublimation">B-POWER · Sublimation</option>
                      </select>
                    </Field>
                  )}
                  <div className="flex items-end gap-2 md:col-span-2">
                    <IconButton className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60" disabled={busy} type="submit">
                      Create account
                    </IconButton>
                    <IconButton className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50" onClick={closeStaffModal} type="button">
                      Cancel
                    </IconButton>
                  </div>
                </form>
              ) : (
                <form className="grid gap-3 md:grid-cols-2" onSubmit={updateStaff}>
                  <Field label="Name">
                    <input autoFocus className={inputClass} onChange={(e) => setStaffEditForm({ ...staffEditForm, name: e.target.value })} required value={staffEditForm.name} />
                  </Field>
                  <Field label="Username">
                    <input autoComplete="username" className={inputClass} onChange={(e) => setStaffEditForm({ ...staffEditForm, username: e.target.value })} required value={staffEditForm.username} />
                  </Field>
                  <Field label="Role">
                    <select className={inputClass} onChange={(e) => setStaffEditForm((current) => ({
                      ...current,
                      role: e.target.value,
                      business_unit: e.target.value === 'supervisor' ? current.business_unit || 'dtf' : '',
                    }))} value={staffEditForm.role}>
                      {Object.entries(roleLabels).map(([role, label]) => <option key={role} value={role}>{label}</option>)}
                    </select>
                  </Field>
                  {staffEditForm.role === 'supervisor' && (
                    <Field label="Supervisor reports">
                      <select className={inputClass} onChange={(e) => setStaffEditForm((current) => ({ ...current, business_unit: e.target.value }))} required value={staffEditForm.business_unit}>
                        <option value="dtf">Massprints · DTF</option>
                        <option value="sublimation">B-POWER · Sublimation</option>
                      </select>
                    </Field>
                  )}
                  <Field label="Reset password (optional, 8+ characters)">
                    <input autoComplete="new-password" className={inputClass} minLength="8" onChange={(e) => setStaffEditForm({ ...staffEditForm, password: e.target.value })} type="password" value={staffEditForm.password} />
                  </Field>
                  <div className="flex justify-end gap-2 md:col-span-2">
                    <IconButton className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50" onClick={closeStaffModal} type="button">
                      Cancel
                    </IconButton>
                    <IconButton className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60" disabled={busy} type="submit">
                      Save changes
                    </IconButton>
                  </div>
                  <p className="text-xs text-slate-600 md:col-span-2">Resetting a password requires the user to change it at their next sign-in.</p>
                </form>
              )}
            </section>
          </div>
        )}

        {activeView === 'printing' && ['admin', 'print_operator'].includes(user.role) && (
          <nav aria-label="Printing stages" className="mb-4 flex flex-wrap gap-2">
            {[
              ['printing', 'Printing', orders.filter((order) => order.order_status === 'printing').length],
              ['reprints', 'Reprints', visibleReprints.length],
              ['test_prints', 'Test Print', visibleTestPrintJobs.length],
            ].map(([stage, label, count]) => (
              <IconButton
                aria-current={printingStage === stage ? 'page' : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-medium ring-1 ${
                  printingStage === stage
                    ? 'bg-violet-600 text-white ring-violet-600'
                    : 'bg-white text-slate-700 ring-slate-200'
                }`}
                key={stage}
                onClick={() => setPrintingStage(stage)}
                type="button"
              >
                {label} <span className="ml-1 text-xs">({count})</span>
              </IconButton>
            ))}
          </nav>
        )}

        {(isPrintingReprints || isPrintingTestPrints) && (
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{queueTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {isStationRole
                  ? 'Log consumables and defects, then hand the order to the next station.'
                  : 'Orders move through the TRD production stages in sequence.'}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-600 ring-1 ring-slate-200">
              {isPrintingReprints
                ? `${visibleReprints.length} job(s)`
                : `${visibleTestPrintJobs.length} request(s)`}
            </span>
          </div>
        )}

        {isPrintingTestPrints && ['admin', 'print_operator'].includes(user.role) && (
          <section className="mb-8 scroll-mt-48 rounded-xl border border-cyan-200 bg-cyan-50 p-5" id="test-prints">
            <h2 className="font-bold text-cyan-950">Test print requests</h2>
            <p className="mt-1 text-sm text-cyan-900">Mock-ups submitted by Artists appear here for Printing.</p>
            <ul className="mt-4 space-y-2">
              {visibleTestPrintJobs.length === 0 ? (
                <li className="rounded-lg bg-white p-3 text-sm text-slate-500">
                  {testPrintJobs.length === 0
                    ? 'There are no open test print requests.'
                    : 'No test print requests match the selected printing machine or search.'}
                </li>
              ) : visibleTestPrintJobs.map((job) => (
                <li className="rounded-lg bg-white p-4" key={job.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{job.order_id} · {job.team_project_name}</p>
                      <p className="text-sm text-slate-600">Artist: {job.artist_name} · Due {job.due_date}</p>
                      <p className="text-xs capitalize text-slate-500">Status: {job.status.replace('_', ' ')} · Requested {job.created_at}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a className="rounded border border-cyan-300 px-3 py-2 text-sm font-medium text-cyan-900 hover:bg-cyan-50" href={`/api/test-prints/${job.id}/mockup`} rel="noreferrer" target="_blank">
                        Open mock-up
                      </a>
                      {job.status === 'open' && (
                        <IconButton className="rounded bg-cyan-700 px-3 py-2 text-sm font-semibold text-white" disabled={busy} onClick={() => updateTestPrint(job.id, 'start')} type="button">
                          Start test print
                        </IconButton>
                      )}
                      <IconButton className="rounded border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-800" disabled={busy} onClick={() => updateTestPrint(job.id, 'complete')} type="button">
                        Complete
                      </IconButton>
                    </div>
                  </div>
                  <Field label="Note for Pressing (optional)">
                    <textarea
                      className={inputClass}
                      maxLength={1000}
                      onChange={(event) => setPressingNotes((current) => ({
                        ...current,
                        [`test-print-${job.id}`]: event.target.value,
                      }))}
                      rows="2"
                      value={pressingNotes[`test-print-${job.id}`] || ''}
                    />
                  </Field>
                </li>
              ))}
            </ul>
          </section>
        )}

        {isPrintingReprints && ['admin', 'print_operator'].includes(user.role) && (
          <section className="mb-8 scroll-mt-48 rounded-xl border border-amber-200 bg-amber-50 p-5" id="reprints">
            <h2 className="font-bold text-amber-950">Open reprint jobs</h2>
            <p className="mt-1 text-sm text-amber-900">These remain available to Printing even after the main order advances.</p>
            <ul className="mt-4 space-y-2">
              {visibleReprints.length === 0 ? (
                <li className="rounded-lg bg-white p-3 text-sm text-slate-500">
                  {reprints.length === 0
                    ? 'There are no open reprint jobs.'
                    : 'No reprint jobs match the selected printing machine or search.'}
                </li>
              ) : visibleReprints.map((job) => (
                <li className="rounded-lg bg-white p-4" key={job.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{job.order_id} · {job.team_project_name}</p>
                      <p className="text-sm text-slate-600">Fabric: {job.fabric_used || '—'}</p>
                      <p className="text-sm text-slate-600">Reason for reprint: {job.defect_description || '—'}</p>
                      <p className="text-xs text-slate-500">Main order stage: {stageLabels[job.order_status]}</p>
                    </div>
                    <div className="flex gap-2">
                      {job.status === 'open' && <IconButton className="rounded bg-amber-600 px-3 py-2 text-sm font-semibold text-white" disabled={busy} onClick={() => updateReprint(job.id, 'start')} type="button">Start reprint</IconButton>}
                      <IconButton className="rounded border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-800" disabled={busy} onClick={() => updateReprint(job.id, 'complete')} type="button">Complete</IconButton>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Field label="Note for Pressing (optional)">
                      <textarea
                        className={inputClass}
                        maxLength={1000}
                        onChange={(event) => setPressingNotes((current) => ({
                          ...current,
                          [`reprint-${job.id}`]: event.target.value,
                        }))}
                        rows="2"
                        value={pressingNotes[`reprint-${job.id}`] || ''}
                      />
                    </Field>
                  </div>
                  <div className="mt-3 grid gap-3 rounded-lg bg-amber-50 p-3 md:grid-cols-4">
                    {(() => {
                      const formKey = `reprint-${job.id}`
                      const form = stationForms[formKey] || {
                        fabric_used: '',
                        defect_description: '',
                        consumable_process: 'sublimation',
                        consumable_brand: 'atexco',
                        consumable_usage: {},
                      }
                      return (
                        <>
                          <Field label="Fabric used">
                            <input className={inputClass} onChange={(event) => setStationForms((current) => ({
                              ...current,
                              [formKey]: { ...form, fabric_used: event.target.value },
                            }))} value={form.fabric_used} />
                          </Field>
                          <Field label="Print process">
                            <select className={inputClass} onChange={(event) => setStationForms((current) => ({
                              ...current,
                              [formKey]: { ...form, consumable_process: event.target.value },
                            }))} value={form.consumable_process}>
                              <option value="sublimation">Sublimation</option>
                              <option value="dtf">DTF</option>
                            </select>
                          </Field>
                          {form.consumable_process !== 'dtf' && (
                            <Field label="Sublimation brand">
                              <select className={inputClass} onChange={(event) => setStationForms((current) => ({
                                ...current,
                                [formKey]: { ...form, consumable_brand: event.target.value },
                              }))} value={form.consumable_brand}>
                                <option value="atexco">Atexco</option>
                                <option value="creons">Creons</option>
                              </select>
                            </Field>
                          )}
                          {consumableCatalog
                            .filter((product) => {
                              if (product.business_unit !== (form.consumable_process === 'dtf' ? 'dtf' : 'sublimation')) return false
                              if (product.legacy) return false
                              if (product.business_unit === 'sublimation' && product.code.startsWith('subli_ink_')) {
                                return product.code.endsWith(`_${form.consumable_brand || 'atexco'}`)
                              }
                              return true
                            })
                            .map((product) => (
                              <Field key={product.code} label={`${product.label} used (${product.unit})`}>
                                <input
                                  className={inputClass}
                                  min="0"
                                  onChange={(event) => setStationForms((current) => ({
                                    ...current,
                                    [formKey]: {
                                      ...form,
                                      consumable_usage: {
                                        ...form.consumable_usage,
                                        [product.code]: event.target.value,
                                      },
                                    },
                                  }))}
                                  step="0.001"
                                  type="number"
                                  value={form.consumable_usage?.[product.code] || ''}
                                />
                              </Field>
                            ))}
                          <Field label="Defect / production issue">
                            <input className={inputClass} onChange={(event) => setStationForms((current) => ({
                              ...current,
                              [formKey]: { ...form, defect_description: event.target.value },
                            }))} value={form.defect_description} />
                          </Field>
                          <IconButton className="self-end rounded border border-amber-700 px-3 py-2 text-sm font-semibold text-amber-900" disabled={busy || job.status === 'complete'} onClick={() => logReprintProduction(job)} type="button">Log production / defect</IconButton>
                        </>
                      )
                    })()}
                  </div>
                  {job.image_path && (
                    <img
                      alt={`Reprint image for ${job.team_project_name}`}
                      className="mt-3 max-h-64 max-w-full rounded-lg border border-amber-200 object-contain"
                      src={`/api/reprints/${job.id}/image`}
                    />
                  )}
                  {job.station_logs.length > 0 && (
                    <ul className="mt-3 space-y-1 text-xs text-slate-600">
                      {job.station_logs.map((entry) => (
                        <li key={entry.id}>
                          {entry.fabric_used && `Fabric: ${entry.fabric_used} · `}
                          {entry.paper_meters} m paper · {entry.operator} · {entry.created_at}
                          {entry.defect_description && <span className="block text-amber-800">Defect: {entry.defect_description}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {showingFabricInventory && canEditFabricInventory && (
          <section className="mx-auto mb-6 w-full px-4 sm:px-6 lg:px-8" aria-labelledby="fabric-inventory-title">
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold" id="fabric-inventory-title">Fabric inventory</h2>
                  <p className="mt-1 text-sm text-slate-500">Record roll quantities and calculated total meters. Entries refresh automatically for Pressing, Admin, and the B-POWER Supervisor.</p>
                </div>
                <IconButton
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => openFabricEntryModal()}
                  type="button"
                >
                  Add fabric
                </IconButton>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Filter by date">
                  <input
                    className={inputClass}
                    onChange={(event) => setFabricFilters((current) => ({ ...current, date: event.target.value }))}
                    type="date"
                    value={fabricFilters.date}
                  />
                </Field>
                <Field label="Filter by fabric">
                  <input
                    className={inputClass}
                    onChange={(event) => setFabricFilters((current) => ({ ...current, fabric: event.target.value }))}
                    placeholder="Search fabric name"
                    value={fabricFilters.fabric}
                  />
                </Field>
              </div>
              <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Fabric</th>
                      <th className="px-3 py-2">GSM</th>
                      <th className="px-3 py-2">Roll qty</th>
                      <th className="px-3 py-2">Unit</th>
                      <th className="px-3 py-2">Measurement</th>
                      <th className="px-3 py-2">Total meter</th>
                      <th className="px-3 py-2">Updated by</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleFabricEntries.length === 0 ? (
                      <tr>
                        <td className="px-3 py-4 text-slate-500" colSpan="9">
                          {fabricEntries.length ? 'No fabric entries match these filters.' : 'No fabric entries recorded.'}
                        </td>
                      </tr>
                    ) : visibleFabricEntries.map((entry) => (
                      <tr className="border-t border-slate-100" key={entry.id}>
                        <td className="whitespace-nowrap px-3 py-2">{entry.entry_date}</td>
                        <td className="px-3 py-2 font-medium">{entry.fabric}</td>
                        <td className="px-3 py-2">{entry.gsm}</td>
                        <td className="px-3 py-2">{entry.roll_quantity}</td>
                        <td className="px-3 py-2">{entry.measurement_type === 'meter' ? 'Meter' : 'Kilo/grams'}</td>
                        <td className="px-3 py-2">
                          {entry.measurement_type === 'meter'
                            ? `${Number(entry.meters_per_roll).toLocaleString()} m / roll`
                            : `${Number(entry.kilo_per_meter).toLocaleString()} m / kg · ${Number(entry.kilo_per_roll).toLocaleString()} kg / roll`}
                        </td>
                        <td className="px-3 py-2 font-semibold">{Number(entry.total_meter).toLocaleString(undefined, { maximumFractionDigits: 2 })} m</td>
                        <td className="px-3 py-2">{entry.updated_by_name || '—'}</td>
                        <td className="px-3 py-2">
                          <IconButton
                            className="rounded border border-violet-300 px-3 py-1.5 text-xs font-semibold text-violet-800 hover:bg-violet-50"
                            onClick={() => openFabricEntryModal(entry)}
                            type="button"
                          >
                            Edit
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-slate-500">{visibleFabricEntries.length} fabric record(s)</p>
            </div>
          </section>
        )}

        {orderViews.has(activeView) &&
          !(activeView === 'pressing' && pressingProcess === 'fabric') && (
        <section className="scroll-mt-48" id="dashboard">
          {!isPrintingReprints && !isPrintingTestPrints && (
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{queueTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {isStationRole
                  ? 'Log consumables and defects, then hand the order to the next station.'
                  : 'Orders move through the TRD production stages in sequence.'}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-600 ring-1 ring-slate-200">
              {isPrintingReprints
                ? `${visibleReprints.length} job(s)`
                : isPrintingTestPrints
                  ? `${visibleTestPrintJobs.length} request(s)`
                  : `${visibleOrders.length} order(s)`}
            </span>
          </div>
          )}
          {isArtistMockupQueue && (
            <nav aria-label="Artist mock-up stages" className="mb-4 flex flex-wrap gap-2">
              {[
                ['creating', 'Creating Mock-up'],
                ['for-approval', 'For Approval'],
                ['revision', 'Revision'],
              ].map(([stage, label]) => {
                const count = orders.filter((order) => {
                  if (stage === 'for-approval') return order.order_status === 'sales_approval'
                  if (stage === 'revision') return order.order_status === 'mockup' && Boolean(order.mockup_path)
                  return order.order_status === 'mockup' && !order.mockup_path
                }).length
                return (
                  <IconButton
                    aria-current={artistMockupStage === stage ? 'page' : undefined}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ring-1 ${
                      artistMockupStage === stage
                        ? 'bg-violet-600 text-white ring-violet-600'
                        : 'bg-white text-slate-700 ring-slate-200'
                    }`}
                    key={stage}
                    onClick={() => setArtistMockupStage(stage)}
                    type="button"
                  >
                    {label} <span className="ml-1 text-xs">({count})</span>
                  </IconButton>
                )
              })}
            </nav>
          )}
          {isPrintingReprints || isPrintingTestPrints ? null : activeView === 'all' && (isSalesOrAdmin || isArtist) ? (
            <>
              {editingOrderId && isSalesOrAdmin && (
                <form className="mb-5 rounded-xl border border-violet-200 bg-white p-5 shadow-sm" onSubmit={updateOrder}>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold">Edit order {editingOrderId}</h3>
                      <p className="text-sm text-slate-500">Edit this order at any stage. Saving changes will not change its current production stage.</p>
                    </div>
                    <IconButton className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={() => setEditingOrderId(null)} type="button">Cancel</IconButton>
                  </div>
                  <OrderEditFields
                    clients={isAdmin
                      ? clients
                      : clients.filter((client) => client.sales_rep_id === Number(
                        orders.find((entry) => entry.order_id === editingOrderId)?.sales_rep_id,
                      ))}
                    form={orderEditForm}
                    artistOptions={artistOptions}
                    includeFinancials={isSalesOrAdmin}
                    isAdmin={isAdmin}
                    machines={machines}
                    styleNumberOptions={styleNumberOptions}
                    onChange={(name, value) => setOrderEditForm((current) => {
                      if (name === 'sales_rep_id') {
                        return { ...current, sales_rep_id: value }
                      }
                      if (name === 'layout_fee' && Number(value) < paidLayoutFeeThreshold) {
                        return {
                          ...current,
                          layout_fee: value,
                          down_payment: '0',
                          assigned_artist_id: '',
                          printer_machine: '',
                          pressing_machine: '',
                          cutting_machine: '',
                        }
                      }
                      return { ...current, [name]: value }
                    })}
                    staff={staff}
                  />
                  <IconButton className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white" disabled={busy} type="submit">Save order</IconButton>
                </form>
              )}
              {visibleOrders.length === 0 ? (
                <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200">
                  {orders.length === 0
                    ? 'No orders are currently assigned to your workspace.'
                    : 'No orders match your search.'}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                  <table className={`w-full ${isArtist ? 'min-w-[1050px]' : 'min-w-[1400px]'} text-left text-sm`}>
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-3">Order ID</th>
                        <th className="px-3 py-3">Client</th>
                        <th className="px-3 py-3">Project</th>
                        <th className="px-3 py-3">Style / item</th>
                        {isArtist
                          ? <th className="px-3 py-3">Assigned to</th>
                          : <><th className="px-3 py-3">Artist</th><th className="px-3 py-3">Sales representative</th></>}
                        <th className="px-3 py-3">Quantity</th>
                        <th className="px-3 py-3">Due date</th>
                        <th className="px-3 py-3">TRD stage</th>
                        <th className="px-3 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleOrders.map((order) => {
                        const client = clients.find((entry) => entry.client_id === order.client_id)
                        const lineupEnabled = isSalesOrAdmin && Number(order.down_payment) >= paidLayoutFeeThreshold
                        return (
                          <tr
                            className={`border-t border-slate-100 align-top ${
                              order.order_status === 'pickup_delivered' ? 'cursor-pointer hover:bg-violet-50' : ''
                            }`}
                            key={order.order_id}
                            onDoubleClick={(event) => {
                              if (order.order_status !== 'pickup_delivered' ||
                                event.target.closest('button, a')) return
                              openCompletedOrderDetails(order)
                            }}
                            title={order.order_status === 'pickup_delivered'
                              ? 'Double-click to view completed order details and consumption'
                              : undefined}
                          >
                            <td className="whitespace-nowrap px-3 py-3 font-semibold">{order.order_id}</td>
                            <td className="px-3 py-3">{client?.company_name || order.client_company_name || order.client_id}</td>
                            <td className="px-3 py-3">{order.team_project_name}</td>
                            <td className="px-3 py-3">{order.style_number} · {order.item}</td>
                            {isArtist
                              ? <td className="px-3 py-3">{user.name}</td>
                              : <>
                                  <td className="px-3 py-3">{staff.find((member) => member.id === order.assigned_artist_id)?.name || '—'}</td>
                                  <td className="px-3 py-3">{order.sales_rep_id === user.id ? user.name : staff.find((member) => member.id === order.sales_rep_id)?.name || '—'}</td>
                                </>}
                            <td className="px-3 py-3">{order.total_quantity}</td>
                            <td className="whitespace-nowrap px-3 py-3">{order.due_date}</td>
                            <td className="px-3 py-3"><span className="rounded-full bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-800">{order.order_status === 'mockup' && isSalesOrAdmin && Number(order.layout_fee) < paidLayoutFeeThreshold ? 'Awaiting layout fee' : stageLabels[order.order_status]}</span></td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-2">
                                {isSalesOrAdmin ? (
                                  <>
                                    <IconButton className="rounded border border-cyan-300 px-2 py-1 text-xs font-medium text-cyan-800 hover:bg-cyan-50 disabled:opacity-50" disabled={!lineupEnabled} onClick={() => openLineupEditor(order)} title={lineupEnabled ? 'Edit lineup' : 'Down payment must be at least 1 to edit the lineup'} type="button">Lineup</IconButton>
                                    <IconButton className="rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50" onClick={() => {
                                      if (!printOrder(order.order_id)) {
                                        setPageError('Allow pop-ups to print the physical order form.')
                                      }
                                    }} type="button">Print</IconButton>
                                    <IconButton className="rounded border border-violet-300 px-2 py-1 text-xs font-medium text-violet-800 hover:bg-violet-50" onClick={() => startEditingOrder(order)} type="button">Edit</IconButton>
                                    <IconButton className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50" disabled={busy} onClick={() => deleteOrder(order)} type="button">Delete</IconButton>
                                  </>
                                ) : (
                                  <>
                                    {order.spreadsheet_path && (
                                      <IconButton className="rounded border border-cyan-300 px-2 py-1 text-xs font-medium text-cyan-800 hover:bg-cyan-50" onClick={() => openLineupEditor(order)} type="button">Open lineup</IconButton>
                                    )}
                                    {order.mockup_path && (
                                      <a className="rounded border border-violet-300 px-2 py-1 text-xs font-medium text-violet-800 hover:bg-violet-50" href={`/api/orders/${order.order_id}/files/mockup`} rel="noreferrer" target="_blank">Review mock-up</a>
                                    )}
                                    {!order.spreadsheet_path && !order.mockup_path && (
                                      <span className="text-xs text-slate-500">No files uploaded</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : visibleOrders.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              {orders.length > 0 && normalizedOrderSearch
                ? 'No orders match your search.'
                : activeView === 'all'
                  ? 'No orders are currently assigned to your workspace.'
                  : `No orders are currently in the ${stageLabels[activeView]} stage.`}
            </div>
          ) : (
            <div className="space-y-4">
              {visibleOrders.map((order) => {
                const activeIndex = stageSequence.indexOf(order.order_status)
                const showOrderDetails =
                  isArtistMockupQueue ||
                  (
                    activeIndex >= stageSequence.indexOf('sales_approval') &&
                    activeIndex <= stageSequence.indexOf('pickup_delivered')
                  )
                const canWorkStation =
                  isAdmin ||
                  (stationByRole[user.role] && order.order_status === stationByRole[user.role])
                const stationForm = stationForms[order.order_id] || {
                  fabric_used: '',
                  paper_meters: '',
                  defect_description: '',
                  consumable_process: 'sublimation',
                  consumable_brand: 'atexco',
                  consumable_usage: {},
                  reprint_image: null,
                }
                const pressingNoteLabels = {
                  stage_completed: 'Printing',
                  reprint_completed: 'Reprint',
                  test_print_completed: 'Test Print',
                }
                const stationWithoutProductionLog = ['pressing', 'cutting', 'sewing', 'packing'].includes(order.order_status)

                return (
                  <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200" key={order.order_id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">{order.order_id} · {order.style_number}</p>
                        <h3 className="mt-1 text-lg font-bold">{order.team_project_name}</h3>
                        <p className="mt-1 text-sm text-slate-600">{order.item} · {order.category} · {order.total_quantity} pieces · Due {order.due_date}</p>
                      </div>
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-800">
                        {order.order_status === 'mockup' && isSalesOrAdmin && Number(order.layout_fee) < paidLayoutFeeThreshold
                          ? 'Awaiting layout fee'
                          : stageLabels[order.order_status]}
                      </span>
                    </div>

                    {activeView === 'pressing' && order.pressing_notes?.length > 0 && (
                      <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <h4 className="text-sm font-bold text-amber-950">Notes for Pressing</h4>
                        <ul className="mt-2 space-y-2 text-sm text-amber-950">
                          {order.pressing_notes.map((entry) => (
                            <li className="border-t border-amber-200 pt-2 first:border-0 first:pt-0" key={`${entry.event_type}-${entry.created_at}`}>
                              <span className="font-semibold">{pressingNoteLabels[entry.event_type] || 'Print'}:</span>{' '}
                              {entry.details}
                              <span className="mt-1 block text-xs text-amber-800">{entry.actor_name} · {entry.created_at}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {showOrderDetails ? (
                      <section className="mt-4 rounded-lg border border-slate-200 p-4">
                        <h4 className="text-sm font-bold">Order details</h4>
                        <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                          {[
                            ['Client', order.client_company_name || order.client_id],
                            ['Team / project', order.team_project_name],
                            ['Due date', order.due_date],
                            ['Style number', order.style_number],
                            ['Item', order.item],
                            ['Product category', order.category],
                            ['Fabric / GSM', `${order.fabric} / ${order.gsm} GSM`],
                            ['Quantity', `${order.total_quantity} pieces`],
                            ['Assigned artist', staff.find((member) => member.id === order.assigned_artist_id)?.name || (order.assigned_artist_id === user.id ? user.name : '—')],
                            ['Sales representative', staff.find((member) => member.id === order.sales_rep_id)?.name || (order.sales_rep_id === user.id ? user.name : '—')],
                            ['Printer machine', order.printer_machine || '—'],
                            ['Pressing machine', order.pressing_machine || '—'],
                            ['Cutting machine', order.cutting_machine || '—'],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <dt className="text-xs font-medium text-slate-500">{label}</dt>
                              <dd className="mt-1 font-medium">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    ) : (
                      <ol className="mt-4 grid grid-cols-4 gap-1 sm:grid-cols-8">
                        {stageSequence.map((stage, index) => (
                          <li className={`rounded px-1 py-2 text-center text-[10px] sm:text-xs ${index <= activeIndex ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`} key={stage}>
                            {stageLabels[stage]}
                          </li>
                        ))}
                      </ol>
                    )}

                    {activeView === 'complete' && isSalesOrAdmin && (
                      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label={`Packed pieces (must equal ${order.total_quantity})`}>
                          <input
                            className={inputClass}
                            max={order.total_quantity}
                            min={order.total_quantity}
                            onChange={(event) => setPackedQuantityForms((current) => ({
                              ...current,
                              [order.order_id]: {
                                ...current[order.order_id],
                                packed_quantity: event.target.value,
                              },
                            }))}
                            required
                            step="1"
                            type="number"
                            value={packedQuantityForms[order.order_id]?.packed_quantity ??
                              (order.packed_quantity == null ? '' : String(order.packed_quantity))}
                          />
                        </Field>
                        <Field label="Per-piece price">
                          <input
                            className={inputClass}
                            min="0"
                            onChange={(event) => setPackedQuantityForms((current) => ({
                              ...current,
                              [order.order_id]: {
                                ...current[order.order_id],
                                per_piece_price: event.target.value,
                              },
                            }))}
                            required
                            step="0.001"
                            type="number"
                            value={packedQuantityForms[order.order_id]?.per_piece_price ??
                              (order.per_piece_price == null ? '' : String(order.per_piece_price))}
                          />
                        </Field>
                        {(() => {
                          const rawPrice = packedQuantityForms[order.order_id]?.per_piece_price ??
                            (order.per_piece_price == null ? '' : String(order.per_piece_price))
                          const perPiecePrice = Number(rawPrice)
                          const totalAmount = perPiecePrice * Number(order.total_quantity)
                          const paidAmount = Number(order.layout_fee || 0) + Number(order.down_payment || 0)
                          const balanceAmount = totalAmount - paidAmount
                          const formatAmount = (amount) =>
                            Number.isFinite(amount) ? amount.toFixed(2) : '—'
                          const validPrice =
                            rawPrice !== '' && Number.isFinite(perPiecePrice) && perPiecePrice >= 0
                          return (
                            <>
                              <Field label="Total amount">
                                <output className="mt-1 block rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold">
                                  {validPrice
                                    ? formatAmount(totalAmount)
                                    : '—'}
                                </output>
                              </Field>
                              <Field label="Balance amount">
                                <output className="mt-1 block rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold">
                                  {validPrice
                                    ? formatAmount(balanceAmount)
                                    : '—'}
                                </output>
                                <span className="mt-1 block text-xs text-slate-500">
                                  Total minus layout fee and down payment.
                                </span>
                              </Field>
                            </>
                          )
                        })()}
                        <IconButton
                          className="self-end rounded bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                          disabled={busy}
                          onClick={() => savePackedQuantity(order)}
                          type="button"
                        >
                          Save packed pieces
                        </IconButton>
                      </div>
                    )}

                    {!showOrderDetails && (
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                        <span>Client: {clients.find((client) => client.client_id === order.client_id)?.company_name || order.client_id}</span>
                        <span>Fabric: {order.fabric} {order.gsm} GSM</span>
                        <span>Artist ID: {order.assigned_artist_id || 'Unassigned'}</span>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {order.spreadsheet_path &&
                        activeView === 'printing' &&
                        ['admin', 'print_operator'].includes(user.role) && (
                        <IconButton
                          className="rounded border border-cyan-300 px-3 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-50"
                          onClick={() => openLineupEditor(order)}
                          type="button"
                        >
                          Open lineup
                        </IconButton>
                      )}
                      {order.spreadsheet_path &&
                        activeView === 'complete' &&
                        ['admin', 'sales', 'artist'].includes(user.role) && (
                        <IconButton
                          className="rounded border border-cyan-300 px-3 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-50"
                          onClick={() => openLineupEditor(order)}
                          type="button"
                        >
                          Open lineup
                        </IconButton>
                      )}
                      {order.spreadsheet_path &&
                        !isSalesOrAdmin &&
                        !isArtistMockupQueue &&
                        !isArtistSizingQueue &&
                        activeView !== 'printing' &&
                        activeView !== 'complete' && (
                        <a className="rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50" href={`/api/orders/${order.order_id}/files/lineup`} rel="noreferrer" target="_blank">
                          Open lineup
                        </a>
                      )}
                      {order.mockup_path && (
                        <a className="rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50" href={`/api/orders/${order.order_id}/files/mockup`} rel="noreferrer" target="_blank">
                          Review mock-up
                        </a>
                      )}
                      {order.swatch_path && !isArtistMockupQueue && (
                        <a className="rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50" href={`/api/orders/${order.order_id}/files/swatch`} rel="noreferrer" target="_blank">
                          Review swatch
                        </a>
                      )}
                      {(isSalesApprovalQueue && order.order_status === 'sales_approval') ||
                      (isArtistSizingQueue && order.order_status === 'sizing') ? (
                        <IconButton
                          className="rounded border border-cyan-300 px-3 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-50 disabled:opacity-50"
                          disabled={Number(order.down_payment) < paidLayoutFeeThreshold}
                          onClick={() => openLineupEditor(order)}
                          title={Number(order.down_payment) >= paidLayoutFeeThreshold ? 'Edit lineup' : 'Down payment must be at least 1 to edit the lineup'}
                          type="button"
                        >
                          Lineup
                        </IconButton>
                      ) : null}
                      {isSalesApprovalQueue && order.order_status === 'sales_approval' && (
                        <>
                          <IconButton
                            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                            onClick={() => {
                              if (!printOrder(order.order_id)) {
                                setPageError('Allow pop-ups to print the physical order form.')
                              }
                            }}
                            type="button"
                          >
                            Print order form
                          </IconButton>
                          <IconButton
                            className="rounded border border-violet-300 px-3 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-50"
                            onClick={() => openPaymentEditor(order)}
                            type="button"
                          >
                            Down payment
                          </IconButton>
                        </>
                      )}

                      {isArtistMockupQueue && order.order_status === 'mockup' && (
                        <div className="grid w-full gap-3 md:grid-cols-3">
                          <Field label="Concept mock-up file">
                            <input accept=".png,.jpg,.jpeg,.pdf" className={inputClass} onChange={(e) => setMockupFiles({ ...mockupFiles, [order.order_id]: { ...mockupFiles[order.order_id], mockup: e.target.files?.[0] || null } })} type="file" />
                          </Field>
                          <IconButton className="self-end rounded bg-violet-600 px-3 py-2 text-sm font-semibold text-white" disabled={busy || !mockupFiles[order.order_id]?.mockup} onClick={() => uploadMockup(order.order_id)} type="button">Submit mock-up</IconButton>
                        </div>
                      )}

                      {isSalesApprovalQueue && order.order_status === 'sales_approval' && (
                        <div className="grid w-full gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-2">
                          <Field label={order.swatch_path ? 'Replace swatch file' : 'Swatch file'}>
                            <input accept=".png,.jpg,.jpeg,.pdf" className={inputClass} onChange={(event) => setMockupFiles((current) => ({
                              ...current,
                              [order.order_id]: { ...current[order.order_id], swatch: event.target.files?.[0] || null },
                            }))} type="file" />
                          </Field>
                          <IconButton className="self-end rounded border border-violet-300 px-3 py-2 text-sm font-semibold text-violet-800 disabled:opacity-50" disabled={busy || !mockupFiles[order.order_id]?.swatch} onClick={() => uploadSwatch(order.order_id)} type="button">
                            {order.swatch_path ? 'Replace swatch' : 'Upload swatch'}
                          </IconButton>
                          <p className="text-xs text-slate-600 md:col-span-2">
                            Upload the swatch and lineup, then print the order form before approving. A valid lineup is required to proceed to sizing.
                          </p>
                          <div className="flex flex-wrap gap-2 md:col-span-2">
                            <IconButton className="rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={busy || !order.swatch_path || !order.spreadsheet_path || Number(order.total_quantity) < 1} onClick={() => approveMockup(order.order_id, true)} type="button">Approve mock-up</IconButton>
                            <IconButton className="rounded border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50" disabled={busy} onClick={() => approveMockup(order.order_id, false)} type="button">Request revision</IconButton>
                          </div>
                        </div>
                      )}

                      {(isArtist || isAdmin) && order.order_status === 'sizing' && (
                        <div className="grid w-full gap-3 md:grid-cols-3">
                          <Field label="Completed layout / sizing notes">
                            <input className={inputClass} onChange={(e) => setSizingNotes({ ...sizingNotes, [order.order_id]: e.target.value })} required value={sizingNotes[order.order_id] || ''} />
                          </Field>
                          <IconButton className="self-end rounded bg-violet-600 px-3 py-2 text-sm font-semibold text-white" disabled={busy || !sizingNotes[order.order_id]?.trim()} onClick={() => runAction(() => api(`/api/orders/${order.order_id}/complete-sizing`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sizing_notes: sizingNotes[order.order_id] }) }), 'Sizing complete; order moved to Printing.')} type="button">Complete layout sizing</IconButton>
                        </div>
                      )}

                      {canWorkStation && ['printing', 'pressing', 'cutting', 'sewing', 'packing'].includes(order.order_status) && (
                        <div className="mt-2 w-full rounded-lg bg-slate-50 p-4">
                          {!stationWithoutProductionLog && (
                            <>
                              <div className="mt-4 grid gap-3 md:grid-cols-3">
                                <Field label="Fabric used">
                                  <input className={inputClass} onChange={(e) => setStationForms({ ...stationForms, [order.order_id]: { ...stationForm, fabric_used: e.target.value } })} value={stationForm.fabric_used} />
                                </Field>
                                <Field label="Print process">
                                  <select className={inputClass} onChange={(event) => setStationForms({ ...stationForms, [order.order_id]: { ...stationForm, consumable_process: event.target.value } })} value={stationForm.consumable_process}>
                                    <option value="sublimation">Sublimation</option>
                                    <option value="dtf">DTF</option>
                                  </select>
                                </Field>
                                {stationForm.consumable_process !== 'dtf' && (
                                  <Field label="Sublimation brand">
                                    <select className={inputClass} onChange={(event) => setStationForms({ ...stationForms, [order.order_id]: { ...stationForm, consumable_brand: event.target.value } })} value={stationForm.consumable_brand}>
                                      <option value="atexco">Atexco</option>
                                      <option value="creons">Creons</option>
                                    </select>
                                  </Field>
                                )}
                                {consumableCatalog
                                  .filter((product) => {
                                    if (product.business_unit !== (stationForm.consumable_process === 'dtf' ? 'dtf' : 'sublimation')) return false
                                    if (product.business_unit === 'sublimation' && product.code.startsWith('subli_ink_')) {
                                      return product.code.endsWith(`_${stationForm.consumable_brand || 'atexco'}`)
                                    }
                                    return true
                                  })
                                  .map((product) => (
                                    <Field key={product.code} label={`${product.label} used (${product.unit})`}>
                                      <input
                                        className={inputClass}
                                        min="0"
                                        onChange={(event) => setStationForms({
                                          ...stationForms,
                                          [order.order_id]: {
                                            ...stationForm,
                                            consumable_usage: {
                                              ...stationForm.consumable_usage,
                                              [product.code]: event.target.value,
                                            },
                                          },
                                        })}
                                        step="0.01"
                                        type="number"
                                        value={stationForm.consumable_usage?.[product.code] || ''}
                                      />
                                    </Field>
                                  ))}
                                <Field label="Defect / production issue">
                                  <input className={inputClass} onChange={(e) => setStationForms({ ...stationForms, [order.order_id]: { ...stationForm, defect_description: e.target.value } })} placeholder="Leave blank if none" value={stationForm.defect_description} />
                                </Field>
                                <IconButton className="self-end rounded border border-violet-300 px-3 py-2 text-sm font-semibold text-violet-800" disabled={busy} onClick={() => stationAction(order, 'station-log')} type="button">Log production / defect</IconButton>
                              </div>
                              {(order.station_logs || []).filter((entry) => entry.station === order.order_status && !entry.reprint_job_id).length > 0 && (
                            <ul className="mt-3 space-y-1 text-xs text-slate-600">
                              {(order.station_logs || [])
                                .filter((entry) => entry.station === order.order_status && !entry.reprint_job_id)
                                .map((entry) => (
                                  <li key={entry.id}>
                                    {entry.fabric_used && `Fabric: ${entry.fabric_used} · `}
                                    {entry.paper_meters} m paper · {entry.operator} · {entry.created_at}
                                    {entry.defect_description && <span className="block text-amber-800">Defect: {entry.defect_description}</span>}
                                  </li>
                                ))}
                            </ul>
                              )}
                            </>
                          )}
                          {order.order_status === 'printing' && (
                            <Field label="Note for Pressing (optional)">
                              <textarea
                                className={inputClass}
                                maxLength={1000}
                                onChange={(event) => setPressingNotes((current) => ({
                                  ...current,
                                  [`printing-${order.order_id}`]: event.target.value,
                                }))}
                                rows="2"
                                value={pressingNotes[`printing-${order.order_id}`] || ''}
                              />
                            </Field>
                          )}
                          <IconButton className="mt-4 rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={busy} onClick={() => stationAction(order, 'complete-stage')} type="button">
                            Complete {stageLabels[order.order_status]} and hand off
                          </IconButton>
                        </div>
                      )}

                      {(
                        (['pressing', 'cutting', 'sewing', 'packing'].includes(order.order_status) &&
                          (isAdmin || stationByRole[user.role] === order.order_status)) ||
                        (['admin', 'print_operator'].includes(user.role) &&
                          stageSequence.indexOf(order.order_status) > stageSequence.indexOf('printing') &&
                          order.order_status !== 'complete')
                      ) && (
                        <div className="mt-2 grid w-full gap-3 rounded-lg bg-amber-50 p-4 md:grid-cols-4">
                          <Field label="Fabric used">
                            <input className={inputClass} onChange={(e) => setStationForms({ ...stationForms, [order.order_id]: { ...stationForm, fabric_used: e.target.value } })} value={stationForm.fabric_used} />
                          </Field>
                          <Field label="Reason for reprint">
                            <input className={inputClass} onChange={(e) => setStationForms({ ...stationForms, [order.order_id]: { ...stationForm, defect_description: e.target.value } })} placeholder="Describe the issue to reprint" value={stationForm.defect_description} />
                          </Field>
                          <Field label="Upload reprint image (optional)">
                            <input
                              accept="image/png,image/jpeg"
                              className={inputClass}
                              key={`${order.order_id}-${reprintImageInputVersion[order.order_id] || 0}`}
                              onChange={(event) => setStationForms({
                                ...stationForms,
                                [order.order_id]: { ...stationForm, reprint_image: event.target.files?.[0] || null },
                              })}
                              type="file"
                            />
                          </Field>
                          <IconButton className="self-end rounded bg-amber-700 px-3 py-2 text-sm font-semibold text-white" disabled={busy || !stationForm.fabric_used?.trim() || !stationForm.defect_description?.trim()} onClick={() => stationAction(order, 'reprint-log')} type="button">Log a reprint</IconButton>
                        </div>
                      )}
                      <IconButton className="rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50" onClick={() => toggleActivity(order.order_id)} type="button">
                        {activity[order.order_id] ? 'Hide history' : 'View history'}
                      </IconButton>
                    </div>
                    {activity[order.order_id] && (
                      <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-bold">Order events</h4>
                          <ul className="mt-2 space-y-2 text-xs text-slate-600">
                            {activity[order.order_id].events.map((event) => (
                              <li key={event.id}>
                                <span className="font-semibold">{event.event_type.replaceAll('_', ' ')}</span>
                                {event.from_stage && ` · ${stageLabels[event.from_stage]} → ${stageLabels[event.to_stage]}`}
                                <span className="block">{event.actor_name} · {event.created_at}</span>
                                {event.details && <span className="block">{event.details}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">Station logs</h4>
                          <ul className="mt-2 space-y-2 text-xs text-slate-600">
                            {activity[order.order_id].station_logs.map((entry) => (
                              <li key={entry.id}>
                                {entry.station}: {entry.fabric_used && `Fabric ${entry.fabric_used} · `}
                                {entry.paper_meters} m paper · {entry.operator}
                                <span className="block">{entry.created_at}</span>
                                {entry.defect_description && <span className="block text-amber-800">Defect: {entry.defect_description}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
        )}
      </div>
      {completedOrderDetails && (() => {
        const order = orders.find((entry) => entry.order_id === completedOrderDetails.orderId)
        if (!order) return null
        const consumptionLogs = completedOrderDetails.activity?.station_logs || []
        const orderDetailGroups = [
          {
            title: 'Order information',
            fields: [
              ['Client', order.client_company_name || order.client_id],
              ...(isSalesOrAdmin ? [['Layout fee', order.layout_fee]] : []),
              ['Order date', order.order_date],
              ['Due date', order.due_date],
              ['Team / project name', order.team_project_name],
              ['Item', order.item],
              ['Style number (C1-C7)', order.style_number],
            ],
          },
          {
            title: 'Product details',
            fields: [
              ['Product Category (C1)', order.category],
              ['Product Style (C2)', order.style],
              ['Product Cut (C3)', order.cut],
              ['Product Neck (C4)', order.neck],
              ['Product Sleeve (C5)', order.sleeve_type],
              ['Product Length (C6)', order.sleeve_length],
              ['Fabric', order.fabric],
              ['GSM', order.gsm],
              ['Product Others (C7)', order.other_details],
            ],
          },
          {
            title: 'Assignments and sizing',
            fields: [
              ['Sales representative', order.sales_rep_name || staff.find((member) => member.id === order.sales_rep_id)?.name || (order.sales_rep_id === user.id ? user.name : '—')],
              ['Assigned artist', staff.find((member) => member.id === order.assigned_artist_id)?.name || '—'],
              ['Printer machine', order.printer_machine],
              ['Pressing machine', order.pressing_machine],
              ['Cutting machine', order.cutting_machine],
              ...(isSalesOrAdmin ? [['Down payment (for sizing)', order.down_payment]] : []),
              ['Sizing notes', order.sizing_notes],
            ],
          },
          {
            title: 'Order quantity',
            fields: [
              ['Order quantity', `${order.total_quantity} pieces`],
              ['Packed pieces', order.packed_quantity ?? '—'],
              ...(isSalesOrAdmin && order.per_piece_price != null ? [
                ['Per-piece price', Number(order.per_piece_price).toFixed(2)],
                ['Total amount', (Number(order.per_piece_price) * Number(order.total_quantity)).toFixed(2)],
                ['Balance amount', (Number(order.per_piece_price) * Number(order.total_quantity) - Number(order.layout_fee || 0) - Number(order.down_payment || 0)).toFixed(2)],
              ] : []),
            ],
          },
        ]
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6">
            <section
              aria-labelledby="completed-order-title"
              aria-modal="true"
              className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-7"
              role="dialog"
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold" id="completed-order-title">
                    Completed order · {order.order_id}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {order.team_project_name} · {stageLabels[order.order_status]}
                  </p>
                </div>
                <div className="flex gap-2">
                  <IconButton
                    className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                    onClick={() => {
                      if (!completedOrderDetails.activity) {
                        setPageError('Order history and consumption are not available to print yet.')
                        return
                      }
                      if (!printCompletedOrder(order, completedOrderDetails.activity)) {
                        setPageError('Allow pop-ups to print the completed order details.')
                      }
                    }}
                    type="button"
                  >
                    Print completed order
                  </IconButton>
                  <IconButton
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    onClick={() => setCompletedOrderDetails(null)}
                    type="button"
                  >
                    Close
                  </IconButton>
                </div>
              </header>

              {completedOrderDetails.error && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                  Unable to load order consumption: {completedOrderDetails.error}
                </p>
              )}
              <section className="mt-5 space-y-4 rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-bold">Order details</h3>
                {orderDetailGroups.map(({ title, fields }) => (
                  <div className="rounded-lg border border-slate-200 p-4" key={title}>
                    <h4 className="text-sm font-semibold">{title}</h4>
                    <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      {fields.map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs font-medium text-slate-500">{label}</dt>
                          <dd className="mt-1 font-medium">{value || '—'}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </section>

              <section className="mt-5 rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-bold">Attachments</h3>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  {[
                    ['Line-up', 'lineup', order.spreadsheet_path],
                    ['Mock-up', 'mockup', order.mockup_path],
                    ['Swatch', 'swatch', order.swatch_path],
                  ].map(([label, kind, filePath]) => (
                    <div className="rounded-lg border border-slate-200 p-3" key={kind}>
                      <h4 className="text-sm font-semibold">{label}</h4>
                      {!filePath ? (
                        <p className="mt-2 text-sm text-slate-500">No {label.toLocaleLowerCase()} uploaded.</p>
                      ) : kind === 'lineup' ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <IconButton
                            className="rounded border border-cyan-300 px-3 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-50"
                            onClick={() => {
                              setCompletedOrderDetails(null)
                              openLineupEditor(order)
                            }}
                            type="button"
                          >
                            View line-up
                          </IconButton>
                          <a
                            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                            href={`/api/orders/${encodeURIComponent(order.order_id)}/files/lineup`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Download File
                          </a>
                        </div>
                      ) : (
                        <a
                          className="mt-3 block"
                          href={`/api/orders/${encodeURIComponent(order.order_id)}/files/${kind}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {/\.(png|jpe?g)$/i.test(filePath) ? (
                            <img
                              alt={`${label} for order ${order.order_id}`}
                              className="max-h-56 w-full rounded-md border border-slate-200 object-contain"
                              src={`/api/orders/${encodeURIComponent(order.order_id)}/files/${kind}`}
                            />
                          ) : (
                            <span className="inline-flex rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">
                              Open {label.toLocaleLowerCase()} file
                            </span>
                          )}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-5 rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-bold">Order quantity</h3>
                <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ['Order quantity', `${order.total_quantity} pieces`],
                    ['Packed pieces', order.packed_quantity ?? '—'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium text-slate-500">{label}</dt>
                      <dd className="mt-1 font-medium">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="mt-5 rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-bold">Order consumption</h3>
                {completedOrderDetails.loading ? (
                  <p className="mt-3 text-sm text-slate-500">Loading production consumption…</p>
                ) : consumptionLogs.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No production consumption has been recorded.</p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-2">Stage</th>
                          <th className="px-3 py-2">Fabric used</th>
                          <th className="px-3 py-2">Paper used</th>
                          <th className="px-3 py-2">Operator</th>
                          <th className="px-3 py-2">Recorded</th>
                          <th className="px-3 py-2">Defect / issue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consumptionLogs.map((entry) => (
                          <tr className="border-t border-slate-100" key={entry.id}>
                            <td className="px-3 py-2">{stageLabels[entry.station] || entry.station}</td>
                            <td className="px-3 py-2">{entry.fabric_used || '—'}</td>
                            <td className="px-3 py-2">{Number(entry.paper_meters || 0)} m</td>
                            <td className="px-3 py-2">{entry.operator}</td>
                            <td className="whitespace-nowrap px-3 py-2">{entry.created_at}</td>
                            <td className="px-3 py-2">{entry.defect_description || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </section>
          </div>
        )
      })()}
      {lineupEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6">
          <section aria-labelledby="lineup-editor-title" aria-modal="true" className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" role="dialog">
            {(() => {
              const canEditLineup =
                (isSalesOrAdmin ||
                  (user.role === 'artist' && lineupEditor.order.order_status === 'sizing')) &&
                ['mockup', 'sales_approval', 'sizing'].includes(lineupEditor.order.order_status) &&
                Number(lineupEditor.order.down_payment) >= paidLayoutFeeThreshold
              return (
                <>
                  <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-4 sm:p-5">
                    <div>
                      <h2 className="text-lg font-bold" id="lineup-editor-title">Order lineup · {lineupEditor.order.order_id}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {lineupEditor.filename || 'No spreadsheet attached'} · {lineupEditor.order.total_quantity || 0} pieces
                      </p>
                    </div>
                    <IconButton className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50" onClick={() => setLineupEditor(null)} type="button">Close</IconButton>
                  </header>
                  {lineupEditor.error && (
                    <p className="mx-4 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:mx-5">{lineupEditor.error}</p>
                  )}
                  {lineupEditor.loading ? (
                    <p className="p-8 text-center text-sm text-slate-500">Loading spreadsheet…</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 p-4 sm:px-5">
                        <Field label={lineupEditor.order.spreadsheet_path ? 'Replace spreadsheet' : 'Attach spreadsheet'}>
                          <input
                            accept=".csv,.xlsx"
                            className={inputClass}
                            disabled={!canEditLineup || busy}
                            onChange={(event) => updateLineupEditor({ file: event.target.files?.[0] || null, error: '' })}
                            type="file"
                          />
                        </Field>
                        <IconButton className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={!canEditLineup || busy || !lineupEditor.file} onClick={uploadLineupFromEditor} type="button">
                          {lineupEditor.draft ? 'Load spreadsheet into table' : lineupEditor.order.spreadsheet_path ? 'Replace spreadsheet' : 'Upload spreadsheet'}
                        </IconButton>
                        {!canEditLineup && (
                          <p className="max-w-xl text-xs text-slate-500">
                            {user.role === 'print_operator'
                              ? 'Printing can view and copy the lineup; editing is limited to Sales and the assigned Artist before Printing begins.'
                              : 'Uploading and editing are available before Printing begins after the down payment is at least 1.'}
                          </p>
                        )}
                      </div>
                      {lineupEditor.headers.length > 0 && (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 sm:px-5">
                            <p className="text-sm text-slate-600">Select rows and columns with checkboxes, or press Ctrl+A inside the grid. Press Ctrl+C to copy the selection for an external spreadsheet.</p>
                            {canEditLineup && (
                              <div className="flex gap-2">
                                <IconButton className="rounded border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50" disabled={!lineupEditor.selectedColumns.length || lineupEditor.selectedColumns.length >= lineupEditor.headers.length} onClick={() => setLineupEditor((current) => current && ({
                                  ...current,
                                  headers: current.headers.filter((_, index) => !current.selectedColumns.includes(index)),
                                  rows: current.rows.map((row) => row.filter((_, index) => !current.selectedColumns.includes(index))),
                                  selectedColumns: [],
                                }))} type="button">Remove selected columns</IconButton>
                                <IconButton className="rounded border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50" disabled={!lineupEditor.selectedRows.length || lineupEditor.selectedRows.length >= lineupEditor.rows.length} onClick={() => setLineupEditor((current) => current && ({
                                  ...current,
                                  rows: current.rows.filter((_, index) => !current.selectedRows.includes(index)),
                                  selectedRows: [],
                                }))} type="button">Remove selected rows</IconButton>
                                <IconButton className="rounded border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50" onClick={() => setLineupEditor((current) => current && ({
                                  ...current,
                                  headers: [...current.headers, `Column ${current.headers.length + 1}`],
                                  rows: current.rows.map((row) => [...row, '']),
                                }))} type="button">Add column</IconButton>
                                <IconButton className="rounded border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50" onClick={() => setLineupEditor((current) => current && ({
                                  ...current,
                                  rows: [...current.rows, current.headers.map(() => '')],
                                }))} type="button">Add row</IconButton>
                              </div>
                            )}
                          </div>
                          <div className="min-h-0 flex-1 overflow-auto p-4 sm:px-5">
                            <div className="overflow-x-auto rounded-lg ring-1 ring-slate-200">
                            <table className="w-full min-w-max text-left text-sm" data-lineup-grid="true">
                              <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                  <th className="border-b border-slate-200 px-3 py-3">
                                    <input
                                      aria-label="Select all lineup rows"
                                      checked={lineupEditor.rows.length > 0 && lineupEditor.selectedRows.length === lineupEditor.rows.length}
                                      onChange={(event) => setLineupEditor((current) => current && ({
                                        ...current,
                                        selectedRows: event.target.checked ? current.rows.map((_, index) => index) : [],
                                      }))}
                                      type="checkbox"
                                    />
                                  </th>
                                  {lineupEditor.headers.map((header, columnIndex) => (
                                    <th className="border-b border-slate-200 px-3 py-2" key={`header-${columnIndex}`}>
                                      <div className="flex min-w-40 items-center gap-1">
                                        <input
                                          aria-label={`Select lineup column ${header || columnIndex + 1}`}
                                          checked={lineupEditor.selectedColumns.includes(columnIndex)}
                                          onChange={(event) => setLineupEditor((current) => current && ({
                                            ...current,
                                            selectedColumns: event.target.checked
                                              ? [...current.selectedColumns, columnIndex]
                                              : current.selectedColumns.filter((index) => index !== columnIndex),
                                          }))}
                                          type="checkbox"
                                        />
                                        <input aria-label={`Column ${columnIndex + 1} name`} className="w-full rounded border border-slate-300 bg-white px-2 py-2 font-semibold text-slate-700" disabled={!canEditLineup} onChange={(event) => setLineupEditor((current) => {
                                          if (!current) return current
                                          const headers = [...current.headers]
                                          headers[columnIndex] = event.target.value
                                          return { ...current, headers }
                                        })} value={header} />
                                        {canEditLineup && lineupEditor.headers.length > 1 && (
                                          <IconButton aria-label={`Remove column ${header || columnIndex + 1}`} className="rounded px-2 py-1 text-red-600 hover:bg-red-50" onClick={() => setLineupEditor((current) => current && ({
                                            ...current,
                                            headers: current.headers.filter((_, index) => index !== columnIndex),
                                            rows: current.rows.map((row) => row.filter((_, index) => index !== columnIndex)),
                                            selectedColumns: [],
                                          }))} type="button">×</IconButton>
                                        )}
                                      </div>
                                    </th>
                                  ))}
                                  {canEditLineup && <th className="border-b border-slate-200 px-3 py-3">Actions</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {lineupEditor.rows.map((row, rowIndex) => (
                                  <tr className="border-t border-slate-100 align-top" key={`row-${rowIndex}`}>
                                    <td className="px-3 py-2 text-xs text-slate-500">
                                      <div className="flex items-center gap-1">
                                        <input
                                          aria-label={`Select lineup row ${rowIndex + 1}`}
                                          checked={lineupEditor.selectedRows.includes(rowIndex)}
                                          onChange={(event) => setLineupEditor((current) => current && ({
                                            ...current,
                                            selectedRows: event.target.checked
                                              ? [...current.selectedRows, rowIndex]
                                              : current.selectedRows.filter((index) => index !== rowIndex),
                                          }))}
                                          type="checkbox"
                                        />
                                        {rowIndex + 1}
                                      </div>
                                    </td>
                                    {lineupEditor.headers.map((_, columnIndex) => (
                                      <td className="px-3 py-2" key={`cell-${rowIndex}-${columnIndex}`}>
                                        <input aria-label={`Row ${rowIndex + 1}, column ${lineupEditor.headers[columnIndex]}`} className="min-w-40 rounded border border-slate-300 bg-white px-2 py-2 focus:border-violet-400 focus:outline-none disabled:border-transparent disabled:bg-transparent" disabled={!canEditLineup} onChange={(event) => setLineupEditor((current) => {
                                          if (!current) return current
                                          const rows = current.rows.map((cells) => [...cells])
                                          rows[rowIndex][columnIndex] = event.target.value
                                          return { ...current, rows }
                                        })} value={row[columnIndex] ?? ''} />
                                      </td>
                                    ))}
                                    {canEditLineup && (
                                      <td className="px-3 py-2">
                                        <IconButton aria-label={`Remove row ${rowIndex + 1}`} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50" disabled={lineupEditor.rows.length <= 1} onClick={() => setLineupEditor((current) => current && ({
                                          ...current,
                                          rows: current.rows.filter((_, index) => index !== rowIndex),
                                          selectedRows: [],
                                        }))} type="button">Remove</IconButton>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            </div>
                          </div>
                          {canEditLineup && (
                            <footer className="flex justify-end border-t border-slate-200 p-4 sm:px-5">
                              <IconButton className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={busy || lineupEditor.loading || !lineupEditor.headers.length} onClick={saveLineupEditor} type="button">{lineupEditor.draft ? 'Done' : 'Save lineup changes'}</IconButton>
                            </footer>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )
            })()}
          </section>
        </div>
      )}
      {isFabricEntryModalOpen && ['admin', 'pressing_operator'].includes(user.role) && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeFabricEntryModal()
          }}
        >
          <section
            aria-labelledby="fabric-entry-title"
            aria-modal="true"
            className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6"
            role="dialog"
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold" id="fabric-entry-title">
                  {editingFabricEntryId ? 'Edit fabric record' : 'Add fabric record'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Enter fabric roll details; total meters are calculated automatically.</p>
              </div>
              <IconButton
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                onClick={closeFabricEntryModal}
                type="button"
              >
                Close
              </IconButton>
            </header>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveFabricEntry}>
              <Field label="Fabric">
                <input
                  className={inputClass}
                  maxLength="100"
                  onChange={(event) => setFabricEntryForm((current) => ({ ...current, fabric: event.target.value }))}
                  required
                  value={fabricEntryForm.fabric}
                />
              </Field>
              <Field label="GSM">
                <input
                  className={inputClass}
                  min="1"
                  onChange={(event) => setFabricEntryForm((current) => ({ ...current, gsm: event.target.value }))}
                  required
                  step="1"
                  type="number"
                  value={fabricEntryForm.gsm}
                />
              </Field>
              <Field label="Roll quantity">
                <input
                  className={inputClass}
                  min="1"
                  onChange={(event) => setFabricEntryForm((current) => ({ ...current, roll_quantity: event.target.value }))}
                  required
                  step="1"
                  type="number"
                  value={fabricEntryForm.roll_quantity}
                />
              </Field>
              <Field label="Entry date">
                <input
                  className={inputClass}
                  onChange={(event) => setFabricEntryForm((current) => ({ ...current, entry_date: event.target.value }))}
                  required
                  type="date"
                  value={fabricEntryForm.entry_date}
                />
              </Field>
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-medium text-slate-700">Roll measurement</legend>
                <div className="mt-2 flex flex-wrap gap-4">
                  {[
                    ['meter', 'Meter'],
                    ['kilo', 'Kilo/grams'],
                  ].map(([value, label]) => (
                    <label className="flex items-center gap-2 text-sm" key={value}>
                      <input
                        checked={fabricEntryForm.measurement_type === value}
                        name="fabric-measurement-type"
                        onChange={() => setFabricEntryForm((current) => ({ ...current, measurement_type: value }))}
                        type="radio"
                        value={value}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              {fabricEntryForm.measurement_type === 'meter' ? (
                <Field label="Meter per roll">
                  <input
                    className={inputClass}
                    min="0.01"
                    onChange={(event) => setFabricEntryForm((current) => ({ ...current, meters_per_roll: event.target.value }))}
                    required
                    step="0.01"
                    type="number"
                    value={fabricEntryForm.meters_per_roll}
                  />
                </Field>
              ) : (
                <>
                  <Field label="Meters per kilo">
                    <input
                      className={inputClass}
                      min="0.0001"
                      onChange={(event) => setFabricEntryForm((current) => ({ ...current, kilo_per_meter: event.target.value }))}
                      required
                      step="0.0001"
                      type="number"
                      value={fabricEntryForm.kilo_per_meter}
                    />
                  </Field>
                  <Field label="Kilo per roll">
                    <input
                      className={inputClass}
                      min="0.01"
                      onChange={(event) => setFabricEntryForm((current) => ({ ...current, kilo_per_roll: event.target.value }))}
                      required
                      step="0.01"
                      type="number"
                      value={fabricEntryForm.kilo_per_roll}
                    />
                  </Field>
                </>
              )}
              <Field label="Total meter (calculated)">
                <output className="mt-1 block rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold">
                  {Number.isFinite(fabricComputedTotalMeters) && fabricComputedTotalMeters > 0
                    ? `${fabricComputedTotalMeters.toLocaleString(undefined, { maximumFractionDigits: 2 })} m`
                    : '—'}
                </output>
              </Field>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <IconButton
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
                  onClick={closeFabricEntryModal}
                  type="button"
                >
                  Cancel
                </IconButton>
                <IconButton
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  disabled={busy}
                  type="submit"
                >
                  {editingFabricEntryId ? 'Save changes' : 'Save fabric'}
                </IconButton>
              </div>
            </form>
          </section>
        </div>
      )}
      {paymentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <section aria-labelledby="payment-editor-title" aria-modal="true" className="w-full max-w-xl rounded-xl bg-white p-5 shadow-2xl sm:p-6" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold" id="payment-editor-title">Order payments · {paymentOrder.order_id}</h2>
                <p className="mt-1 text-sm text-slate-500">Layout fee must be at least 700. Update payment amounts without changing order assignments.</p>
              </div>
              <IconButton className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={() => setPaymentOrder(null)} type="button">Close</IconButton>
            </div>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={updateOrderPayments}>
              <Field label="Layout fee">
                <input className={inputClass} min={minimumLayoutFee} onChange={(event) => setPaymentForm((current) => ({ ...current, layout_fee: event.target.value }))} required step="0.01" type="number" value={paymentForm.layout_fee} />
              </Field>
              <Field label="Down payment">
                <input className={inputClass} min="0" onChange={(event) => setPaymentForm((current) => ({ ...current, down_payment: event.target.value }))} required step="0.01" type="number" value={paymentForm.down_payment} />
              </Field>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <IconButton className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium" onClick={() => setPaymentOrder(null)} type="button">Cancel</IconButton>
                <IconButton className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={busy} type="submit">Save payments</IconButton>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
