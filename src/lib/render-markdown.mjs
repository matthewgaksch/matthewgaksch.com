import { micromark } from 'micromark'
import { gfm, gfmHtml } from 'micromark-extension-gfm'

/** Shared by the private editor and published articles. Raw HTML and unsafe URLs are disabled. */
export function renderMarkdown(body) {
  if (typeof body !== 'string' || body.length > 200_000) throw new TypeError('Invalid article text.')
  return micromark(body, {
    allowDangerousHtml: false,
    allowDangerousProtocol: false,
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  })
}
