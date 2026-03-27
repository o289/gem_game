const sounds = {
  card: new Audio('/audio/card.mp3'),
  token: new Audio('/audio/token.mp3'),
}

export const playSound = (type: keyof typeof sounds) => {
  const sound = sounds[type]
  if (!sound) return

  sound.currentTime = 0
  sound.play().catch(() => {}) // iOS対策
}