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
        convert: (cb) => {
            cb = cb || function (cbr) { };
            var returnData = {
                input: {},
                output: []
            }
            db.compare.get(id,(compare) => {
                var nowTime = 0;
                var locData = {};
                while(true) {
                    locData = {
                        allow:[],
                        delay:0
                    };

                    //first top & bottom
                    //first straight+right
                    locData.delay = compare.time.vertical.straight;
                    nowTime+=locData.delay;
                    locData.allow.push({
                        location:"bottom",
                        direction:"straight"
                    });
                    locData.allow.push({
                        location:"bottom",
                        direction:"right"
                    });
                    locData.allow.push({
                        location:"top",
                        direction:"straight"
                    });
                    locData.allow.push({
                        location:"top",
                        direction:"right"
                    });

                    returnData.output.push(locData);

                    if(nowTime==compare.normalInsTakenTime) break;

                    locData = {
                        allow:[],
                        delay:0
                    };

                    //then left
                    locData.delay = compare.time.vertical.left;
                    nowTime+=locData.delay;
                    locData.allow.push({
                        location:"bottom",
                        direction:"left"
                    });
                    locData.allow.push({
                        location:"top",
                        direction:"left"
                    });

                    returnData.output.push(locData);

                    if(nowTime==compare.normalInsTakenTime) break;

                    locData = {
                        allow:[],
                        delay:0
                    };

                    //then left & right
                    //first straight+right
                    locData.delay = compare.time.horizontal.straight;
                    nowTime+=locData.delay;
                    locData.allow.push({
                        location:"right",
                        direction:"straight"
                    });
                    locData.allow.push({
                        location:"right",
                        direction:"right"
                    });
                    locData.allow.push({
                        location:"left",
                        direction:"straight"
                    });
                    locData.allow.push({
                        location:"left",
                        direction:"right"
                    });

                    returnData.output.push(locData);

                    if(nowTime==compare.normalInsTakenTime) break;

                    locData = {
                        allow:[],
                        delay:0
                    };

                    //then left
                    locData.delay = compare.time.horizontal.left;
                    nowTime+=locData.delay;
                    locData.allow.push({
                        location:"left",
                        direction:"left"
                    });
                    locData.allow.push({
                        location:"right",
                        direction:"left"
                    });

                    returnData.output.push(locData);

                    if(nowTime==compare.normalInsTakenTime) break;
                }
                db.scene.get(compare.refCIns,(scene) => {
                    returnData.input = scene;
                    cb(returnData);
                })
            })
        }
    }
}())
