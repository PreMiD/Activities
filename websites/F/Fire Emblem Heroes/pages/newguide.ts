export default function applyNewGuideDetails(presenceData: PresenceData): void {
  presenceData.details = 'Browsing the Guide'
  presenceData.state = document.querySelector('h1')?.textContent
  presenceData.buttons = [{ label: 'Read Guide', url: document.location.href }]
}
