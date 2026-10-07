export type DeviceKind = 'macbook' | 'desktop' | 'server'

export interface DeviceProfile {
  id: DeviceKind
  name: string
  prompt: string
  description: string
  specs: { label: string; value: string }[]
  productHref?: string
  buyHref?: string
  buyLabel?: string
}

export const devices: DeviceProfile[] = [
  {
    id: 'macbook',
    name: 'MacBook Air',
    prompt: 'matthew@macbook-air ~ % fastfetch',
    description: '13-inch MacBook Air M4 · Sky Blue',
    specs: [
      { label: 'CPU', value: 'Apple M4 · 10-core CPU' },
      { label: 'GPU', value: '10-core GPU' },
      { label: 'Memory', value: '16GB unified memory' },
      { label: 'Storage', value: '512GB SSD' },
    ],
    productHref: 'https://support.apple.com/en-us/122209',
    buyHref: 'https://s.shopee.co.th/70KViIBPq7',
    buyLabel: 'Buy MacBook Air M5 (newer)',
  },
  {
    id: 'desktop',
    name: 'Main PC',
    prompt: 'matthew@rog-desktop ~ % fastfetch',
    description: 'ROG desktop · MSI MAG 244F monitor',
    specs: [
      { label: 'CPU', value: 'Intel Core i7-7700' },
      { label: 'GPU', value: 'ROG Strix GeForce RTX 3070 Ti OC Edition · 8GB GDDR6X' },
      { label: 'Memory', value: 'G.SKILL Trident Z RGB · 16GB (2 × 8GB) DDR4-2400 CL15' },
      { label: 'Storage', value: 'WD_BLACK SN850X NVMe SSD · 1TB' },
      { label: 'Board', value: 'ROG Strix H270F Gaming' },
      { label: 'Cooling', value: 'Thermaltake Water 3.0 Liquid Cooler' },
      { label: 'Power', value: 'Corsair CX750M · 750W, 80 PLUS Bronze, semi-modular' },
      { label: 'Case', value: 'Corsair 4000D Airflow Tempered Glass Mid-Tower' },
    ],
  },
  {
    id: 'server',
    name: 'Home server',
    prompt: 'matthew@home-server ~ % fastfetch',
    description: 'An old laptop repurposed as a homelab server.',
    specs: [
      { label: 'CPU', value: 'Intel Core i3-5005U' },
      { label: 'GPU', value: 'NVIDIA GeForce 940M · 4 GB DDR3' },
      { label: 'Memory', value: '12 GB DDR3L-1600 SODIMM' },
    ],
  },
]

interface PeripheralItem {
  label: string
  value: string
  productHref?: string
  buyHref?: string
  buyLabel?: string
}

export const peripherals: PeripheralItem[] = [
  {
    label: 'Keyboard',
    value: 'ROG Strix Scope NX TKL Moonlight White',
    productHref: 'https://rog.asus.com/th/keyboards/keyboards/compact/rog-strix-scope-nx-tkl-moonlight-white-model/',
  },
  {
    label: 'Mouse',
    value: 'Razer Basilisk V3',
    productHref: 'https://www.razer.com/gaming-mice/razer-basilisk-v3',
    buyHref: 'https://s.shopee.co.th/60RyVcvsnS',
    buyLabel: 'Buy on Shopee',
  },
  {
    label: 'Monitor',
    value: 'MSI MAG 244F · 24-inch FHD, 200Hz',
    productHref: 'https://www.msi.com/Monitor/MAG-244F',
    buyHref: 'https://s.shopee.co.th/4VdAjAx9Jn',
    buyLabel: 'Buy MAG 255F (newer)',
  },
  {
    label: 'Headset',
    value: 'Logitech G435 Lightspeed',
    productHref: 'https://www.logitechg.com/th-th/shop/p/g435-wireless-bluetooth-gaming-headset.981-001051',
    buyHref: 'https://s.shopee.co.th/4VdAjEj1QS',
    buyLabel: 'Buy G321 (newer)',
  },
  {
    label: 'Controller',
    value: 'Sony PlayStation 5 DualSense Wireless Controller',
    productHref: 'https://www.playstation.com/en-th/accessories/dualsense-wireless-controller/',
    buyHref: 'https://s.shopee.co.th/8fSjgkfjRq',
    buyLabel: 'Buy on Shopee',
  },
  {
    label: 'Desk',
    value: 'IKEA UTESPELARE',
    productHref: 'https://www.ikea.com/th/en/p/utespelare-gaming-desk-black-40500350/',
  },
  { label: 'Chair', value: 'DXRacer Racing Chair' },
]

export const applications = [
  { id: 'codex', name: 'Codex', category: 'AI-assisted development', icon: '/app-icons/codex.webp', href: 'https://openai.com/codex/' },
  { id: 'antigravity', name: 'Antigravity', category: 'AI-assisted development', icon: '/app-icons/antigravity.png', href: 'https://antigravity.google/' },
  { id: 'opencode', name: 'OpenCode', category: 'AI-assisted development', icon: '/app-icons/opencode.png', href: 'https://opencode.ai/' },
  { id: 'ghostty', name: 'Ghostty', category: 'Desktop apps', icon: '/app-icons/ghostty.png', href: 'https://ghostty.org/' },
  { id: 'vscode', name: 'VS Code', category: 'Desktop apps', icon: '/app-icons/vs-code.png', href: 'https://code.visualstudio.com/' },
  { id: 'muse', name: 'Muse', category: 'Desktop apps', icon: '/app-icons/muse.png', href: 'https://muse.ai/' },
  { id: 'orbstack', name: 'OrbStack', category: 'Desktop apps', icon: '/app-icons/orbstack.png', href: 'https://orbstack.dev/' },
]
