import { useEffect, useState } from 'react'

import sanityClient from '../sanity-client'

import { sanityConfig } from '../config'
const { projectId, dataset } = sanityConfig

export default function FetchLocations(){
  const { client } = sanityClient(projectId, dataset)

  const [locations, setLocations] = useState([])

  useEffect(() => {
    let isSubscribed = true

    if(typeof window !== `undefined`){
      const domain = window.location.hostname
      const getLocations = async () => {
        try {
          const domainQuery = /* groq */`*[_type == "domain" && url match [$domain, $nakedDomain]]`
          const domainParams = { nakedDomain: `${domain.replace(`www.`, ``)}`, domain }
          console.log(`Domain Params: `, domainParams)
          const domainData = await client.fetch(domainQuery, domainParams)
        
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
          const domainId = domainData?.[0]?._id
          if(!domainId){
            throw Error(`"${domain}" is an invalid domain because it was not added to the domain list in sanity`)
          }
          const locationParams = { domainId }
          const locationData = await client.fetch(locationQuery, locationParams)
          if(isSubscribed) {
            setLocations(locationData)
          }
        } catch(error){
          if(isSubscribed) {
            console.error(error)
            setLocations({ error })
          }
        }
      }
      
      getLocations()
    }
    return () => (isSubscribed = false)
  }, [])

  return [locations, setLocations]

}