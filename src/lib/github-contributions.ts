// Calendar layout adapted from Chánh Đại's MIT-licensed GitHub Contributions component.
// https://chanhdai.com/components/github-contributions (credits Kibo UI)
export const GITHUB_USERNAME = 'matthewgaksch'
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`
export const CONTRIBUTIONS_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
export const CONTRIBUTIONS_CACHE_KEY = `github-contributions:v2:${GITHUB_USERNAME}`
export const CONTRIBUTIONS_CACHE_MS = 86_400_000
const DAY_MS = 86_400_000

export interface Activity {
  date: string
  count: number
  level: number
}

/** Treat remote data and browser storage as untrusted. Never invent missing activity. */
export function parseContributions(value: unknown): Activity[] | null {
  if (!value || typeof value !== 'object' || !('contributions' in value)) return null
  const days = value.contributions
  if (!Array.isArray(days) || days.length === 0 || days.length > 373) return null
  const result: Activity[] = []
  for (const day of days) {
    if (!day || typeof day !== 'object' ||
      typeof day.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
      !Number.isSafeInteger(day.count) || day.count < 0 || day.count > 1_000_000 ||
      !Number.isInteger(day.level) || day.level < 0 || day.level > 4) return null
    const timestamp = Date.parse(`${day.date}T00:00:00Z`)
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== day.date) return null
    result.push({ date: day.date, count: day.count, level: day.level })
  }
  result.sort((a, b) => a.date.localeCompare(b.date))
  for (let i = 1; i < result.length; i++) {
    if (Date.parse(result[i].date) - Date.parse(result[i - 1].date) !== DAY_MS) return null
  }
  return result
}

export function readContributionCache(raw: string | null, now: number): Activity[] | null {
  if (!raw || raw.length > 100_000) return null
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || !('fetchedAt' in value) ||
      typeof value.fetchedAt !== 'number' || !Number.isSafeInteger(value.fetchedAt) ||
      value.fetchedAt > now || now - value.fetchedAt >= CONTRIBUTIONS_CACHE_MS) return null
    return parseContributions(value)
  } catch { return null }
}

const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' })
const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' })
export function contributionLabel(activity: Activity): string {
  return `${activity.count.toLocaleString('en')} contribution${activity.count === 1 ? '' : 's'} on ${dateFormatter.format(new Date(`${activity.date}T00:00:00Z`))}`
}

export function contributionCalendar(data: Activity[]) {
  if (!data.length) return { weeks: [], months: [], total: 0 }
  const padding = new Date(`${data[0].date}T00:00:00Z`).getUTCDay()
  const padded: (Activity | null)[] = [...Array<null>(padding).fill(null), ...data]
  const weeks = Array.from({ length: Math.ceil(padded.length / 7) }, (_, i) => padded.slice(i * 7, i * 7 + 7))
  const months = weeks.flatMap((week, weekIndex) => {
    const first = week.find((day) => day !== null)
    if (!first) return []
    const label = monthFormatter.format(new Date(`${first.date}T00:00:00Z`))
    const previous = weeks[weekIndex - 1]?.find((day) => day !== null)
    if (previous?.date.slice(0, 7) === first.date.slice(0, 7)) return []
    return [{ label, weekIndex }]
  }).filter(({ weekIndex }, index, labels) => {
    if (index === 0) return !labels[1] || labels[1].weekIndex - weekIndex >= 3
    return index !== labels.length - 1 || weeks.length - weekIndex >= 3
  })
  return { weeks, months, total: data.reduce((sum, day) => sum + day.count, 0) }
}

/** Bound bytes before JSON parsing; cancellation covers oversized and stalled bodies. */
export async function readContributionResponse(response: Response): Promise<Activity[]> {
  if (!response.ok || response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json' || !response.body)
    throw new Error('Contribution data unavailable')
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let bytes = 0
  let chunks = 0
  let text = ''
  try {
    for (;;) {
      const part = await reader.read()
      if (part.done) break
      bytes += part.value.byteLength
      if (bytes > 100_000 || ++chunks > 1024) throw new Error('Invalid contribution response')
      text += decoder.decode(part.value, { stream: true })
    }
    text += decoder.decode()
    const parsed = parseContributions(JSON.parse(text))
    if (!parsed) throw new Error('Invalid contribution data')
    return parsed
  } finally { void reader.cancel().catch(() => {}) }
}
