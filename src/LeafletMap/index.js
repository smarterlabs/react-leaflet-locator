/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/first */

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { css, Global } from '@emotion/core'
import { injectGlobal } from 'emotion'

import useSupercluster from "use-supercluster"
import MoonLoader from "react-spinners/MoonLoader"

// import debounce from 'lodash/debounce'
injectGlobal`
${require(`leaflet/dist/leaflet.css`).toString()}
`

import Seo from './seo'
import StyleContext from './context/StyleContext'
import SanityContext from './context/SanityContext'
import Search from './Search'
import LocatorList from './LocatorList'
import CurrentLocation from './CurrentLocation'
import FilterModal from './FilterModal'
import DealerPane from './DealerPane'
import sanityClient from './sanity-client'
import useLocations from './hooks/useLocations'
import usePromise from './hooks/usePromise'

const icons = {}

const { sanityImg, client } = sanityClient()

export default function MapLocator(props) {
	const { 
		center = [40.2502757,-85.9485402],  
		maxZoom = 30, 
		primaryColor = `#003CA6`,
		breakpoint = `1000px`,
		mobile,
		desktop,
		zoom: initZoom = 4,
		mapMaxWidth = `1000px`,
		disableFilters,
		disableDealerPane,
		initSearch,
		onLocationSelect,
		seo,
		getOptions,
	} = props

	const [locations] = useLocations()

	console.log(`Locations: `, locations)
	
	const [mapIcons] = usePromise(client.fetch(/* groq */`*[_type == "mapIcon" && default == true]{
		...,
		icon { ..., asset-> },
		domains[] { ..., icon { ..., asset-> } }
	}`), null)
	const defaultMapIcon = mapIcons?.[0]

	useEffect(() => {
		if(getOptions){
			getOptions({ breakpoint })
		}
	}, [breakpoint])

	//context 

	// window state
	const [domain, setDomain] = useState(``)
	// map state and refs
	const mapEl = useRef()
	const [leaflet, setLeaflet] = useState({})
	const [bounds, setBounds] = useState(null)
	const [zoom, setZoom] = useState(initZoom)

	// map locations state
	const [visibleLocations, setVisibleLocations] = useState([])
	const [filteredLocations, setFilteredLocations] = useState(null)
	const [curLocationIdx, setCurLocationIdx] = useState(null)

	// current location state
	const [currentLocation, setCurrentLocation] = useState(null)

	// modal toggle state
	const [filterModal, setFilterModal] = useState(false)
	const [searched, setSearched] = useState(false)

	// prepare data 
	// const { allSanityDealer, defaultMapIcon } = useStaticQuery(query)

	const defaultMapIconId = defaultMapIcon?.icon?.asset?._id
	const defaultDomain = defaultMapIcon?.domains?.find(obj => {
		return obj.domain === domain.replace(`www.`, ``)  || obj.domain === domain
	})
	const defaultDomainIconId = defaultDomain?.icon?.asset?._id

	// const locations = allSanityDealer?.nodes|| []

	const points = useMemo(() => {
		return visibleLocations.map(loc => ({
			type: `Feature`,
			properties: { cluster: false, ...loc },
			geometry: {
				type: `Point`,
				coordinates: [
					parseFloat(loc.geolocation.longitude),
					parseFloat(loc.geolocation.latitude),
				],
			},
		}))
	}, [visibleLocations])

	// map variables that were set dynamically
	const {
		Map: LeafletMap,
		TileLayer,
		Marker,
		Popup,
		icon,
		OpenStreetMapProvider,
		leaf,
		fetchClusterIcon,
		fetchImageIcon,
		defaultIcon,
	} = leaflet

	// keeps track of visible locations in the current bounds
	const handleMove = () => {
		if(mapEl?.current){
			const leafletElement = mapEl?.current?.leafletElement
			const b = leafletElement?.getBounds()
			const mapCenter = leafletElement?.getCenter()
			// set bounds for clustering
			setBounds([
				b.getSouthWest().lng,
				b.getSouthWest().lat,
				b.getNorthEast().lng,
				b.getNorthEast().lat,
			])

			// set zoom for clustering
			setZoom(mapEl.current.leafletElement.getZoom())

			// set visible locations for location list
			const foundLocations = locations?.filter?.(m => {
				const { geolocation } = m
				return b.contains([geolocation?.latitude, geolocation?.longitude])
			})?.map(marker => {
				const { geolocation } = marker
				const markerCenter = [geolocation?.latitude, geolocation?.longitude]
				const distance = (leafletElement?.distance(markerCenter, mapCenter)) * 0.00062137
				return { ...marker, distance: distance.toFixed(1) }
			}) || []

			setVisibleLocations(foundLocations)
		}
	}
  
	useEffect(() => {
		// Dynamically import leaflet due to window in src
		async function init() {
			if(typeof window !== undefined) {
				setDomain(window?.location?.hostname)
			}

			if (!leaflet.Map) {
				const L = await import(`leaflet`)
				
				// cluster icons
				const fetchClusterIcon = (count, size) => {
					if (!icons[count]) {
						icons[count] = L.divIcon({
							html: `<div 
								class="cluster-marker ${count > 100 ? `large` : count > 50 ? `medium` : `small`}" 
								style="width: ${size}px; height: ${size}px;"
							>
								${count}
							</div>`,
						})
					}
					return icons[count]
				}

				// single image marker
				const fetchImageIcon = (title, img) => {
					if (!icons[title]) {
						icons[title] = new L.Icon({
							iconUrl: img,
							iconSize: [50, 50],
						})
					}
					return icons[title]
				}

				const defaultIcon = sanityImg && defaultMapIconId && new L.Icon({
					iconUrl: sanityImg(defaultMapIconId).url(),
					iconSize: [50, 50],
				})

				const {
					Map,
					TileLayer,
					Marker,
					Popup,
				} = await import(`react-leaflet`)

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
					icon,
					fetchClusterIcon,
					fetchImageIcon,
					// initBounds,
					OpenStreetMapProvider,
					leaf: L,
					defaultIcon,
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

	// handles search functionality and updating the map location
	async function handleSearch(location, useCenter) {	
		
		if(location){
			const { bounds, x, y, label } = location

			const center = [y, x]
			const leafletElement = mapEl?.current?.leafletElement

			if(typeof window !== undefined && window?.ga){
				window.ga(`send`, {
					hitType: `event`,
					eventCategory: `Dealer Locator`,
					eventAction: `search`,
					eventLabel: label,
				})
			}

			if(leafletElement) { 
				setSearched(true)

				if(useCenter) {
					leafletElement.setView(center, 10)
				} else {
					leafletElement.fitBounds(bounds)
				}
			}
		}
	}

	// get clusters 
	const { clusters, supercluster } = useSupercluster({
		points,
		bounds,
		zoom,
		options: { radius: 150, maxZoom: 17 },
	})

	// const memoRender = 

	const renderer = () => {
		if(locations.error){
			return (
				<section>
					<div>Could not load any locations...</div>
					<div>{locations.error?.message}</div>
				</section>
			)
		}
		if(!LeafletMap || !locations?.length) {
			return (
				<div 
					css={css`
						display: flex;
						justify-content: center;
						align-items: center;
						height: calc(80vh - 87px);
					`} 
					className="locatorContainer">
					<MoonLoader
						size={125}
						color={primaryColor}
					/>
				</div>
			)
		}

		// const MapComp = React.memo(LeafletMap)
	
		return (
			<StyleContext.Provider value={{ 
				primaryColor, breakpoint, 
				desktop, mobile, 
			}}>
				<SanityContext.Provider value={{ sanityImg }}>
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
							zoom={initZoom}
							setFilterModal={setFilterModal}
							disableFilters={disableFilters}
							initSearch={initSearch}
						/>
						<div className="mapContainer">
							<LeafletMap
								className={`leafletMap`}
								center={center}
								zoom={initZoom}
								maxZoom={maxZoom}
								css={[styles.map]}
								onMoveend={handleMove}
								ref={mapEl}
								scrollWheelZoom={false}
								preferCanvas={true}
							>
								<TileLayer 
									attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
									url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
								/>
								{searched && clusters?.map?.((cluster, i) => {
									const [longitude, latitude] = cluster.geometry.coordinates
									
									const {
										cluster: isCluster,
										point_count: pointCount,
										name,
										_id,
										phone,
										slug,
										mapIcon,
										address,
									} = cluster.properties

									const mapIconId = mapIcon?.icon?.asset?._id 
									const dealerDomain = mapIcon?.domains?.find(obj => {
										return obj.domain === domain.replace(`www.`, ``)  || obj.domain === domain
									})
									const dealerDomainIconId = dealerDomain?.icon?.asset?._id
									// we have a cluster to render
									if(isCluster) {
										return (
											<Marker
												key={`cluster-${cluster.id}-${i}`}
												position={[latitude, longitude]}
												icon={fetchClusterIcon(
													pointCount,
													10 + (pointCount / points.length) * 50,
												)}
												onClick={() => {
													const expansionZoom = Math.min(
														supercluster.getClusterExpansionZoom(cluster.id),
														17,
													)
													const leaflet = mapEl.current.leafletElement
													leaflet.setView([latitude, longitude], expansionZoom, {
														animate: true,
													})
												}}
											/>
										)
									}
		
									// we have a single point to render
									// NEED to break icon logic out so it's not so confusing 
									return (
										<Marker 
											key={`dealer-${_id}-${i}`} 
											icon={sanityImg 
												? dealerDomainIconId
													? fetchImageIcon(dealerDomain?.domain, sanityImg(dealerDomainIconId).url())
													: mapIconId
														? fetchImageIcon(mapIcon?.title, sanityImg(mapIconId).url()) 
														: defaultDomainIconId
															? fetchImageIcon(defaultDomain?.domain, sanityImg(defaultDomainIconId).url()) 
															: defaultIcon
																? defaultIcon
																: leaf.divIcon({ className: `singleMarker` })
												: leaf.divIcon({ className: `singleMarker` })
											} 
											position={[latitude, longitude]}
											onClick={e => {
												if(e.target.isPopupOpen()){
													e.target.closePopup()
												}
												setCurLocationIdx(i)
											}}
											onMouseOver={e => {
												e.target.openPopup()
											}}
											// onMouseOut={e => {
											// 	e.target.closePopup()
											// }}
										>
											<Popup
												autoPan={false}
											>
												<h3>
													<a href={`/dealer/${slug?.current || _id}`}>
														{name}
													</a>
												</h3>
												<div>{address}</div>
												<div>{phone}</div>
											</Popup>
										</Marker>
									)
								})}
							</LeafletMap>
						</div>
						<CurrentLocation 
							mapEl={mapEl} 
							setCurrentLocation={setCurrentLocation} 
						/>
						<LocatorList 
							locations={searched ? (filteredLocations || visibleLocations).slice(0, 20) : []} 
							currentLocation={currentLocation}
							setCurLocationIdx={setCurLocationIdx}
							noDealers={searched ? (filteredLocations || visibleLocations).length < 1 : false}
							onLocationSelect={onLocationSelect}
							curLocationIdx={curLocationIdx}
						/>
						{!disableFilters && <FilterModal 
							active={searched && filterModal && !!visibleLocations.length}
							setFilterModal={setFilterModal}
							locations={locations} 
							setFilteredLocations={setFilteredLocations}
						/>}
						{!disableDealerPane && (visibleLocations?.[curLocationIdx] && (
							<DealerPane
								location={visibleLocations?.[curLocationIdx]}
								curLocationIdx={curLocationIdx}
								setCurLocationIdx={setCurLocationIdx}
								totalLocations={filteredLocations 
									? filteredLocations.slice(0, 20).length 
									: visibleLocations.slice(0, 20).length
								}
							/>
						))}
					</main>
				</SanityContext.Provider>
			</StyleContext.Provider>
		)
	}

	return (
		<>
			<Seo 
				description={seo?.metaDescription || ``}
				title={seo?.pageTitle || ``}
			/>
			{renderer()}
		</>
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
        "locs map"
        "locs map";
    grid-template-columns: minmax(425px, 50%) 1fr;
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
		.singleMarker {
			background: black;
			border-radius: 50%;
		}
		.leaflet-div-icon {
			background: none !important;
			border: none !important;
		}
		
		.cluster-marker {
			color: #fff;
			
			border-radius: 50%;
			padding: 10px;
			width: 10px;
			height: 10px;
			display: flex;
			justify-content: center;
			align-items: center;
			&.small {
				background: #1978c8;
			}
			&.medium {
				background: #00b300;
			}
			&.large {
				background: #ff4d4d;
			}
		}
		@media(min-width: ${props.breakpoint}) {
			height: 100%;
		}
	}
	.currentLocation {
		@media(min-width: ${props.breakpoint}) {
			display: none;
		}
	}
	.dealerPaneContainer {
		@media(min-width: ${props.breakpoint}) {
			min-width: 425px;
			max-width: 50%;
			height: ${props?.desktop?.height || `100%`};
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
			height: ${props?.desktop?.height || `80vh`};
		}
	}
`