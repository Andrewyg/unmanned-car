(function () {
    var mongoose = require('mongoose');
    // var userdb = mongoose.createConnection('mongodb://localhost:27017/ttiwa-users', { autoIndex: true });
    var mongodb = mongoose.createConnection('mongodb://localhost:27017/unmanned-car', { useNewUrlParser: true });
    var options = {
        upsert: true,
        strict: true
    }
    var Schema = mongoose.Schema;
    var intersectionSchema = new Schema({
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
    var ins = mongodb.model('intersection', intersectionSchema, 'intersections');
    module.exports = {
        reset: () => {
            ins.deleteMany({}, (err, res) => console.log(res));
        },
        create: (cb) => {
            cb = cb || function (cbr) { console.log(cbr) };
            ins.create({}, (err, res) => cb(res.toObject()));
        },
        add: (id, place, direction, carId, cb) => {
            cb = cb || function (cbr) { console.log(cbr) };
            var data;
            ins.findOne({ _id: id }).lean().exec((err, res) => {
                data = res;
                data[place][direction].amount++;
                data[place][direction].queue.push(carId)
                ins.updateOne({ _id: id }, data, (err2, res2) => cb(res2));
            })
        },
        get: (id, cb) => {
            cb = cb || function (cbr) { console.log(cbr) };
            ins.findOne({ _id: id }).lean().exec((err, res) => {
                cb(res);
            })
        },
        clear: (id, cb) => {
            cb = cb || function (cbr) { console.log(cbr) };
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
        }
    }
}())