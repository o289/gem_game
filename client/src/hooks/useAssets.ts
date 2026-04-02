import { useEffect, useState } from 'react'
import { preloadImages } from '../util/preloadImages'
import { TokenColor } from 'shared/types'

const TOKEN_TYPES: TokenColor[] = ['diamond', 'emerald', 'onyx', 'ruby', 'sapphire', 'gold']

const generateImagePaths = () => {
  const paths: string[] = []

  TOKEN_TYPES.forEach(token => {
    paths.push(`/img/${token}.png`)

    for (let i = 1; i <= 6; i++) {
      paths.push(`/img/${token}/${token}_${i}.png`)
    }
  })

  // card level images
  for (let i = 1; i <= 3; i++) {
    paths.push(`/img/card_lv_${i}.png`)
  }

  return paths
}

export const useAssets = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      const paths = generateImagePaths()
      await preloadImages(paths)
      setLoaded(true)
    }

    load()
  }, [])

  return loaded
}