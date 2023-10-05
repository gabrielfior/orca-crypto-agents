import { AnchorProvider } from "@coral-xyz/anchor";
import { WhirlpoolContext, buildWhirlpoolClient, ORCA_WHIRLPOOL_PROGRAM_ID, PDAUtil, PriceMath } from "@orca-so/whirlpools-sdk";
import {config} from 'dotenv';
import * as web3 from '@solana/web3.js';
config();

// UNIX/Linux/Mac
// bash$ export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
// bash$ export ANCHOR_WALLET=wallet.json
// bash$ ts-node this_script.ts
//

async function main() {
  const provider = AnchorProvider.env();
  const ctx = WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID);
  const client = buildWhirlpoolClient(ctx);

  console.log("endpoint:", ctx.connection.rpcEndpoint);
  console.log("wallet pubkey:", ctx.wallet.publicKey.toBase58());

  const DEVNET_WHIRLPOOLS_CONFIG = new web3.PublicKey("2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ");

  const usdc = {mint: new web3.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), decimals: 6};
  const wsol = {mint: new web3.PublicKey("So11111111111111111111111111111111111111112"), decimals: 9};
  const t2080 = {mint: new web3.PublicKey("Dwri1iuy5pDFf2u2GwwsH2MxjR6dATyDv9En9Jk8Fkof"), decimals: 9};

  const tick_spacing = 128;
  console.log('whirpool programId', ORCA_WHIRLPOOL_PROGRAM_ID);
  // ToDo - Fetch whirpool using PDAUtil instead of hardcoding pool address
  const whirlpool_pubkey = PDAUtil.getWhirlpool(
    ORCA_WHIRLPOOL_PROGRAM_ID,
    DEVNET_WHIRLPOOLS_CONFIG,
    wsol.mint, t2080.mint, tick_spacing).publicKey;
console.log("whirlpool_key:", whirlpool_pubkey.toBase58());
//const whirlpool = await client.getPool(whirlpool_pubkey);

  const whirlpool = await client.getPool(whirlpool_pubkey);
  console.log('whirpool liquidity', whirlpool.getData().liquidity.toString());
  

   // Get the current price of the pool
   const sqrt_price_x64 = whirlpool.getData().sqrtPrice;
   const price = PriceMath.sqrtPriceX64ToPrice(sqrt_price_x64, whirlpool.getTokenAInfo().decimals,
   whirlpool.getTokenBInfo().decimals);
 
   console.log("sqrt_price_x64:", sqrt_price_x64.toString());
   console.log("price:", price.toString());


}

main();