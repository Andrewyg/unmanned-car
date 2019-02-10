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
        nowCIns = data
    }
})

app.get('/status', (req, res) => {
    if (running) {
        res.send("running");
    } else {
        res.send("Initializing");
    }
})

app.get('/operate', (req, res) => {
    compiler.run(nowCIns, true, (rtd) => {
        res.json(rtd);
        db.scene.archive(nowCIns, (rtd2) => {
            nowCIns = rtd2._id;
        })
    })
})

app.get('/compare', (req, res) => {
    simulator.run((rtd) => {
        res.json(rtd);
    })
})

app.get('/test', (req, res) => {
    var resloc = {
        input: {},
        output: []
    }
    var data = {
        "top": {
            "straight": {
                "amount": 0,
                "queue": []
            },
            "left": {
                "amount": 0,
                "queue": []
            },
            "right": {
                "amount": 0,
                "queue": []
            }
        },
        "left": {
            "straight": {
                "amount": 0,
                "queue": []
            },
            "left": {
                "amount": 0,
                "queue": []
            },
            "right": {
                "amount": 0,
                "queue": []
            }
        },
        "right": {
            "straight": {
                "amount": 0,
                "queue": []
            },
            "left": {
                "amount": 0,
                "queue": []
            },
            "right": {
                "amount": 0,
                "queue": []
            }
        },
        "bottom": {
            "straight": {
                "amount": 0,
                "queue": []
            },
            "left": {
                "amount": 0,
                "queue": []
            },
            "right": {
                "amount": 0,
                "queue": []
            }
        }
    };

    function randText(leng) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < leng; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    function randNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    var rn = randNumber(0, 10);

    // var ids = [];
    // function makeID() {
    //     var id = randText(10);
    //     if (ids.includes(id)) {
    //         return makeID();
    //     } else {
    //         ids.push(id);
    //         return id;
    //     }
    // }

    for (i = 0; i < rn; i++) {
        data.top.left.amount++;
    } rn = randNumber(0, 10);
    for (i = 0; i < rn; i++) {
        data.top.straight.amount++;
    } rn = randNumber(0, 10);
    for (i = 0; i < rn; i++) {
        data.top.right.amount++;
    } rn = randNumber(0, 10);
    for (i = 0; i < rn; i++) {
        data.right.left.amount++;
    } rn = randNumber(0, 10);
    for (i = 0; i < rn; i++) {
        data.right.straight.amount++;
    } rn = randNumber(0, 10);
    for (i = 0; i < rn; i++) {
        data.right.right.amount++;
    } rn = randNumber(0, 10);
    for (i = 0; i < rn; i++) {
        data.bottom.left.amount++;
    } rn = randNumber(0, 10);
    for (i = 0; i < rn; i++) {
        data.bottom.straight.amount++;
    } rn = randNumber(0, 10);
    for (i = 0; i < rn; i++) {
        data.bottom.right.amount++;
    } rn = randNumber(0, 10);
    for (i = 0; i < rn; i++) {
        data.left.left.amount++;
    } rn = randNumber(0, 10);
    for (i = 0; i < rn; i++) {
        data.left.straight.amount++;
    } rn = randNumber(0, 10);
    for (i = 0; i < rn; i++) {
        data.left.right.amount++;
    }

    resloc.input = data;

    var request = require('request');
    request({
        url: "http://localhost:8080/operate",
        method: "POST",
        json: data
    }, (err, res1, body) => {
        resloc.output = body;
        res.json(resloc)
    })
})



app.use(express.static('./public'))
app.listen(8080, '0.0.0.0')