export const preloadImages = async (paths: string[]) => {
  await Promise.all(
    paths.map(src => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve()
        img.onerror = () => resolve()
      })
    })
  )
}