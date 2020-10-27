import React, { useContext } from 'react'
import { BiCurrentLocation } from 'react-icons/bi'
import { css } from '@emotion/core'

import StyleContext from './context/StyleContext'

export default function CurrentLocation(props) {
	const { mapEl, setCurrentLocation } = props

	const { primaryColor } = useContext(StyleContext)

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
		<div css={styles({ primaryColor })}  className="currentLocation">
			<BiCurrentLocation onClick={useLocalLocation} className="currentLocationIcon" />
			<div className="currentLocationText">
				use my current location
			</div>
		</div>
	)
}

const styles = props => css`
	cursor: pointer;
	text-align: center;
	.currentLocationIcon {
		background: ${props.primaryColor};
		color: #fff;
		height: 50px;
		width: 50px;
		border-radius: 50%;
		padding: 5px;
		box-shadow: 0px 5px 5px #666;
		margin: 20px 0 10px 0;
	}
	.currentLocationText {
		color: #999;
	}
`