const express = require('express');
const api1Routes = require('./routes/api1.routes');
const api2Routes = require('./routes/api2.routes');
const api3Routes = require('./routes/api3.routes');

const app = express();
app.use(express.json());

app.use(api1Routes);
app.use(api2Routes);
app.use(api3Routes);

module.exports = app;
