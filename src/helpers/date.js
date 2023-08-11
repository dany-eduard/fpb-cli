export const DateTimeStyle = {
  Long: 'long',
  Short: 'short',
  Full: 'full',
  Medium: 'medium',
  Undefined: undefined
}

export const formatDateToHuman = (date = new Date(), options = {}) => {
  let { locales, dateStyle, timeStyle } = options

  !locales && (locales = 'es-CO')
  !dateStyle && dateStyle !== undefined && (dateStyle = DateTimeStyle.Long)
  !timeStyle && timeStyle !== undefined && (timeStyle = DateTimeStyle.Short)

  return new Intl.DateTimeFormat(locales, {
    dateStyle,
    timeStyle
  }).format(new Date(date))
}
