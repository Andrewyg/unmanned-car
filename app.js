Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var db = require('./db');
var compiler = require('./compiler');
var simulator = require('./simulator');
var nowCIns = "";
var running = false;

var fs = require('fs');
fs.readFile('./nowCIns', (err, data) => {
    if (err || data.length <= 0) {
        db.reset((rtd2) => {
            db.init((rtd) => {
                nowCIns = rtd;
                fs.writeFileSync('./nowCIns', nowCIns);
                running = true;
            })
        })
    } else {
        nowCIns = data.toString();
        running = true;
    }
})

app.get('/status', (req, res) => {
    if (running) {
        res.send(nowCIns);
    } else {
        res.send("Initializing");
    }
})

function getQueryStr(url) {
    var urlIndex = url.indexOf('?');
    var query = url.substr(i + 1);
    return query;
}

app.get('/operate', (req, res) => {
    compiler.run(nowCIns, req.query.left, req.query.straight, req.query.right, req.query.car, (rtd) => {
        res.json(rtd);
        db.scene.archive(nowCIns, (rtd2) => {
            nowCIns = rtd2._id;
        })
    }, true)
})

app.get('/compare', (req, res) => {
    simulator.run(req.query.left, req.query.straight, req.query.right, req.query.car, req.query.light, (rtd) => {
        res.json(rtd);
    }, req.query.input, req.query.output)
})

var license = 0;
app.post('/add', (req, res) => {
    license++
    db.car.create({
        license: license,
        type: "small",
        speed: 60
    }, (rtd) => {
        var id = rtd._id;
        db.scene.add(nowCIns, req.body.place, req.body.direction, id, (rtd2) => {
            res.json(rtd2);
        })
    })
})

app.use(express.static('./public'));

app.listen(8080, '0.0.0.0')
