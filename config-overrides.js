const { useBabelRc, override, addBabelPreset } = require(`customize-cra`)
module.exports = override(
	useBabelRc(),
	addBabelPreset(`@emotion/babel-preset-css-prop`),
)