(function () {
    var request = require('request');

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
        while (true) {
            //first top & bottom
            //first straight+right
            insData.bottom.straight = minusCar(insData.bottom.straight, totalPassCarS);
            insData.bottom.right = minusCar(insData.bottom.right, totalPassCarS);
            insData.top.straight = minusCar(insData.top.straight, totalPassCarS);
            insData.top.right = minusCar(insData.top.right, totalPassCarS);
            //then left
            insData.bottom.left = minusCar(insData.bottom.left, totalPassCarL);
            insData.top.left = minusCar(insData.top.left, totalPassCarL);
            //then left & right
            //first straight+right
            insData.right.straight = minusCar(insData.right.straight, totalPassCarS);
            insData.right.right = minusCar(insData.right.right, totalPassCarS);
            insData.left.straight = minusCar(insData.left.straight, totalPassCarS);
            insData.left.right = minusCar(insData.left.right, totalPassCarS);
            //then left
            insData.right.left = minusCar(insData.right.left, totalPassCarL);
            insData.left.left = minusCar(insData.left.left, totalPassCarL);

            takenTime += insLightTime;

            var clearedIns = 0;
            for (i = 0; i < 4; i++) {
                for (j = 0; j < 3; j++) {
                    if (insData[i][j].amount == 0) clearedIns++;
                }
            }
            if (clearedIns == 12) break;
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
                request.get("https://uc.ccsource.org/api/operate?left=" + leftTurnTime + "&straight=" + straightGoTime + "&right=" + rightTurnTime + "&car=" + oneCarTime, (err, res, body) => {
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
                var oneCarTime = 0;
                if (minInsInfo.dir == "left") oneCarTime = leftTurnTime
                if (minInsInfo.dir == "straight") oneCarTime = straightGoTime
                if (minInsInfo.dir == "right") oneCarTime = rightTurnTime
                return calcTime(moveTime, oneCarTime, minInsInfo.amount);
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