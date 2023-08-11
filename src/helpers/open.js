import open, { apps } from 'open'
import ora from 'ora'

export const openLink = async ({ link = '', name = '', showLoading = false }) => {
  let spinner = null

  if (showLoading) spinner = ora({ text: `${name || link}` }).start()

  try {
    await open(link, {
      wait: true,
      app: {
        name: apps.chrome
      }
    })
    if (showLoading && spinner) spinner.succeed()
  } catch (error) {
    if (showLoading && spinner) spinner?.fail(`${error?.message || error}`)
    else console.error(error)
  }
}
