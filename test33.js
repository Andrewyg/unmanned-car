var db = require('./db');
var obj = {
    "top": {
        "straight": {
            "amount": 0,
            "queue": []
        },
        "left": {
            "amount": -11,
            "queue": []
        }
    },
    "left": {
        "straight": {
            "amount": 2,
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
            "amount": 3,
            "queue": []
        },
        "right": {
            "amount": 0,
            "queue": []
        }
    }
};
db.validate(obj, (ret) => {
    console.log(ret);
})