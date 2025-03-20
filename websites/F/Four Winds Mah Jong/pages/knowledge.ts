export default function handler(presenceData: PresenceData): void {
  const mainFrame = document.querySelector<HTMLFrameElement>(
    'frame[src=\'kbstart.htm\']',
  )!
  const { contentDocument } = mainFrame

  presenceData.details = 'Viewing the knowledge base'
  presenceData.state = contentDocument?.querySelector('h3')
}
