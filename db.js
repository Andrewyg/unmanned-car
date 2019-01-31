(function () {
    var mongoose = require('mongoose');
    // var userdb = mongoose.createConnection('mongodb://localhost:27017/ttiwa-users', { autoIndex: true });
    var mongodb = mongoose.createConnection('mongodb://localhost:27017/unmanned-car', { useNewUrlParser: true });
    var Schema = mongoose.Schema;
    var carSchema = new Schema({
        id: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        }
    })
    var car = mongodb.model('car', carSchema, 'cars');
    var intersectionSchema = new Schema({
        columns: {
            type: Number,
            minimum: 1,
            required: true
        }
    })
    var ins = mongodb.model('intersection', intersectionSchema, 'intersections');
    var CIntersectionSchema = new Schema({
        top: {
            straight: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [String]
            },
            left: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [String]
            },
            right: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [String]
            }
        },
        left: {
            straight: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [String]
            },
            left: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [String]
            },
            right: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [String]
            }
        },
        right: {
            straight: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [String]
            },
            left: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [String]
            },
            right: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [String]
            }
        },
        bottom: {
            straight: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [String]
            },
            left: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [String]
            },
            right: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [String]
            }
        }
    });
    var cins = mongodb.model("CurrentIns", CIntersectionSchema, "CurrentInss");
    module.exports = {
        reset: () => {
            ins.deleteMany({}, (err, res) => console.log(res));
        },
        create: (cb) => {
            cb = cb || function (cbr) { };
            ins.create({}, (err, res) => cb(res.toObject()));
        },
        add: (id, place, direction, carId, cb) => {
            cb = cb || function (cbr) { };
            var data;
            ins.findOne({ _id: id }).lean().exec((err, res) => {
                data = res;
                data[place][direction].amount++;
                data[place][direction].queue.push(carId)
                ins.updateOne({ _id: id }, data, (err2, res2) => cb(res2));
            })
        },
        get: (id, cb) => {
            cb = cb || function (cbr) { };
            ins.findOne({ _id: id }).lean().exec((err, res) => {
                cb(res);
            })
        },
        clear: (id, cb) => {
            cb = cb || function (cbr) { };
            ins.updateOne({ _id: id }, {
                "top":
                {
                    straight: { amount: 0, queue: [] },
                    left: { amount: 0, queue: [] },
                    right: { amount: 0, queue: [] }
                },
                "left":
                {
                    straight: { amount: 0, queue: [] },
                    left: { amount: 0, queue: [] },
                    right: { amount: 0, queue: [] }
                },
                "right":
                {
                    straight: { amount: 0, queue: [] },
                    left: { amount: 0, queue: [] },
                    right: { amount: 0, queue: [] }
                },
                "bottom":
                {
                    straight: { amount: 0, queue: [] },
                    left: { amount: 0, queue: [] },
                    right: { amount: 0, queue: [] }
                }
            }, (err, res) => cb(res))
        },
        validate: (obj, cb) => {
            cb = cb || function (cbr) { };
            var rtd = {
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
            ins.create(obj, (err, res) => {
                if (err) cb(rtd);
                console.log(res._id);
                ins.findOne({ _id: res._id }).lean().exec((err2, res2) => {
                    cb(res2);
                });
            });
        },
        remove: (id, cb) => {
            cb = cb || function (cbr) { };
            ins.deleteOne({ _id: id }, (err, res) => cb(res));
        }
    }
}())