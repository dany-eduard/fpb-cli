import fs from 'node:fs'
import axios from 'axios'
import ora from 'ora'
import { exiftool } from 'exiftool-vendored'
import { buildReadmeContentWithAlbumInfo } from './templates.js'
import { FACEBOOK_HOST_API, DEVELOPMENT } from '../config/globals.js'

export async function listUserPhotos({ accessToken = '', showLoading = false }) {
  let spinner = null
  if (showLoading) spinner = ora({ text: 'Obteniendo fotos' }).start()
  try {
    const url = `${FACEBOOK_HOST_API}/me/photos?limit=1000&type=uploaded&fields=name%2Csource%2Calt_text%2Clink%2Cid%2Ccreated_time&access_token=${accessToken}`
    const response = await axios.get(url)
    const photos = response.data.data
    DEVELOPMENT && fs.writeFile(`./logs/debug/listUserPhotos_${Date.now()}.json`, JSON.stringify(response.data, null, 2), () => console.log('logged'))
    if (showLoading && spinner) spinner?.succeed('')
    return photos
  } catch (error) {
    error = error?.response?.data?.error || error
    fs.writeFile(`logs/errors/listUserPhotos_${Date.now()}-error.log`, JSON.stringify(error, null, 2), () => console.log('error logged...'))
    if (showLoading && spinner) spinner?.fail(`Error buscando fotos. ${error?.message || error}`)
    throw new Error(error)
  }
}

export async function getPhotoById({ photoId = '', accessToken = '' }) {
  try {
    const url = `${FACEBOOK_HOST_API}/${photoId}?fields=name%2Csource%2Calt_text%2Clink%2Cid%2Ccreated_time&access_token=${accessToken}`
    const response = await axios.get(url)
    const photo = response.data
    DEVELOPMENT && fs.writeFileSync(`./getPhotoById-${photoId}.json`, JSON.stringify(photo, null, 2))
    return photo
  } catch (error) {
    error = error?.response?.data?.error || error
    fs.writeFile(`logs/errors/getPhotoById_${Date.now()}-error.log`, JSON.stringify(error, null, 2), () => console.log('error logged...'))
    throw new Error(error)
  }
}

export async function listUserAlbums({ accessToken = '', fields = '' }) {
  try {
    if (!fields) fields = 'updated_time%2Cname%2Ccreated_time%2Ccount%2Cdescription%2Clink'
    const url = `${FACEBOOK_HOST_API}/me/albums?fields=${fields}&access_token=${accessToken}`
    const response = await axios.get(url)
    const albumes = response.data.data
    DEVELOPMENT && fs.writeFileSync(`./logs/debug/listUserAlbums-${Date.now()}.json`, JSON.stringify(albumes, null, 2))
    return albumes
  } catch (error) {
    console.error(error.message)
    error = error?.response?.data?.error || error
    fs.writeFile(`logs/errors/listUserAlbums_${Date.now()}-error.log`, JSON.stringify(error, null, 2), () => console.log('error logged...'))
    throw new Error(error)
  }
}

export async function writeAlbumReadme({ albumPath = '', content = '' }) {
  if (!albumPath || !content) return false
  fs.writeFile(albumPath, content, (error) => {
    if (error) {
      fs.writeFile(`logs/errors/writeAlbumReadme_${Date.now()}-error.log`, JSON.stringify(error, null, 2), () => console.log('error logged...'))
      console.error('Error al crear el archivo:', error)
    } else {
      return true
    }
  })
}

export async function createLocalAlbumsDirectory({ albums = [], showLoading = false, backupDirectory = './public/backup' }) {
  let spinner = null
  if (showLoading) spinner = ora({ text: 'Creando directorios para albumes' }).start()

  const albumPaths = new Map()

  for (const album of albums) {
    const { name, created_time, updated_time, count, link, id } = album
    const path = `${backupDirectory}/${name.replace(/ /g, '-')}`
    try {
      await fs.promises.mkdir(path, { recursive: true })
      if (showLoading && spinner) spinner.text = `${path} creado...`
      await writeAlbumReadme({
        albumPath: `${path}/README.md`,
        content: buildReadmeContentWithAlbumInfo({ name, created_time, updated_time, link, count })
      })
      albumPaths.set(id, path)
      if (showLoading && spinner) spinner.succeed()
    } catch (error) {
      await fs.promises.writeFile(`logs/errors/createLocalAlbumsDirectory_${Date.now()}-error.log`, JSON.stringify(error, null, 2))
      console.error('Error al crear el directorio:', error)
    }
  }
  return albumPaths
}

export async function writeMetadataToImage({ imagePath = '', metadata = {} }) {
  try {
    const args = ['-overwrite_original']
    await exiftool.write(imagePath, metadata, args)
  } catch (error) {
    fs.writeFile(`logs/errors/writeMetadataToImage_${Date.now()}-error.log`, JSON.stringify(error, null, 2), () => console.log('error logged...'))
    console.error('Error al escribir los metadatos en la imagen:', error)
  }
}

