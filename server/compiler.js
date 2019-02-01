(function () {
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
    var db = require('./db');
    function keyLeft(x) {
        x -= 1;
        if (x < 0) x += 4;
        return x;
    }
    function keyOpp(x) {
        x -= 2;
        if (x < 0) x += 4;
        return x;
    }
    function keyRight(x) {
        x += 1;
        if (x > 3) x -= 4;
        return x;
    }
    var keys = ["bottom", "right", "top", "left"];
    var dirs = ["left", "straight", "right"];
    function joinColumns(key, dir1, dir2, raf) {
        var tempArr = [];
        var sorted = [];
        tempArr.concat(cins[keys[key]][dir1].queue);
        tempArr.concat(cins[keys[key]][dir2].queue);
        for (i = 0; i < tempArr.length; i++) {
            var sindex = 0;
            for (j = 0; j < sorted.length; j++) {
                if (tempArr[i].arriveTime.getTime() > sorted.getTime()) {
                    sindex++;
                }
            }
            sorted.splice(sindex, 0, tempArr[i]);
        }
        return sorted
    }
    module.exports = {
        run: (CIns, cb, input1, input2) => {
            cb = cb || function (cbr) { };
            var db = require('./db');
            // db.scene.get(CIns, (rtd) => {
            // db.ins.get(rtd.refIns, (rtd2) => {
            var rtd = input1
            var rtd2 = input2
            refIns = rtd2;
            // data.refIns = refIns;
            var cins = rtd;
            var oriID = rtd._id;
            var oriA = [];
            dirs.remove("right");
            var rightAllied = false;
            if (rtd2.columns == 2) {
                oriA = ["0,0", "0,1", "1,0", "1,1", "2,0", "2,1", "3,0", "3,1"];
                rightAllied = true;
                for (i = 0; i < 4; i++) {
                    cins[keys[i]]["straight"].amount += cins[keys[i]]["right"].amount;
                    cins[keys[i]]["right"].amount = 0;
                    cins[keys[i]]["straight"].queue = joinColumns(i, "straight", "right");
                    cins[keys[i]]["right"].queue = [];
                }
            }
            // db.scene.validate(cins, (rtd3) => {
            // cins = rtd3;
            var mostVal;
            var mostName = [];
            var movingIns = [];
            var minskey = 0;

            if (!rightAllied) {
                movingIns.push([0, 2]);
                movingIns.push([1, 2]);
                movingIns.push([2, 2]);
                movingIns.push([3, 2]);
            }

            while (true) {
                var available = oriA;
                mostVal = 0

                for (i = 0; i < keys.length; i++) {
                    for (j = 0; j < dirs.length; j++) {
                        if (cins[keys[i]][dirs[j]].amount >= mostVal) {
                            mostVal = cins[keys[i]][dirs[j]].amount;
                            mostName = [i, j];
                        }
                    }
                }
                if (mostVal <= 0) break;

                var locMovingIns = movingIns[minskey];
                locMovingIns = [];

                while (available.length > 0) {
                    mostVal = 0;

                    for (i = 0; i < keys.length; i++) { //get a focused by the value of each intersection
                        for (j = 0; j < dirs.length; j++) {
                            if (cins[keys[i]][dirs[j]].amount > mostVal && available.includes((i + "," + j))) {
                                mostVal = cins[keys[i]][dirs[j]].amount;
                                mostName = [i, j];
                            }
                        }
                    }
                    if (mostVal <= 0) break;

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
                    for (asd1 = 0; asd1 < against.length; asd1++) {
                        available.remove(against[asd1].toString());
                    }
                }

                //convert and consume
                for (asd2 = 0; asd2 < locMovingIns.length; asd2++) {
                    locMovingIns[asd2][0] = keys[locMovingIns[asd2][0]];
                    locMovingIns[asd2][1] = dirs[locMovingIns[asd2][1]];
                }
                for (asd2 = 0; asd2 < locMovingIns.length; asd2++) {
                    cins[locMovingIns[asd2][0]][locMovingIns[asd2][1]].amount -= cins[locMovingIns[locMovingIns.length - 1][0]][locMovingIns[locMovingIns.length - 1][1]].amount;
                }

                movingIns[minskey] = locMovingIns;
                minskey++;
            }

            if (cins._id != oriID) {
                db.scene.remove(cins._id);
            }

            cb(movingIns)
            // })
        })
    })
}
    }
}())