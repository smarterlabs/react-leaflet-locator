import { useEffect, useState } from 'react'

import sanityClient from '../sanity-client'

export default function FetchLocations(projectId, dataset){
  const { client } = sanityClient(projectId, dataset)

  const [locations, setLocations] = useState(null)

  useEffect(() => {
    if(typeof window !== `undefined`){
      const domain = document.location.hostname
      const query = /* groq */`*[ 
        _type == "dealer" && 
        $domain in domains[]
      ]`
      const params = { domain }
      const data = client.fetch(query, params)

      setLocations(data)
    }
  }, [])

  console.log(locations)

  return [locations, setLocations]

}