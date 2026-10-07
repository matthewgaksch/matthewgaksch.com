'use client'

import { useEffect, useRef, useState } from 'react'

const holdDuration = 1200
const fadeDuration = 300

function remainingShimmerTime(element: HTMLSpanElement | null) {
  if (!element) return 1500
  const animation = element.getAnimations()[0]
  if (animation && typeof animation.currentTime === 'number') {
    const endTime = animation.effect?.getComputedTiming().endTime
    if (typeof endTime === 'number' && Number.isFinite(endTime)) {
      return Math.max(0, endTime - animation.currentTime)
    }
  }
  return Number.parseFloat(window.getComputedStyle(element).animationDuration) * 1000 || 0
}

export function RotatingRole({ phrases, accessibleText }: { phrases: readonly string[], accessibleText: string }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const shimmer = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (phrases.length < 2) return
    let changeTimer: number | undefined
    // Preserve the current animation progress instead of restarting its timing on hydration.
    const holdTimer = window.setTimeout(() => {
      setVisible(false)
      changeTimer = window.setTimeout(() => {
        setIndex((current) => (current + 1) % phrases.length)
        setVisible(true)
      }, fadeDuration)
    }, remainingShimmerTime(shimmer.current) + holdDuration)

    return () => {
      window.clearTimeout(holdTimer)
      window.clearTimeout(changeTimer)
    }
  }, [index, phrases.length])

  return <p className="hero-role"><span className="sr-only">{accessibleText}</span><span key={index} className={`role-phrase${visible ? '' : ' role-phrase-out'}`} aria-hidden="true"><span ref={shimmer} className="shimmer shimmer-once shimmer-duration-1500">{phrases[index]}</span></span></p>
}
