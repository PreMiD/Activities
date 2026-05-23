import type { User } from 'discord-rpc'
import { Client } from 'discord-rpc'

export async function getDiscordUser(): Promise<User | undefined> {
  try {
    const client = new Client({ transport: 'ipc' })

    await client.login({ clientId: '503557087041683458' })

    const { user } = client

    await client.destroy()

    return user
  }
  catch {
    return undefined
  }
}

export async function getDiscordUserById(
  id: string,
): Promise<{ username: string } | undefined> {
  const res = await fetch('https://api.premid.app/v3/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `query getUser($id: String!) {
        discordUsers(userId: $id) {
          username
        }
      }`,
      variables: { id },
    }),
  })

  try {
    const { data } = await res.json()
    return data.discordUsers[0]
  }
  catch {
    return { username: 'unknown-please-replace' }
  }
}
