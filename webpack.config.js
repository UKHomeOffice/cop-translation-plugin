const path = require('path');

module.exports = {
    entry: path.join(path.resolve(__dirname, 'dist'), 'index.js'),
    target: 'node',
    output: {
        library: 'translation',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist'),
        filename: 'translation.js',
    },
    mode: 'production',
    performance: {hints: false},
};
