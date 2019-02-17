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
fs.readFile('/nowCIns', "utf8", (err, data) => {
    if (err || data.length <= 1) { //dunno but empty file has a length of 1
        db.reset((rtd2) => {
            db.init((rtd) => {
                nowCIns = rtd;
                fs.writeFileSync('/nowCIns', nowCIns);
                running = true;
            })
        })
    } else {
        nowCIns = data;
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

app.get('/operate/:id', (req, res) => {
    var useCIns = req.params.id;
    if (req.params.id == "current") useCIns = nowCIns;
    var qLeft = Number(req.query.left),
        qStraight = Number(req.query.straight),
        qRight = Number(req.query.right),
        qCar = Number(req.query.car),
        qLightHS = Number(req.query.lightHS),
        qLightHL = Number(req.query.lightHL),
        qLightVS = Number(req.query.lightVS),
        qLightVL = Number(req.query.lightVL);
    compiler.run(useCIns, qLeft, qStraight, qRight, qCar, qLightHS, qLightHL, qLightVS, qLightVL, (rtd, newCIns) => {
        nowCIns = newCIns;
        res.json(rtd);
    }, (req.query.copy == "true"), true)
})

app.get('/compare/:id', (req, res) => {
    var useCompare = req.params.id;
    if (req.params.id == "current") {
        var useCIns = nowCIns
        var qLeft = Number(req.query.left),
            qStraight = Number(req.query.straight),
            qRight = Number(req.query.right),
            qCar = Number(req.query.car),
            qLightHS = Number(req.query.lightHS),
            qLightHL = Number(req.query.lightHL),
            qLightVS = Number(req.query.lightVS),
            qLightVL = Number(req.query.lightVL);
        compiler.run(useCIns, qLeft, qStraight, qRight, qCar, qLightHS, qLightHL, qLightVS, qLightVL, (rtd, newCIns) => {
            nowCIns = newCIns;
            db.compare.get(rtd.output.refCompare, (rtd2) => {
                res.json(rtd2);
            })
        }, (req.query.copy == "true"), true)
    } else {
        db.compare.get(useCompare, (rtd) => {
            res.json(rtd)
        })
    }
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

app.get('/db/:type/:id', (req, res) => {
    db[req.params.type].get(req.params.id, (rtd) => res.json(rtd));
})

app.get('/db/:type', (req, res) => {
    db[req.params.type].getAll((rtd) => res.json(rtd));
})

app.use(express.static('./public'));

app.listen(8080, '0.0.0.0')
