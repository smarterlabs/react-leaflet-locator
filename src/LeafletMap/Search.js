/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState, useCallback, useRef, useContext } from 'react'
import { css } from '@emotion/core'
import debounce from 'lodash/debounce'
import { AiOutlineSearch } from 'react-icons/ai'

import StyleContext from './context/StyleContext'

export default function Search(props){
	const { 
		onSearch, 
		OpenStreetMapProvider,
		leaf,
		// mapEl,
		// center, 
		// zoom,
		setFilterModal,
		disableFilters,
		initSearch,
	} = props

	const ref = useRef(null)
	const inputRef = useRef()
	const inputNumRef = useRef()
	const [searching, setSearching] = useState(false)
	const [searchInput, setSearchInput] = useState(``)
	const [zip, setZip] = useState(``)
	const [results, setResults] = useState(null)
	
	const globalStyles = useContext(StyleContext)

	const osmProvider = OpenStreetMapProvider && new OpenStreetMapProvider({
		params: {
			countrycodes: [`ca`,`us`], // limit search results to the Netherlands
			addressdetails: 1, 
			format: `json`,
		},
	})

	const search = async value => {
		const results = await osmProvider?.search({ query: value })
		if(results?.[0]){			
			onSearch(results[0], true)
		}
		setSearching(false)
	}

	const delaySearch = useCallback(debounce(async value => {
		const results = await osmProvider?.search({ query: value })
		const filteredResults = results.reduce((acc, cur) => {
			const { label } = cur
			const exist = acc.find(result => result.label.toLowerCase() === label.toLowerCase())
			if(!exist){
				acc.push(cur)
			}
			return acc
		}, [])
		setResults(filteredResults.slice(0, 10))
		setSearching(false)
	}, 250), [])

	useEffect(() => {
		if(ref?.current){
			const disableClickPropagation = leaf?.DomEvent?.disableClickPropagation
			disableClickPropagation(ref.current)
		}
		if(initSearch && !searchInput.length){
			// setSearch(initSearch)
			search(initSearch)
		} 
		// else if(initSearchFromContext && !searchInput.length){
		// 	search(initSearchFromContext)
		// 	setSearchInput(initSearchFromContext)
		// 	setZip(initSearchFromContext)
		// }
	}, [])
  
	const submitSearch = (loc) => {
		if(loc) {
			const { raw: { address }, label } = loc
			const { 
				city, 
				country_code = ``, 
				postcode = ``, 
				state = ``,
				road = ``,
				house_number = ``,
			} = address || {}

			const addr = address 
				? `${postcode} ${house_number} ${road} ${city ? `${city},` : ``} ${state} ${country_code.toUpperCase()}`
				: label
			const formatted = addr.replace(/\s{2,}/, ` `)
			
			// setSearch(postcode)
			setSearchInput(formatted || ``)
			setZip(formatted || ``)
			onSearch(loc, true)
			const input = inputRef.current
			const inputNum = inputNumRef.current
			if(inputNum) inputNum.blur()
			if(input) input.blur()
		}
	}

	const handleSubmit = e => {
		e.preventDefault()

		if(results?.[0]) {
			submitSearch(results?.[0])
			setResults(null)
		}
	}

	// function resetView(){
	// 	if(center && zoom && mapEl) { 
	// 		const { leafletElement } = mapEl?.current
	// 		leafletElement.setView(center, zoom)
	// 	}
	// }

	return (
		<div 
			css={styles(globalStyles)}
			className={`searchContainer`}
			ref={ref}
		>
			{/* <div onClick={resetView} className="reset">Reset</div> */}
			<div className="input searchInputContainer">
				<form className="searchForm" onSubmit={handleSubmit}>
					<input 
						type="text" 
						onChange={e => {
							setSearchInput(e.target.value)
							delaySearch(e.target.value)
						}}
						ref={inputRef}
						onFocus={() => {
							setSearchInput(``)
						}}
						value={searchInput}
						placeholder={`Enter your ZIP`} 
						className="desktopSearchInput"
					/>
					<input 
						type="number" 
						onChange={e => {
							setZip(e.target.value)
							delaySearch(e.target.value)
						}}
						ref={inputNumRef}
						onFocus={() => {
							setZip(``)
						}}
						value={zip}
						placeholder={`Enter your ZIP`} 
						className="mobileSearchInput"
					/>
					<button type="submit"/>
				</form>
				<AiOutlineSearch className="searchIcon" />
				<div className="resultContainer">
					{(!!results?.length && !searching) && (
						<ul className="resultList">
							{results.map((result, i) => {
								const { label, raw: { address } } = result
								const { 
									city, 
									country_code, 
									postcode, 
									state,
									road,
									house_number,
								} = address || {}
								return (
									<li 
										onClick={() => {
											submitSearch(result)
											setResults(null)
										}} 
										key={i}
										className="resultItem"
									>
										{address 
											? <>
												<span className="resultZip">{postcode} </span>
												<span className="resultAddr">{house_number} {road} </span>
												{city && <span>{city}, </span>}
												{state && <span>{state} </span>}
												<span>{country_code.toUpperCase()}</span>
											</>
											: label
										}
									</li>
								)
							})}
						</ul>
					)}
				</div>
			</div>
			{!disableFilters && (
				<div className="filter" onClick={() => setFilterModal(true)}>
					Filter
				</div>
			)}
		</div>
	)
}

const styles = props => css`
  display: flex;
  flex-flow: row nowrap;
	align-items: center;
	justify-content: center;
	box-shadow: 0px 5px 3px #999;
	z-index: 2000;
  position: relative;
	padding: 15px;
	.resultZip {
		font-weight: bold;
	}
	.resultAddr, .resultZip {
		font-size: 16px;
		color: #000;
	}
	.desktopSearchInput {
		display: none;
	}
	@media(min-width: ${props.breakpoint}){
		.desktopSearchInput {
			display: block;
		}
		.mobileSearchInput {
			display: none;
		}
	}
	.filter {
		cursor: pointer;
	}
	.searchInputContainer {
		flex: 1;
		max-width: 600px;
		position: relative;
		margin-right: 20px;
		.searchForm  {
			width: 100%;
			button {
				visibility: hidden;
			}
		}
		input {
			border: none;
			border-bottom: 2px solid #999;
			font-size: 16px;
			padding: 0;
			width: 100%;
			height: 40px;
		}
		.searchIcon {
			width: 24px;
			height: 24px;
			position: absolute;
			right: 0px;
			top: 50%;
			transform: translateY(-50%);
			color: #999;
		}
	}
  .resultContainer {
    position: absolute;
		left: 0;
		top: 56px;
		width: 100%;
  }
  .resultList {
    list-style: none;
    margin: 0;
    background: #fff;
    border: 1px solid #333;
    border-radius: 5px;
    .resultItem {
      margin-bottom: 10px;
			border-bottom: 1px solid #ccc;
    	padding: 10px;
			font-size: 14px;
			color: #666;
      cursor: pointer;
			:last-of-type {
				border: none;
			}
			:hover {
				color: #666;
			}
    }
  }
  .input {
    display: flex;
  }
  .label {
    display: flex;
    background: rgba(0, 0, 0, 0.7);
    justify-content: center;
    align-items: center;
    padding: 0 5px;
    font-size: 14px;
		color: #fff;
  }
  input {
    outline: none;
    padding: 5px 10px;
  }
  button {
    padding: 0 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .checkmark {
    border-right: 2px solid black;
    border-bottom: 2px solid black;
    height: 15px;
    width: 7.5px;
    transform: rotate(45deg);
    margin-bottom: 5px;
  } 
`