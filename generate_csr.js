
import forge from 'node-forge';
import fs from 'fs';

// Generate 2048-bit key-pair
console.log("Generating 2048-bit Key Pair... This may take a moment.");
const keys = forge.pki.rsa.generateKeyPair(2048);
const privateKey = keys.privateKey;
const publicKey = keys.publicKey;

console.log("Key Pair Generated!");

// Create CSR
const csr = forge.pki.createCertificationRequest();
csr.publicKey = publicKey;
csr.setSubject([{
    name: 'commonName',
    value: 'SmartMarket Distribution'
}, {
    name: 'countryName',
    value: 'TR' // Turkey
}, {
    name: 'organizationName',
    value: 'Firat Furkan'
}]);

// Sign CSR with Private Key
csr.sign(privateKey);

// Convert to PEM
const csrPem = forge.pki.certificationRequestToPem(csr);
const privateKeyPem = forge.pki.privateKeyToPem(privateKey);

// Save to files
fs.writeFileSync('SmartMarket_Dist.csr', csrPem);
fs.writeFileSync('private_key.pem', privateKeyPem);

console.log("\nSUCCESS! Files Created:");
console.log("1. SmartMarket_Dist.csr (Upload this to Apple)");
console.log("2. private_key.pem (KEEP THIS SAFE - We need it for .p12)");
