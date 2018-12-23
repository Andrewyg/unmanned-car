var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var db = require('./db');
var id = "5c1dec835156636974b1b014";
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
        var dirs = ["straight", "left", "right"];
        var mostVal;
        var mostName = "";
        var lf = {
            remove: (place, direction) => {
                if (ins[place][direction].amount > 0) {
                    ins[place][direction].amount--;
                    ins[place][direction].queue.shift();
                }
            }
        }
        var time = 0;
        var blockZone = [[false, false], [false, false]];
        function c2bz(x, y) {
            if (x) { x = 1 } else { x = 0 }
            if (y) { y = 1 } else { y = 0 }
            return blockZone[x][y];
        }
        function block(x, y) {
            if (x) { x = 1 } else { x = 0 }
            if (y) { y = 1 } else { y = 0 }
            if (blockZone[x][y]) {
                blockZone[x][y] = false;
            } else {
                blockZone[x][y] = true;
            }
        }
        function qblock(posi, dir, j) {
            var a = true;
            var b = false;
            if (posi == 1) {
                a = !a;
            }
            if (posi == 2) {
                a = !a;
                b = !b;
            }
            if (posi == 3) {
                b = !b;
            }
            if (j == 0 || j == 1) {
                block(a, !b);
                if (j == 0) return;
            }
            if (dir == 2) {
                return;
            } else {
                if (j == 1 || j == 2) {
                    la = a;
                    lb = b;
                    if (posi == 2) {
                        la = !la;
                        lb = !lb;
                    }
                    block(la, lb);
                    if (j == 1) return;
                }
                if (dir == 1) {
                    block(!a, b);
                }
            }
        }
        function blocked(posi, dir, g) {
            var a = true;
            var b = false;
            if (posi == 1) {
                a = !a;
            }
            if (posi == 2) {
                a = !a;
                b = !b;
            }
            if (posi == 3) {
                b = !b;
            }
            if (g == 0) {
                return c2bz(a, !b);
            }
            if (dir == 2) {
                return false;
            } else {
                if (g == 1) {
                    la = a;
                    lb = b;
                    if (posi == 2) {
                        la = !la;
                        lb = !lb;
                    }
                    return c2bz(la, lb);
                }
                if (dir == 1) {
                    return c2bz(!a, b)
                }
            }
            return false;
        }
        var blockZoneClear = () => {
            if (!blockZone[0].includes(true) && !blockZone[1].includes(true)) {
                return true;
            } else {
                return false;
            }
        }
        var clearIns = [];
        while (true) {
            var localClearIns = [];
            mostVal = 0;
            for (i = 0; i < keys.length; i++) {
                for (j = 0; j < dirs.length; j++) {
                    if (ins[keys[i]][dirs[j]].amount >= mostVal) {
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
            for (t = 0; t < mostVal; t++) {
                var lla, llb, llan, llbn;
                var n = [0, 0, 0, 0];
                while (true) {
                    for (k = 0; k < 4; k++) {
                        lla = keys[mostName[0] + k] || keys[mostName[0] + k - 4];
                        llb = dirs[mostName[1] + k] || dirs[mostName[1] + k - 3];
                        llan = keys.indexOf(lla);
                        llbn = dirs.indexOf(llb);
                        if (!((n[k] > 3 && llbn == 0) || (n[k] > 2 && llbn == 2) || (n[k] > 4 && llbn == 1)) && !clearIns.includes(([llan, llbn]).toString()) && !localClearIns.includes(([llan, llbn]).toString())) {
                            if (!blocked(llan, llbn, n[k]) || ((n[k] == 2 && llbn == 0) || (n[k] == 1 && llbn == 2) || (n[k] == 3 && llbn == 1))) {
                                console.log(lla + " go " + llb);
                                lf.remove(lla, llb);
                                qblock(llan, llbn, n[k]);
                                console.log("----------------");
                                if (((n[k] == 2 && llbn == 0) || (n[k] == 1 && llbn == 2) || (n[k] == 3 && llbn == 1))) {
                                    localClearIns.push(([llan, llbn]).toString());
                                }
                                n[k]++;
                            } else {
                            }
                        } else {
                        }
                        time++;
                    }
                    if (blockZoneClear()) break;
                }
                console.log("========================================================");
            }
            time++;
        }
        console.log("end");
        res.end();
    })
})
app.use(express.static('./public'))
app.listen(80)