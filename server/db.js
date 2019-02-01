(function () {
    var mongoose = require('mongoose');
    var mongodb = mongoose.createConnection('mongodb://uc:a@192.168.10.98:3001/unmanned-car', { useNewUrlParser: true });
    var Schema = mongoose.Schema;
    var carSchema = new Schema({
        license: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        speed: {
            type: Number,
            minimum: 1,
            required: true
        }
    })
    var car = mongodb.model('car', carSchema, 'cars');
    var intersectionSchema = new Schema({
        location: {
            type: String,
            required: true
        },
        name: String,
        waitZoneLength: {
            type: Number,
            minimum: 1,
            required: true
        },
        lanes: {
            type: Number,
            minimum: 1,
            required: true
        }
    })
    var ins = mongodb.model('intersection', intersectionSchema, 'intersections');
    var CIntersectionSchema = new Schema({
        refIns: {
            type: String,
            required: true
        },
        top: {
            straight: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [{
                    refCar: String,
                    arriveTime: {
                        type: Date
                    }
                }]
            },
            left: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [{
                    refCar: String,
                    arriveTime: {
                        type: Date
                    }
                }]
            },
            right: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [{
                    refCar: String,
                    arriveTime: {
                        type: Date
                    }
                }]
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
                queue: [{
                    refCar: String,
                    arriveTime: {
                        type: Date
                    }
                }]
            },
            left: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [{
                    refCar: String,
                    arriveTime: {
                        type: Date
                    }
                }]
            },
            right: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [{
                    refCar: String,
                    arriveTime: {
                        type: Date
                    }
                }]
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
                queue: [{
                    refCar: String,
                    arriveTime: {
                        type: Date
                    }
                }]
            },
            left: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [{
                    refCar: String,
                    arriveTime: {
                        type: Date
                    }
                }]
            },
            right: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [{
                    refCar: String,
                    arriveTime: {
                        type: Date
                    }
                }]
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
                queue: [{
                    refCar: String,
                    arriveTime: {
                        type: Date
                    }
                }]
            },
            left: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [{
                    refCar: String,
                    arriveTime: {
                        type: Date
                    }
                }]
            },
            right: {
                amount: {
                    type: Number,
                    default: 0,
                    required: true,
                    minimum: 0
                },
                queue: [{
                    refCar: String,
                    arriveTime: {
                        type: Date
                    }
                }]
            }
        }
    });
    var cins = mongodb.model("CurrentIns", CIntersectionSchema, "CurrentInss");
    var resultSchema = new Schema({
        refCIns: String
    })
    module.exports = {
        init: (cb) => {
            cb = cb || function (cbr) { };
            var rtd = {
                car: "", ins: "", cins: ""
            }
            car.create({
                license: "XX-0000",
                type: "small",
                speed: "60"
            }, (err, res) => {
                rtd.car = res._id;
                ins.create({
                    location: "台中市",
                    name: "中清路",
                    waitZoneLength: 18,
                    lanes: 2
                }, (err2, res2) => {
                    rtd.ins = res2._id
                    cins.create({ refIns: res2._id }, (err3, res3) => {
                        rtd.cins = res3._id;
                        cb(rtd);
                    });;
                });
            });
        },
        ins: {
            reset: () => {
                ins.deleteMany({}, (err, res) => console.log(res));
            },
            create: (obj, cb) => {
                cb = cb || function (cbr) { };
                ins.create(obj, (err, res) => cb(res.toObject()));
            },
            get: (id, cb) => {
                cb = cb || function (cbr) { };
                ins.findOne({ _id: id }).lean().exec((err, res) => {
                    console.log(res);
                    cb(res);
                })
            }
        },
        car: {
            create: (obj, cb) => {
                cb = cb || function (cbr) { };
                car.create(obj, (err, res) => cb(res.toObject()));
            },
            modify: (obj, cb) => {
                cb = cb || function (cbr) { };
                car.updateOne({ _id: obj._id }, obj, (err, res) => cb(res));
            }
        },
        scene: {
            reset: () => {
                cins.deleteMany({}, (err, res) => console.log(res));
            },
            add: (id, place, direction, carId, cb) => {
                cb = cb || function (cbr) { };
                var data;
                cins.findOne({ _id: id }).lean().exec((err, res) => {
                    if (err) console.log(err)
                    data = res;
                    data[place][direction].amount++;
                    data[place][direction].queue.push({ refCar: carId, arriveTime: (new Date()).toISOString() })
                    console.log(data.bottom.straight.queue)
                    cins.updateOne({ _id: id }, data, (err2, res2) => cb(res2));
                })
            },
            get: (id, cb) => {
                cb = cb || function (cbr) { };
                cins.findOne({ _id: id }).lean().exec((err, res) => {
                    cb(res);
                })
            },
            clear: (id, cb) => {
                cb = cb || function (cbr) { };
                cins.updateOne({ _id: id }, {
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
                // console.log(obj);
                cins.create(obj, (err, res) => {
                    // if (err) { cb(false); console.log(err) }
                    console.log(res);
                    console.log(res._id);
                    cins.findOne({ _id: res._id }).lean().exec((err2, res2) => {
                        cb(res2);
                    });
                });
            },
            archive: (id, cb) => {
                cb = cb || function (cbr) { };
                // console.log(id);
                cins.findById(id).lean().exec((err, res) => {
                    // console.log(err);
                    // console.log(res);
                    cins.create({ refIns: res.refIns }, (err2, res2) => {
                        cb(res);
                    })
                });
            },
            remove: (id, cb) => {
                cb = cb || function (cbr) { };
                cins.deleteOne({ _id: id }, (err, res) => cb(res));
            }
        },
        result: {
            run: (cb) => {
                cb = cb || function (cbr) { };
                var db = require('./db');
                db.scene.get(nowCIns, (rtd) => {
                    var data = rtd;
                    var ins = rtd.refIns;
                    db.ins.get(refIns, (rtd2) => {
                        refIns = rtd2;
                        // data.refIns = refIns;
                    })
                })
            }
        }
    }
}())