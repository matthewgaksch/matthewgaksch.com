import test from 'node:test'
import assert from 'node:assert/strict'
import { contributionCalendar, contributionLabel, parseContributions, readContributionCache, CONTRIBUTIONS_CACHE_MS } from '../src/lib/github-contributions.ts'
const days = [
  { date: '2026-10-25', count: 0, level: 0 },
  { date: '2026-10-26', count: 1, level: 1 },
  { date: '2026-10-27', count: 16, level: 4 },
]
test('validates, sorts and projects public daily activity only', () => {
  assert.deepEqual(parseContributions({ contributions: [...days].reverse().map(d => ({ ...d, ignored: 'not rendered' })) }), days)
})
test('rejects malformed dates, counts, levels, duplicates and missing days', () => {
  for (const patch of [{ date: '2026-02-30' }, { date: '<script>' }, { count: -1 }, { count: 0.5 }, { count: '2' }, { level: 5 }, { level: 1.5 }])
    assert.equal(parseContributions({ contributions: [{ ...days[0], ...patch }] }), null)
  for (const contributions of [[], Array(374).fill(days[0]), [days[0], days[0]], [days[0], days[2]]])
    assert.equal(parseContributions({ contributions }), null)
  assert.equal(parseContributions({ private: true }), null)
})
test('a cache is valid for one day and cannot make old or corrupt data look current', () => {
  const now = 1_800_000_000_000
  const cache = age => JSON.stringify({ fetchedAt: now - age, contributions: days })
  assert.deepEqual(readContributionCache(cache(CONTRIBUTIONS_CACHE_MS - 1), now), days)
  for (const raw of [cache(CONTRIBUTIONS_CACHE_MS), cache(-1), '{', JSON.stringify({ fetchedAt: now, contributions: [] })])
    assert.equal(readContributionCache(raw, now), null)
})
test('calendar aligns Sunday rows, totals counts and handles year boundaries in UTC', () => {
  assert.equal(contributionCalendar(days).weeks[0][0].date, '2026-10-25')
  assert.equal(contributionCalendar(days.slice(1)).weeks[0][0], null)
  assert.equal(contributionCalendar(days).total, 17)
  assert.match(contributionLabel(days[1]), /^1 contribution on October 26, 2026$/)
  assert.match(contributionLabel(days[0]), /^0 contributions on October 25, 2026$/)
  assert.deepEqual(contributionCalendar([]), { weeks: [], months: [], total: 0 })
})
