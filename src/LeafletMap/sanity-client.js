import sanityClient from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

import { sanityConfig } from './config'
const { projectId, dataset } = sanityConfig

export default function SanityClient() {
  const client = sanityClient({
    projectId,
    dataset,
    useCdn: true,
  })
  
  const builder = imageUrlBuilder(client)
  
  function sanityImg(source) {
    return builder.image(source)
  }

  return {
    sanityImg,
    client,
  }
}
