import React from 'react'
import { css } from '@emotion/core'
import { FaMapMarkerAlt, FaPhone, FaInfoCircle } from 'react-icons/fa'


export default function LocatorList(props) {
	const { 
		locations, 
		currentLocation, 
		setCurLocationIdx, 
	} = props

	const origin = currentLocation 
		? `&origin=${currentLocation.latitude},${currentLocation.longitude}` 
		: ``

	return (
		<div css={styles} className="locatorListContainer">
			{!!locations.length && (
				<ul className="locatorList">
					{locations.map((loc, i) => {
						const { distance, name, hours, phone, lat, lng } = loc
						const destination = lat && lng ? `&destination=${lat},${lng}` : ``
						const directions = `https://www.google.com/maps/dir/?api=1${origin}${destination}`
						return (
							<li className="locatorItem" key={i}>
								<div className="display">
									<div onClick={() => setCurLocationIdx(i)} className="title">{name}</div>
									<div className="distance">{distance || 1.3} mi</div>
									<span className="bulletPoint">&bull;</span>
									<div className="hours">Open until {hours}</div>
								</div>
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
									<div className="dealerPage">
										<FaInfoCircle className="icon infoIcon" />
									</div>
								</div>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}

const styles = css`
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
		margin-bottom: 20px;
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