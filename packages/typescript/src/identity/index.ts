import { BigNumber } from "@ethersproject/bignumber";
import hash from "js-sha512";
import { poseidon1, poseidon2 } from "poseidon-bls12381";
import { randomBytes } from "@ethersproject/random";

function checkParameter(value: any, name: string, type: string) {
  if (typeof value !== type) {
    throw new TypeError(`Parameter '${name}' is not a ${type}`);
  }
}

/**
 * Generates a random big number.
 * @param numberOfBytes The number of bytes of the number.
 * @returns The generated random number.
 */
export function genRandomNumber(numberOfBytes = 31): bigint {
  return BigNumber.from(randomBytes(numberOfBytes)).toBigInt();
}

/**
 * Checks if a string is a JSON.
 * @param jsonString The JSON string.
 * @returns True or false.
 */
export function isJsonArray(jsonString: string) {
  try {
    return Array.isArray(JSON.parse(jsonString));
  } catch (error) {
    return false;
  }
}

export class Identity {
  private _trapdoor: bigint;
  private _nullifier: bigint;
  private _secret: bigint;
  private _commitment: bigint;

  /**
   * Initializes the class attributes based on the strategy passed as parameter.
   * @param identityOrMessage Additional data needed to create identity for given strategy.
   */
  constructor(identityOrMessage?: string) {
    if (identityOrMessage === undefined) {
      this._trapdoor = genRandomNumber();
      this._nullifier = genRandomNumber();
      this._secret = poseidon2([this._nullifier, this._trapdoor]);
      this._commitment = poseidon1([this._secret]);

      return;
    }

    checkParameter(identityOrMessage, "identityOrMessage", "string");

    if (!isJsonArray(identityOrMessage)) {
      const h = hash.sha512(identityOrMessage).padStart(128, "0");
      // alt_bn128 is 253.6 bits, so we can safely use 253 bits.
      this._trapdoor = BigInt(`0x${h.slice(64)}`) >> BigInt(3);
      this._nullifier = BigInt(`0x${h.slice(0, 64)}`) >> BigInt(3);
      this._secret = poseidon2([this._nullifier, this._trapdoor]);
      this._commitment = poseidon1([this._secret]);

      return;
    }

    const [trapdoor, nullifier] = JSON.parse(identityOrMessage);

    this._trapdoor = BigNumber.from(trapdoor).toBigInt();
    this._nullifier = BigNumber.from(nullifier).toBigInt();
    this._secret = poseidon2([this._nullifier, this._trapdoor]);
    this._commitment = poseidon1([this._secret]);
  }

  /**
   * Returns the identity trapdoor.
   * @returns The identity trapdoor.
   */
  public get trapdoor(): bigint {
    return this._trapdoor;
  }

  /**
   * Returns the identity trapdoor.
   * @returns The identity trapdoor.
   */
  public getTrapdoor(): bigint {
    return this._trapdoor;
  }

  /**
   * Returns the identity nullifier.
   * @returns The identity nullifier.
   */
  public get nullifier(): bigint {
    return this._nullifier;
  }

  /**
   * Returns the identity nullifier.
   * @returns The identity nullifier.
   */
  public getNullifier(): bigint {
    return this._nullifier;
  }

  /**
   * Returns the identity secret.
   * @returns The identity secret.
   */
  public get secret(): bigint {
    return this._secret;
  }

  /**
   * Returns the identity secret.
   * @returns The identity secret.
   */
  public getSecret(): bigint {
    return this._secret;
  }

  /**
   * Returns the identity commitment.
   * @returns The identity commitment.
   */
  public get commitment(): bigint {
    return this._commitment;
  }

  /**
   * Returns the identity commitment.
   * @returns The identity commitment.
   */
  public getCommitment(): bigint {
    return this._commitment;
  }

  /**
   * Returns a JSON string with trapdoor and nullifier. It can be used
   * to export the identity and reuse it later.
   * @returns The string representation of the identity.
   */
  public toString(): string {
    return JSON.stringify([
      `0x${this._trapdoor.toString(16)}`,
      `0x${this._nullifier.toString(16)}`,
    ]);
  }
}
