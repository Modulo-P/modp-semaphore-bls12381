import { WitnessTester } from "circomkit";
import { circomkit } from "./common";
import { Group, Identity } from "@modp-semaphore-bls12381/typescript";
import { poseidon2 } from "poseidon-bls12381";

describe("semaphore", () => {
  let semaphoreCircuit: WitnessTester<
    [
      "identityNullifier",
      "identityTrapdoor",
      "treePathIndices",
      "treeSiblings",
      "signalHash",
      "externalNullifier"
    ],
    ["root", "nullifierHash"]
  >;

  let secretCircuit: WitnessTester<
    ["identityTrapdoor", "identityTrapdoor"],
    ["out"]
  >;

  const MAX_DEPTH = 20;

  before(async () => {
    semaphoreCircuit = await circomkit.WitnessTester("semaphore", {
      file: "semaphore",
      template: "Semaphore",
      params: [MAX_DEPTH],
    });

    secretCircuit = await circomkit.WitnessTester("semaphore", {
      file: "semaphore",
      template: "CalculateSecret",
    });
  });

  it("Calculate identity secret and commitment", async () => {
    const identity = new Identity('["2", "1"]');
    const { trapdoor, nullifier, commitment } = identity;

    const INPUT = {
      identityTrapdoor: trapdoor,
      identityNullifier: nullifier,
    };

    const OUTPUT = {
      out: poseidon2([BigInt(nullifier), BigInt(trapdoor)]),
    };

    const output = await secretCircuit.readWitnessSignals(
      await secretCircuit.calculateWitness(INPUT),
      ["out"]
    );

    await secretCircuit.expectPass(INPUT, OUTPUT);
  });

  it("Should calculate the root and the nullifier correctly using the Semaphore Identity library", async () => {
    const identity = new Identity();
    const { trapdoor, nullifier, commitment } = identity;

    const group = new Group(1, MAX_DEPTH, [commitment, 2n, 3n]);

    const { pathIndices, siblings, root } = group.generateMerkleProof(0);

    const signalHash = 1;
    const externalNullifier = 2;

    const INPUT = {
      identityNullifier: nullifier,
      identityTrapdoor: trapdoor,
      treePathIndices: pathIndices,
      treeSiblings: siblings,
      signalHash,
      externalNullifier,
    };

    const nullifierHash = poseidon2([BigInt(externalNullifier), nullifier]);

    const OUTPUT = {
      root,
      nullifierHash,
    };

    await semaphoreCircuit.expectPass(INPUT, OUTPUT);
  });
});
