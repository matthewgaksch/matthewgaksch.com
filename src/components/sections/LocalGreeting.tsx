'use client'

import { useEffect, useState } from 'react'

function greetingForHour(hour: number) {
  if (hour >= 5 && hour < 12) return 'Good morning.'
  if (hour >= 12 && hour < 18) return 'Good afternoon.'
  if (hour >= 18) return 'Good evening.'
  return 'Hello.'
}

export function LocalGreeting() {
  const [greeting, setGreeting] = useState('Hello.')

  useEffect(() => {
    const update = () => setGreeting(greetingForHour(new Date().getHours()))
    update()
    const timer = window.setInterval(update, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  return <p className="about-greeting">{greeting}</p>
}
