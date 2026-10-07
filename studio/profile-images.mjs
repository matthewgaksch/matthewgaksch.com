import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')

for (const width of [480, 768, 1200, 2000]) {
  await sharp(path.join(publicDir, 'profile.png'))
    .resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 95, effort: 6 })
    .toFile(path.join(publicDir, `profile-${width}.webp`))
}
