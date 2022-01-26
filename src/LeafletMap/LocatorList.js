import React, { useContext } from 'react'
import { css } from '@emotion/core'
import { FaMapMarkerAlt, FaPhone, FaInfoCircle } from 'react-icons/fa'

import StyleContext from './context/StyleContext'

export default function LocatorList(props) {
	const { 
		locations, 
		currentLocation, 
		curLocationIdx,
		setCurLocationIdx, 
		loading,
		noDealers,
		onLocationSelect,
	} = props

	const globalStyles = useContext(StyleContext)

	const origin = currentLocation 
		? `&origin=${currentLocation.latitude},${currentLocation.longitude}` 
		: ``

	if(loading) return <div>Loading...</div>	

	return (
		<div css={styles(globalStyles)} className="locatorListContainer">
			{noDealers && <div className="noDealers">Sadly, there are no dealers in your area</div>}
			{locations.length 
				? (
					<ul className="locatorList">
						{locations.map((loc, i) => {
							const { distance, name, hours, phone, geolocation, slug, _id } = loc
							const { latitude, longitude } = geolocation || {}
							const destination = latitude && longitude ? `&destination=${latitude},${longitude}` : ``
							const directions = `https://www.google.com/maps/dir/?api=1${origin}${destination}`
							return (
								<li className={`locatorItem ${curLocationIdx === i && `activeLoc`}`} key={i}>
									<div className="display">
										<div onClick={() => {
											setCurLocationIdx(i)
											if(onLocationSelect){
												onLocationSelect(loc)
											}
										}} className="title">{name}</div>
										<div className="distance">{distance || 1.3} mi</div>
										<span className="bulletPoint">&bull;</span>
										{hours && <div className="hours">Open until {hours}</div>}
									</div>
									{curLocationIdx === i && (
										<div className="yourPick">
											Your Pick-Up Location
										</div>
									)}
									<div className="contact">
										<a 
											href={`tel:${phone}`} 
											className="phone"
										>
											<FaPhone className="icon phoneIcon" />
										</a>
										<a 
											href={directions} 
											className="mapMarker"
											target="_blank"
											rel="noopener noreferrer"
										>
											<FaMapMarkerAlt className="icon markerIcon" />
										</a>
										<a href={`/dealer/${slug?.current || _id}`} className="dealerPage">
											<FaInfoCircle className="icon infoIcon" />
										</a>
									</div>
								</li>
							)
						})}
					</ul>
				)
				: (
					<div className="noLocationsText">
						Enter your zip, city, or state above <br/>
						To find your pickup location
					</div>
				)
			}
		</div>
	)
}

const styles = props => css`
	.noLocationsText {
		width: 100%;
    text-align: center;
		color: ${props.primaryColor};
		text-transform: uppercase;
		font-size: 14px;
	}
	.yourPick {
		display: none;
		text-align: center;
		color: ${props.primaryColor};
		text-transform: uppercase;
		font-size: 12px;
	}
	.activeLoc {
		.display {
			.title {
				color: ${props.primaryColor};
			}
		}
	}
	.noDealers {
		margin: 20px;
	}
	.bulletPoint {
		margin: 0 4px;
	}
	.title {
		font-size: 16px;
		font-weight: bold;
		text-transform: capitalize;
		cursor: pointer;
	}
	.locatorItem {
		display: flex;
		font-size: 12px;
		margin-bottom: 40px;
		> div {
			flex: 1 0 50%;
		}
	}
	.display {
		display: flex;
		flex-flow: row wrap;
		text-align: left;
		.title {
			flex: 1 0 100%;
		}
	}
	.locatorList {
		list-style: none;
		padding: 0;
		margin: 20px;
	}

	.contact {
		display: flex;
		justify-content: flex-end;
		.icon {
			width: 30px;
			height: 30px;
			color: #999;
			margin: 0 15px;
		}
	}
`