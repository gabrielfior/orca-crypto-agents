import { AnchorProvider } from "@coral-xyz/anchor";
import { WhirlpoolContext, buildWhirlpoolClient, ORCA_WHIRLPOOL_PROGRAM_ID, PDAUtil, PriceMath } from "@orca-so/whirlpools-sdk";
import { config } from 'dotenv';
import * as web3 from '@solana/web3.js';
import { DecimalUtil, Percentage } from "@orca-so/common-sdk";
import * as fs from "fs";
import * as spl_token from '@solana/spl-token';
import Decimal from "decimal.js";
config();

export function loadKp(keypairPath: string): web3.Keypair {    
      const kpBytes = fs.readFileSync(keypairPath);
      const kp = web3.Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(kpBytes.toString()))
      );
      return kp;
    
  }


async function main() {
    console.log('start');
    const provider = AnchorProvider.env();

    const usdc = { mint: new web3.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), decimals: 6 };
    const wsol = { mint: new web3.PublicKey("So11111111111111111111111111111111111111112"), decimals: 9 };
    const t2080 = {mint: new web3.PublicKey("Dwri1iuy5pDFf2u2GwwsH2MxjR6dATyDv9En9Jk8Fkof"), decimals: 9};

    const tokenAccounts = await provider.connection.getTokenAccountsByOwner(provider.wallet.publicKey, {programId:new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") });

    const keypair = loadKp(process.env.ANCHOR_WALLET);

    // mint SOL
    // Do manually via airdrop

    for (const token of [t2080]){

        const ata = await spl_token.getOrCreateAssociatedTokenAccount(provider.connection, keypair, token.mint, keypair.publicKey);
        console.log('ata', ata);
    
        const amount = DecimalUtil.toBN(new Decimal("100"), token.decimals);
        await spl_token.mintTo(provider.connection, keypair, token.mint, ata.address, provider.wallet.publicKey, amount);
        const tokenBalance = await provider.connection.getTokenAccountBalance(ata.address);
        console.log('token balance', tokenBalance);
    }

    
    console.log('end');

}

main();