import React, { useEffect, useState, useRef } from 'react'
import { css } from '@emotion/core'

import 'leaflet/dist/leaflet.css'

export default function DirectionsMap(props) {
	const [leaflet, setLeaflet] = useState({})
	const mapEl = useRef(null)
  
	const {
		Map,
		TileLayer,
		leaf,
	} = leaflet

	useEffect(() => {
		// Dynamically import leaflet due to window in src
		async function init() {
			if (!leaflet.Map) {
				const L = await import(`leaflet`)
				
				const icon = L.divIcon({className: `markerIcon`})
  
				const {
					Map,
					TileLayer,
					Marker,
					Popup,
				} = await import(`react-leaflet`)

  
				setLeaflet({
					Map,
					TileLayer,
					Marker,
					Popup,
					icon,
					leaf: L,
				})
			}
		}
    
		init()
    
		const interval = setInterval(() => {
			if(!mapEl.current || !leaf) return
			clearInterval(interval)
			leaf.Routing.control({
				waypoints: [
					leaf.latLng(57.74, 11.94),
					leaf.latLng(57.6792, 11.949),
				],
			}).addTo(mapEl.current)
		}, 10)
	}, [])
  
	if(!Map) {
		return (
			<div className="loading">Loading...</div>
		)
	}

	return (
		<Map
			css={styles.map}
			ref={mapEl}
			center={[40.2502757,-85.9485402]}
			zoom={5}
		>
			<TileLayer 
				attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
			/>
		</Map>
	)

}

const styles = {
	map: css`
    height: 60vh;
		width: 100%;
		.leaflet-control-container {
			user-select: none;
    }
    .markerIcon {
      background: blue;
      border-radius: 50%;
    }
	`,
	mapContainer: css`
		max-width: 1000px;
		width: 100%;
		margin: 0 auto;
		z-index: 0;
		display: flex;
	`,
}

