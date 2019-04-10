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

    module.exports = {
        normal: (compareId, cb) => {
            cb = cb || function (cbr) { };
            var returnData = {
                input: {},
                output: []
            }
            db.compare.get(compareId, (compare) => {
                var nowTime = 0;
                var locData = {};
                while (true) {
                    if (nowTime >= compare.normalInsTakenTime) break;
                    
                    locData = {
                        allow: [],
                        delay: 0
                    };

                    //first top & bottom
                    //first straight+right
                    locData.delay = compare.time.lights.vertical.straight;
                    nowTime += locData.delay;
                    locData.allow.push({
                        location: "bottom",
                        direction: "straight"
                    });
                    locData.allow.push({
                        location: "bottom",
                        direction: "right"
                    });
                    locData.allow.push({
                        location: "top",
                        direction: "straight"
                    });
                    locData.allow.push({
                        location: "top",
                        direction: "right"
                    });

                    returnData.output.push(locData);

                    if (nowTime >= compare.normalInsTakenTime) break;

                    locData = {
                        allow: [],
                        delay: 0
                    };

                    //then left
                    locData.delay = compare.time.lights.vertical.left;
                    nowTime += locData.delay;
                    locData.allow.push({
                        location: "bottom",
                        direction: "left"
                    });
                    locData.allow.push({
                        location: "top",
                        direction: "left"
                    });

                    returnData.output.push(locData);

                    if (nowTime >= compare.normalInsTakenTime) break;

                    locData = {
                        allow: [],
                        delay: 0
                    };

                    //then left & right
                    //first straight+right
                    locData.delay = compare.time.lights.horizontal.straight;
                    nowTime += locData.delay;
                    locData.allow.push({
                        location: "right",
                        direction: "straight"
                    });
                    locData.allow.push({
                        location: "right",
                        direction: "right"
                    });
                    locData.allow.push({
                        location: "left",
                        direction: "straight"
                    });
                    locData.allow.push({
                        location: "left",
                        direction: "right"
                    });

                    returnData.output.push(locData);

                    if (nowTime >= compare.normalInsTakenTime) break;

                    locData = {
                        allow: [],
                        delay: 0
                    };

                    //then left
                    locData.delay = compare.time.lights.horizontal.left;
                    nowTime += locData.delay;
                    locData.allow.push({
                        location: "left",
                        direction: "left"
                    });
                    locData.allow.push({
                        location: "right",
                        direction: "left"
                    });

                    returnData.output.push(locData);
                }
                db.scene.get(compare.refCIns, (scene) => {
                    returnData.input = scene;
                    cb(returnData);
                })
            })
        },
        ccins: (resultId, cb) => {
            cb = cb || function (cbr) { };
            var returnData = {
                input: {},
                output: []
            }
            db.result.get(resultId, (result) => {
                returnData.output = result;
                db.scene.get(result.refCIns, (scene) => {
                    returnData.input = scene;
                    cb(returnData);
                })
            })
        }
    }
}())
