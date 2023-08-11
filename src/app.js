#!/usr/bin/env node

import { mainMenu, listAlbumsMenu, readInput, pause, colours, OPTION_VALUES } from './lib/inquirer.js'
import { backupUserPhotos, listUserAlbums, listUserPhotos } from './lib/facebook.js'
import { printAlbumTable, printAllPhotosTable } from './lib/templates.js'
import { openLink } from './helpers/open.js'

const { blue, underline, bold, italic, bgRed, bgCyan } = colours

const main = async () => {
  let hasBackup = false
  let op = null
  let fbToken = null
  let albums = []
  let photos = []

  let linkText = ''
  let linkURL = ''
  let styledLink = ''

  do {
    op = await mainMenu()
    switch (op) {
      case OPTION_VALUES.Backup:
        fbToken = await readInput({ message: 'Ingresa el token de Facebook:', type: 'password' })
        const backupDirectory = await readInput({ message: 'Ingrese la ruta donde guardar el backup' })
        await backupUserPhotos({ accessToken: fbToken, showLoading: true, backupDirectory })
        hasBackup = true
        break
      case OPTION_VALUES.ListAlbums:
        if (!fbToken) fbToken = await readInput({ message: 'Ingresa el token de Facebook:', type: 'password' })
        if (!albums.length) albums = await listUserAlbums({ accessToken: fbToken })
        printAlbumTable({ albums })
        await listAlbumsMenu({ albums })
        break
      case OPTION_VALUES.ListAllPhotos:
        if (!fbToken) fbToken = await readInput({ message: 'Ingresa el token de Facebook:', type: 'password' })
        if (!photos.length) photos = await listUserPhotos({ accessToken: fbToken, showLoading: true })
        printAllPhotosTable({ photos })
        break
      case OPTION_VALUES.DeleteAnAlbum:
        if (!fbToken) fbToken = await readInput({ message: 'Ingresa el token de Facebook:', type: 'password' })
        if (!hasBackup) {
          await backupUserPhotos({ accessToken: fbToken })
          hasBackup = true
        }
        await openLink({ link: 'https://www.facebook.com/help/152153388188974', name: styledLink, showLoading: false })
        break
      case OPTION_VALUES.DeleteAllAlbums:
        if (!fbToken) fbToken = await readInput({ message: 'Ingresa el token de Facebook:', type: 'password' })
        await openLink({ link: 'https://www.xataka.com/basics/como-borrar-todas-publicaciones-facebook-a-vez', name: styledLink, showLoading: false })
        break
      case OPTION_VALUES.Token:
        linkText = 'Explorador de la API Graph'
        linkURL = 'https://developers.facebook.com/tools/explorer'
        styledLink = blue(underline(linkText))

        console.log(
          `
Para generar un FB token puedes usar ${styledLink}
El token debe ser de tipo usuario.
El token debe tener los permisisos:
${bgCyan(' x ')} [${italic('public_profile')}] por defecto
${bgCyan(' x ')} [${italic('user_photos')}] para obtener albumes y fotos
\n`
// ${bgCyan(' x ')} [${italic('publish_actions')}] para eliminar fotos\n`
        )

        await openLink({ link: linkURL, name: styledLink, showLoading: true })

        break
      default:
        linkURL = 'https://github.com/dany-eduard'
        styledLink = bold(`GitHub: ${underline('@dany-eduard')}`)

        await openLink({ link: linkURL, name: styledLink, showLoading: true })
        break
    }
    await pause()
  } while (op && op !== OPTION_VALUES.Exit)
}

main()
