import React from 'react'

export default function LocatorList(props) {
	const { locations } = props

	return (
		<div className="locatorList">
			{locations?.length} dealers in the window
		</div>
	)
}