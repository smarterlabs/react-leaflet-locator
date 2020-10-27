import React from 'react'
import { render } from 'react-dom'

import TestComp from '../src/TestComp'

function queryRender(query, component) {
  const dataAttr = `[data-locator-${query}]`
  
  const els = document.querySelectorAll(dataAttr)

  console.log(els)

  for (let i = els.length; i--; ) {
    if (els[i].dataset.processed) {
      continue
    }
    render(component, els[i])
    els[i].dataset.processed = true
  }
}

class TestInject {
  constructor(props) {
    console.log(`Starting Props: `, props)
    this.inject()
  }
  inject() {
    queryRender(`container`, <TestComp />)
  }
}

window.TestInject = TestInject



