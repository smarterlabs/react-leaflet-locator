import React, { useEffect, useState, useCallback, useRef } from 'react'
import { css } from '@emotion/core'
import debounce from 'lodash/debounce'
import { AiOutlineSearch } from 'react-icons/ai'

export default function Search(props){
	const { 
		onSearch, 
		OpenStreetMapProvider,
		leaf,
		// mapEl,
		// center, 
		// zoom,
		setFilterModal,
	} = props

	const ref = useRef(null)
	const [searching, setSearching] = useState(false)
	const [searchInput, setSearchInput] = useState(``)
	const [results, setResults] = useState(null)
	
	const osmProvider = new OpenStreetMapProvider({
		params: {
			countrycodes: `us`, // limit search results to the Netherlands
			addressdetails: 1, 
			format: `json`,
		},
	})

	const delaySearch = useCallback(debounce(async value => {
		const results = await osmProvider.search({ query: value })
		setResults(results.slice(0, 10))
		setSearching(false)
	}, 250), [])

	useEffect(() => {
		if(ref?.current){
			const disableClickPropagation = leaf?.DomEvent?.disableClickPropagation
			disableClickPropagation(ref.current)
		}
	}, [])
  
	const submitSearch = (loc) => {
		if(loc) {
			setSearchInput(loc?.label || ``)
			onSearch(loc)
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
			css={styles}
			className={`searchContainer`}
			ref={ref}
		>
			{/* <div onClick={resetView} className="reset">Reset</div> */}
			<div className="input searchInputContainer">
				<input 
					type="text" 
					onChange={e => {
						setSearchInput(e.target.value)
						delaySearch(e.target.value)
					}}
					value={searchInput}
					placeholder={`Enter your ZIP`} 
				/>
				<AiOutlineSearch className="searchIcon" />
				<div className="resultContainer">
					{(!!results?.length && !searching) && (
						<ul className="resultList">
							{results.map((result, i) => {
								const { label } = result
								return (
									<li 
										onClick={() => {
											submitSearch(result)
											setResults(null)
										}} 
										key={i}
									>
										{label}
									</li>
								)
							})}
						</ul>
					)}
				</div>
			</div>
			<div className="filter" onClick={() => setFilterModal(true)}>
					Filter
			</div>
		</div>
	)
}

const styles = css`
  display: flex;
  flex-flow: row nowrap;
	align-items: center;
	box-shadow: 0px 5px 3px #999;
	z-index: 2000;
  position: relative;
	padding: 15px;
	.filter {
		cursor: pointer;
	}
	.searchInputContainer {
		flex: 1;
		max-width: 600px;
		position: relative;
		margin-right: 20px;
		input {
			border: none;
			border-bottom: 2px solid #999;
			font-size: 20px;
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
		top: 90px;
		width: 100%;
  }
  .resultList {
    list-style: none;
    margin: 0;
    padding: 10px;
    background: #fff;
    border: 1px solid #333;
    border-radius: 5px;
    > li {
      margin-bottom: 10px;
      cursor: pointer;
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