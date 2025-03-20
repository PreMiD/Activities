const iframe = new iFrame()

let minesweeper = {
  time: 0,
  bombs: 0,
  gameState: '',
}
let bananamp = {
  title: '',
  playing: false,
}
let defrag = {
  progress: '',
  playing: false,
  started: false,
}
let solitude = {
  stack1: '',
  stack2: '',
  stack3: '',
  stack4: '',
}
let maze = {
  distance: '',
}
let wlc = {
  currentTime: 0,
  duration: 0,
  paused: false,
}
let active = false

window.addEventListener('focus', () => {
  active = true
})

window.addEventListener('blur', () => {
  active = false
})

active = true

iframe.on('UpdateData', async () => {
  switch (document.location.pathname.split('/')[3]) {
    case 'minesweeper': {
      const counterRegExp = /(?:time|moves)(.+)\.gif/
      const time = Number.parseInt(
        `${
          document
            ?.querySelector<HTMLImageElement>('[name=\'time100s\']')
            ?.src
            .match(counterRegExp)?.[1] ?? ''
        }${
          document
            ?.querySelector<HTMLImageElement>('[name=\'time10s\']')
            ?.src
            .match(counterRegExp)?.[1] ?? ''
        }${
          document
            ?.querySelector<HTMLImageElement>('[name=\'time1s\']')
            ?.src
            .match(counterRegExp)?.[1] ?? ''
        }`,
      )
      const bombs = Number.parseInt(
        `${
          document
            ?.querySelector<HTMLImageElement>('[name=\'bomb100s\']')
            ?.src
            .match(counterRegExp)?.[1] ?? ''
        }${
          document
            ?.querySelector<HTMLImageElement>('[name=\'bomb10s\']')
            ?.src
            .match(counterRegExp)?.[1] ?? ''
        }${
          document
            ?.querySelector<HTMLImageElement>('[name=\'bomb1s\']')
            ?.src
            .match(counterRegExp)?.[1] ?? ''
        }`,
      )
      let gameState = ''
      switch (
        document
          ?.querySelector<HTMLImageElement>('#face > img')
          ?.src
          ?.match(/face(.+)\.gif/)?.[1] ?? ''
      ) {
        case 'smile': {
          gameState = 'Playing'
          break
        }
        case 'ooh': {
          gameState = 'Playing'
          break
        }
        case 'dead': {
          gameState = 'Game over'
          break
        }
        case 'win': {
          gameState = 'Victory'
          break
        }
      }
      minesweeper = {
        time,
        bombs,
        gameState,
      }
      break
    }
    case 'bananamp': {
      bananamp = {
        title: document.querySelector('#bamp_info_loaded')?.textContent ?? '',
        playing: document
          .querySelector('#bamp_play > .bamp__ico')
          ?.classList
          .contains('bamp__ico--pause') ?? false,
      }
      break
    }
    case 'defrag': {
      defrag = {
        progress: document.querySelector('#pourcentage')?.textContent ?? '',
        playing: !document
          .querySelector('#infos')
          ?.textContent
          ?.includes('paused'),
        started: !document
          .querySelector('#infos')
          ?.textContent
          ?.includes('Welcome'),
      }
      break
    }
    case 'solitude': {
      enum CardSuits {
        hearts = '♥',
        diams = '♦',
        clubs = '♣',
        spades = '♠',
      }
      const cardValues = [
        '',
        'A',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        'J',
        'Q',
        'K',
      ]

      solitude = {
        stack1: `${
          cardValues[
            Number.parseInt(
              (
                document.querySelectorAll('.foundation')[0]
                  ?.lastChild as HTMLDivElement
              )?.dataset?.cid ?? '',
            )
          ] ?? '▮'
        }${
          CardSuits[
            (
              document.querySelectorAll('.foundation')[0]
                ?.lastChild as HTMLDivElement
            )?.dataset?.type as keyof typeof CardSuits
          ] ?? '▮'
        }`,
        stack2: `${
          cardValues[
            Number.parseInt(
              (
                document.querySelectorAll('.foundation')[1]
                  ?.lastChild as HTMLDivElement
              )?.dataset?.cid ?? '',
            )
          ] ?? '▮'
        }${
          CardSuits[
            (
              document.querySelectorAll('.foundation')[1]
                ?.lastChild as HTMLDivElement
            )?.dataset?.type as keyof typeof CardSuits
          ] ?? '▮'
        }`,
        stack3: `${
          cardValues[
            Number.parseInt(
              (
                document.querySelectorAll('.foundation')[2]
                  ?.lastChild as HTMLDivElement
              )?.dataset?.cid ?? '',
            )
          ] ?? '▮'
        }${
          CardSuits[
            (
              document.querySelectorAll('.foundation')[2]
                ?.lastChild as HTMLDivElement
            )?.dataset?.type as keyof typeof CardSuits
          ] ?? '▮'
        }`,
        stack4: `${
          cardValues[
            Number.parseInt(
              (
                document.querySelectorAll('.foundation')[3]
                  ?.lastChild as HTMLDivElement
              )?.dataset?.cid ?? '',
            )
          ] ?? '▮'
        }${
          CardSuits[
            (
              document.querySelectorAll('.foundation')[3]
                ?.lastChild as HTMLDivElement
            )?.dataset?.type as keyof typeof CardSuits
          ] ?? '▮'
        }`,
      }
      break
    }
    case 'maze': {
      const readout = document
        .querySelector('.readout')
        ?.textContent
        ?.split(',')[1]
        ?.trim() ?? ''
      maze = {
        distance: `${readout.charAt(0).toUpperCase()}${readout.slice(1)}`,
      }
      break
    }
    case 'wlc': {
      wlc = {
        currentTime: document.querySelector<HTMLVideoElement>('video')?.currentTime ?? 0,
        duration: document.querySelector<HTMLVideoElement>('video')?.duration ?? 0,
        paused: document.querySelector<HTMLVideoElement>('video')?.paused ?? false,
      }
      break
    }
  }
  if (active) {
    iframe.send({
      minesweeper,
      bananamp,
      defrag,
      solitude,
      maze,
      wlc,
    })
  }
})
