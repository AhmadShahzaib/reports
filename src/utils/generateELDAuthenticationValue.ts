import * as crypto from 'crypto';
import * as path from 'path';
export const generateELDAuthenticationValue = (
    eldRegistrationId: string,
    eldIdentifier: string,
    vehicleVIN: string,
    driverLicenseNumber: string,privateKey
  )=> {
    // Step 1: Concatenate the values
    const concatenatedString = `${eldRegistrationId}${eldIdentifier}${vehicleVIN}${driverLicenseNumber}`;

    // Step 2: Create a SHA-512 hash and sign it using the RSA private key
    const signer = crypto.createSign('RSA-SHA512');
    signer.update(concatenatedString);
    signer.end();

    const signature = signer.sign(privateKey);

    // Step 3: Convert the signature bytes to a hex string
    const hexSignature = signature.toString('hex');

    return hexSignature;
  }