import {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from '@solana/spl-token';
import {
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const pvKeyStr = process.env.PRIVATE_KEY;

if (!pvKeyStr) {
  throw new Error('Set your env variables');
}

const pvKeyUint8 = bs58.decode(pvKeyStr as string);
const kp = Keypair.fromSecretKey(new Uint8Array(pvKeyUint8));

const rpcUrl = 'https://api.devnet.solana.com';
const connection = new Connection(rpcUrl, 'confirmed');

const mintAddress = process.env.MINT_ADDRESS;
const transferAmount = 20 * LAMPORTS_PER_SOL;

async function sendTokens(receiverAdd: string) {
  if (!mintAddress) return;
  const receiverWalletAddress = receiverAdd;
  let sourceATA = await getOrCreateAssociatedTokenAccount(
    connection,
    kp,
    new PublicKey(mintAddress),
    kp.publicKey
  );
  console.log('Sender address is ', sourceATA.address.toString());

  let destinationATA = await getOrCreateAssociatedTokenAccount(
    connection,
    kp,
    new PublicKey(mintAddress),
    new PublicKey(receiverWalletAddress)
  );
  console.log('Receiver address is ', destinationATA.address.toString());

  const tx = new Transaction();
  tx.add(
    createTransferInstruction(
      sourceATA.address,
      destinationATA.address,
      kp.publicKey,
      transferAmount
    )
  );

  // Inorder to ensure that no one else replays the tx
  const latestBlockHash = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = latestBlockHash.blockhash;
  const signature = await sendAndConfirmTransaction(connection, tx, [kp]);
  console.log('Signature : ', signature);
}

// Sending my token to 10 random solana addresses
(async function () {
  for (let i = 0; i < 10; i++) {
    console.log('Iteration number : ', i);
    //generates a new public key
    await sendTokens(Keypair.generate().publicKey.toBase58());
  }
})();


// Inorder to create your own token - GENERATING TOKENS -> 
// 1. Create a wallet using "spl-token new --force"
// 2. Airdrop some sol "solana airdrop 5"
// 3. Create your own token (currency) "spl-token create-token". this returns mint address. store it. 
// 4. Create associated token account "spl-token create-account <TOKEN_MINT_ADDRESS>". store the account address. 
// 5. Mint your tokens as many as you want "spl-token mint <mint_add> <how many tokens you want> <associated token address>" - the tokens go into the ATA which is connected to your original Account (wallet account). 
// 6. After receiving you can transfer them to anyone you want
