interface Choice {
  name: string
  value: any
}

export function searchChoices(choices: Choice[], input?: string) {
  if (!input)
    return choices
  return choices.filter(choice => choice.name.toLowerCase().includes(input.toLowerCase()))
}
