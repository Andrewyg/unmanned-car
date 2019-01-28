var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var db = require('./db');
// var id = "5c1dec835156636974b1b014";
db.create(function (rbval) {
    id = rbval._id;
})

app.get('/id', (req, res) => {
    res.send(id);
})
app.post('/add', (req, res) => {
    var data = req.body;
    db.add(id, data.place, data.direction, data.id, (cbr) => {
        res.json(cbr)
    });
})
app.get('/operate', (req, res) => {
    db.get(id, (cbr) => {
        var ins = cbr;
        var keys = ["bottom", "right", "top", "left"];
        var dirs = ["left", "straight"];
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
        while (available.length > 0) { //break when all cars are out
            console.log("in");
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
                x = x - 1;
                if (x < 0) x + 4;
                return x;
            }
            function keyOpp(x = mostName[0]) {
                x = x - 2;
                if (x < 0) x + 4;
                return x;
            }
            function keyRight(x = mostName[0]) {
                x = x + 1;
                if (x > 3) x - 4;
                return x;
            }

            // while () {

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
            // if (mostVal == 0) { //check if any car left on intersection
            //     break;
            // }


            available.remove(mostName.toString());
            movingIns.push(mostName);

            var against = [];

            if (mostName[1] == 0) {
                against.push([keyLeft(), 0]);
                against.push([keyLeft(), 1]);
                against.push([keyRight(), 0]);
                against.push([keyOpp(), 1]);
            }

            if (mostName[1] == 1) {
                against.push([keyLeft(), 1]);
                against.push([keyRight(), 1]);
                against.push([keyRight(), 0]);
                against.push([keyOpp(), 0]);
            }

            for (asd1 = 0; asd1 < 3; asd1++) {
                available.remove(against[asd1].toString());
            }

            // }



            updateLights(); //reset
            console.log(movingIns);
            console.log(available);
        }
        res.json(movingIns);
        // res.end();
    })
})
app.use(express.static('./public'))
app.listen(80)
//auto change pattern when one intersection is zero