export async function downloadPhoto({ url = '', path = '', metadata }) {
  try {
    const response = await axios.get(url, { responseType: 'stream' })
    const writer = fs.createWriteStream(path)
    response.data.pipe(writer)
    return /** @type {Promise<void>} */ (
      new Promise((resolve, reject) => {
        writer.on('error', reject)
        writer.on('finish', () => {
          if (metadata) writeMetadataToImage({ imagePath: path, metadata })
          return resolve()
        })
      })
    )
  } catch (error) {
    fs.writeFile(`logs/errors/downloadPhoto_${Date.now()}-error.log`, JSON.stringify(error, null, 2), () => console.log('error logged...'))
    console.error('Error al descargar foto:', error)
  }
}

export async function downloadAlbumPhotos({ albumId = '', albumDirectory = '', accessToken = '', url = '' }) {
  try {
    const fields = 'photos{id,name,created_time,link,alt_text_custom,images}'
    if (!url || url === '') url = `${FACEBOOK_HOST_API}/${albumId}?fields=${fields}&access_token=${accessToken}`
    const response = await axios.get(url)

    const nextPage = response.data.photos?.paging?.next
    const albumPhotos = response?.data?.photos?.data || response?.data?.data
    DEVELOPMENT && fs.writeFileSync(`./logs/debug/downloadAlbumPhotos-${albumId}-${Date.now()}.json`, JSON.stringify({ nextPage, albumPhotos }, null, 2))

    for await (const photo of albumPhotos) {
      const legen = 'Descargada de Facebook usando FPB-CLI'
      await downloadPhoto({
        url: photo.images[0]?.source,
        path: `${albumDirectory}/${photo.id}.jpeg`,
        metadata: {
          CreateDate: photo?.created_time,
          Title: photo?.name,
          Description: `${photo?.alt_text_custom ? photo?.alt_text_custom + '. ' + legen : legen}`,
          Author: 'dany-eduard',
          Link: photo?.link
        }
      })
    }
    if (nextPage && typeof nextPage === 'string') downloadAlbumPhotos({ url: nextPage, albumId, albumDirectory })
  } catch (error) {
    fs.writeFile(`logs/errors/downloadAlbumPhotos_${Date.now()}-error.log`, JSON.stringify(error, null, 2), () => console.log('error logged...'))
    console.error('Error al descargar foto:', error)
  }
}

export async function backupUserPhotos({ accessToken = '', showLoading = false, backupDirectory = undefined }) {
  let spinner = null
  if (showLoading) spinner = ora({ text: 'Backup en progreso' }).start()
  try {
    const albums = await listUserAlbums({ accessToken })
    const albumPaths = await createLocalAlbumsDirectory({ albums, showLoading, backupDirectory })
    for await (const [albumId, albumPath] of albumPaths.entries()) {
      await downloadAlbumPhotos({ albumId, albumDirectory: albumPath, accessToken })
    }
    if (showLoading && spinner) spinner.succeed('Backup completado!')
    else console.log('Backup completado!')
  } catch (error) {
    error = error?.response?.data?.error || error
    fs.writeFile(`logs/errors/backupUserPhotos_${Date.now()}-error.log`, JSON.stringify(error, null, 2), () => console.log('error logged...'))
    if (showLoading && spinner) spinner?.fail(`Error haciendo backup de los albumes. ${error?.message || error}`)
    throw new Error(error.message)
  }
}

// backupUserPhotos({
//   accessToken:
//     'EAADHn19lyk8BOx1K0k3YTsAWdBdgshJZCO5qUtnjti1ZCWZAfeZCPYqusld7ZCDn4tgHWfBrZAPLBUZAWXaOzE8I5pn36ws3O3AxI9ygKVWZAcDFT8ZBVRziZBTd4uZBZBjCFqXTjB4shOtz3yVZBthP1EsYxeZBj7PjpmvqIKGXZCzZA4UL8RDfl8dAfePVfOtBu44v5ZCPyjWZBhZBVXao7HyjfE5X89JywzjTcHOAP2KHIlgZCHZBw6Wowbl8GA8U6kNTV'
// })

/**
 * 104990583003509?fields=name,created_time,photos{id,name,created_time,link,images}
 * 104990583003509?fields=photos{id,name,created_time,link,picture,images}
 * Las fotos de un album
 */

/**
 * /me/albums?fields=updated_time%2Cname%2Ccreated_time%2Ccount%2Cdescription%2Clink&access_token=
 * Listar albumes del usuario
 */

/**
 * OK: Hacer backup de las fotos
 * 1. función que liste los albumes del usuario y cree un directorio con el nombre. Un archivo README.md con información del albúm [link, fecha de creación, ultima actualización, numero de imagenes]
 * 2. función que reciba los ids de los albumes y descargue las fotos en su respectivo directorio
 */

/**
 * TODO: Eliminar las fotos por album
 * 1. Crear una función que reciba un arreglo de ids de albumes y elimine todas las fotos del album
 *    - Debe recibir un parametro opcional de fecha para excluir las fotos que tengan fecha superior
 *    - Si la imagen no está descargada mostrar una advertencia y descargarla en el directorio correspondiente
 *    - Debe entregar un reporte de las imagenes que se eliminaron
 */

/**
 * TODO: Mejorar los prints
 * 1. Crear una función que reciba un arreglo e imprima en consola los objetos
 *  - debe mostrar los enlaces
 *  - debe formatear las fechas
 *  -
 */

/**
 * TODO:
 */

// listUserPhotos()

// getPhotoById(2445702322265645, accessToken)
