import inquirer from 'inquirer'
import figlet from 'figlet'
import {
  bgCyan,
  bgGreen,
  bgRed,
  bgYellow,
  black,
  blackBright,
  blue,
  bold,
  cyan,
  dim,
  green,
  italic,
  magenta,
  red,
  underline,
  white,
  yellow
} from 'colorette'
import { openLink } from '../helpers/open.js'

export const colours = {
  bgCyan,
  bgGreen,
  bgRed,
  bgYellow,
  black,
  blackBright,
  blue,
  bold,
  cyan,
  dim,
  green,
  italic,
  magenta,
  red,
  underline,
  white,
  yellow
}

export const OPTION_VALUES = {
  Backup: Symbol('backup'),
  ListAlbums: Symbol('listalbums'),
  ListAllPhotos: Symbol('listallphotos'),
  DeleteAnAlbum: Symbol('deleteanalbum'),
  DeleteAllAlbums: Symbol('deleteallalbums'),
  Token: Symbol('token'),
  Exit: Symbol('exit')
}

const mainOptions = [
  {
    type: 'list',
    name: 'option',
    message: 'Seleccione una opción',
    choices: [
      {
        value: OPTION_VALUES.Backup,
        name: `${blue('1.')} Hacer backup de fotos`
      },
      {
        value: OPTION_VALUES.ListAlbums,
        name: `${blue('2.')} Listar todos mis albumes`
      },
      {
        value: OPTION_VALUES.ListAllPhotos,
        name: `${blue('3.')} Listar todas mis fotos`
      },
      {
        value: OPTION_VALUES.DeleteAnAlbum,
        name: `${blue('4.')} Eliminar fotos de un album`
      },
      {
        value: OPTION_VALUES.DeleteAllAlbums,
        name: `${blue('5.')} Eliminar fotos de todos los albumes`
      },
      {
        value: OPTION_VALUES.Token,
        name: `${blue('6.')} Obtener token de Facebook`
      },
      {
        value: OPTION_VALUES.Exit,
        name: `${red('0.')} Salir`
      }
    ]
  }
]

export const mainMenu = async () => {
  try {
    console.clear()

    console.log(
      bold(
        blue(
          figlet.textSync('FPB-CLI', {
            font: 'ANSI Shadow',
            horizontalLayout: 'default',
            verticalLayout: 'default'
          })
        )
      )
    )

    console.log(`
${bgCyan(blackBright(bold(' Facebook Photos Backup ')))}
${dim(italic('Herramienta de respaldo y eliminación de fotos.'))}
${dim(`${italic('Desarrollada por')} ${underline('@dany-eduard')}`)}
`)

    const { option } = await inquirer.prompt(mainOptions)
    return option
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const InputType = {
  Input: 'input',
  Number: 'number',
  Confirm: 'confirm',
  List: 'list',
  Expand: 'expand',
  Checkbox: 'checkbox'
}

export const readInput = async ({ message = '', type = InputType.Input }) => {
  const question = [
    {
      type,
      name: 'value',
      message,
      validate(value) {
        if (value.length === 0) {
          return 'Por favor ingrese un valor'
        }
        return true
      }
    }
  ]

  const { value } = await inquirer.prompt(question)
  return value
}

export const LIST_ALBUMS_OPTION_VALUES = {
  Go: Symbol('go'),
  Back: Symbol('back')
}

const listAlbumsOptions = [
  {
    type: 'list',
    name: 'option',
    message: 'Seleccione una opción',
    choices: [
      {
        value: LIST_ALBUMS_OPTION_VALUES.Go,
        name: 'Abrir album en el navegador'
      },
      {
        value: LIST_ALBUMS_OPTION_VALUES.Back,
        name: 'Atrás'
      }
    ]
  }
]

const goToAlbumOptions = [
  {
    type: 'list',
    name: 'albumLink',
    message: '¿A qué album quiere ir?',
    choices: [{}]
  }
]

export const listAlbumsMenu = async ({ albums = [] }) => {
  const { option } = await inquirer.prompt(listAlbumsOptions)
  if (option === LIST_ALBUMS_OPTION_VALUES.Go) {
    const choices = albums.map((a) => ({ value: a.link, name: a.name }))
    choices.push({ value: LIST_ALBUMS_OPTION_VALUES.Back, name: '<<< Llevame atrás <<<' })
    goToAlbumOptions[0].choices = choices

    const { albumLink } = await inquirer.prompt(goToAlbumOptions)
    if (albumLink === LIST_ALBUMS_OPTION_VALUES.Back) return
    return await openLink({ link: albumLink, showLoading: true })
  }
}

export const pause = async () => {
  const question = [
    {
      type: 'input',
      name: 'enter',
      message: `Presione ${blue('enter')} para continuar`
    }
  ]

  console.log('\n')
  await inquirer.prompt(question)
}

export const printMessage = async ({ message = '', color = 'green', bgColor = '', txtStyle = '' }) => {
  if (color !== '') '_' + color
  if (bgColor !== '') '_' + bgColor
  if (txtStyle !== '') '_' + txtStyle

  if (typeof global[color] === 'function' && typeof global[bgColor] === 'function' && typeof global[txtStyle] === 'function') {
    return global[txtStyle](global[bgColor](global[color](message)))
  } else if (typeof global[color] === 'function' && typeof global[bgColor] === 'function') {
    return global[bgColor](global[color](message))
  } else if (typeof global[color] === 'function') {
    return global[color](message)
  } else {
    console.error(`La función "${color}" no existe.`)
  }
}
