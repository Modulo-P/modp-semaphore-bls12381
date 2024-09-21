#!/bin/bash

if [ ! -d ptau ]; then
    mkdir ptau
else
    rm -rf ptau
    mkdir ptau
fi

snarkjs powersoftau new bls12381 14 ptau/pot14_0000.ptau

FIRST_CONTRIBUTION_RANDOMNESS=$(xxd -u -l 16 -p /dev/urandom)
snarkjs powersoftau contribute ptau/pot14_0000.ptau ptau/pot14_0001.ptau --name="First contribution" --curve=bls12381 << EOF 
${FIRST_CONTRIBUTION_RANDOMNESS}
EOF

snarkjs powersoftau prepare phase2 ptau/pot14_0001.ptau ptau/pot14_final.ptau 