import React from 'react'

/*
*  This is to prevent an error when using async inside of useEffect
*/

// This is the error below 

// ______
// \    /
//  \  /
//   \/

// Warning: Can't perform a React state update on an unmounted component.
// This is a no-op, but it indicates a memory leak in your application.
// To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.


export default function(promiseOrFunction, defaultValue) {
	const [state, setState] = React.useState({ 
		value: defaultValue, 
		error: null, 
		isPending: true, 
	})
  
	React.useEffect(() => {
		const promise = (typeof promiseOrFunction === `function`)
			? promiseOrFunction()
			: promiseOrFunction

		let isSubscribed = true
		const callPromise = async () => {
			try {
				const value = await promise
				if(isSubscribed) {
					setState({ value, error: null, isPending: false })
				}
			} catch(error) {
				if(isSubscribed) {
					setState({ value: defaultValue, error: error, isPending: false })
				}
			}
		}

		callPromise()
    
		return () => (isSubscribed = false)
	}, [])

	const { value, error, isPending } = state
	return [value, error, isPending]
}