const TINYMT32_MASK = 0x7FFFFFFF,
      TINYMT32_SH0 = 1,
      TINYMT32_SH1 = 10,
      TINYMT32_SH8 = 8,
      MIN_LOOP = 8,
      PRE_LOOP = 8;

const params = {
    mat1: 0x8f7011ee,
    mat2: 0xfc78ff1f,
    tmat: 0x3793fdff
};

export default class TinyMT {

    constructor(seed, param = params) {
        this.param = param;
        if(typeof seed == "number") {
            this.init(seed);
        } else {
            this.status = new Uint32Array(4);
            for (var i = 0; i < 4; i++) {
                this.status[i] = seed[i];
            }
        }
    }

    init(seed) {
        this.status = new Uint32Array([seed, this.param.mat1, this.param.mat2, this.param.tmat]);
        var s;

        for(let i = 1; i < MIN_LOOP; i++) {
            s = this.status[(i - 1) & 3] ^ (this.status[(i - 1) & 3] >>> 30);
            this.status[i & 3] ^= ((((s >>> 16) * 0x6C078965) << 16) + (s & 0xffff) * 0x6C078965) + i;
        }

        this.period_certification();

        for(let i = 0; i < PRE_LOOP; i++) {
            this.nextState();
        }
    }

    nextState() {
        var y = this.status[3];
        var x = ((this.status[0] & TINYMT32_MASK) ^ this.status[1] ^ this.status[2]);
        x ^= (x << TINYMT32_SH0);
        y ^= (y >>> TINYMT32_SH0) ^ x;
        this.status[0] = this.status[1];
        this.status[1] = this.status[2];
        this.status[2] = x ^ (y << TINYMT32_SH1);
        this.status[3] = y;

        if ((y & 1) == 1) {
            this.status[1] ^= this.param.mat1;
            this.status[2] ^= this.param.mat2;
        }
    }

    temper() {
        var t0 = this.status[3];
        var t1 = this.status[0] + (this.status[2] >>> TINYMT32_SH8);
        t0 ^= t1;
        if ((t1 & 1) == 1) {
            t0 ^= this.param.tmat;
        }
        return t0 >>> 0;
    }

    Reseed(seed) {
        this.init(seed);
    }

    period_certification() {
        if( this.status[0] == TINYMT32_MASK && this.status[1] == 0 && this.status[2] == 0 && this.status[3] == 0 ){
            this.status = [ TINYMT32_MASK, TINYMT32_MASK, TINYMT32_MASK, TINYMT32_MASK ];
        }
    }

    Nextuint() {
        this.nextState();
        return this.temper();
    }

}
