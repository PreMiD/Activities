import { GameType } from './types.js'

interface RoomData {
  code: string | null
  players: number | null
  activePlayers: number | null
  isPrivateRoom: boolean
}

export function getRoomData(gameType: GameType): RoomData {
  const roomCodeElement = document.querySelector('.info .url .roomCode')
  const playersElement = document.querySelector('.info .room .playerCount')
  const isPrivateRoom = !!document.querySelector('.info.privateRoom')

  const roomData: RoomData = {
    code: roomCodeElement?.textContent ?? null,
    players: playersElement ? Number.parseInt(playersElement.textContent || '0', 10) : null,
    activePlayers: null,
    isPrivateRoom,
  }

  if (gameType === GameType.BombParty) {
    const playersRow = document.querySelector('.statsTable tbody')

    roomData.activePlayers = playersRow ? playersRow.querySelectorAll('tr').length : null
  }
  else if (gameType === GameType.PopSauce) {
    const playersRow = document.querySelector('.scoreboard')

    roomData.activePlayers = playersRow ? playersRow.querySelectorAll('.entry').length : null
  }
  else {
    return {
      code: null,
      players: null,
      activePlayers: null,
      isPrivateRoom: false,
    }
  }
  return roomData
}
