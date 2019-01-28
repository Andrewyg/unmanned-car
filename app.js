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
// var db = require('./db');
// var id = "5c1dec835156636974b1b014";
// db.create(function (rbval) {
//     id = rbval._id;
// })

var keys = ["bottom", "right", "top", "left"];
var dirs = ["left", "straight"];
var usedID = [];

// app.get('/id', (req, res) => {
//     res.send(id);
// })
// app.post('/add', (req, res) => {
//     var data = req.body;
//     if (keys.includes(data.place) && dirs.includes(data.direction) && !usedID.includes(data.id)) {
//         db.add(id, data.place, data.direction, data.id, (cbr) => {
//             res.json(cbr)
//         });
//     }
// })

// app.post('/bulk', (req, res) => {

// })

app.post('/operate', (req, res) => {
    // db.get(id, (cbr) => {
    var ins = req.body;
    var mostVal;
    var mostName = [];
    var mostName2 = [];
    var lf = {
        remove: (place, direction) => {
            if (ins[place][direction].amount > 0) {
                ins[place][direction].amount--;
                ins[place][direction].queue.shift();
            }
        }
    }
    var time = 0;
    var clearIns = [];
    var available = ["0,0", "0,1", "1,0", "1,1", "2,0", "2,1", "3,0", "3,1"];
    var movingIns = [];
    var minskey = 0;
    while (true) {
        var locMovingIns = movingIns[minskey];
        locMovingIns = [];
        while (available.length > 0) { //break when all cars are out
            var lights = [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]];
            var pendingLights = [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]];
            function updateLights(arr = pendingLights) {
                lights = arr;
                if (arr == pendingLights) {
                    pendingLights = [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]];
                }
                // res.write(lights + "<br /><hr /><br />");
            }
            function changeLights(nums) {
                pendingLights[nums[0]][nums[1]] = Math.abs(pendingLights[nums[0]][nums[1]] - 1);
            }
            mostVal = 0;

            function keyLeft(x = mostName[0]) {
                x -= 1;
                if (x < 0) x += 4;
                return x;
            }
            function keyOpp(x = mostName[0]) {
                x -= 2;
                if (x < 0) x += 4;
                return x;
            }
            function keyRight(x = mostName[0]) {
                x += 1;
                if (x > 3) x -= 4;
                return x;
            }

            // while () {
            console.log(available);

            for (i = 0; i < keys.length; i++) { //get a focused by the value of each intersection
                for (j = 0; j < dirs.length; j++) {
                    if (ins[keys[i]][dirs[j]].amount >= mostVal && available.includes((i + "," + j))) {
                        mostVal = ins[keys[i]][dirs[j]].amount;
                        mostName = [i, j];
                    }
                    if (ins[keys[i]][dirs[j]].amount == 0) {
                        clearIns.push(([i, j]).toString());
                    }
                }
            }
            if (mostVal == 0) {
                break;
            }
            // if (mostVal == 0) { //check if any car left on intersection
            //     break;
            // }


            available.remove(mostName.toString());
            locMovingIns.push(mostName);

            var against = [];

            if (mostName[1] == 0) {
                against.push([keyLeft(mostName[0]), 0]);
                against.push([keyLeft(mostName[0]), 1]);
                against.push([keyRight(mostName[0]), 0]);
                against.push([keyOpp(mostName[0]), 1]);
            }

            if (mostName[1] == 1) {
                against.push([keyLeft(mostName[0]), 1]);
                against.push([keyRight(mostName[0]), 1]);
                against.push([keyRight(mostName[0]), 0]);
                against.push([keyOpp(mostName[0]), 0]);
            }
            console.log("--------" + against);

            for (asd1 = 0; asd1 < against.length; asd1++) {
                console.log(against[asd1].toString());
                available.remove(against[asd1].toString());
            }

            //convert and consume
            for (asd2 = 0; asd2 < locMovingIns.length; asd2++) {
                locMovingIns[asd2][0] = keys[locMovingIns[asd2][0]];
                locMovingIns[asd2][1] = dirs[locMovingIns[asd2][1]];
                ins[locMovingIns[asd2][0]][locMovingIns[asd2][1]].amount -= ins[locMovingIns[0][0]][locMovingIns[0][1]].amount;
                if (ins[locMovingIns[asd2][0]][locMovingIns[asd2][1]].amount < 0) ins[locMovingIns[asd2][0]][locMovingIns[asd2][1]].amount = 0;
            }
        }
        minskey++;
    }
    console.log(movingIns);
    res.json(movingIns);
    // res.end();
    // })
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

    var ids = [];

    function makeID() {
        var id = randText(10);
        if (ids.includes(id)) {
            return makeID();
        } else {
            return id;
        }
    }

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
        url: "http://localhost/operate",
        method: "POST",
        json: data
    }, (err, res1, body) => {
        if (err) console.log(err);
        // console.log(res);
        console.log(body);
        resloc.output = body;
        res.json(resloc)
    })
})



app.use(express.static('./public'))
app.listen(80)
//auto change pattern when one intersection is zero