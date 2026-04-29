export default function handler(presenceData: PresenceData): void {
  // The Four Winds knowledge base uses legacy <frame> markup; HTMLFrameElement
  // and its contentDocument are flagged deprecated, but the site still requires them.
  // eslint-disable-next-line ts/no-deprecated
  const mainFrame = document.querySelector<HTMLFrameElement>(
    'frame[src=\'kbstart.htm\']',
  )!
  // eslint-disable-next-line ts/no-deprecated
  const { contentDocument } = mainFrame

  presenceData.details = 'Viewing the knowledge base'
  presenceData.state = contentDocument?.querySelector('h3')
}
