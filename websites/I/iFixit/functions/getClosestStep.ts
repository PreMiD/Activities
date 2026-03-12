interface Step {
  stepLink: HTMLAnchorElement | null
  stepImage: HTMLImageElement | null
  stepNumber: string | null | undefined
  stepTitle: string
}

export function getClosestStep(): Step | null {
  const steps = document.querySelectorAll('.step')
  if (steps.length === 0) {
    return null
  }
  const closestStep = Array.from(steps).reduce((closest, step) =>
    Math.abs(step.getBoundingClientRect().top)
    < Math.abs(closest.getBoundingClientRect().top)
      ? step
      : closest,
  )
  return {
    stepLink: closestStep.querySelector<HTMLAnchorElement>('.fragment-link'),
    stepImage: closestStep.querySelector<HTMLImageElement>('.stepImage img.visible'),
    stepNumber: closestStep.querySelector('.fragment-link .stepValue')
      ?.textContent,
    stepTitle:
      closestStep.querySelector('.fragment-link .stepTitleTitle')
        ?.textContent || '',
  }
}
