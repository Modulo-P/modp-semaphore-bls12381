import * as bb from "bigint-buffer";
// @ts-ignore
import * as ff from "ffjavascript";
const args = process.argv;
if (args.length === 1) {
    console.log("Just one path argument is needed!");
}
//const proof: Proof = JSON.parse(fs.readFileSync("proof.json", "utf-8"));
//const verificationKey: VerificationKey = JSON.parse(fs.readFileSync("verification_key.json", "utf-8"));
//
async function compressedG1(point) {
    const curve = await ff.getCurveFromName("bls12381");
    const result = bb.toBufferBE(BigInt(point[0]), 48);
    const COMPRESSED = 0b10000000;
    const INFINITY = 0b01000000;
    const YBIT = 0b00100000;
    result[0] = result[0] | COMPRESSED;
    if (BigInt(point[2]) !== 1n) {
        result[0] = result[0] | INFINITY;
    }
    else {
        const F = curve.G1.F;
        const x = F.fromObject(BigInt(point[0]));
        const x3b = F.add(F.mul(F.square(x), x), curve.G1.b);
        const y1 = F.toObject(F.sqrt(x3b));
        const y2 = F.toObject(F.neg(F.sqrt(x3b)));
        const y = BigInt(point[1]);
        if (y1 > y2 && y > y2) {
            result[0] = result[0] | YBIT;
        }
        else if (y1 < y2 && y > y1) {
            result[0] = result[0] | YBIT;
        }
    }
    return result.toString("hex");
}
async function compressedG2(point) {
    const curve = await ff.getCurveFromName("bls12381");
    const result = Buffer.concat([
        bb.toBufferBE(BigInt(point[0][1]), 48),
        bb.toBufferBE(BigInt(point[0][0]), 48),
    ]);
    const COMPRESSED = 0b10000000;
    const INFINITY = 0b01000000;
    const YBIT = 0b00100000;
    result[0] = result[0] | COMPRESSED;
    if (BigInt(point[2][0]) !== 1n) {
        result[0] = result[0] | INFINITY;
    }
    else {
        const F = curve.G2.F;
        const x = F.fromObject(point[0].map(item => BigInt(item)));
        const x3b = F.add(F.mul(F.square(x), x), curve.G2.b);
        const y1 = F.toObject(F.sqrt(x3b));
        const y2 = F.toObject(F.neg(F.sqrt(x3b)));
        function greaterThan(a, b) {
            if (a[1] > b[1]) {
                return true;
            }
            else if (a[1] === b[1] && a[0] > b[0]) {
                return true;
            }
            return false;
        }
        const y = point[1].map(item => BigInt(item));
        if (greaterThan(y1, y2) && greaterThan(y, y2)) {
            result[0] = result[0] | YBIT;
        }
        else if (greaterThan(y2, y1) && greaterThan(y, y1)) {
            result[0] = result[0] | YBIT;
        }
    }
    return result.toString("hex");
}
async function convertProofToUncompressed(proof) {
    const uncompressedProof = {
        pi_a: await compressedG1(proof.pi_a),
        pi_b: await compressedG2(proof.pi_b),
        pi_c: await compressedG1(proof.pi_c),
    };
    return uncompressedProof;
}
async function convertVerificationKeyToUncompressed(verificationKey) {
    const uncompressedVerificationKey = {
        vk_alpha_1: await compressedG1(verificationKey.vk_alpha_1),
        vk_beta_2: await compressedG2(verificationKey.vk_beta_2),
        vk_gamma_2: await compressedG2(verificationKey.vk_gamma_2),
        vk_delta_2: await compressedG2(verificationKey.vk_delta_2),
        IC: await Promise.all(verificationKey.IC.map(async (item) => {
            try {
                return await compressedG1(item);
            }
            catch (error) {
                console.error("Error processing item:", item, error);
                return null;
            }
        })),
    };
    return uncompressedVerificationKey;
}
export async function printCompressedProof(proof) {
    console.log("Uncompressed proof", JSON.stringify(await convertProofToUncompressed(proof)));
}
export async function printCompressedVerificationKey(verificationKey) {
    console.log("\n\nUncompressed verification key", JSON.stringify(await convertVerificationKeyToUncompressed(verificationKey)));
}
//async function run_program() {
//  await printCompressedVerificationKey();
//  await printCompressedProof();
//  process.exit();
//}
//run_program();
//# sourceMappingURL=conversion.js.map