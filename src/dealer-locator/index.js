/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useRef, useEffect } from 'react'
import { css, Global } from '@emotion/core'

import 'leaflet-geosearch/assets/css/leaflet.css'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-markercluster/dist/styles.min.css'

import StyleContext from '../context/StyleContext'
import Search from './Search'
import LocatorList from './LocatorList'
import CurrentLocation from './CurrentLocation'
import FilterModal from './FilterModal'
import DealerPane from './DealerPane'

import markers from '../test-data'

export default function MapLocator(props) {
	const { 
		center = [40.2502757,-85.9485402], 
		zoom = 5, 
		maxZoom = 30, 
		primaryColor = `#003CA6`,
		breakpoint = `1000px`,
		mobile,
		desktop,
		mapMaxWidth = `1000px`,
	} = props

	const mapEl = useRef(null)
	const [leaflet, setLeaflet] = useState({})
	const [visibleLocations, setVisibleLocations] = useState([])
	const [locations, setLocations] = useState(null)
	const [filteredLocations, setFilteredLocations] = useState(null)
	const [currentLocation, setCurrentLocation] = useState(null)
	const [filterModal, setFilterModal] = useState(false)
	const [curLocationIdx, setCurLocationIdx] = useState(null)
	
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
		// const interval = setInterval(() => {
		// 	if(!mapEl.current) return
		// 	clearInterval(interval)
		// 	handleMove()
		// }, 10)
	}, [])

	useEffect(() => {
		// checks to see to make sure the filteredLocations are still
		// on the visisble map window
		if(filteredLocations){
			const exist = filteredLocations.filter(f => !!visibleLocations.find(v => v.name === f.name))
			setFilteredLocations(exist.length > 0 ? exist : null)
		}
	}, [visibleLocations])

	// keeps track of visible locations in the current bounds
	const handleMove = () => {
		if(mapEl?.current){
			const leafletElement = mapEl?.current?.leafletElement
			
			const mapBounds = leafletElement?.getBounds()
			const mapCenter = leafletElement?.getCenter()

			const topRight = mapBounds?.getNorthEast()
			const bottomLeft = mapBounds.getSouthWest()

			const { lat: maxLat, lng: maxLng} = topRight || {}
			const { lat: minLat, lng: minLng } = bottomLeft || {}

			const locationsInBounds = markers
				.filter(({ lat, lng }) => (
					(lat >= minLat) &&
					(lat <= maxLat) &&
					(lng >= minLng) &&
					(lng <= maxLng)
				))
				.map(marker => {
					const markerCenter = [marker.lat, marker.lng]
					const distance = (leafletElement?.distance(markerCenter, mapCenter)) * 0.00062137
					return { ...marker, distance: distance.toFixed(1) }
				})

			const newLocations = locationsInBounds?.filter(loc => !locations?.find(l => l.name === loc.name))

			setLocations([
				...(locations || []),
				...newLocations,
			])

			setVisibleLocations(locationsInBounds)
				
			// if(locations) {
			// 	locations.forEach(location => {
			// 		const { lat, lng } = location
			// 		if(mapBounds?.contains([lat, lng])){
			// 			foundLocations.push(location)
			// 		}
			// 	})
			// }
		}    
	}

	// handles search functionality and updating the map location
	async function handleSearch(location) {	
		if(location){
			const { bounds /*, x, y*/ } = location
			const [bottomLeft, topRight] = bounds

			// const [maxLat, maxLng] = topRight
			// const [minLat, minLng] = bottomLeft

			// const searchCenter = [y, x]
			const leafletElement = mapEl?.current?.leafletElement

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
		<StyleContext.Provider value={{ 
			primaryColor, breakpoint, 
			desktop, mobile, 
		}}>
			<main css={styles({ breakpoint, mapMaxWidth })} className="locatorContainer">
				<Global 
					styles={global}
				/>
				<Search
					onSearch={handleSearch}
					OpenStreetMapProvider={OpenStreetMapProvider}
					leaf={leaf}
					mapEl={mapEl}
					center={center}
					zoom={zoom}
					setFilterModal={setFilterModal}
				/>
				<div className="mapContainer">
					<Map
						center={center}
						zoom={zoom}
						maxZoom={maxZoom}
						css={styles.map}
						onMoveend={handleMove}
						ref={mapEl}
						scrollWheelZoom={false}
						className="leafletMap"
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
				<CurrentLocation 
					mapEl={mapEl} 
					setCurrentLocation={setCurrentLocation} 
				/>
				<LocatorList 
					locations={filteredLocations || visibleLocations} 
					currentLocation={currentLocation}
					setCurLocationIdx={setCurLocationIdx} 
				/>
				<FilterModal 
					active={filterModal && !!visibleLocations.length}
					setFilterModal={setFilterModal}
					locations={visibleLocations} 
					setFilteredLocations={setFilteredLocations}
				/>
				{visibleLocations?.[curLocationIdx] && (
					<DealerPane
						location={visibleLocations[curLocationIdx]}
						curLocationIdx={curLocationIdx}
						setCurLocationIdx={setCurLocationIdx}
						totalLocations={filteredLocations 
							? filteredLocations.length 
							: visibleLocations.length
						}
					/>
				)}
			</main>
		</StyleContext.Provider>
	)
}

const global = css`
	body {
		margin: 0;
	} 
`

const styles = props => css`
	position: relative;
	@media(min-width: ${props.breakpoint}) {
		display: grid;
    grid-template-areas:
        "search map"
        "curLoc map"
        "locs map";
    grid-template-columns: ${props?.desktop?.paneWidth || `40vw`} 1fr;
		grid-template-rows: 
		10vh 
		20vh 
		calc(${props?.desktop?.height || `100vh`} - 30vh);
	}
	.leafletMap {
		height: 60vh;
		width: 100%;
		.leaflet-control-container {
			user-select: none;
		}
		.markerIcon {
			background: blue;
			border-radius: 50%;
		}
		@media(min-width: ${props.breakpoint}) {
			height: 100%;
		}
	}
	.currentLocation {
		@media(min-width: ${props.breakpoint}) {
			grid-area: curLoc;
		}
	}
	.searchContainer {
		@media(min-width: ${props.breakpoint}) {
			grid-area: search;
			box-shadow: none;
		}
	}
	.locatorListContainer {
		@media(min-width: ${props.breakpoint}) {
			grid-area: locs;
			overflow: auto;
		}
	}
	.mapContainer {
		max-width: ${props.mapMaxWidth};
		width: 100%;
		margin: 0 auto;
		z-index: 0;
		display: flex;
		@media(min-width: ${props.breakpoint}) {
			grid-area: map;
			height: ${props?.desktop?.height || `100vh`};
		}
	}
`