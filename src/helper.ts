import bs58 from 'bs58';
// You can use this helper file to convert your private key from Uint8Array to a string and then store it in the env file. Or else just put that Uint8Array in the index file if you know where exactly to put it. 
const stringFormat = bs58.encode([]);

console.log(stringFormat)