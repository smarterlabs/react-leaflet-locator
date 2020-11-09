import React from 'react'
import { render } from 'react-dom'

import LeafletMap from '../src/LeafletMap'

function queryRender(query, component) {
  const dataAttr = `[data-locator-${query}]`
  
  const els = document.querySelectorAll(dataAttr)

  for (let i = els.length; i--; ) {
    if (els[i].dataset.processed) {
      continue
    }
    render(component, els[i])
    els[i].dataset.processed = true
  }
}

class MapInject {
  constructor(props) {
    this.inject(props)
  }
  inject(props) {
    queryRender(`container`, <LeafletMap {...props} />)
  }
}

window.TestInject = MapInject



