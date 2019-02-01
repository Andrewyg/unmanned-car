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
    function joinColumns(cins, key, dir1, dir2, raf) {
        var tempArr = [];
        var sorted = [];
        tempArr = cins[key][dir1].queue;
        ////console.log(cins[key][dir2].queue)
        tempArr.concat(cins[key][dir2].queue);
        ////console.log(tempArr.length)
        for (i = 0; i < tempArr.length; i++) {
            ////console.log(i)
            var sindex = 0;
            for (j = 0; j < sorted.length; j++) {
                ////////console.log(tempArr[i].arriveTime)
                if ((new Date(tempArr[i].arriveTime)).getTime() > (new Date(sorted[j].arriveTime)).getTime()) {
                    sindex++;
                }
            }
            sorted.splice(sindex, 0, tempArr[i]);
        }
        return sorted
    }
    module.exports = {
        run: (CIns, joinData, cb) => {
            cb = cb || function (cbr) { };
            var db = require('./db');
            db.scene.get(CIns, (rtd) => {
                db.ins.get(rtd.refIns, (rtd2) => {
                    // var rtd = input1
                    // var rtd2 = input2
                    refIns = rtd2;
                    // data.refIns = refIns;
                    var cins = rtd;
                    var oriID = rtd._id;
                    var oriA = ["0,0", "0,1", "0,2", "1,0", "1,1", "1,2", "2,0", "2,1", "2,2", "3,0", "3,1", "3,2"];
                    ////console.log(oriA);
                    var mostVal;
                    var mostName = [];
                    var movingIns = [];
                    var minskey = 0;
                    var available = [];
                    var returnData = {};
                    if (joinData) {
                        returnData = {
                            input: {},
                            output: {}
                        }
                        returnData.input = rtd;
                        returnData.input.refIns = rtd2
                    }
                    ////////console.log("0.5")
                    if (rtd2.lanes == 2) {
                        dirs.remove("right");
                        oriA = ["0,0", "0,1", "1,0", "1,1", "2,0", "2,1", "3,0", "3,1"];
                        for (abcd = 0; abcd < 4; abcd++) {
                            //////console.log(abcd)
                            cins[keys[abcd]]["straight"].amount += cins[keys[abcd]]["right"].amount;
                            cins[keys[abcd]]["right"].amount = 0;
                            // cins[keys[abcd]]["straight"].queue = joinColumns(cins, keys[abcd], "straight", "right");
                            // cins[keys[abcd]]["right"].queue = [];
                        }
                        // movingIns.push(["bottom", "right"]);
                        // movingIns.push(["right", "right"]);
                        // movingIns.push(["top", "right"]);
                        // movingIns.push(["left", "right"]);
                    }
                    //////console.log(cins["left"]["straight"])
                    ////////console.log(cins["left"]["straight"])
                    ////////console.log(0.6)
                    // db.scene.validate(cins, (rtd3) => {
                    // cins = rtd3;

                    ////////console.log("1");
                    while (true) {
                        available = oriA.slice();
                        //console.log(oriA);
                        mostVal = 0

                        for (i = 0; i < keys.length; i++) {
                            for (j = 0; j < dirs.length; j++) {
                                if (cins[keys[i]][dirs[j]].amount >= mostVal) {
                                    mostVal = cins[keys[i]][dirs[j]].amount;
                                    mostName = [i, j];
                                }
                            }
                        }
                        ////console.log(mostVal)
                        if (mostVal <= 0) break;

                        var locMovingIns = movingIns[minskey];
                        locMovingIns = [];

                        while (available.length > 0) {
                            ////////console.log(4)
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
                            for (asd3 = 0; asd3 < cins[locMovingIns[locMovingIns.length - 1][0]][locMovingIns[locMovingIns.length - 1][1]].amount; asd3++) {
                                cins[locMovingIns[asd2][0]][locMovingIns[asd2][1]].queue.shift()
                            }
                            cins[locMovingIns[asd2][0]][locMovingIns[asd2][1]].amount -= cins[locMovingIns[locMovingIns.length - 1][0]][locMovingIns[locMovingIns.length - 1][1]].amount;
                        }
                        for (asd2 = 0; asd2 < locMovingIns.length; asd2++) {
                            locMovingIns[asd2] = {
                                location: locMovingIns[asd2][0],
                                direction: locMovingIns[asd2][1]
                            }
                        }

                        movingIns[minskey] = {
                            allow: locMovingIns,
                            delay: 0 //haven't count delay
                        };
                        minskey++;
                    }

                    if (cins._id != oriID) {
                        db.scene.remove(cins._id);
                    }

                    //console.log(returnData)

                    returnData.output = movingIns;

                    cb(returnData)
                    // })
                })
            })
        }
    }
}())