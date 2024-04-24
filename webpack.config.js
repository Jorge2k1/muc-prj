const path = require('path');

module.exports = {
  // Define múltiples puntos de entrada
  entry: {
    bundle: './src/index.js',  // Asumiendo que 'index.js' es tu punto de entrada principal
    chat: './src/chat.js'      // Añade 'chat.js' como un punto de entrada adicional para el chat
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // Los archivos se generan en la carpeta 'dist'
    filename: '[name].js', // '[name]' es un placeholder para el nombre de cada punto de entrada
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      // Aquí puedes añadir más reglas si necesitas cargar otros tipos de archivos.
    ],
  },
  // Si necesitas configuraciones adicionales como plugins, puedes añadirlas aquí.
};

// const path = require('path');

// module.exports = {
//   entry: './src/index.js',
//   output: {
//     path: path.resolve(__dirname, 'dist'), 
//     filename: 'bundle.js',
//   },
//   module: {
//     rules: [
//       {
//         test: /\.js$/, 
//         exclude: /node_modules/, 
//         use: {
//           loader: 'babel-loader', 
//           options: {
//             presets: ['@babel/preset-env'],
//           },
//         },
//       },
//     ],
//   },
// };
