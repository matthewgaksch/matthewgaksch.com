/** Static-asset _headers do not apply to Worker-generated responses. */
export function secureApiResponse(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  headers.set('Strict-Transport-Security', 'max-age=31536000')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}
