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
var normalConversion = require('./normal-conversion');
var nowCIns = "";
var running = false;

var keys = ["bottom", "right", "top", "left"];
var dirs = ["left", "straight", "right"];

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

app.get('/normal/:id',(req, res) => {
    normalConversion.convert(req.body.compareId,(rtd) => {
        res.json(rtd)
    })
});

app.get('/operate/:id', (req, res) => {
    var useCIns = req.params.id;
    if (req.params.id == "current") {
        useCIns = nowCIns;
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
    } else {
        db.result.get(useCIns, (rtd) => {
            res.json(rtd);
        );
    }
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
        db.compare.getByOperateId(useCompare, (rtd) => {
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

app.get('/export/compare/all', (req, res) => {
    var csv = "";
    res.writeHead(200, { "Content-Disposition": "attachment;filename=compare-all.csv", 'Content-Type': 'text/csv' });
    db.compare.getAll((compare) => {
        function addResult(i) {
            csv += '"scene","result","compare"\n';
            csv += '"' + compare[i].refCIns + '","' + compare[i].refCIns + '","' + compare[i]._id + '"\n';
            csv += '"","left","straight","right"\n';
            db.scene.get(compare[i].refCIns, (scene) => {
                for (j = 0; j < keys.length; j++) {
                    csv += '"' + keys[j] + '","' + scene[keys[j]].left.amount + '","' + scene[keys[j]].straight.amount + '","' + scene[keys[j]].right.amount + '"\n';
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
            for (j = 0; j < keys.length; j++) {
                csv += '"' + keys[j] + '","' + scene[keys[j]].left.amount + '","' + scene[keys[j]].straight.amount + '","' + scene[keys[j]].right.amount + '"\n';
            }
            csv += '"normal","' + compare.normalInsTakenTime + '",""\n';
            csv += '"computer controled","' + compare.computerControledInsTakenTime + '",""\n';
            res.end(csv);
        })
    })
})

app.get('/import/:id', (req, res) => {
    db.scene.import(req.params.id, nowCIns, (rtd) => {
        res.redirect('/db/scene/'+nowCIns);
    })
}

app.get('/clear/scene', (req, res) => {
    db.scene.clear(nowCIns, (rtd) => {
        res.redirect('/db/scene')
    });
})

app.use(express.static('./public'));

app.listen(8080, '0.0.0.0')
