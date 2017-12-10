# TinyMTjs

Pure JavaScript implementation of the TinyMT pseudo random number generator.

## Installing

```
npm install --save tinymtjs
```

## Usage

Please note, this library is not cryptographically secure:

```
import TinyMT from 'tinymtjs'; // Import TinyMT

let tiny = new TinyMT([0xA, 0xB, 0xC, 0xD]); // Seed with an array (length of four)
let tiny2 = new TinyMT(0xAABBCCDD); // Seed with a number

tiny.GetNext32Bit(); // Get the next unsigned 32 bit integer
console.log(tiny.status); // Check the status
tiny.Reseed(0xAABBCCDD); // Reseed
```
