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
    res.writeHead(200, { 'Content-Type': 'text/html' });
    db.get(id, (cbr) => {
        var ins = cbr;
        var keys = ["bottom", "right", "top", "left"];
        var dirs = ["left", "straight", "right"];
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
        while (true) { //break when all cars are out
            var lights = [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]];
            var pendingLights = [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]];
            function updateLights(arr = pendingLights) {
                lights = arr;
                if (arr == pendingLights) {
                    pendingLights = [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]];
                }
                res.write(lights + "<br /><hr /><br />");
            }
            function changeLights(nums) {
                pendingLights[nums[0]][nums[1]] = Math.abs(pendingLights[nums[0]][nums[1]] - 1);
            }
            mostVal = 0;
            for (i = 0; i < keys.length; i++) { //get a focused by the value of each intersection
                for (j = 0; j < dirs.length - 1; j++) {
                    if (ins[keys[i]][dirs[j]].amount >= mostVal) {
                        mostVal = ins[keys[i]][dirs[j]].amount;
                        mostName = [i, j];
                    }
                    if (ins[keys[i]][dirs[j]].amount == 0) {
                        clearIns.push(([i, j]).toString());
                    }
                }
            }
            if (mostVal == 0) { //check if any car left on intersection
                break;
            }
            changeLights(mostName);
            var opSide = 0;
            if ((mostName[0] - 2) < 0) { //get opposite id
                opSide = mostName[0] + 2;
            } else {
                opSide = mostName[0] - 2;
            }
            if (mostName[1] == 0) {
                if (ins[keys[opSide]][dirs[0]].amount > ins[keys[mostName[0]]][dirs[1]].amount) {
                    mostName2 = [opSide, 0];
                } else {
                    mostName2 = [mostName[0], 1];
                }
            }
            if (mostName[1] == 1) {
                if (ins[keys[opSide]][dirs[1]].amount > ins[keys[mostName[0]]][dirs[0]].amount) {
                    mostName2 = [opSide, 1];
                } else {
                    mostName2 = [mostName[0], 0];
                }
            }
            changeLights([mostName2[0], mostName2[1]]);
            updateLights();

            //consuming
            ins[keys[0]][dirs[2]].amount -= ins[keys[mostName[0]]][dirs[mostName[1]]].amount;
            ins[keys[1]][dirs[2]].amount -= ins[keys[mostName[0]]][dirs[mostName[1]]].amount;
            ins[keys[2]][dirs[2]].amount -= ins[keys[mostName[0]]][dirs[mostName[1]]].amount;
            ins[keys[3]][dirs[2]].amount -= ins[keys[mostName[0]]][dirs[mostName[1]]].amount;
            if (ins[keys[0]][dirs[2]].amount < 0) ins[keys[0]][dirs[2]].amount = 0;
            if (ins[keys[1]][dirs[2]].amount < 0) ins[keys[1]][dirs[2]].amount = 0;
            if (ins[keys[2]][dirs[2]].amount < 0) ins[keys[2]][dirs[2]].amount = 0;
            if (ins[keys[3]][dirs[2]].amount < 0) ins[keys[3]][dirs[2]].amount = 0;


            ins[keys[mostName[0]]][dirs[mostName[1]]].amount = 0;
            ins[keys[mostName2[0]]][dirs[mostName2[1]]].amount = 0;
            time += mostVal + 2;



            updateLights(); //reset
        }
        res.write("end");
        res.end();
    })
})
app.use(express.static('./public'))
app.listen(80)