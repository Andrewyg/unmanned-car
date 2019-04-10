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
    var simulator = require('./simulator');

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

    function joinColumns(cins, key, dir1, dir2) {
        var tempArr = [];
        var sorted = [];
        tempArr = cins[key][dir1].queue;
        for (i = 0; i < cins[key][dir2].queue.length; i++) {
            cins[key][dir2].queue[i].ntd = dir2;
        }
        tempArr = tempArr.concat(cins[key][dir2].queue);
        for (i = 0; i < tempArr.length; i++) {
            var sindex = 0;
            for (j = 0; j < sorted.length; j++) {
                if ((new Date(tempArr[i].arriveTime)).getTime() > (new Date(sorted[j].arriveTime)).getTime()) {
                    sindex++;
                }
            }
            sorted.splice(sindex, 0, tempArr[i]);
        }
        return sorted
    }

    module.exports = {
        run: (CIns, leftTurnTime, straightGoTime, rightTurnTime, oneCarTime, insLightTimeHS, insLightTimeHL, insLightTimeVS, insLightTimeVL, cb, copyData, joinData) => {
            cb = cb || function (cbr) { };
            db.scene.get(CIns, (rtd) => {
                db.ins.get(rtd.refIns, (rtd2) => {
                    refIns = rtd2;
                    var cins = rtd;
                    var oriA = ["0,0", "0,1", "0,2", "1,0", "1,1", "1,2", "2,0", "2,1", "2,2", "3,0", "3,1", "3,2"];
                    var mostVal;
                    var mostName = [];
                    var movingIns = [];
                    var minskey = 0;
                    var available = [];
                    var returnData = {
                        output: {}
                    };

                    if (rtd2.lanes == 2) {
                        dirs.remove("right");
                        oriA = ["0,0", "0,1", "1,0", "1,1", "2,0", "2,1", "3,0", "3,1"];
                        for (abcd = 0; abcd < 4; abcd++) {
                            cins[keys[abcd]]["straight"].amount += cins[keys[abcd]]["right"].amount;
                            cins[keys[abcd]]["right"].amount = 0;
                            cins[keys[abcd]]["straight"].queue = joinColumns(cins, keys[abcd], "straight", "right");
                        }
                    }

                    cinsP = JSON.parse(JSON.stringify(cins));
                    cinsP.refIns = JSON.parse(JSON.stringify(rtd2));

                    if (joinData) {
                        returnData.input = {};
                        returnData.input = cins;
                    }

                    while (true) {
                        available = oriA.slice();
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
                        var minCar = {
                            key: locMovingIns[locMovingIns.length - 1][0],
                            dir: locMovingIns[locMovingIns.length - 1][1],
                            amount: cins[locMovingIns[locMovingIns.length - 1][0]][locMovingIns[locMovingIns.length - 1][1]].amount
                        }
                        for (asd2 = 0; asd2 < locMovingIns.length; asd2++) {
                            for (asd3 = 0; asd3 < minCar.amount; asd3++) {
                                cins[locMovingIns[asd2][0]][locMovingIns[asd2][1]].queue.shift()
                            }
                            cins[locMovingIns[asd2][0]][locMovingIns[asd2][1]].amount -= minCar.amount;
                        }
                        for (asd2 = 0; asd2 < locMovingIns.length; asd2++) {
                            locMovingIns[asd2] = {
                                location: locMovingIns[asd2][0],
                                direction: locMovingIns[asd2][1]
                            }
                        }

                        var calcedDelay = 0;
                        simulator.ccins.delay(minCar, leftTurnTime, straightGoTime, rightTurnTime, oneCarTime, (rtd99) => {
                            calcedDelay = rtd99;
                        })

                        movingIns[minskey] = {
                            allow: locMovingIns,
                            delay: calcedDelay
                        };
                        minskey++;
                    }

                    simulator.run(leftTurnTime, straightGoTime, rightTurnTime, oneCarTime, insLightTimeHS, insLightTimeHL, insLightTimeVS, insLightTimeVL, (rtd992) => {
                        db.result.save(CIns, rtd992._id, movingIns, (rtd991) => {
                            db.compare.setResult(rtd992._id, rtd991._id, (rtd993) => {
                                db.scene.archive(CIns, copyData, (rtd999) => {
                                    cb(rtd992._id, rtd999._id)
                                })
                            })
                        })
                    }, cinsP, movingIns);
                })
            })
        }
    }
}())