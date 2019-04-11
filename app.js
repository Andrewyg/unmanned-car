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
var conversion = require('./conversion');
var nowCIns = "";
var running = false;

var positions = ["bottom", "right", "top", "left"];
var directions = ["left", "straight", "right"];

var fs = require('fs');
fs.readFile('/nowCIns', "utf8", (err, data) => {
    if (err || data == "reset\n" || data == "\n") { //all file are ending with \n
        db.resetDynamic((rtd2) => {
            db.init((rtd) => {
                nowCIns = rtd;
                fs.writeFileSync('/nowCIns', nowCIns);
                running = true;
            })
        })
    } else if (data == "hard reset\n") {
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

app.get('/normal/:id', (req, res) => {
    conversion.normal(req.params.id, (rtd) => {
        res.json(rtd)
    })
});

app.get('/operate/:id', (req, res) => {
    var useCIns = req.params.id;
    if (req.params.id == "current") {
        useCIns = nowCIns;
        var query = req.query;
        if (query.left && query.straight && query.right && query.car && query.lightHS && query.lightHL && query.lightVS && query.lightVL) {
            var qLeft = Number(query.left),
                qStraight = Number(query.straight),
                qRight = Number(query.right),
                qCar = Number(query.car),
                qLightHS = Number(query.lightHS),
                qLightHL = Number(query.lightHL),
                qLightVS = Number(query.lightVS),
                qLightVL = Number(query.lightVL);
            compiler.run(useCIns, qLeft, qStraight, qRight, qCar, qLightHS, qLightHL, qLightVS, qLightVL, (rtd, compareId, newCIns) => {
                nowCIns = newCIns;
                conversion.ccins(rtd, (rtd2) => {
                    res.json(rtd2);
                })
            }, (req.query.copy == "true"), true)
        } else {
            res.writeHead(400);
            res.end("Parameters missing");
        }
    } else {
        conversion.ccins(useCIns, (rtd) => {
            res.json(rtd);
        })
    }
})

app.get('/compare/:id', (req, res) => {
    var useCompare = req.params.id;
    if (req.params.id == "current") {
        var useCIns = nowCIns;
        var query = req.query;
        if (query.left && query.straight && query.right && query.car && query.lightHS && query.lightHL && query.lightVS && query.lightVL) {
            var qLeft = Number(query.left),
                qStraight = Number(query.straight),
                qRight = Number(query.right),
                qCar = Number(query.car),
                qLightHS = Number(query.lightHS),
                qLightHL = Number(query.lightHL),
                qLightVS = Number(query.lightVS),
                qLightVL = Number(query.lightVL);
            compiler.run(useCIns, qLeft, qStraight, qRight, qCar, qLightHS, qLightHL, qLightVS, qLightVL, (rtd, compareId, newCIns) => {
                nowCIns = newCIns;
                db.compare.get(compareId, (rtd2) => {
                    res.json(rtd2);
                })
            }, (req.query.copy == "true"), true)
        } else {
            res.writeHead(400);
            res.end("Parameters missing");
        }
    } else {
        db.compare.getByOperateId(useCompare, (rtd) => {
            res.json(rtd)
        })
    }
})

var license = 0;
app.post('/add', (req, res) => {
    if (positions.includes(req.body.position) && directions.includes(req.body.direction)) {
        license++
        db.car.create({
            license: license,
            type: "small",
            speed: 60
        }, (rtd) => {
            var id = rtd._id;
            db.scene.add(nowCIns, req.body.position, req.body.direction, id, (rtd2) => {
                res.json(rtd2);
            })
        })
    } else {
        res.writeHead(400);
        res.end("Parameter error");
    }
})

app.get('/db/:type/:id', (req, res) => {
    db[req.params.type].get(req.params.id, (rtd) => res.json(rtd));
})

app.get('/db/:type', (req, res) => {
    db[req.params.type].getAll((rtd) => res.json(rtd));
})

app.get('/export/compare/all', (req, res) => {
    var csv = "";
    res.writeHead(200, { "Content-Disposition": "attachment;filename=compare-all.csv", 'Content-Type': 'text/csv' });
    db.compare.getAll((compare) => {
        function addResult(i) {
            csv += '"scene","result","compare"\n';
            csv += '"' + compare[i].refCIns + '","' + compare[i].refCIns + '","' + compare[i]._id + '"\n';
            csv += '"","left","straight","right"\n';
            db.scene.get(compare[i].refCIns, (scene) => {
                for (j = 0; j < positions.length; j++) {
                    csv += '"' + positions[j] + '","' + scene[positions[j]].left.amount + '","' + scene[positions[j]].straight.amount + '","' + scene[positions[j]].right.amount + '"\n';
                }
                csv += '"normal","' + compare[i].normalInsTakenTime + '",""\n';
                csv += '"computer controled","' + compare[i].computerControledInsTakenTime + '",""\n';
                csv += '"","",""\n';
                if (i < compare.length - 1) return addResult(i + 1); else return res.end(csv);
            })
        }
        addResult(0);
    })
})

app.get('/export/compare/:id', (req, res) => {
    var csv = "";
    res.writeHead(200, { "Content-Disposition": "attachment;filename=compare-" + req.params.id + ".csv", 'Content-Type': 'text/csv' });
    db.compare.get(req.params.id, (compare) => {
        csv += '"scene","result","compare"\n';
        csv += '"' + compare.refCIns + '","' + compare.refCIns + '","' + compare._id + '"\n';
        csv += '"","left","straight","right"\n';
        db.scene.get(compare.refCIns, (scene) => {
            for (j = 0; j < positions.length; j++) {
                csv += '"' + positions[j] + '","' + scene[positions[j]].left.amount + '","' + scene[positions[j]].straight.amount + '","' + scene[positions[j]].right.amount + '"\n';
            }
            csv += '"normal","' + compare.normalInsTakenTime + '",""\n';
            csv += '"computer controled","' + compare.computerControledInsTakenTime + '",""\n';
            res.end(csv);
        })
    })
})

app.get('/import/:id', (req, res) => {
    db.scene.import(req.params.id, nowCIns, (rtd) => {
        res.redirect('/db/scene/' + nowCIns);
    })
})

app.get('/clear/scene', (req, res) => {
    db.scene.clear(nowCIns, (rtd) => {
        res.redirect('/db/scene/' + nowCIns)
    });
})

app.use(express.static('./public'));

app.listen(8080, '0.0.0.0')
