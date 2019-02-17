(function () {
    var request = require('request');
    var db = require('./db');
    var compiler = require('./compiler');

    var keys = ["bottom", "right", "top", "left"];
    var dirs = ["left", "straight", "right"];

    function calcTime(moveTime, oneCarTime, carNum) {
        return moveTime + oneCarTime * carNum;
    }

    function calcTimeR(moveTime, elapseTime, oneCarTime) {
        return (elapseTime - moveTime) / oneCarTime;
    }

    function minusCar(num, mNum) {
        num -= mNum;
        if (num < 0) num = 0;
        return num;
    }

    function normalIns(insData, leftTurnTime, straightGoTime, oneCarTime, insLightTimeHS, insLightTimeHL, insLightTimeVS, insLightTimeVL) {
        var totalPassCarL = calcTimeR(leftTurnTime, insLightTimeL, oneCarTime);
        var totalPassCarS = calcTimeR(straightGoTime, insLightTimeS, oneCarTime);
        var takenTime = 0;
        var clearedIns = 0;
        while (true) {
            clearedIns = 0;
            for (i = 0; i < 4; i++) {
                for (j = 0; j < 3; j++) {
                    if (insData[keys[i]][dirs[j]].amount == 0) clearedIns++;
                }
            }
            if (clearedIns == 12) break;

            //first top & bottom
            //first straight+right
            insData.bottom.straight.amount = minusCar(insData.bottom.straight.amount, totalPassCarS);
            insData.bottom.right.amount = minusCar(insData.bottom.right.amount, totalPassCarS);
            insData.top.straight.amount = minusCar(insData.top.straight.amount, totalPassCarS);
            insData.top.right.amount = minusCar(insData.top.right.amount, totalPassCarS);

            takenTime += insLightTimeVS;

            clearedIns = 0;
            for (i = 0; i < 4; i++) {
                for (j = 0; j < 3; j++) {
                    if (insData[keys[i]][dirs[j]].amount == 0) clearedIns++;
                }
            }
            if (clearedIns == 12) break;

            //then left
            insData.bottom.left.amount = minusCar(insData.bottom.left.amount, totalPassCarL);
            insData.top.left.amount = minusCar(insData.top.left.amount, totalPassCarL);

            takenTime += insLightTimeVL;

            clearedIns = 0;
            for (i = 0; i < 4; i++) {
                for (j = 0; j < 3; j++) {
                    if (insData[keys[i]][dirs[j]].amount == 0) clearedIns++;
                }
            }
            if (clearedIns == 12) break;

            //then left & right
            //first straight+right
            insData.right.straight.amount = minusCar(insData.right.straight.amount, totalPassCarS);
            insData.right.right.amount = minusCar(insData.right.right.amount, totalPassCarS);
            insData.left.straight.amount = minusCar(insData.left.straight.amount, totalPassCarS);
            insData.left.right.amount = minusCar(insData.left.right.amount, totalPassCarS);

            takenTime += insLightTimeHS;

            clearedIns = 0;
            for (i = 0; i < 4; i++) {
                for (j = 0; j < 3; j++) {
                    if (insData[keys[i]][dirs[j]].amount == 0) clearedIns++;
                }
            }
            if (clearedIns == 12) break;

            //then left
            insData.right.left.amount = minusCar(insData.right.left.amount, totalPassCarL);
            insData.left.left.amount = minusCar(insData.left.left.amount, totalPassCarL);

            takenTime += insLightTimeHL;
        }
        return takenTime;
    }

    function ccIns(output) {
        var takenTime = 0;
        for (i = 0; i < output.length; i++) {
            takenTime += output[i].delay;
        }
        return takenTime;
    }

    module.exports = {
        run: (leftTurnTime, straightGoTime, oneCarTime, insLightTimeHS, insLightTimeHL, insLightTimeVS, insLightTimeVL, cb, input, output) => {
            cb = cb || function (cbr) { };
            cb({ "normalInsTakenTime": normalIns(input, leftTurnTime, straightGoTime, oneCarTime, insLightTimeHS, insLightTimeHL, insLightTimeVS, insLightTimeVL), "computerControledInsTakenTime": ccIns(output) });
            db.compare.save({ "normalInsTakenTime": normalIns(input, leftTurnTime, straightGoTime, oneCarTime, insLightTimeHS, insLightTimeHL, insLightTimeVS, insLightTimeVL), "computerControledInsTakenTime": ccIns(output), "refCIns": input._id }, (rtd) => {
                cb(rtd);
            })
        },
        ccins: {
            delay: (minInsInfo, leftTurnTime, straightGoTime, rightTurnTime, oneCarTime, cb) => {
                cb = cb || function (cbr) { };
                var moveTime = 0;
                if (minInsInfo.dir == "left") moveTime = leftTurnTime
                if (minInsInfo.dir == "straight") moveTime = straightGoTime
                if (minInsInfo.dir == "right") moveTime = rightTurnTime
                cb(calcTime(moveTime, oneCarTime, minInsInfo.amount));
            }
        },
        animation: {
            text: (cb) => {
                cb = cb || function (cbr) { };
                var frames = [];
                return frames
            }
        }
    }
}())