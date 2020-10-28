var path = require(`path`)

module.exports = {
  mode: `development`,
  // entry: `./scripts/inject.js`,
  entry: `./src/App.js`,
  output: {
    path: path.resolve(__dirname, `dist`),
    filename: `bundle.js`,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: `file-loader`,
          },
        ],
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
        test: /\.css$/i,
        use: [
          `style-loader`, 
          {
            loader: `css-loader`,
            options: {
              // Enable css as module so we can import
              modules: true,
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