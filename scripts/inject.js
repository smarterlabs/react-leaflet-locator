import React from 'react'
import { render } from 'react-dom'

import TestComp from '../src/TestComp'

function queryRender(query, component) {
  const els = document.querySelectorAll(`[data-${query} = true]`)
  for (let i = els.length; i--; ) {
    if (els[i].dataset.processed) {
      continue
    }
    render(component, els[i])
    els[i].dataset.processed = true
  }
}

class TestInject {
  constructor() {
    this.inject()
  }
  inject() {
    console.log(`INjected: `)
    queryRender(`test`, <TestComp />)
  }
}

export default TestInject

