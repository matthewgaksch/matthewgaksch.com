/* global document, fetch, window, clearTimeout, setTimeout, FormData */
const $ = (selector) => document.querySelector(selector)
const form = $('#post-form')
const list = $('#post-list')
const state = $('#save-state')
const preview = $('#preview')
const bodyInput = $('#body')
const grid = $('#writing-grid')
let posts = []
let originalSlug = null
let slugTouched = false
let dirty = false
let viewTouched = false
let previewTimer

const slugify = (value) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)

async function api(route, payload) {
  const response = await fetch(route, payload === undefined ? undefined : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Blog-Editor': 'local' },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Request failed.')
  return data
}

function setDirty() {
  dirty = true
  state.textContent = 'Unsaved changes'
}

function canLeave() {
  return !dirty || window.confirm('Discard your unsaved changes?')
}

function renderList() {
  list.replaceChildren()
  if (!posts.length) {
    const empty = document.createElement('p')
    empty.className = 'empty-list'
    empty.textContent = 'No saved posts yet.'
    list.append(empty)
    return
  }
  for (const post of posts) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `post-item${post.slug === originalSlug ? ' is-active' : ''}`
    const title = document.createElement('strong')
    title.textContent = post.title
    const meta = document.createElement('span')
    meta.textContent = `${post.status === 'published' ? 'Published' : 'Draft'} · ${post.category}`
    button.append(title, meta)
    button.addEventListener('click', () => selectPost(post))
    list.append(button)
  }
}

function newPost(force = false) {
  if (!force && !canLeave()) return
  form.reset()
  originalSlug = null
  slugTouched = false
  dirty = false
  $('#slug').readOnly = false
  $('#editor-heading').textContent = 'New post'
  state.textContent = ''
  renderList()
  updatePreview()
  $('#title').focus()
}

function selectPost(post) {
  if (post.slug === originalSlug || !canLeave()) return
  for (const key of ['title', 'slug', 'summary', 'category', 'body', 'status']) form.elements[key].value = post[key]
  originalSlug = post.slug
  slugTouched = true
  dirty = false
  $('#slug').readOnly = true
  $('#editor-heading').textContent = post.title
  state.textContent = ''
  renderList()
  updatePreview()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function updatePreview() {
  const body = bodyInput.value.trim()
  if (!body) {
    preview.replaceChildren()
    const empty = document.createElement('p')
    empty.className = 'empty-preview'
    empty.textContent = 'Your article preview appears here.'
    preview.append(empty)
    return
  }
  try {
    const result = await api('/api/preview', { body })
    if (body === bodyInput.value.trim()) preview.innerHTML = result.html
  } catch (error) {
    state.textContent = error.message
  }
}

function schedulePreview() {
  clearTimeout(previewTimer)
  previewTimer = setTimeout(updatePreview, 250)
}

function insertText(text, selectStart = null, selectEnd = null) {
  const start = bodyInput.selectionStart
  const end = bodyInput.selectionEnd
  bodyInput.setRangeText(text, start, end, 'end')
  if (selectStart !== null) bodyInput.setSelectionRange(start + selectStart, start + (selectEnd ?? selectStart))
  bodyInput.focus()
  setDirty()
  schedulePreview()
}

function formatText(kind) {
  const selected = bodyInput.value.slice(bodyInput.selectionStart, bodyInput.selectionEnd)
  const wrap = (left, right, fallback) => {
    const text = selected || fallback
    insertText(`${left}${text}${right}`, left.length, left.length + text.length)
  }
  if (kind === 'bold') wrap('**', '**', 'bold text')
  if (kind === 'italic') wrap('*', '*', 'italic text')
  if (kind === 'code') wrap('`', '`', 'code')
  if (kind === 'link') wrap('[', '](https://example.com)', 'link text')
  if (kind === 'heading') insertText(`## ${selected || 'Heading'}`)
  if (kind === 'list') insertText((selected || 'List item').split('\n').map((line) => `- ${line}`).join('\n'))
  if (kind === 'quote') insertText((selected || 'Quote').split('\n').map((line) => `> ${line}`).join('\n'))
}

function setView(mode, touched = true) {
  grid.dataset.mode = mode
  for (const button of document.querySelectorAll('[data-view]')) button.setAttribute('aria-pressed', String(button.dataset.view === mode))
  if (touched) viewTouched = true
  if (mode !== 'write') updatePreview()
}

async function uploadImage(file) {
  if (!file) return
  const indicator = $('#image-state')
  if (file.size > 10_000_000) { indicator.textContent = 'Image exceeds 10 MB.'; return }
  indicator.textContent = 'Optimizing image…'
  try {
    const response = await fetch('/api/images', {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Blog-Editor': 'local' },
      body: file,
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Image upload failed.')
    const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Image'
    const prefix = bodyInput.value && !bodyInput.value.endsWith('\n') ? '\n\n' : ''
    insertText(`${prefix}![${alt}](${result.url})\n`)
    indicator.textContent = 'Image added'
    $('#image-file').value = ''
  } catch (error) {
    indicator.textContent = error.message
  }
}

$('#new-post').addEventListener('click', () => newPost())
$('#title').addEventListener('input', () => {
  if (!originalSlug && !slugTouched) $('#slug').value = slugify($('#title').value)
  if (!originalSlug) $('#editor-heading').textContent = $('#title').value || 'New post'
})
$('#slug').addEventListener('input', () => { slugTouched = true })
form.addEventListener('input', setDirty)
form.addEventListener('change', setDirty)
bodyInput.addEventListener('input', schedulePreview)
for (const button of document.querySelectorAll('[data-format]')) button.addEventListener('click', () => formatText(button.dataset.format))
for (const button of document.querySelectorAll('[data-view]')) button.addEventListener('click', () => setView(button.dataset.view))
$('#upload-button').addEventListener('click', () => $('#image-file').click())
$('#image-file').addEventListener('change', (event) => uploadImage(event.target.files[0]))
bodyInput.addEventListener('paste', (event) => {
  const image = [...event.clipboardData.files].find((file) => file.type.startsWith('image/'))
  if (image) { event.preventDefault(); uploadImage(image) }
})
bodyInput.addEventListener('dragover', (event) => { if (event.dataTransfer.types.includes('Files')) event.preventDefault() })
bodyInput.addEventListener('drop', (event) => {
  const image = [...event.dataTransfer.files].find((file) => file.type.startsWith('image/'))
  if (image) { event.preventDefault(); uploadImage(image) }
})
window.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); form.requestSubmit() }
})
window.addEventListener('beforeunload', (event) => { if (dirty) { event.preventDefault(); event.returnValue = '' } })
window.addEventListener('resize', () => { if (!viewTouched) setView(window.innerWidth <= 900 ? 'write' : 'split', false) })

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const payload = Object.fromEntries(new FormData(form))
  payload.originalSlug = originalSlug
  state.textContent = 'Saving…'
  try {
    const saved = await api('/api/posts', payload)
    posts = await api('/api/posts')
    originalSlug = saved.slug
    dirty = false
    $('#slug').readOnly = true
    state.textContent = saved.status === 'published' ? 'Saved · rebuild to publish' : 'Draft saved'
    renderList()
  } catch (error) {
    state.textContent = error.message
  }
})

try { posts = await api('/api/posts'); renderList(); newPost(true); setView(window.innerWidth <= 900 ? 'write' : 'split', false) }
catch (error) { state.textContent = error.message }
