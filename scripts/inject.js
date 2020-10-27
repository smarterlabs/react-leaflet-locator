import React from 'react'
import { render } from 'react-dom'

import TestComp from '../src/TestComp'

function queryRender(query, component) {
  const els = document.querySelectorAll(`[data-test-${query}]`)
  for (let i = els.length; i--; ) {
    if (els[i].dataset.processed) {
      continue
    }
    render(component, els[i])
    els[i].dataset.processed = true
  }
}

export default class LocatorInject {
  constructor() {
    // this.inject()
  }
  inject() {
    queryRender(`container`, <TestComp />)
  }
}