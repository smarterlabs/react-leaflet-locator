import React from 'react'

export default function CurrentLocation(props) {
	const { mapEl, setCurrentLocation } = props

	function showPosition(position){
		if(position.coords){
			setCurrentLocation(position.coords)
			const { latitude, longitude } = position?.coords || {}
			if(mapEl) { 
				const { leafletElement } = mapEl?.current
				leafletElement.flyTo([latitude, longitude], 12)
			}
		}
	}

	function useLocalLocation() {
		if(typeof window !== `undefined`){
			const geolocation = window?.navigator?.geolocation
			if(geolocation) {
				geolocation.getCurrentPosition(showPosition)
			}
		}
	}

	return (
		<div onClick={useLocalLocation}>
      use my current location
		</div>
	)
}