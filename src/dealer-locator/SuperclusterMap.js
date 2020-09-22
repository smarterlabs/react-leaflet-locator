import React, { useRef, useState } from "react"
// Used for the map itself
import { Map, Marker, TileLayer } from "react-leaflet"
// Used when making custom Marker icons
import L from "leaflet"
// Used to fetch remote data
import useSwr from "swr"
// Used to cluster points
import useSupercluster from "use-supercluster"
// Styling
import { css } from '@emotion/core'

import 'leaflet/dist/leaflet.css'

const fetcher = (...args) => window?.fetch(...args).then(response => response.json())

const cuffs = new L.divIcon({
  className: `singleMarker`,
});

const icons = {};
const fetchIcon = (count, size) => {
  if (!icons[count]) {
    icons[count] = L.divIcon({
      html: `<div class="cluster-marker" style="width: ${size}px; height: ${size}px;">
        ${count}
      </div>`
    });
  }
  return icons[count];
};

export default function App() {
	// state and refs
	const [bounds, setBounds] = useState(null)
	const [zoom, setZoom] = useState(13)
	const mapRef = useRef()

	// load and prepare data
	const url =
    `https://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592&date=2019-10`
	const { data, error } = useSwr(url, { fetcher })
	const crimes = data && !error ? data : []
	const points = crimes.map(crime => ({
		type: `Feature`,
		properties: { cluster: false, crimeId: crime.id, category: crime.category },
		geometry: {
			type: `Point`,
			coordinates: [
				parseFloat(crime.location.longitude),
				parseFloat(crime.location.latitude),
			],
		},
	}))
  
	console.log(`Points: `, points)
	// get map bounds
	function updateMap() {
		if(mapRef?.current){
			const b = mapRef.current.leafletElement.getBounds()
			setBounds([
				b.getSouthWest().lng,
				b.getSouthWest().lat,
				b.getNorthEast().lng,
				b.getNorthEast().lat,
			])
			setZoom(mapRef.current.leafletElement.getZoom())
		}
	}

	React.useEffect(() => {
		updateMap()
	}, [])

	// get clusters
	const { clusters, supercluster } = useSupercluster({
		points,
		bounds,
		zoom,
		options: { radius: 75, maxZoom: 20 },
	})

	// return map
	return (
		<Map 
			css={styles} 
			center={[52.6376, -1.135171]} 
			zoom={13}
			onMoveEnd={updateMap}
			ref={mapRef}
		>
			<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			/>
			{clusters?.map?.(cluster => {
        // every cluster point has coordinates
        const [longitude, latitude] = cluster.geometry.coordinates;
        // the point may be either a cluster or a crime point
        const {
          cluster: isCluster,
          point_count: pointCount
        } = cluster.properties;

        // we have a cluster to render
        if (isCluster) {
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              position={[latitude, longitude]}
              icon={fetchIcon(
                pointCount,
                10 + (pointCount / points.length) * 40
							)}
							onClick={() => {
								const expansionZoom = Math.min(
                  supercluster.getClusterExpansionZoom(cluster.id),
                  17
                );
                const leaflet = mapRef.current.leafletElement;
                leaflet.setView([latitude, longitude], expansionZoom, {
                  animate: true
                });
							}}
            />
          );
        }

        // we have a single point (crime) to render
        return (
          <Marker
            key={`crime-${cluster.properties.crimeId}`}
						position={[latitude, longitude]}
						icon={cuffs}
          />
        );
      })}
		</Map>
	)
}

const styles = css`
  width: 100%;
  height: 100vh;

  .leaflet-div-icon {
    background: none !important;
    border: none !important;
  }

  .cluster-marker {
    color: #fff;
    background: #1978c8;
    border-radius: 50%;
    padding: 10px;
    width: 10px;
    height: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

	.singleMarker {
		background: black;
    border-radius: 50%;
	}
`