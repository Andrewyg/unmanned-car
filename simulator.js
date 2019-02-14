(function () {
    var request = require('request');

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

    function normalIns(insData, leftTurnTime, straightGoTime, oneCarTime, insLightTime) {
        var totalPassCarL = calcTimeR(leftTurnTime, insLightTime, oneCarTime);
        var totalPassCarS = calcTimeR(straightGoTime, insLightTime, oneCarTime);
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

            //then left & right
            //first straight+right
            insData.right.straight.amount = minusCar(insData.right.straight.amount, totalPassCarS);
            insData.right.right.amount = minusCar(insData.right.right.amount, totalPassCarS);
            insData.left.straight.amount = minusCar(insData.left.straight.amount, totalPassCarS);
            insData.left.right.amount = minusCar(insData.left.right.amount, totalPassCarS);

            takenTime += insLightTime;

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
            insData.right.left.amount = minusCar(insData.right.left.amount, totalPassCarL);
            insData.left.left.amount = minusCar(insData.left.left.amount, totalPassCarL);

            takenTime += insLightTime;
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
        run: (leftTurnTime, straightGoTime, rightTurnTime, oneCarTime, insLightTime, cb, input, output) => {
            cb = cb || function (cbr) { };
            if (input && output) {
                cb({ "normalInsTakenTime": normalIns(input, leftTurnTime, straightGoTime, oneCarTime, insLightTime), "computerControledInsTakenTime": ccIns(output) });
            } else {
                request.get("http://localhost:8080/operate?left=" + leftTurnTime + "&straight=" + straightGoTime + "&right=" + rightTurnTime + "&car=" + oneCarTime, (err, res, body) => {
                    var data = JSON.parse(body);
                    var input = data.input,
                        output = data.output;
                    cb({ "normalInsTakenTime": normalIns(input, leftTurnTime, straightGoTime, oneCarTime, insLightTime), "computerControledInsTakenTime": ccIns(output) });
                })
            }
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