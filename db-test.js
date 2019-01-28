var express = require('express');
var app = express();
var db = require('./db');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var id = "5c1dec835156636974b1b014";
db.create(function (rbval) {
    id = rbval._id;
})

app.get('/id', (req, res) => {
    res.send(id);
})
app.post('/add', (req, res) => {
    var data = req.body;
    if (keys.includes(data.place) && dirs.includes(data.direction) && !usedID.includes(data.id)) {
        db.add(id, data.place, data.direction, data.id, (cbr) => {
            res.json(cbr)
        });
    }
})

app.listen(8080);