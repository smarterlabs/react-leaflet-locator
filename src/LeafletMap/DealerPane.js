import React, { useContext, useEffect } from 'react'
import { css, Global} from '@emotion/core'
import Player from 'react-player'
import { MdClose } from 'react-icons/md'
import { FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
import Slider from "react-slick"
import BlockContent from '@sanity/block-content-to-react'
import HubspotForm from 'react-hubspot-form'

import slickCss from "slick-carousel/slick/slick.css"
import slickCssTheme from "slick-carousel/slick/slick-theme.css"

console.log(`Slick Css: `, slickCss)
console.log(`Slick Theme Css: `, slickCssTheme)

import StyleContext from './context/StyleContext'
import SanityContext from './context/SanityContext'

export default function DealerPane(props) {
	const sliderSettings = {
		dots: true,
		infinite: true,
		slidesToShow: 1,
		slidesToScroll: 1,
	}

	const { 
		location,
		curLocationIdx,
		setCurLocationIdx,
		totalLocations,
		currentLocation,
		override,
		backLink,
	} =  props
  
	const {
		name, 
		phone,
		amenitiesList,
		images,
		siteUrl,
		_rawDescription,
		distance,
		address,
		city,
		state,
		postal,
		hours,
		geolocation,
		logo,
		video,
		productAvailabilityList,
		mapIcon,
		hubspotForm,
	} = location

	useEffect(() => {
		if(typeof window !== undefined && window?.ga){
			window.ga(`send`, {
				hitType: `event`,
				eventCategory: `Dealer Locator`,
				eventAction: `dealerLoad`,
				eventLabel: name,
			})
		}
	}, [])
  
	const sanityContext = useContext(SanityContext)
	const { sanityImg } = sanityContext || {}

	const { latitude: lat, longitude: lng } = geolocation || {}

	const origin = currentLocation 
		? `&origin=${currentLocation.latitude},${currentLocation.longitude}` 
		: ``
  
	const destination = lat && lng ? `&destination=${lat},${lng}` : ``
	const directions = `https://www.google.com/maps/dir/?api=1${origin}${destination}`
  
	const globalStyles = useContext(StyleContext)
  
	function next() {
		const idx = curLocationIdx === totalLocations - 1 ? 0 : curLocationIdx + 1
		setCurLocationIdx(idx)
	}

	function prev() {
		const idx = curLocationIdx === 0 ? totalLocations - 1 : curLocationIdx - 1
		setCurLocationIdx(idx)
	}

	// console.log(`location: `, location)

	return (
		<>
			<Global styles={global(globalStyles || override)}/>
			<section css={styles(globalStyles || override)} className="dealerPaneContainer">
				<div className="inner">
					<div className="dealerSelect">
						{totalLocations > 1 && (
							<>
								<div onClick={prev} className="previous">
									{`< `}Previous
								</div>
								<div onClick={next} className="next">
                Next{ ` >`}
								</div>	
							</>
						)}
						<div className="close" onClick={() => setCurLocationIdx(null)}>
							<MdClose className="closeIcon" />
						</div>
					</div>
					{!!images?.length && <div className="dealerBanner">
						<Slider {...sliderSettings}>
							{images?.filter(({ asset }) => !!asset?._id)?.map?.(({ asset }, i) => {                
								return (
									<div key={i} className="dealerSlide">
										<img 
											src={sanityImg(asset?._id)
												.focalPoint(.5,.5)
												.maxWidth(1000)
												.maxHeight(600)
												.url()
											} 
											alt="dealerPaneImg" 
											className="dealerBannerImg"
										/>
										<div className="dealerBannerLogo">
											{logo?.asset && <img src={sanityImg(logo?.asset?._id).url()} alt="dealer logo" />}
										</div>
										<div className="imageSelect">
											<div className="rec rec1"></div>
											<div className="rec rec2"></div>
											<div className="rec rec3"></div>
										</div>
									</div> 
								)
							})}
						</Slider>
					</div>}
					<div className="dealerInfo">
						<div className="display">
							<div className="title">{name}</div>
							<div className="subTitle">
								<div className="distance">{distance || 1.3} mi</div>
								<span className="bulletPoint">&bull;</span>
								{hours && <div className="hours">Open until {hours}</div>}
							</div>
						</div>
						<div className="contactIcons">
							<a 
								href={`tel:${phone}`} 
								className="phone"
							>
								<FaPhone className="icon phoneIcon" />
							</a>
							<a 
								href={directions} 
								className="mapMarker"
								target="_blank"
								rel="noopener noreferrer"
							>
								<FaMapMarkerAlt className="icon markerIcon" />
							</a>
						</div>
						<div className="personalInfo">
							<div className="address">{address}</div>
							<div className="stateCityZip">{city}, {state} {postal}</div>
							<div className="phone">{phone}</div>
							<div className="website">
								<a 
									href={siteUrl} 
									target="_blank" 
									rel="noopener noreferrer"
								>
									{siteUrl}
								</a>
							</div>
						</div>
						<div className="dealerLevel">
							<div className="badge">
								{mapIcon?.icon?.asset?._id && ( 
									<img src={sanityImg(mapIcon?.icon?.asset?._id).url()} alt={mapIcon?.title} />
								)}
							</div>
							{!!productAvailabilityList?.length && (
								<div className="dealerIcons">
									{productAvailabilityList.map((prod, i) => {
										const { icon, title } = prod
										const iconImgId = icon?.asset?._id

										return (
											<div key={i} className="dealerIcon">
												{iconImgId && <img src={sanityImg(iconImgId).url()} alt={title} />}
											</div>
										)
									})}
								</div>
							)}
							
						</div>
					</div>
					{_rawDescription && <div className="dealerDescription">
						{ _rawDescription && <BlockContent blocks={_rawDescription} /> }
					</div>}
					{video && <div className="dealerVideo">
						<Player url={video} className="player" width="100%" />
					</div>}
					{!!amenitiesList?.length &&	<div className="dealerAmenities">
						<div className="sectionHeader">
                Amenities
						</div>
						<ul className="amenitiesList">
							{amenitiesList.map((amenity, i) => {
								const { title, icon } = amenity
								const iconImgId = icon?.asset?._id
								return (
									<li key={i} className="amenity">
										{iconImgId && <img src={sanityImg(iconImgId).url()} className="amenityIcon" />} 
										{title}
									</li>
								)
							})}
						</ul>
					</div>}
					{hubspotForm?.portalId && hubspotForm?.formId && (
						<div className="hubspotForm">
							<HubspotForm
								portalId={hubspotForm.portalId}
								formId={hubspotForm.formId}
								loading={<div>Loading...</div>}
							/>
						</div>
					)}
					<div className="dealerPaneClose">
						<div className="testMap" />
            {backLink 
             ? <a className="back" href={backLink}>Back to the map</a>
             : (
              <button
                onClick={() => setCurLocationIdx(null)}
              >
                Back to the map
              </button>
            )}
					</div>
				</div>
			</section>
		</>
	)
}

const global = props => css`
  body {
    margin: 0;
    height: 100%;
    overflow: hidden;
  }
  ${props.breakpoint && `@media(min-width: ${props.breakpoint}) {
    body {
      overflow: auto;
    }
  }`}
  
`

const bannerHeight = `50vh`
const maxBannerHeight = `600px`
const contentPadding = `20px`

const styles = props => css`
  z-index: 5000;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: auto;
  text-align: left;
  .hubspotForm {
    padding: 20px;
  }
  .inner {
    height: 100%;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .dealerInfo, .dealerDescription, .dealerVideo, 
  .dealerAmenities, .dealerPaneClose {
    margin: ${contentPadding};
    margin-bottom: 40px;
  }
  .dealerInfo, .dealerDescription, .dealerAmenities {
    border-bottom: 2px solid #ccc;
    padding-bottom: 40px;
  }
  .dealerPaneClose {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 175px;

    .testMap {
      z-index: -1;
      background: skyblue;
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
    .back {
      background: ${props.primaryColor};
      color: #fff;
      font-size: 24px;
      text-transform: uppercase;
      font-weight: bold;
      padding: 20px 25px;
      border: none;
      outline: none;
      border-radius: 10px;
      box-shadow: 0px 3px 10px #333;
      cursor: pointer;
    }
  }
  .amenitiesList {
    margin-top: 20px;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    .amenityIcon {
      width: 40px;
      height: 40px;
      margin-right: 10px;
    }
    .amenity {
      display: flex;
      align-items: center;
      flex: 1 0 50%;
      font-size: 20px;
      color: #999;
      text-transform: capitalize;
    }
  }
  .sectionHeader {
    font-size: 26px;
    font-weight: 300;
    color: #999;
    border-bottom: 2px solid #ccc;
    padding-bottom: 5px;
  }
  .dealerInfo {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    > div {
      margin: 10px;
      flex: 1 0 calc(50% - 60px);
    }
  }
  .contactIcons {
    display: flex;
    justify-content: flex-end;
    > a {
      background: #fff;
      border-radius: 50%;
      box-shadow: 0px 3px 3px #ccc;
      padding: 5px;
      margin: 0 10px;
      height: 50px;
      width: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .icon {
      height: 30px;
      width: 30px;
      color: ${props.primaryColor};
    }
  }
  .personalInfo {
    font-size: 14px;
    .stateCityZip, .phone {
      margin-bottom: 15px;
    }
  }
  .dealerLevel {
    text-align: center;
    max-width: 300px;

    .badge {
      margin: 0 auto 10px auto;
      width: 50px;
    }
    .dealerIcons {
      display: flex;
      flex-flow: row wrap;
      margin: -5px;
      .dealerIcon {
        margin: 5px;
        flex-basis: calc((100% / 3) - 12px);
      }
    }
  }
  .display {
    .title {
      font-size: 36px;
      font-weight: bold;
      text-transform: capitalize;
    }
    .subTitle {
      font-size: 14px;
      display: flex;
    }
    .bulletPoint {
      margin: 0 8px;
    }
  }
  .close {
    display: flex;
    align-items: center;
    margin-left: auto;
  }
  .closeIcon {
    color: #666;
    height: 40px;
    width: 40px;
    cursor: pointer;
  }
  .previous, .next {
    cursor: pointer;
  }
  .dealerSelect {
    display: flex;
    align-items: center;
    padding: 20px;
    font-size: 24px;
  }
  .previous {
      margin-right: 25px;
    }
  .dealerBannerLogo, .imageSelect {
    z-index: 10;
    position: absolute;
  }
  .imageSelect {
    right: 70px;
    bottom: 55px;
    position: relative;
    cursor: pointer;
    .rec {
      position: absolute;
      height: 20px;
      width: 30px;
      border: 3px solid #fff;
    }
    .rec1 {
      top: 0;
      left: 0;
    }
    .rec2 {
      top: -5px;
      left: -5px;
    }
    .rec3 {
      top: -10px;
      left: -10px;
    }
  }
  .dealerBannerLogo {
    bottom: 40px;
    left: 40px;
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    border-radius: 50%;
    align-items: center;
    background: #fff;
    overflow: hidden;
  }
  .dealerSlide {
    position: relative;
    width: 100%;
    height: ${bannerHeight};
    max-height: ${maxBannerHeight};
    background: #333;
  }
  .dealerBanner {
    margin-bottom: 40px;
  }
  .dealerBannerImg {
    width: 100%;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .slick-slider {
    overflow: hidden;
    width: 100%;
    height: ${bannerHeight};
    max-height: ${maxBannerHeight};
  }
  .slick-arrow {
    z-index: 1;
    ::before {
      font-size: 30px;
      opacity: 1;
    }
  }
  .slick-prev {
    left: 10px;
  }
  .slick-next {
    right: 15px;
  }
`
