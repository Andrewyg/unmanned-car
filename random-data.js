var data = {
    "top": {
        "straight": {
            "amount": 0,
            "queue": []
        },
        "left": {
            "amount": 0,
            "queue": []
        },
        "right": {
            "amount": 0,
            "queue": []
        }
    },
    "left": {
        "straight": {
            "amount": 0,
            "queue": []
        },
        "left": {
            "amount": 0,
            "queue": []
        },
        "right": {
            "amount": 0,
            "queue": []
        }
    },
    "right": {
        "straight": {
            "amount": 0,
            "queue": []
        },
        "left": {
            "amount": 0,
            "queue": []
        },
        "right": {
            "amount": 0,
            "queue": []
        }
    },
    "bottom": {
        "straight": {
            "amount": 0,
            "queue": []
        },
        "left": {
            "amount": 0,
            "queue": []
        },
        "right": {
            "amount": 0,
            "queue": []
        }
    }
};

function randText(leng) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < leng; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function randNumber(min, max) {
    return Math.random() * (max - min) + min;
}

var rn = randNumber(0, 10);

var ids = [];

function makeID() {
    var id = randText(10);
    if (ids.includes(id)) {
        return makeID();
    } else {
        return id;
    }
}

for (i = 0; i < rn; i++) {
    data.top.left.amount++;
    data.top.left.queue.push(makeID());
} rn = randNumber(0, 10);
for (i = 0; i < rn; i++) {
    data.top.straight.amount++;
    data.top.straight.queue.push(makeID());
} rn = randNumber(0, 10);
for (i = 0; i < rn; i++) {
    data.top.right.amount++;
    data.top.right.queue.push(makeID());
} rn = randNumber(0, 10);
for (i = 0; i < rn; i++) {
    data.right.left.amount++;
    data.right.left.queue.push(makeID());
} rn = randNumber(0, 10);
for (i = 0; i < rn; i++) {
    data.right.straight.amount++;
    data.right.straight.queue.push(makeID());
} rn = randNumber(0, 10);
for (i = 0; i < rn; i++) {
    data.right.right.amount++;
    data.right.right.queue.push(makeID());
} rn = randNumber(0, 10);
for (i = 0; i < rn; i++) {
    data.bottom.left.amount++;
    data.bottom.left.queue.push(makeID());
} rn = randNumber(0, 10);
for (i = 0; i < rn; i++) {
    data.bottom.straight.amount++;
    data.bottom.straight.queue.push(makeID());
} rn = randNumber(0, 10);
for (i = 0; i < rn; i++) {
    data.bottom.right.amount++;
    data.bottom.right.queue.push(makeID());
} rn = randNumber(0, 10);
for (i = 0; i < rn; i++) {
    data.left.left.amount++;
    data.left.left.queue.push(makeID());
} rn = randNumber(0, 10);
for (i = 0; i < rn; i++) {
    data.left.straight.amount++;
    data.left.straight.queue.push(makeID());
} rn = randNumber(0, 10);
for (i = 0; i < rn; i++) {
    data.left.right.amount++;
    data.left.right.queue.push(makeID());
}

console.log(JSON.stringify(data));

var request = require('request');
request({
    url: "http://localhost/operate",
    method: "POST",
    json: data
}, (err, res, body) => {
    if (err) console.log(err);
    // console.log(res);
    console.log(body);
})