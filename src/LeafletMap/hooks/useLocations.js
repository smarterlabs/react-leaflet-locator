import { useEffect, useState } from 'react'

import sanityClient from '../sanity-client'



export default function FetchLocations(projectId, dataset){
  const { client } = sanityClient(projectId, dataset)

  const [locations, setLocations] = useState(null)

  useEffect(() => {
    let isSubscribed = true

    if(typeof window !== `undefined`){
      const domain = document.location.hostname
      const getLocations = async () => {
        try {
          const domainQuery = /* groq */`*[_type == "domain" && url == $domain]`
          const domainParams = { domain }
          const domainData = await client.fetch(domainQuery, domainParams)
          console.log(`Domain Data: `, domainData)
        
          const locationQuery = /* groq */`*[_type == "dealer" && domains[]._ref == $domainId]{
            ...,
            domains[]->,
            productAvailabilityList[]-> {
              ...,
              icon {
                ...,
                asset->
              }
            },
            amenitiesList[]-> {
              ...,
              icon {
              ...,
              asset->
              }
            },
            images[] { ..., asset-> },
            logo { ..., asset-> },
            mapIcon-> {
              domains[] {
                ...,
                icon { ..., asset-> }
              },
              icon { ..., asset-> }
            }
            ,
            seo {
              ...,
              twitter {
                ...,
                image {
                  ...,
                  asset->
                  }
              },
              og {
                ...,
                image {
                  ...,
                  asset->
                  }
              }
            }
          }`
          const locationParams = { domainId: domainData?.[0]?._id }
          const locationData = await client.fetch(locationQuery, locationParams)
          console.log(`Location Data: `, locationData)
          if(isSubscribed) {
            setLocations(locationData)
          }
        } catch(error){
          if(isSubscribed) {
            setLocations({ error })
          }
        }
      }
      
      getLocations()
    }
    return () => isSubscribed(false)
  }, [])

  return [locations, setLocations]

}