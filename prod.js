const fs = require('node:fs/promises')
const { join } = require('node:path')

const clearFile = async (pathFile) => {
  let file = await fs.readFile(pathFile, 'utf-8')
  file = file
    .replace('<!--', '')
    .replace('-->', '')
    .replace(`<link id="app-theme" rel="stylesheet" type="text/css" href="light.css" media="none" onload="if(media!='all')media='all'"/>`, '')
    .replace(`<link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="styles.css"></noscript>`, '')
    .replace('<link rel="stylesheet" href="styles.css">', '')
    .replace(`<link id="app-theme" rel="stylesheet" type="text/css" href="light.css" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="light.css"></noscript>`, '')
    .replace('<script src="polyfills.js" type="module"></script><script src="main.js" type="module"></script>', '')
  await fs.writeFile(pathFile, file, 'utf-8')
}

const searchFile = async (path) => {
  const folder = await fs.readdir(path)
  folder.forEach(async file => {
    const filePath = join(path, file)
    const folder = await fs.stat(filePath)
    if (folder.isDirectory()) searchFile(filePath)
    if (file.startsWith('index.') && file.endsWith('.html')) {
      clearFile(filePath)
    }
  })
}

searchFile('./dist/frontend-sisat-server')
