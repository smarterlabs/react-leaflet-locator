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


const markers = [
	{ 
		name: `test1`, 
		lat: 37.9716, 
		lng: -87.5711, 
		hours: `8:00pm`, 
		phone: `123-123-1234`,
		categories: [`category a`, `category b`],
		products: [`product a`, `product b`],
		images: [
			`https://via.placeholder.com/800/FFFF00/000000?Text=Image+1`,
			`https://via.placeholder.com/800/E5CCAA/000000?Text=Image+2`,
			`https://via.placeholder.com/800/333FFF/000000?Text=Image+3`,
		],
		email: `test1@test.com`,
		description: `here is description for test 1`,
		video: `https://youtu.be/eYiodrKoGTc`,
		address: `3655 Hwy 62 W`,
		city: `Boonville`,
		state: `IN`,
		zip: `47601`,
	},
	{ 
		name: `test2`, 
		lat: 37.8716, 
		lng: -87.5711,
		hours: `8:00pm`, 
		phone: `123-123-1234`,
		categories: [`category e`, `category d`],
		products: [`product c`],
		images: [
			`https://via.placeholder.com/800/E5CCAA/333?Text=Image+1`,
			`https://via.placeholder.com/800/E5CCAA/333?Text=Image+2`,
			`https://via.placeholder.com/800/E5CCAA/333?Text=Image+3`,
		],
		email: `test2@test.com`,
		description: `here is description for test 2`,
		video: `https://youtu.be/eYiodrKoGTc`,
		address: `3655 Hwy 62 W`,
		city: `Boonville`,
		state: `IN`,
		zip: `47601`,
	},
	{ 
		name: `test3`, 
		lat: 37.7716, 
		lng: -87.5711,
		hours: `8:00pm`, 
		phone: `123-123-1234`,
		categories: [`category c`],
		products: [`product a`],
		images: [
			`https://via.placeholder.com/800/E5CCAA/333?Text=Image+1`,
			`https://via.placeholder.com/800/E5CCAA/333?Text=Image+2`,
			`https://via.placeholder.com/800/E5CCAA/333?Text=Image+3`,
		],
		email: `test3@test.com`,
		description: `here is description for test 3`,
		video: `https://youtu.be/eYiodrKoGTc`,
		address: `3655 Hwy 62 W`,
		city: `Boonville`,
		state: `IN`,
		zip: `47601`,
	},
	{ 
		name: `test4`, 
		lat: 37.6716, 
		lng: -87.5711,
		hours: `8:00pm`, 
		phone: `123-123-1234`,
		categories: [`category e`],
		products: [`product a`, `product d`],
		images: [
			`https://via.placeholder.com/800/E5CCAA/000000?Text=Image+1`,
			`https://via.placeholder.com/800/E5CCAA/000000?Text=Image+2`,
			`https://via.placeholder.com/800/E5CCAA/000000?Text=Image+3`,
		],
		email: `test4@test.com`,
		description: `here is description for test 4`,
		video: `https://youtu.be/eYiodrKoGTc`,
		address: `3655 Hwy 62 W`,
		city: `Boonville`,
		state: `IN`,
		zip: `47601`,
	},
	{ 
		name: `test5`, 
		lat: 37.5716, 
		lng: -87.5711,
		hours: `8:00pm`, 
		phone: `123-123-1234`,
		categories: [`category a`, `category d`],
		products: [`product c`, `product b`],
		images: [
			`https://via.placeholder.com/800/E5CCAA/333?Text=Image+1`,
			`https://via.placeholder.com/800/E5CCAA/333?Text=Image+2`,
			`https://via.placeholder.com/800/E5CCAA/333?Text=Image+3`,
		],
		email: `test5@test.com`,
		description: `here is description for test 5`,
		video: `https://youtu.be/eYiodrKoGTc`,
		address: `3655 Hwy 62 W`,
		city: `Boonville`,
		state: `IN`,
		zip: `47601`,
	},
]

export default function MapLocator(props) {
	const { center, zoom, maxZoom, primaryColor = `#003CA6` } = props
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
					return { ...marker, distance: distance.toFixed(1) }
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
		<StyleContext.Provider value={{ primaryColor }}>
			<main css={styles.locatorContainer} className="locatorContainer">
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
					setFilterModal={setFilterModal}
				/>
				<div css={styles.mapContainer} className="mapContainer">
					<Map
						center={center || [40.2502757,-85.9485402]}
						zoom={zoom || 5}
						maxZoom={maxZoom || 30}
						css={styles.map}
						onMoveend={handleMove}
						ref={mapEl}
						scrollWheelZoom={false}
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

const styles = {
	locatorContainer: css`
		position: relative;
	`,
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