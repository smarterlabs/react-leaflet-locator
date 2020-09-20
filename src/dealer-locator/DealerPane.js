import React, { useContext } from 'react'
import { css, Global} from '@emotion/core'
import Player from 'react-player'
import { MdClose, MdPlaylistAdd } from 'react-icons/md'
import { FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
import Slider from "react-slick"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

import StyleContext from '../context/StyleContext'

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
	} =  props
  
	const {
		name, 
		hours, 
		phone,
		categories,
		images,
		email,
		description,
		video,
		distance,
		lat,
		lng,
		address,
		city,
		state,
		zip,
	} = location

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


	return (
		<>
			<Global styles={global}/>
			<section css={() => styles(globalStyles)} className="dealerPaneContainer">
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
				<div className="dealerBanner">
					<Slider {...sliderSettings}>
						{images.map((img, i) => {
							return (
								<div key={i} className="dealerSlide">
									<img src={img} alt="dealerPaneImg" className="dealerBannerImg"/>
									<div className="dealerBannerLogo">
										<div className="sampleLogo">
                      Dealer Logo
										</div>
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
				</div>
				<div className="dealerInfo">
					<div className="display">
						<div className="title">{name}</div>
						<div className="subTitle">
							<div className="distance">{distance || 1.3} mi</div>
							<span className="bulletPoint">&bull;</span>
							<div className="hours">Open until {hours}</div>
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
						<div className="stateCityZip">{city}, {state} {zip}</div>
						<div className="phone">{phone}</div>
						<a href={`mailto:${email}`} className="email">{email}</a>
					</div>
					<div className="dealerLevel">
						<div className="badge">
            Dealer Level Badge
						</div>
						<div className="dealerIcons">
							<div className="testIcon">Icon</div>
							<div className="testIcon">Icon</div>
							<div className="testIcon">Icon</div>
							<div className="testIcon">Icon</div>
							<div className="testIcon">Icon</div>
							<div className="testIcon">Icon</div>
						</div>
					</div>
				</div>
				<div className="dealerDescription">
					{description}
				</div>
				<div className="dealerVideo">
					<Player url={video} className="player" width="100%" />
				</div>
				<div className="dealerAmenities">
					{!!categories.length && (
						<>
							<div className="sectionHeader">
                Amenities
							</div>
							<ul className="amenitiesList">
								{categories.map((cat, i) => {
									return (
										<li key={i} className="amenity">
											<MdPlaylistAdd className="amenityIcon" /> {cat}
										</li>
									)
								})}
							</ul>
						</>
          
					)}
				</div>
				<div className="dealerPaneClose">
					<div className="testMap" />
					<button className="back" onClick={() => setCurLocationIdx(null)}>
              Back to the map
					</button>
				</div>
			</section>
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

const bannerHeight = `60vh`
const maxBannerHeight = `600px`
const contentPadding = `20px`

const styles = props => css`
  z-index: 5000;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: auto;
  text-align: left;
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
      height: 20px;
      width: 20px;
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
      flex: 1 0 50%;
    }
  }
  .contactIcons {
    display: flex;
    justify-content: flex-end;
    .icon {
      height: 30px;
      width: 30px;
      color: ${props.primaryColor};
      background: #fff;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0px 3px 3px #ccc;
      :first-of-type {
        margin-right: 10px;
      }
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
    .badge {
      margin-bottom: 10px;
    }
    .dealerIcons {
      display: flex;
      flex-flow: row wrap;
      margin: -5px;
      .testIcon {
        border: 1px solid #000;
        margin: 5px;
        flex: 1 0 calc((100% / 3) - 12px);
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
  }
  .dealerSlide {
    position: relative;
    width: 100%;
    height: ${bannerHeight};
    max-height: ${maxBannerHeight};
  }
  .dealerBanner {
    margin-bottom: 40px;
  }
  .dealerBannerImg {
    height: 100%;
    width: 100%;
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