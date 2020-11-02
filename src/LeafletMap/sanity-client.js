import sanityClient from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'


export default function SanityClient(projectId = ``, dataset = ``) {
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
