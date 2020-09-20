import React, { useState, useMemo, useContext } from 'react'
import { css, Global } from '@emotion/core' 
import { MdClose, MdPlaylistAdd, MdDone } from 'react-icons/md'

import StyleContext from '../context/StyleContext'

export default function FilterModal(props){
	const { 
		locations, 
		setFilterModal, 
		setFilteredLocations,
		active, 
	} = props

	const { primaryColor } = useContext(StyleContext)
	const [activeFilters, setActiveFilters] = useState({})
  
	const filters = useMemo(() => {
		return locations.reduce((acc, cur) => {
			const { products, categories } = cur
			const productFilters = [
				...acc?.products || [],
				...products.filter(prod => (acc?.products || []).indexOf(prod) === -1),
			]
			const categoryFilters = [
				...acc?.categories || [],
				...categories.filter(prod => (acc?.categories || []).indexOf(prod) === -1),
			]
  
			return {
				...acc,
				products: productFilters,
				categories: categoryFilters,
			}
		}, {})
	}, [locations]) 
  
	function toggleFilter(filter, value) {
		const index = activeFilters?.[filter]?.indexOf(value) 
		const filterCopy = [...activeFilters[filter] || []]
		const updatedFilter = index > -1
			? [...filterCopy.slice(0, index), ...filterCopy.slice(index + 1)]
			: [...filterCopy, value]

		setActiveFilters({
			...activeFilters,
			[filter]: updatedFilter,
		})
	}
  
	function applyFilters() {
		const filteredLocations = locations?.filter(loc => {
			const { products, categories } = loc
			let included = true

			// if there are category filters
			if(activeFilters?.categories?.length) {
				const containsCat = activeFilters?.categories?.some(c => categories.indexOf(c) > -1)
				if(!containsCat && included) included = false 
			}
      
			// if there are product filters
			if(activeFilters?.products?.length) {
				const containsProd = activeFilters?.products?.some(p => products?.indexOf(p) > -1)
				if(!containsProd && included) included = false 
			}
			return included
		})  
    
		setFilteredLocations(filteredLocations.length > 0 ? filteredLocations : null)
		setFilterModal(false)
	}
    
	return (
		<>
			{active && <Global styles={global}/>}
			<div css={() => styles({ primaryColor, active })} className="filterModal">
				<div className="filterModalInner">
					<div className="close" onClick={() => setFilterModal(false)}>
						<MdClose className="closeIcon" />
					</div>
					<ul className="filters">
						{Object.keys(filters)?.map((filter, i) => {

							if(!filters[filter]?.length) return null
							return (
								<li key={i} className="filter">
									<div className="filterTitle">
										{filter}
									</div>
									<ul className="filterList">
										{filters[filter]?.map((value, j) => {
											const index = activeFilters?.[filter]?.indexOf(value) 

											return (
												<li 
													key={j} 
													className="filterItem" 
													onClick={() => toggleFilter(filter, value)}
												>
													<MdPlaylistAdd className="filterIcon" />  
													<div className="filterValue">
														{value}
													</div>  
													{index > -1 && (
														<div className="isActive">
															<MdDone className="isActiveIcon"/>
														</div>
													)}
												</li>
											)
										})}
									</ul>
								</li>
							)

						})}
					</ul>

					<div className="applyFilters">
						<button className="applyBtn" onClick={applyFilters}>
              Apply
						</button>
					</div>
				</div>
			</div>
		</>
	)
}

const global = css`
  body {
    margin: 0;
    height: 100%;
    overflow: hidden;
  }
`

const styles = props => css`
  z-index: 5000;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: auto;
	display: ${props.active ? `block` : `none`};
  .close {
    text-align: right;
    cursor: pointer;
    .closeIcon {
      height: 25px;
      width: 25px;
    }
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .filterModalInner {
    padding: 20px;
  }
  .filters {
    text-align: left;
    text-transform: capitalize;
    max-width: 400px;
    margin: 0 auto;
  }
  .filter {
    margin-bottom: 35px;
  }
  .filterTitle {
    font-size: 36px;
    border-bottom: 2px solid #ccc;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  .filterItem {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    cursor: pointer;
  }
  .filterIcon {
    height: 35px;
    width: 35px;
    margin-right: 10px;
  }
  .isActive {
    margin-left: auto;
  }
  .isActiveIcon {
    height: 30px;
    width: 30px;
    color: green;
  }
  .applyBtn {
    font-size: 20px;
    color: #fff;
    background: ${props.primaryColor};
    border: none;
    outline: none;
    border-radius: 7px;
    text-transform: uppercase;
    font-weight: bold;
    padding: 10px 20px;
    cursor: pointer;
    box-shadow: 0px 5px 5px #999;
    :hover {
      opacity: .9;
    }
  }
`