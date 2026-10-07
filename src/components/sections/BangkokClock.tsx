'use client'

import { useEffect, useState } from 'react'

const bangkokMinutes = 7 * 60

function formatDifference(minutes: number) {
  if (minutes === 0) return 'Same time as you'
  const amount = Math.abs(minutes)
  const hours = Math.floor(amount / 60)
  const remaining = amount % 60
  const parts = [hours ? `${hours}h` : '', remaining ? `${remaining}m` : ''].filter(Boolean).join(' ')
  return `${parts} ${minutes > 0 ? 'ahead of' : 'behind'} you`
}

export function BangkokClock() {
  const [clock, setClock] = useState<{ time: string; difference: string } | null>(null)

  useEffect(() => {
    function update() {
      const now = new Date()
      const time = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false,
      }).format(now)
      const difference = formatDifference(bangkokMinutes + now.getTimezoneOffset())
      setClock({ time, difference })
    }
    update()
    const timer = window.setInterval(update, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  return <span className="clock-value"><strong>{clock?.time ?? '--:--'} <small>GMT+7</small></strong><span>{clock?.difference ?? 'Bangkok time'}</span></span>
}
