const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(`${ __dirname }/build`)));

app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname + '/public' + '/index.html'));
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(port, () => {
    console.log(`App listening at ${ port }`);
});
