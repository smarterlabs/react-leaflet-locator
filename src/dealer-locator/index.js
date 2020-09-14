import React, { useState, useRef, useEffect } from 'react'
import { css, Global } from '@emotion/core'

import 'leaflet-geosearch/assets/css/leaflet.css'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-markercluster/dist/styles.min.css'

import Search from './Search'
import LocatorList from './LocatorList'

const markers = [
	{ 
		name: `test1`, 
		lat: 37.9716, 
		lng: -87.5711, 
		hours: `6:00am - 8:00pm`, 
		phone: `123-123-1234`,
	},
	{ 
		name: `test2`, 
		lat: 37.8716, 
		lng: -87.5711,
		hours: `6:00am - 8:00pm`, 
		phone: `123-123-1234`,
	},
	{ 
		name: `test3`, 
		lat: 37.7716, 
		lng: -87.5711,
		hours: `6:00am - 8:00pm`, 
		phone: `123-123-1234`,
	},
	{ 
		name: `test4`, 
		lat: 37.6716, 
		lng: -87.5711,
		hours: `6:00am - 8:00pm`, 
		phone: `123-123-1234`,
	},
	{ 
		name: `test5`, 
		lat: 37.5716, 
		lng: -87.5711,
		hours: `6:00am - 8:00pm`, 
		phone: `123-123-1234`,
	},
]

export default function MapLocator(props) {
	const { proximitySearch } = props
	const mapEl = useRef(null)
	const [leaflet, setLeaflet] = useState({})
	const [visibleLocations, setVisibleLocations] = useState([])
	const [proxMarkers, setProxMarkers] = useState(null)
	const [loadingUser, setLoadingUser] = useState(proximitySearch)
  
	const {
		Map,
		TileLayer,
		Marker,
		Popup,
		MarkerClusterGroup,
		icon,
		latLngBounds,
		initBounds,
		useLeaflet,
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
					useLeaflet,
				} = await import(`react-leaflet`)

				const {
					default: MarkerClusterGroup,
				} = await import(`react-leaflet-markercluster`)

				const { OpenStreetMapProvider } = await import(`leaflet-geosearch`)

				const initBounds = L.latLngBounds()
				markers.forEach(m => {
					const { lat, lng } = m
					initBounds.extend([lat, lng])
				})

				setLeaflet({
					Map,
					TileLayer,
					Marker,
					Popup,
					MarkerClusterGroup,
					icon,
					latLngBounds: L.latLngBounds,
					initBounds,
					useLeaflet,
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

	// for proximity search updating prox markers and setting map
	useEffect(() => {
		if(mapEl?.current?.leafletElement){
			if(latLngBounds && proxMarkers){
				const bounds = latLngBounds()
				proxMarkers.forEach(m => {
					const { lat, lng } = m
					bounds.extend([lat, lng])
				})
				if(proximitySearch) setLoadingUser(false)

				if(bounds && mapEl) { 
					const { leafletElement } = mapEl?.current
					leafletElement.flyToBounds(bounds)
				}
			} 
		}
	}, [latLngBounds, proxMarkers, proximitySearch])
  

	// keeps track of visible locations in the current bounds
	const handleMove = () => {
		const locations = []
		if(mapEl?.current){
			const mapBounds = mapEl?.current?.leafletElement?.getBounds()
			// const dealers = proximitySearch ? proxMarkers || [] : markers
      
			markers.forEach(marker => {
				const { lat, lng } = marker
				if(mapBounds?.contains([lat, lng])){
					locations.push(marker)
				}
			})
		}
    
		setVisibleLocations(locations)
	}

	// handles search functionality and updating the map location
	async function handleSearch(location, radius = 30) {
		if(location){
			const { raw: { address }, bounds } = location
			console.log(`Address: `, address) 
			// const { state, city } = address

			// if(proximitySearch){ 
			// 	const dealers = await getDealers(city, state, radius)
			// 	const allDealers = [...dealers.local || [], ...dealers.retail || []]
			// 	setProxMarkers(allDealers)
			// } else {
			if(bounds && mapEl) { 
				const { leafletElement } = mapEl?.current
				leafletElement.flyToBounds(bounds)
			}
			// }
		}
	}
  
	const locations = proximitySearch ? proxMarkers : markers

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
				proximitySearch={proximitySearch}
				useLeaflet={useLeaflet}
				OpenStreetMapProvider={OpenStreetMapProvider}
				loadingUser={loadingUser}
				leaf={leaf}
			/>
			<div css={styles.mapContainer} className="locatorContainer">
				<LocatorList locations={locations} />
				<Map
					bounds={initBounds}
					maxZoom={30}
					css={styles.map}
					onMoveend={handleMove}
					ref={mapEl}
				>
					<TileLayer 
						attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
						url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
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
    height: 100vh;
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