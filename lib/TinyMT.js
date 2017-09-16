"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function leftShift32bitSafe(base, bits) {
    return (base & Math.pow(2, 32 - bits) - 1) * Math.pow(2, bits);
}

function add32bitSafe(num1, num2) {
    return ((num1 >>> 16) + (num2 >>> 16) & 0xFFFF) * 0x10000 + (num1 & 0xFFFF) + (num2 & 0xFFFF);
}

function multiply32bitSafe(num1, num2) {
    return ((num1 >>> 16) * num2 << 16) + (num1 & 0xFFFF) * num2 >>> 0;
}

var TINYMT32_MASK = 0x7FFFFFFF,
    TINYMT32_SH0 = 1,
    TINYMT32_SH1 = 10,
    TINYMT32_SH8 = 8,
    MIN_LOOP = 8,
    PRE_LOOP = 8;

var params = {
    mat1: 0x8f7011ee,
    mat2: 0xfc78ff1f,
    tmat: 0x3793fdff
};

var TinyMT = function () {
    function TinyMT(seed) {
        var param = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : params;

        _classCallCheck(this, TinyMT);

        this.param = param;
        if (typeof seed == "number") {
            this.init(seed);
        } else {
            this.status = new Uint32Array(4);
            for (var i = 0; i < 4; i++) {
                this.status[i] = seed[i];
            }
        }
    }

    _createClass(TinyMT, [{
        key: "init",
        value: function init(seed) {
            this.status = new Uint32Array([seed, this.param.mat1, this.param.mat2, this.param.tmat]);
            for (var i = 1; i < MIN_LOOP; i++) {
                var temp = (this.status[i - 1 & 3] ^ this.status[i - 1 & 3]) >>> 30;
                multiply32bitSafe(this.status[i & 3] ^= i + (1812433253 >>> 0), temp);
            }

            this.period_certification();

            for (var _i = 0; _i < PRE_LOOP; _i++) {
                this.nextState();
            }
        }
    }, {
        key: "nextState",
        value: function nextState() {
            var y = this.status[3];
            var x = this.status[0] & TINYMT32_MASK ^ this.status[1] ^ this.status[2];
            x ^= leftShift32bitSafe(x, TINYMT32_SH0);
            y ^= y >> TINYMT32_SH0 ^ x;
            this.status[0] = this.status[1];
            this.status[1] = this.status[2];
            this.status[2] = leftShift32bitSafe(y, TINYMT32_SH1) ^ x;
            this.status[3] = y;

            if ((y & 1) == 1) {
                this.status[1] = this.status[1] ^ this.param.mat1;
                this.status[2] = this.status[2] ^ this.param.mat2;
            }
        }
    }, {
        key: "temper",
        value: function temper() {
            var t0 = this.status[3] >>> 0;
            var t1 = add32bitSafe(this.status[0], this.status[2] >>> TINYMT32_SH8);
            t0 ^= t1;
            if ((t1 & 1) == 1) {
                t0 ^= this.param.tmat;
            }
            return t0 >>> 0;
        }
    }, {
        key: "Reseed",
        value: function Reseed(seed) {
            this.init(seed);
        }
    }, {
        key: "period_certification",
        value: function period_certification() {
            if (this.status[0] == TINYMT32_MASK && this.status[1] == 0 && this.status[2] == 0 && this.status[3] == 0) {
                this.status = [TINYMT32_MASK, TINYMT32_MASK, TINYMT32_MASK, TINYMT32_MASK];
            }
        }
    }, {
        key: "Nextuint",
        value: function Nextuint() {
            this.nextState();
            return this.temper();
        }
    }]);

    return TinyMT;
}();

exports.default = TinyMT;