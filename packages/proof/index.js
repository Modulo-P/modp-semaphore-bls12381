import { Group } from '@modp-semaphore-bls12381/typescript';
import { Identity } from '@modp-semaphore-bls12381/typescript';
import { groth16 } from 'snarkjs';
import * as fs from 'fs';
//import {printCompressedProof, printCompressedVerificationKey} from './conversion';
//import { Trie, digest } from '@aiken-lang/merkle-patricia-forestry';
const identity_0 = new Identity();
const identity_commitment_0 = identity_0.getCommitment();
console.log(identity_commitment_0);
const group_0 = new Group(1, 20, [identity_commitment_0]);
console.log(group_0.members);
console.log(group_0.root);
const mkp = group_0.generateMerkleProof(0);
console.log(mkp);
console.log(mkp.pathIndices.length);
const inputs = {
    identityNullifier: identity_0.getNullifier(),
    identityTrapdoor: identity_0.getTrapdoor(),
    treePathIndices: mkp.pathIndices,
    treeSiblings: mkp.siblings,
    signalHash: 1n,
    externalNullifier: 26752615589533105314083070294476356144393894068720636123966246677904n,
};
console.log(inputs);
const proof = await groth16.fullProve(inputs, `/home/ash/Cardano/Modp/Prototyping/modp-semaphore-bls12381/packages/circuits/build/semaphore/semaphore_js/semaphore.wasm`, `/home/ash/Cardano/Modp/Prototyping/modp-semaphore-bls12381/packages/circuits/build/semaphore/groth16_pkey.zkey`);
console.log(proof);
const vk = JSON.parse(fs.readFileSync('/home/ash/Cardano/Modp/Prototyping/modp-semaphore-bls12381/packages/circuits/build/semaphore/groth16_vkey.json').toString());
console.log(vk);
console.log(await groth16.verify(vk, proof.publicSignals, proof.proof));
/**
 * Escribe un valor en un archivo JSON en el directorio actual.
 * @param value - El valor a escribir en el archivo JSON.
 * @param filename - El nombre del archivo donde se escribirá el JSON.
 */
function writeJsonToFile(value, filename) {
    // Convierte el valor a JSON
    const jsonContent = JSON.stringify(value, null, 2); // Formato legible
    // Escribe el archivo
    fs.writeFileSync(filename, jsonContent, "utf-8");
    console.log(`Archivo ${filename} escrito con éxito.`);
}
//const trie = new Trie();
//const value = 26593495781683680956254130405702393360799795146227253887984406106246073779265n;
//console.log(digest(value));
//trie.insert(digest(value), value);
//console.log(trie);
writeJsonToFile(proof, "proof.json");
writeJsonToFile(vk, "verification_key.json");
//printCompressedProof(proof);
//printCompressedVerificationKey(vk);
//
//# sourceMappingURL=index.js.map