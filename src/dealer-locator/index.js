import React, { useState, useRef, useEffect } from 'react'
import { css, Global } from '@emotion/core'

import 'leaflet-geosearch/assets/css/leaflet.css'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-markercluster/dist/styles.min.css'

import Search from './Search'
import LocatorList from './LocatorList'
import CurrentLocation from './CurrentLocation'

const markers = [
	{ 
		name: `test1`, 
		lat: 37.9716, 
		lng: -87.5711, 
		hours: `8:00pm`, 
		phone: `123-123-1234`,
	},
	{ 
		name: `test2`, 
		lat: 37.8716, 
		lng: -87.5711,
		hours: `8:00pm`, 
		phone: `123-123-1234`,
	},
	{ 
		name: `test3`, 
		lat: 37.7716, 
		lng: -87.5711,
		hours: `8:00pm`, 
		phone: `123-123-1234`,
	},
	{ 
		name: `test4`, 
		lat: 37.6716, 
		lng: -87.5711,
		hours: `8:00pm`, 
		phone: `123-123-1234`,
	},
	{ 
		name: `test5`, 
		lat: 37.5716, 
		lng: -87.5711,
		hours: `8:00pm`, 
		phone: `123-123-1234`,
	},
]

export default function MapLocator(props) {
	const { center, zoom, maxZoom } = props
	const mapEl = useRef(null)
	const [leaflet, setLeaflet] = useState({})
	const [visibleLocations, setVisibleLocations] = useState([])
	const [locations, setLocations] = useState(null)
	const [currentLocation, setCurrentLocation] = useState(null)
	
	const {
		Map,
		TileLayer,
		Marker,
		Popup,
		MarkerClusterGroup,
		icon,
		OpenStreetMapProvider,
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

				const {
					default: MarkerClusterGroup,
				} = await import(`react-leaflet-markercluster`)

				const { OpenStreetMapProvider } = await import(`leaflet-geosearch`)

				// const initBounds = L.latLngBounds()
				// markers.forEach(m => {
				// 	const { lat, lng } = m
				// 	initBounds.extend([lat, lng])
				// })

				setLeaflet({
					Map,
					TileLayer,
					Marker,
					Popup,
					MarkerClusterGroup,
					icon,
					// initBounds,
					OpenStreetMapProvider,
					leaf: L,
				})
			}
		}
    
		init()

		// Wait for map ref to be available and update
		const interval = setInterval(() => {
			if(!mapEl.current) return
			clearInterval(interval)
			handleMove()
		}, 10)
	}, [])

	useEffect(() => {
		// search was not setting locations before handleMove() was
		// getting called. This is to make sure the most current locations
		// are visisble in the locator list
		handleMove()
	}, [locations])

	// keeps track of visible locations in the current bounds
	const handleMove = () => {
		console.log(`Handle Move: `, locations)
		const foundLocations = []
		if(mapEl?.current){
			const mapBounds = mapEl?.current?.leafletElement?.getBounds()
			
			if(locations) {
				locations.forEach(location => {
					const { lat, lng } = location
					if(mapBounds?.contains([lat, lng])){
						foundLocations.push(location)
					}
				})
			}
		}
    
		setVisibleLocations(foundLocations)
	}

	// handles search functionality and updating the map location
	async function handleSearch(location) {	
		if(location){
			const { bounds, x, y } = location
			const [bottomLeft, topRight] = bounds

			const [maxLat, maxLng] = topRight
			const [minLat, minLng] = bottomLeft

			const searchCenter = [y, x]
			const leafletElement = mapEl?.current?.leafletElement

			const locationsInBounds = markers
				.filter(({ lat, lng }) => (
					(lat >= minLat) &&
					(lat <= maxLat) &&
					(lng >= minLng) &&
					(lng <= maxLng)
				))
				.map(marker => {
					const markerCenter = [marker.lat, marker.lng]
					const distance = (leafletElement?.distance(markerCenter, searchCenter)) * 0.00062137
					return { ...marker, distance }
				})

			setLocations(locationsInBounds)
			
			if(bounds && leafletElement) { 
				leafletElement.fitBounds([bottomLeft, topRight])
			}
		}
	}

	if(!Map) {
		return (
			<div className="loading">Loading...</div>
		)
	}

	return (
		<>
			<Global 
				styles={styles.global}
			/>
			<Search
				onSearch={handleSearch}
				OpenStreetMapProvider={OpenStreetMapProvider}
				leaf={leaf}
				mapEl={mapEl}
				center={center || [40.2502757,-85.9485402]}
				zoom={zoom || 5}
			/>
			<div css={styles.mapContainer} className="locatorContainer">
				<Map
					center={center || [40.2502757,-85.9485402]}
					zoom={zoom || 5}
					maxZoom={maxZoom || 30}
					css={styles.map}
					onMoveend={handleMove}
					ref={mapEl}
				>
					<TileLayer 
						attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
						url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
					/>
					{locations && (
						<MarkerClusterGroup>
							{locations.map((m, i) => {
								const { lat, lng, name } = m
								return (
									<Marker key={i} icon={icon} position={[lat, lng]}>
										<Popup>
											<div>{name}</div>
										</Popup>
									</Marker>
								)
							})}
						</MarkerClusterGroup>
					)}
				</Map>
			</div>
			<CurrentLocation mapEl={mapEl} setCurrentLocation={setCurrentLocation} />
			<LocatorList locations={markers} currentLocation={currentLocation} />
		</>
	)
}

const styles = {
	global: css`
    body {
      margin: 0;
    } 
	`,
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