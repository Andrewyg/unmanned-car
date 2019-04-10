(function () {
    var mongoose = require('mongoose');
    var mongodb = mongoose.createConnection('mongodb://uc:a@ccins.andrew.at.tw:3001/unmanned-car', { useNewUrlParser: true });
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
        name: {
            type: String,
            required: true
        },
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
    ins.schema.pre('save', function (next) {
        if (!this.name) this.name = this.get('location');
        next();
    });

    var CIntersectionSchema = new Schema({
        refIns: {
            type: String,
            required: true
        },
        bottom: {
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
        top: {
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
    var cins = mongodb.model("currentIns", CIntersectionSchema, "currentInss");

    var compileResultSchema = new Schema({
        refCIns: {
            type: String,
            required: true
        },
        refCompare: {
            type: String,
            required: true
        },
        result: {
            type: Array,
            required: true
        }
    })
    var result = mongodb.model("compileResult", compileResultSchema, "compileResults");

    var compareResultSchema = new Schema({
        normalInsTakenTime: {
            type: Number,
            required: true
        },
        computerControledInsTakenTime: {
            type: Number,
            required: true
        },
        refCIns: {
            type: String,
            required: true
        },
        refResult: String,
        time: {
            left: {
                type: Number,
                required: true,
                minimum: 1
            },
            straight: {
                type: Number,
                required: true,
                minimum: 1
            },
            right: {
                type: Number,
                required: true,
                minimum: 1
            },
            car: {
                type: Number,
                required: true,
                minimum: 1
            },
            lights: {
                horizontal: {
                    left: {
                        type: Number,
                        required: true,
                        minimum: 1
                    },
                    straight: {
                        type: Number,
                        required: true,
                        minimum: 1
                    },
                    right: {
                        type: Number,
                        required: true,
                        minimum: 1
                    }
                },
                verticle: {
                    left: {
                        type: Number,
                        required: true,
                        minimum: 1
                    },
                    straight: {
                        type: Number,
                        required: true,
                        minimum: 1
                    },
                    right: {
                        type: Number,
                        required: true,
                        minimum: 1
                    }
                }
            }
        }
    })
    var compare = mongodb.model("compareResult", compareResultSchema, "compareResults");
    compare.schema.pre('save', function (next) {
        if (!this.time.horizontal.right) this.time.horizontal.right = this.get('time.horizontal.straight');
        if (!this.time.verticle.right) this.time.verticle.right = this.get('time.vertical.straight');
        next();
    });

    module.exports = {
        init: (cb) => {
            cb = cb || function (cbr) { };
            ins.findOne({}).lean().exec((err, res) => {
                if (res == null) {
                    ins.create({
                        location: "台中市",
                        name: "中清路",
                        waitZoneLength: 18,
                        lanes: 2
                    }, (err2, res2) => {
                        car.findOne({}).lean().exec((err, res) => {
                            if (res == null) {
                                car.create({
                                    license: "1225",
                                    type: "small",
                                    speed: 60
                                }, (err4, res4) => {
                                    cins.create({ refIns: res2._id }, (err3, res3) => {
                                        cb(res3._id);
                                    });
                                })
                            } else {
                                cins.create({ refIns: res2._id }, (err3, res3) => {
                                    cb(res3._id);
                                });
                            }
                        })
                    });
                } else {
                    car.findOne({}).lean().exec((err, res) => {
                        if (res == null) {
                            car.create({
                                license: "1225",
                                type: "small",
                                speed: 60
                            }, (err4, res4) => {
                                cins.create({ refIns: res._id }, (err3, res3) => {
                                    cb(res3._id);
                                });
                            })
                        } else {
                            cins.create({ refIns: res._id }, (err3, res3) => {
                                cb(res3._id);
                            });
                        }
                    })
                }
            })
        },
        reset: (cb) => {
            cb = cb || function (cbr) { };
            car.deleteMany({}, (err, res) => {
                ins.deleteMany({}, (err2, res2) => {
                    cins.deleteMany({}, (err3, res3) => {
                        result.deleteMany({}, (err4, res4) => {
                            compare.deleteMany({}, (err5, res5) => cb())
                        })
                    })
                })
            })
        },
        resetDynamic: (cb) => {
            cb = cb || function (cbr) { };
            cins.deleteMany({}, (err3, res3) => {
                result.deleteMany({}, (err4, res4) => {
                    compare.deleteMany({}, (err5, res5) => cb())
                })
            })
        },
        ins: {
            reset: () => {
                ins.deleteMany({}, (err, res) => { });
            },
            create: (obj, cb) => {
                cb = cb || function (cbr) { };
                ins.create(obj, (err, res) => cb(res.toObject()));
            },
            get: (id, cb) => {
                cb = cb || function (cbr) { };
                ins.findOne({ _id: id }).lean().exec((err, res) => {
                    cb(res);
                })
            },
            getAll: (cb) => {
                cb = cb || function (cbr) { };
                ins.find({}).lean().exec((err, res) => {
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
            },
            get: (id, cb) => {
                cb = cb || function (cbr) { };
                car.findOne({ _id: id }).lean().exec((err, res) => {
                    cb(res);
                })
            },
            getAll: (cb) => {
                cb = cb || function (cbr) { };
                car.find({}).lean().exec((err, res) => {
                    cb(res);
                })
            }
        },
        scene: {
            reset: () => {
                cins.deleteMany({}, (err, res) => { });
            },
            add: (id, place, direction, carId, cb) => {
                cb = cb || function (cbr) { };
                var data;
                cins.findOne({ _id: id }).lean().exec((err, res) => {
                    data = res;
                    data[place][direction].amount++;
                    data[place][direction].queue.push({ refCar: carId, arriveTime: (new Date()).toISOString() })
                    cins.updateOne({ _id: id }, data, (err2, res2) => cb(res2));
                })
            },
            get: (id, cb) => {
                cb = cb || function (cbr) { };
                cins.findOne({ _id: id }).lean().exec((err, res) => {
                    cb(res);
                })
            },
            getAll: (cb) => {
                cb = cb || function (cbr) { };
                cins.find({}).lean().exec((err, res) => {
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
                cins.create(obj, (err, res) => {
                    cins.findOne({ _id: res._id }).lean().exec((err2, res2) => {
                        cb(res2);
                    });
                });
            },
            archive: (id, copyData, cb) => {
                cb = cb || function (cbr) { };
                cins.findById(id).lean().exec((err, res) => {
                    delete res._id
                    if (!copyData) res = { refIns: res.refIns }
                    cins.create(res, (err2, res2) => {
                        cb(res2);
                    })
                });
            },
            remove: (id, cb) => {
                cb = cb || function (cbr) { };
                cins.deleteOne({ _id: id }, (err, res) => cb(res));
            },
            import: (id, nowCIns, cb) => {
                cb = cb || function (cbr) { };
                cins.findById(id).lean().exec((err, res) => {
                    delete res._id
                    cins.updateOne({ _id: nowCIns }, res, (err2, res2) => cb(res2))
                })
            }
        },
        result: {
            save: (refCIns, refCompare, obj, cb) => {
                cb = cb || function (cbr) { };
                var data = {
                    refCIns: refCIns,
                    refCompare: refCompare,
                    result: obj
                }
                result.create(data, (err, res) => cb(res.toObject()));
            },
            get: (id, cb) => {
                cb = cb || function (cbr) { };
                result.findOne({ _id: id }).lean().exec((err, res) => {
                    cb(res);
                })
            },
            getAll: (cb) => {
                cb = cb || function (cbr) { };
                result.find({}).lean().exec((err, res) => {
                    cb(res);
                })
            }
        },
        compare: {
            save: (obj, cb) => {
                cb = cb || function (cbr) { };
                compare.create(obj, (err, res) => cb(res.toObject()));
            },
            setResult: (id, resultId, cb) => {
                cb = cb || function (cbr) { };
                compare.updateOne({ _id: id }, { refResult: resultId }, (err, res) => cb());
            },
            get: (id, cb) => {
                cb = cb || function (cbr) { };
                compare.findOne({ _id: id }).lean().exec((err, res) => {
                    cb(res);
                })
            },
            getByOperateId: (id, cb) => {
                cb = cb || function (cbr) { };
                compare.findOne({ refResult: id }).lean().exec((err, res) => {
                    cb(res);
                })
            },
            getAll: (cb) => {
                cb = cb || function (cbr) { };
                compare.find({}).lean().exec((err, res) => {
                    cb(res);
                })
            }
        }
    }
}())
