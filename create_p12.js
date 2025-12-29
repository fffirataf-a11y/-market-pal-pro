
import forge from 'node-forge';
import fs from 'fs';

try {
    // Read Private Key
    const privateKeyPem = fs.readFileSync('private_key.pem', 'utf8').replace(/\r/g, '');
    console.log("Private Key read, length:", privateKeyPem.length);
    console.log("First line:", privateKeyPem.split('\n')[0]);

    // Test parsing Private Key specifically
    let privateKey;
    try {
        privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        console.log("Private Key parsed successfully!");
    } catch (e) {
        console.error("FAILED to parse Private Key:", e.message);
        throw e;
    }

    // Read Certificate (Try both names)
    let certDer;
    console.log("Reading Certificate...");
    try {
        certDer = fs.readFileSync('ios_distribution.cer', 'binary');
    } catch (e) {
        try {
            certDer = fs.readFileSync('distribution.cer', 'binary');
        } catch (e2) {
            console.error("ERROR: Could not find 'ios_distribution.cer'! Please put it in this folder.");
            process.exit(1);
        }
    }

    console.log("Converting Certificate...");
    const certAsn1 = forge.asn1.fromDer(certDer);
    const cert = forge.pki.certificateFromAsn1(certAsn1);

    if (!cert) {
        throw new Error("Certificate parsing failed!");
    }
    console.log("Certificate parsed. Subject:", cert.subject.attributes[0].value);

    // Create P12 using the 'safe' API with simpler options
    console.log("Creating P12 Container...");
    const p12 = forge.pkcs12.toPkcs12Asn1(
        [{ key: privateKey, cert: cert, friendlyName: 'SmartMarket' }],
        '123456'
    );

    const p12Der = forge.asn1.toDer(p12).getBytes();
    fs.writeFileSync('distribution.p12', p12Der, 'binary');

    console.log("\nSUCCESS! distribution.p12 created.");
    console.log("Password is: 123456");

    // Convert to Base64 for user
    const p12Base64 = Buffer.from(p12Der, 'binary').toString('base64');
    console.log("\n--- COPY THE CODE BELOW FOR GITHUB (BUILD_CERTIFICATE_BASE64) ---");
    console.log(p12Base64);
    console.log("---------------------------------------------------------------");

} catch (err) {
    console.error("Error:", err.message);
}
