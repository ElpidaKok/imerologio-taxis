import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const filePath = (relativePath) => fileURLToPath(new URL(relativePath, import.meta.url))
const source = filePath('../public/app-icon.svg')

await Promise.all([
  sharp(source).resize(192, 192).png().toFile(filePath('../public/app-icon-192.png')),
  sharp(source).resize(512, 512).png().toFile(filePath('../public/app-icon-512.png')),
  sharp(source).resize(180, 180).png().toFile(filePath('../public/apple-touch-icon.png')),
])

console.log('Generated PWA icons: 180px, 192px, 512px')