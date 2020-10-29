var path = require(`path`)

module.exports = {
  mode: `development`,
  entry: `./scripts/inject.js`,
  output: {
    path: path.resolve(__dirname, `dist`),
    filename: `bundle.js`,
  },
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
          {
            loader: `css-loader`,
            options: {
              esModule: false,
            },
          },
        ],
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