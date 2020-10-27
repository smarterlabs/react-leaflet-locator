import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

function SEO({ 
	author,
	description, 
	lang, 
	meta, 
	keywords, 
	title, 
	imageUrl,
	ogImageUrl,
	ogTitle,
	ogDescription,
	twitterTitle,
	twitterDescription,
	twitterImageUrl,
}) {
	return (
		<Helmet
			htmlAttributes={{
				lang,
			}}
			title={title}
			meta={[
				{
					property: `og:image`,
					content: ogImageUrl || imageUrl,
				},
				{
					name: `description`,
					content: description,
				},
				{
					property: `og:title`,
					content: ogTitle || title,
				},
				{
					property: `og:description`,
					content: ogDescription || description,
				},
				{
					property: `og:type`,
					content: `website`,
				},
				{
					name: `twitter:card`,
					content: `summary`,
				},
				{
					name: `twitter:creator`,
					content: author,
				},
				{
					name: `twitter:title`,
					content: twitterTitle || title,
				},
				{
					name: `twitter:description`,
					content: twitterDescription || description,
				},
				{
					name: `twitter:image`,
					content: twitterImageUrl || imageUrl,
				},
			]
				.concat(
					keywords.length > 0
						? {
							name: `keywords`,
							content: keywords.join(`, `),
						}
						: [],
				)
				.concat(meta)}
		/>
	)
}

SEO.defaultProps = {
	lang: `en`,
	meta: [],
	keywords: [],
}

SEO.propTypes = {
	description: PropTypes.string,
	lang: PropTypes.string,
	meta: PropTypes.array,
	keywords: PropTypes.arrayOf(PropTypes.string),
	title: PropTypes.string.isRequired,
}

export default SEO
