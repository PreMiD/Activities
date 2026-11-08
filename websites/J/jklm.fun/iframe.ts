import { GameType } from './data/types.js'

const iframe = new iFrame()

async function getGameType(): Promise<GameType> {
  const gameUrl = await iframe.getUrl()

  if (gameUrl.includes('/games/bombparty'))
    return GameType.BombParty
  if (gameUrl.includes('/games/popsauce'))
    return GameType.PopSauce

  return GameType.None
}

function getBombPartyData(): { currentPrompt: string | null } {
  const currentPromptElement = document.querySelector('.round .syllable')

  return {
    currentPrompt: currentPromptElement?.textContent || null,
  }
}

async function getRulesData(gameType: GameType): Promise<{ dictionary: string | null, maxPlayers: number | null, difficulty: string | null, lives: number | null }> {
  // Universal for both games
  const dictionaryElement = document.querySelector('.quickRules .summary .dictionary')
  const livesElement: HTMLInputElement | null = document.querySelector('.setting.rule.lives input.starting')
  const maxPlayerElement: HTMLInputElement | null = document.querySelector('.setting.rule.maxPlayers .field.range input[type="number"]')

  let difficulty: HTMLElement | null = null

  if (gameType === GameType.BombParty) {
    difficulty = document.querySelector('.quickRules .wordsPerPrompt')
  }
  else if (gameType === GameType.PopSauce) {
    difficulty = document.querySelector('.quickRules .summary .scoreGoal')
  }

  return {
    dictionary: dictionaryElement?.textContent || null,
    maxPlayers: maxPlayerElement ? Number.parseInt(maxPlayerElement.value || '0', 10) : null,
    lives: livesElement ? Number.parseInt(livesElement.value || '0', 10) : null,
    difficulty: difficulty?.textContent || null,
  }
}

iframe.on('UpdateData', async () => {
  const gameType = await getGameType()
  if (gameType === GameType.None) {
    iframe.send({
      gameType,
      game: null,
      rules: null,
    })
    return
  }

  const { currentPrompt } = getBombPartyData()
  const { dictionary, lives, maxPlayers, difficulty } = await getRulesData(gameType)

  const data = {
    gameType,
    game: {
      currentPrompt: currentPrompt || '',
    },
    rules: {
      dictionary: dictionary || '',
      lives: lives || 0,
      maxPlayers: maxPlayers || 0,
      difficulty: difficulty || '',
    },
  }

  iframe.send(data)
})
