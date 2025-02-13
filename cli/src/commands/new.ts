import { existsSync } from 'node:fs'
import { cp, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { Validator } from 'jsonschema'
import { getDiscordUser, getDiscordUserById } from '../util/getDiscordUser.js'
import { getFolderLetter } from '../util/getFolderLetter.js'
import { getSchema } from '../util/getSchema.js'
import { isFirstTimeAuthor } from '../util/isFirstTimeAuthor.js'
import { exit, prefix, success } from '../util/log.js'
import { sanitazeFolderName } from '../util/sanitazeFolderName.js'
import { build } from './build.js'
import { versionizeActivity } from './versionize.js'

export async function newActivity(activity?: string) {
  if (!activity) {
    ({ activity } = await inquirer.prompt({
      type: 'input',
      name: 'activity',
      message: 'What is the name of the activity?',
      validate: input => !!input,
    }).catch(() => ({ activity: undefined })))
  }

  if (!activity) {
    exit('Activity name is required')
  }

  const folderLetter = getFolderLetter(activity)
  const sanitazedActivity = sanitazeFolderName(activity)
  const path = resolve(process.cwd(), 'websites', folderLetter, sanitazedActivity)

  if (existsSync(path)) {
    const { versionize } = await inquirer.prompt({
      type: 'confirm',
      name: 'versionize',
      message: 'The activity already exists. Would you like to create a new api version for it?',
    })

    if (versionize)
      return versionizeActivity(activity)

    const { develop } = await inquirer.prompt({
      type: 'confirm',
      name: 'develop',
      message: 'Would you like to develop the activity?',
    })

    if (develop)
      return build(activity, { watch: true })

    exit('Activity already exists')
  }

  const schema = await getSchema()
  const v = new Validator()
  v.addSchema({ definitions: schema.definitions })

  const discordUser = await getDiscordUser()
  let author: { id: string, name: string } | undefined = discordUser ? { id: discordUser.id, name: discordUser.username! } : undefined

  const { category, tags } = await inquirer.prompt([
    {
      name: 'author',
      message: 'Discord ID of the author',
      default: discordUser?.id,
      type: 'input',
      validate: async (input) => {
        if (!input)
          return 'Author cannot be empty!'

        const user = discordUser?.id === input ? discordUser : await getDiscordUserById(input)

        if (!user)
          return 'User not found.'

        author = { id: input, name: user.username! }

        return true
      },
      transformer: (input: string) => {
        return author ? author.name : input
      },
    },
    {
      name: 'tags',
      message: 'Tags of the Presence (separate multiple tags with a comma)',
      type: 'input',
      validate: (input: string) => {
        if (!input)
          return 'Tags cannot be empty!'

        const schemaRes = v.validate(input.split(','), schema.properties.tags)

        if (!schemaRes.valid)
          return schemaRes.errors[0].message
        return true
      },
    },
    {
      name: 'category',
      message: 'Category of the service',
      type: 'list',
      choices: schema.properties.category.enum,
    },
  ]).catch(() => exit('Something went wrong.'))

  const metadata = {
    $schema: 'https://schemas.premid.app/metadata/1.13',
    apiVersion: 1,
    author,
    service: activity,
    description: {
      en: 'TODO',
    },
    url: 'google.com',
    version: '1.0.0',
    logo: 'https://i.imgur.com/000000.png',
    thumbnail: 'https://i.imgur.com/000000.png',
    color: '#000000',
    category,
    tags: tags.split(','),
  }

  const result = v.validate(metadata, schema)
  if (!result.valid) {
    exit(result.toString())
  }

  await mkdir(path, { recursive: true })
  await writeFile(resolve(path, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`)
  await cp(resolve(fileURLToPath(import.meta.url), '../../../templates/tsconfig.json'), resolve(path, 'tsconfig.json'))
  await cp(resolve(fileURLToPath(import.meta.url), `../../../templates/presence${await isFirstTimeAuthor(author!.id) ? '' : '.min'}.ts`), resolve(path, 'presence.ts'))

  success(
    `Activity created successfully! ${chalk.grey(chalk.underline(resolve(path, 'metadata.json')))}\n${prefix} ${chalk.white('Please edit the metadata.json file and add the correct information.')}\n${prefix} ${chalk.white(`After that, run ${chalk.cyan(`${prefix} dev "${activity}"`)} to start developing the activity.`)}`,
  )
}
