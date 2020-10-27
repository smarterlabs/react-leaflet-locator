import React, { useState, useRef, useEffect } from 'react'
import { LatLng, LatLngBounds } from "leaflet"
import { Map, TileLayer, CircleMarker } from "react-leaflet"

import 'leaflet-geosearch/assets/css/leaflet.css'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-markercluster/dist/styles.min.css'

export default function TestMap(){
	const [center] = useState([51.505, -0.09])
	const [zoom] = useState(6)
	const [markers, setMarkers] = useState([])
	const [allMarkers, setAllMarkers] = useState(null)
	const mapEl = useRef(null)

	function generateMarkers(count, bounds) {
		const minLat = bounds.getSouthWest().lat,
			rangeLng = bounds.getNorthEast().lat - minLat,
			minLng = bounds.getSouthWest().lng,
			rangeLat = bounds.getNorthEast().lng - minLng

		const result = Array.from({ length: count }, () => {
			return new LatLng(
				minLat + Math.random() * rangeLng,
				minLng + Math.random() * rangeLat,
			)
		})
		return result
	}

	useEffect(() => {
		const southWest = new LatLng(30.0, -20.0),
			northEast = new LatLng(60.0, 20.0),
			bounds = new LatLngBounds(southWest, northEast)
		setAllMarkers(generateMarkers(20000, bounds))
		displayMarkers()
	}, [])

	function displayMarkers() {
		const map = mapEl.current.leafletElement
		const markers = allMarkers?.filter?.(m => map.getBounds().contains(m)) || []
		// console.log(markers)
		setMarkers(markers)
	}

	const locations = markers.map((v, i) => (
		<CircleMarker key={i} center={v} radius={3} />
	))

	return (
		<div style={{
			width: `600px`,
			height: `600px`,
		}}>
			<Map
				onMoveEnd={displayMarkers}
				preferCanvas={false}
				ref={mapEl}
				center={center}
				zoom={zoom}
				style={{
					height: `100%`,
					width: `100%`,
				}}
			>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
				{locations}
			</Map>
		</div>
		
	)
}