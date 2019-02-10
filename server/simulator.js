(function () {
    var leftTurnTime = 0, //from car front leave white line to arrive next white line
        oneCarTime = 0,
        insLightTime = 0;

    var request = require('request');

    function calcTime(moveTime, carNum) {
        return moveTime + oneCarTime * carNum;
    }

    function calcTimeR(elapseTime) {
        return (elapseTime - moveTime) / oneCarTime;
    }

    function minusCar(num, mNum) {
        num -= mNum;
        if (num < 0) num = 0;
        return num;
    }

    function normalIns(insData) {
        var totalPassCar = calcTimeR(insLightTime);
        var takenTime = 0;
        while (true) {
            //first top & bottom
            //first straight+right
            insData.bottom.straight = minusCar(insData.bottom.straight, totalPassCar);
            insData.bottom.right = minusCar(insData.bottom.right, totalPassCar);
            insData.top.straight = minusCar(insData.top.straight, totalPassCar);
            insData.top.right = minusCar(insData.top.right, totalPassCar);
            //then left
            insData.bottom.left = minusCar(insData.bottom.left, totalPassCar);
            insData.top.left = minusCar(insData.top.left, totalPassCar);
            //then left & right
            //first straight+right
            insData.right.straight = minusCar(insData.right.straight, totalPassCar);
            insData.right.right = minusCar(insData.right.right, totalPassCar);
            insData.left.straight = minusCar(insData.left.straight, totalPassCar);
            insData.left.right = minusCar(insData.left.right, totalPassCar);
            //then left
            insData.right.left = minusCar(insData.right.left, totalPassCar);
            insData.left.left = minusCar(insData.left.left, totalPassCar);

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

    module.exports.run = (cb, input, output) => {
        if (input && output) {
            return { "normalInsTakenTime": normalIns(input), "computerControledInsTakenTime": ccIns(output) };
        } else {
            request.get("http://example.com", (err, res, body) => {
                var data = JSON.parse(body);
                var input = data.input,
                    output = data.output;
                return { "normalInsTakenTime": normalIns(input), "computerControledInsTakenTime": ccIns(output) };
            })
        }
    }
}())