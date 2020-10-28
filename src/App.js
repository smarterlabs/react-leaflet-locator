import React from 'react'
import './App.css'

import Locator from './LeafletMap'
import data from '../test-data'

function App() {
	return (
		<div className="App">
			<Locator {...data} />
		</div>
	)
}

export default App
