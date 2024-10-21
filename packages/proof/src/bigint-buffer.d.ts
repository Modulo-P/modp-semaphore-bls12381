declare module 'bigint-buffer' {
    export function toBufferBE(num: BigInt, width: number): Buffer;
    export function toBufferLE(num: BigInt, width: number): Buffer;
    export function toBigIntBE(buffer: Buffer): BigInt;
    export function toBigIntLE(buffer: Buffer): BigInt;
  }