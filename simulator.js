(function () {
    var request = require('request');
    var db = require('./db');
    var compiler = require('./compiler');

    var positions = ["bottom", "right", "top", "left"];
    var directions = ["left", "straight", "right"];

    function calcTime(moveTime, oneCarTime, carNum) {
        return moveTime + oneCarTime * carNum;
    }

    function calcTimeR(moveTime, elapseTime, oneCarTime) {
        return Math.floor((elapseTime - moveTime) / oneCarTime);
    }

    function minusCar(num, mNum) {
        num -= mNum;
        if (num < 0) num = 0;
        return num;
    }

    function largest(arr) {
        var returnLargest = 0;
        for (i = 0; i < arr.length; i++) {
            if (arr[i] >= returnLargest) returnLargest = arr[i];
        }
        return returnLargest;
    }

    function normalIns(insData, leftTurnTime, straightGoTime, oneCarTime, insLightTimeHS, insLightTimeHL, insLightTimeVS, insLightTimeVL) {
        var totalPassCarHL = calcTimeR(leftTurnTime, insLightTimeHL, oneCarTime);
        var totalPassCarHS = calcTimeR(straightGoTime, insLightTimeHS, oneCarTime);
        var totalPassCarVL = calcTimeR(leftTurnTime, insLightTimeVL, oneCarTime);
        var totalPassCarVS = calcTimeR(straightGoTime, insLightTimeVS, oneCarTime);
        var takenTime = 0;
        var clearedIns = 0;
        var previousAdded = 0;
        while (true) {
            clearedIns = 0;
            for (i = 0; i < 4; i++) {
                for (j = 0; j < 3; j++) {
                    if (insData[positions[i]][directions[j]].amount == 0) clearedIns++;
                }
            }
            if (clearedIns == 12) {
                takenTime = takenTime - insLightTimeHL + calcTime(leftTurnTime, oneCarTime, largest([insData.right.left.amount, insData.left.left.amount]));
                break;
            }

            //first top & bottom
            //first straight+right
            insData.bottom.straight.amount = minusCar(insData.bottom.straight.amount, totalPassCarVS);
            insData.bottom.right.amount = minusCar(insData.bottom.right.amount, totalPassCarVS);
            insData.top.straight.amount = minusCar(insData.top.straight.amount, totalPassCarVS);
            insData.top.right.amount = minusCar(insData.top.right.amount, totalPassCarVS);

            takenTime += insLightTimeVS;

            clearedIns = 0;
            for (i = 0; i < 4; i++) {
                for (j = 0; j < 3; j++) {
                    if (insData[positions[i]][directions[j]].amount == 0) clearedIns++;
                }
            }
            if (clearedIns == 12) {
                takenTime = takenTime - insLightTimeVS + calcTime(straightGoTime, oneCarTime, largest([insData.bottom.straight.amount, insData.bottom.right.amount, insData.top.straight.amount, insData.top.right.amount]));
                break;
            }

            //then left
            insData.bottom.left.amount = minusCar(insData.bottom.left.amount, totalPassCarVL);
            insData.top.left.amount = minusCar(insData.top.left.amount, totalPassCarVL);

            takenTime += insLightTimeVL;

            clearedIns = 0;
            for (i = 0; i < 4; i++) {
                for (j = 0; j < 3; j++) {
                    if (insData[positions[i]][directions[j]].amount == 0) clearedIns++;
                }
            }
            if (clearedIns == 12) {
                takenTime = takenTime - insLightTimeVL + calcTime(leftTurnTime, oneCarTime, largest([insData.bottom.left.amount, insData.top.left.amount]));
                break;
            }

            //then left & right
            //first straight+right
            insData.right.straight.amount = minusCar(insData.right.straight.amount, totalPassCarHS);
            insData.right.right.amount = minusCar(insData.right.right.amount, totalPassCarHS);
            insData.left.straight.amount = minusCar(insData.left.straight.amount, totalPassCarHS);
            insData.left.right.amount = minusCar(insData.left.right.amount, totalPassCarHS);

            takenTime += insLightTimeHS;

            clearedIns = 0;
            for (i = 0; i < 4; i++) {
                for (j = 0; j < 3; j++) {
                    if (insData[positions[i]][directions[j]].amount == 0) clearedIns++;
                }
            }
            if (clearedIns == 12) {
                takenTime = takenTime - insLightTimeHS + calcTime(straightGoTime, oneCarTime, largest([insData.right.straight.amount, insData.right.right.amount, insData.left.straight.amount, insData.left.right.amount]));
                break;
            }

            //then left
            insData.right.left.amount = minusCar(insData.right.left.amount, totalPassCarHL);
            insData.left.left.amount = minusCar(insData.left.left.amount, totalPassCarHL);

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
        run: (leftTurnTime, straightGoTime, rightTurnTime, oneCarTime, insLightTimeHS, insLightTimeHL, insLightTimeVS, insLightTimeVL, cb, input, output) => {
            cb = cb || function (cbr) { };
            var dts = {
                "normalInsTakenTime": normalIns(input, leftTurnTime, straightGoTime, oneCarTime, insLightTimeHS, insLightTimeHL, insLightTimeVS, insLightTimeVL),
                "computerControledInsTakenTime": ccIns(output),
                "refCIns": input._id,
                "refResult": output._id,
                "time": {
                    "left": leftTurnTime,
                    "straight": straightGoTime,
                    "right": rightTurnTime,
                    "car": oneCarTime,
                    "lights": {
                        "horizontal": {
                            "left": insLightTimeHL,
                            "straight": insLightTimeHS,
                            "right": insLightTimeHS
                        },
                        "vertical": {
                            "left": insLightTimeVL,
                            "straight": insLightTimeVS,
                            "right": insLightTimeVS
                        }
                    }
                }
            };
            db.compare.save(dts, (rtd) => {
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
