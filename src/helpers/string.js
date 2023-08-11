export const shortenString = ({ string = '', len = 10 }) => {
  if (string.length > len) return string.slice(0, len) + ' ...'
  return string
}
