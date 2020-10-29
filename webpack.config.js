var path = require(`path`)
// const MiniCssExtractPlugin = require(`mini-css-extract-plugin`)

module.exports = {
  mode: `development`,
  entry: `./scripts/inject.js`,
  output: {
    path: path.resolve(__dirname, `dist`),
    filename: `bundle.js`,
  },
  // plugins: [new MiniCssExtractPlugin({
  //   filename: `[name].css`,
  //   chunkFilename: `[id].css`,
  // })],
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [`file-loader`],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: `file-loader`,
            options: {
              name: `[name].[ext]`,
              outputPath: `fonts/`,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          `style-loader`,
          {
            loader: `css-loader`,
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
        include: /\.module\.css$/,
      },
      {
        test: /\.css$/,
        use: [
          `style-loader`,
          `css-loader`,
        ],
        exclude: /\.module\.css$/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use:  {
          loader: `babel-loader`,
          options: {
            presets: [`@babel/preset-env`],
          },
        }, 
      },  
    ],
  }, 
}