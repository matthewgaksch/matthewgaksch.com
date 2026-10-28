/* Adapted from https://chanhdai.com/components/github-contributions.
 * MIT © 2026 Chánh Đại; contribution graph credits Kibo UI.
 * Static-export adaptation uses browser fetching and existing Base UI tooltips.
 */
'use client'

import { Tooltip } from '@base-ui/react/tooltip'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  CONTRIBUTIONS_CACHE_KEY, CONTRIBUTIONS_URL, GITHUB_PROFILE_URL,
  contributionCalendar, contributionLabel, readContributionResponse, readContributionCache,
  type Activity,
} from '../../lib/github-contributions'
import { ExternalLink } from '../ui/ExternalLink'

const BLOCK = 11
const STEP = 15
const LABEL_HEIGHT = 24

export function GitHubContributions() {
  const [data, setData] = useState<Activity[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [focusedDate, setFocusedDate] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [tooltipHandle] = useState(() => Tooltip.createHandle<Activity>())
  const calendar = useMemo(() => contributionCalendar(data ?? []), [data])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 10_000)
    let active = true
    async function load() {
      try {
        let cached: Activity[] | null = null
        try { cached = readContributionCache(localStorage.getItem(CONTRIBUTIONS_CACHE_KEY), Date.now()) } catch { /* Storage can be disabled. */ }
        if (cached) { if (active) setData(cached); return }
        const response = await fetch(CONTRIBUTIONS_URL, { signal: controller.signal, credentials: 'omit', redirect: 'error' })
        const parsed = await readContributionResponse(response)
        if (active) setData(parsed)
        try { localStorage.setItem(CONTRIBUTIONS_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), contributions: parsed })) } catch { /* Rendering does not depend on storage. */ }
      } catch { if (active) setFailed(true) }
      finally { window.clearTimeout(timeout) }
    }
    void load()
    return () => { active = false; controller.abort(); window.clearTimeout(timeout) }
  }, [])

  // Open at today's end of the timeline. Follow resizes only while the visitor
  // remains at that end; exploring older weeks must never snap back.
  useEffect(() => {
    const scroll = scrollRef.current
    if (!data || !scroll) return
    let pinnedToLatest = true
    const showLatest = () => {
      if (pinnedToLatest) scroll.scrollLeft = scroll.scrollWidth - scroll.clientWidth
    }
    const trackPosition = () => {
      pinnedToLatest = scroll.scrollWidth - scroll.clientWidth - scroll.scrollLeft < 3
    }
    showLatest()
    scroll.addEventListener('scroll', trackPosition, { passive: true })
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(showLatest)
    observer?.observe(scroll)
    return () => { observer?.disconnect(); scroll.removeEventListener('scroll', trackPosition) }
  }, [data])

  function moveFocus(event: KeyboardEvent, activity: Activity) {
    if (!data) return
    const offsets: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }
    const index = data.findIndex((day) => day.date === activity.date)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? data.length - 1 :
      event.key in offsets ? Math.max(0, Math.min(data.length - 1, index + offsets[event.key])) : null
    if (next === null) return
    event.preventDefault()
    const target = data[next].date
    setFocusedDate(target)
    event.currentTarget.closest('svg')?.querySelector<SVGGElement>(`[data-contribution-date="${target}"]`)?.focus()
  }

  return (
    <section className="home-section contributions-section" id="github" aria-labelledby="github-title">
      <div className="home-section-heading shell">
        <h2 id="github-title">GitHub activity</h2>
        <ExternalLink className="contributions-profile" href={GITHUB_PROFILE_URL} label="Matthew Gaksch on GitHub (opens in a new tab)">
          <span>@matthewgaksch</span>
        </ExternalLink>
      </div>
      <div className="shell contributions-content" aria-busy={!data && !failed}>
        {!data ? (
          <div className="contributions-placeholder" role="status">
            {failed ? <p>Activity is unavailable right now. <a href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer">View on GitHub</a></p> :
              <><LoaderCircle className="contributions-spinner" size={20} aria-hidden="true" /><span className="sr-only">Loading GitHub activity…</span></>}
          </div>
        ) : (
          <>
            <div className="contributions-scroll" ref={scrollRef}>
              <svg className="contributions-calendar" width={calendar.weeks.length * STEP - 4} height={LABEL_HEIGHT + STEP * 7 - 4}
                viewBox={`0 0 ${calendar.weeks.length * STEP - 4} ${LABEL_HEIGHT + STEP * 7 - 4}`}
                role="group" aria-label="GitHub contribution calendar. Use arrow keys to explore days.">
                <title>GitHub contributions over the last year</title>
                <g className="contributions-months" aria-hidden="true">
                  {calendar.months.map(({ label, weekIndex }) => <text key={weekIndex} x={weekIndex * STEP} y={11}>{label}</text>)}
                </g>
                {calendar.weeks.map((week, weekIndex) => week.map((activity, dayIndex) => activity && (
                  <Tooltip.Trigger key={activity.date} handle={tooltipHandle} payload={activity} delay={100} closeDelay={100}
                    tabIndex={activity.date === (focusedDate ?? data[data.length - 1].date) ? 0 : -1}
                    aria-label={contributionLabel(activity)}
                    onFocus={() => setFocusedDate(activity.date)} onKeyDown={(event) => moveFocus(event, activity)}
                    render={<g className="contributions-day" data-contribution-date={activity.date} />}>
                    <rect data-level={activity.level} x={weekIndex * STEP} y={LABEL_HEIGHT + dayIndex * STEP}
                      width={BLOCK} height={BLOCK} rx={2} ry={2} />
                  </Tooltip.Trigger>
                )))}
              </svg>
            </div>
            <div className="contributions-footer">
              <p>{calendar.total.toLocaleString('en')} contribution{calendar.total === 1 ? '' : 's'} in the last year.</p>
              <div className="contributions-legend" aria-label="Contribution intensity: less to more">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => <svg key={level} width={BLOCK} height={BLOCK} aria-hidden="true"><rect data-level={level} width={BLOCK} height={BLOCK} rx={2} /></svg>)}
                <span>More</span>
              </div>
            </div>
            <Tooltip.Root handle={tooltipHandle}>
              {({ payload }) => (
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={10} className="contributions-tooltip-positioner">
                    <Tooltip.Popup role="tooltip" className="contributions-tooltip">{payload ? contributionLabel(payload) : null}</Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              )}
            </Tooltip.Root>
          </>
        )}
      </div>
    </section>
  )
}
