import CliTable from 'cli-table3'
import { formatDateToHuman, DateTimeStyle } from '../helpers/date.js'
import { colours } from './inquirer.js'
import { shortenString } from '../helpers/string.js'

const { blue, dim, underline, bold, bgRed, bgCyan, italic } = colours

export const buildReadmeContentWithAlbumInfo = ({ name, created_time, updated_time, link, count }) => {
  return `
# ${name}  

**Creado:** ${formatDateToHuman(new Date(created_time))}  
**Última actualización:** ${formatDateToHuman(new Date(updated_time))}  
**Enlace:** ${link}  
**Número de fotos:** ${count}  
`
}

export const printAlbumTable = ({ albums = [] }) => {
  const head = ['ID', 'Nombre', 'Número de fotos', 'Creado', 'Última actualización']
  const table = new CliTable({
    head: head.map((h) => bold(blue(h))),
    colWidths: [null, null, null, null, null],
    wordWrap: true,
    wrapOnWordBoundary: false
  })

  for (const album of albums) {
    const { id, name, count, created_time, updated_time } = album
    const createdTime = `${formatDateToHuman(new Date(created_time), { dateStyle: DateTimeStyle.Medium, timeStyle: DateTimeStyle.Undefined })}`
    const updatedTime = `${formatDateToHuman(new Date(updated_time), { dateStyle: DateTimeStyle.Medium, timeStyle: DateTimeStyle.Undefined })}`
    table.push([id, name, count, createdTime, updatedTime])
  }
  table.push([bold(blue('Total')), albums.length])

  console.log(table.toString())
}

export const printAllPhotosTable = ({ photos = [] }) => {
  const head = ['ID', 'Nombre', 'Creado']
  const table = new CliTable({
    head: head.map((h) => bold(blue(h))),
    colWidths: [null, 40, null],
    wordWrap: true,
    wrapOnWordBoundary: false
  })

  for (const photo of photos) {
    let { id, name, created_time } = photo
    const createdTime = `${formatDateToHuman(new Date(created_time), { dateStyle: DateTimeStyle.Medium, timeStyle: DateTimeStyle.Undefined })}`
    table.push([id, `${shortenString({ string: name, len: 30 }) || ''}`, createdTime])
  }
  table.push(['Total', photos.length])

  console.log(table.toString())
}
