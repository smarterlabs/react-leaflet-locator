import React, { useState, useMemo, useContext } from 'react'
import { css, Global } from '@emotion/core' 
import { MdClose, MdDone } from 'react-icons/md'

import StyleContext from './context/StyleContext'
import SanityContext from './context/SanityContext'

export default function FilterModal(props){
	const { 
		locations, 
		setFilterModal, 
		setFilteredLocations,
		active, 
	} = props

	const globalStyles = useContext(StyleContext)
	const sanityContext = useContext(SanityContext)
	const { sanityImg } = sanityContext || {}

	const [activeFilters, setActiveFilters] = useState({})
  
	const filters = useMemo(() => {
		return locations.reduce((acc, cur) => {
			const { productAvailabilityList, amenitiesList } = cur

			const productFilters = [
				...acc?.products || [],
				...productAvailabilityList?.filter(({ slug }) => {
					return (acc.products || [])
						.findIndex(p => p?.slug?.current === slug?.current) === -1
				}) || [],
			]
			const amenitiesFilters = [
				...acc?.amenities || [],
				...amenitiesList?.filter(({ slug }) => {
					return (acc.amenities || [])
						.findIndex(a => a?.slug?.current === slug?.current) === -1
				}) || [],
			]
  
			return {
				...acc,
				products: productFilters,
				amenities: amenitiesFilters,
			}
		}, {})
	}, [locations]) 
  
	function toggleFilter(filter, slug) {
		const index = activeFilters?.[filter]?.indexOf(slug) 
		const filterCopy = [...activeFilters[filter] || []]

		const updatedFilter = index > -1
			? [...filterCopy.slice(0, index), ...filterCopy.slice(index + 1)]
			: [...filterCopy, slug]

		setActiveFilters({
			...activeFilters,
			[filter]: updatedFilter,
		})
	}
  
	function applyFilters() {
		const filteredLocations = locations?.filter(loc => {
			const { productAvailabilityList, amenitiesList } = loc
			let included = true
			// if there are category filters
			if(activeFilters?.amenities?.length) {
				const containsAmenity = activeFilters?.amenities?.some?.(c => {
					return amenitiesList.findIndex(({ slug }) => slug?.current === c) > -1
				})

				if(!containsAmenity && included) included = false 
			}
      
			// if there are product filters
			if(activeFilters?.products?.length) {
				const containsProd = activeFilters?.products?.some?.(p => {
					return productAvailabilityList?.findIndex(({ slug }) => slug?.current === p) > -1
				})
				if(!containsProd && included) included = false 
			}

			return included
		})  
    
		setFilteredLocations(filteredLocations.length > 0 ? filteredLocations : null)
		setFilterModal(false)
	}
		
	return (
		<>
			{active && <Global styles={global(globalStyles)}/>}
			<div css={styles(globalStyles)} className={`filterModal ${active && `active`}`}>
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
										{filters[filter]?.map(({ title, icon, slug }, j) => {
											const index = activeFilters?.[filter]?.indexOf(slug?.current) 
											const iconImgId = icon?.asset?._id

											return (
												<li 
													key={j} 
													className="filterItem" 
													onClick={() => toggleFilter(filter, slug?.current)}
												>
													{iconImgId && <img 
														src={sanityImg(iconImgId).url()} 
														className="filterIcon" 
														alt={title}
													/> } 
													<div className="filterValue">
														{title}
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

const global = props => css`
  body {
    margin: 0;
    height: 100%;
    overflow: hidden;
  }
	@media(min-width: ${props.breakpoint}){
		body: {
			overflow: auto;
		}
	}
`

const styles = props => css`
  z-index: 5000;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: auto;
	display: none;
	@media(min-width: ${props.breakpoint}) {
    min-width: 425px;
		max-width: 50%;
		height: ${props?.desktop?.height || `100%`};
  }
	&.active {
		display: block !important;
	}
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
		height: 100%;
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
	.applyFilters {
		text-align: center;
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