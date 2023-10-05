import { AnchorProvider } from "@coral-xyz/anchor";
import { WhirlpoolContext, buildWhirlpoolClient, ORCA_WHIRLPOOL_PROGRAM_ID, PDAUtil, PriceMath, increaseLiquidityQuoteByInputTokenWithParams, increaseLiquidityQuoteByInputToken, TickUtil, TickArrayUtil } from "@orca-so/whirlpools-sdk";
import { config } from 'dotenv';
import { DecimalUtil, Percentage } from "@orca-so/common-sdk";
import Decimal from "decimal.js";
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
    //const poolAddress = "HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ"; // SOL/USDC
    // old pool - 7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm

    const usdc = { mint: new web3.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), decimals: 6 };
    const wsol = { mint: new web3.PublicKey("So11111111111111111111111111111111111111112"), decimals: 9 };

    const tick_spacing = 64;
    console.log('whirpool programId', ORCA_WHIRLPOOL_PROGRAM_ID);
    // ToDo - Fetch whirpool using PDAUtil instead of hardcoding pool address
    const whirlpool_pubkey = PDAUtil.getWhirlpool(
        ORCA_WHIRLPOOL_PROGRAM_ID,
        DEVNET_WHIRLPOOLS_CONFIG,
        wsol.mint,usdc.mint, tick_spacing).publicKey;
    console.log("whirlpool_key:", whirlpool_pubkey.toBase58());
    //const whirlpool = await client.getPool(whirlpool_pubkey);

    const whirlpool = await client.getPool(whirlpool_pubkey);
    console.log('whirpool liquidity', whirlpool.getData().liquidity.toString());
    console.log("whirlpool tick spacing:", whirlpool.getData().tickSpacing);
    console.log("whirlpool token A:", whirlpool.getTokenAInfo(), " tokenB ", whirlpool.getTokenBInfo());
       


    // Get the current price of the pool
    const sqrt_price_x64 = whirlpool.getData().sqrtPrice;
    const price = PriceMath.sqrtPriceX64ToPrice(sqrt_price_x64, whirlpool.getTokenAInfo().decimals,
        whirlpool.getTokenBInfo().decimals);

    console.log("sqrt_price_x64:", sqrt_price_x64.toString());
    console.log("price:", price.toString());

    // Deposit logic
    // Set price range, amount of tokens to deposit, and acceptable slippage
    const lower_price = new Decimal(price.mul(0.97));
    const upper_price = new Decimal(price.mul(1.03));
    const usdc_amount = DecimalUtil.toBN(new Decimal("50" /* devUSDC */), usdc.decimals);
    const slippage = Percentage.fromFraction(10, 1000); // 1%

    // Adjust price range (not all prices can be set, only a limited number of prices are available for range specification)
    // (prices corresponding to InitializableTickIndex are available)
    const whirlpool_data = whirlpool.getData();
    const token_a = whirlpool.getTokenAInfo();
    const token_b = whirlpool.getTokenBInfo();
     let lower_tick_index = PriceMath.priceToInitializableTickIndex(lower_price, token_a.decimals, token_b.decimals, whirlpool_data.tickSpacing);
     let upper_tick_index = PriceMath.priceToInitializableTickIndex(upper_price, token_a.decimals, token_b.decimals, whirlpool_data.tickSpacing);
    
     //lower_tick_index = -443632;
     //upper_tick_index = 443632;

    console.log("lower & upper tick_index:", lower_tick_index, upper_tick_index);
    console.log("lower & upper price:",
        PriceMath.tickIndexToPrice(lower_tick_index, token_a.decimals, token_b.decimals).toFixed(token_b.decimals),
        PriceMath.tickIndexToPrice(upper_tick_index, token_a.decimals, token_b.decimals).toFixed(token_b.decimals)
    );


    // Obtain deposit estimation
    const quote = increaseLiquidityQuoteByInputTokenWithParams({
        // Pass the pool definition and state
        tokenMintA: token_a.mint,
        tokenMintB: token_b.mint,
        sqrtPrice: whirlpool_data.sqrtPrice,
        tickCurrentIndex: whirlpool_data.tickCurrentIndex,
        // Price range
        tickLowerIndex: lower_tick_index,
        tickUpperIndex: upper_tick_index,
        // Input token and amount
        inputTokenMint: usdc.mint,
        inputTokenAmount: usdc_amount,
        // Acceptable slippage
        slippageTolerance: slippage,
    });


    // Output the estimation
    console.log("wsol max input:", DecimalUtil.fromBN(quote.tokenMaxA, token_a.decimals).toFixed(token_a.decimals));
    console.log("usdc max input:", DecimalUtil.fromBN(quote.tokenMaxB, token_b.decimals).toFixed(token_b.decimals));


    console.log('tick spacing', whirlpool.getData().tickSpacing);
    console.log(TickUtil.getFullRangeTickIndex(8));
    //process.exit(1);

 // Create a transaction
  // Use openPosition method instead of openPositionWithMetadata method
  const open_position_tx = await whirlpool.openPositionWithMetadata(
    lower_tick_index,
    upper_tick_index,
    quote,
  );

  // Send the transaction
  const tx = await open_position_tx.tx.build();
  //console.log('tx', tx.signers);

  console.log('tx',tx.transaction);

  const signature = await open_position_tx.tx.buildAndExecute();
  console.log("signature:", signature);
  console.log("position NFT:", open_position_tx.positionMint.toBase58());

  // Wait for the transaction to complete
  const latest_blockhash = await ctx.connection.getLatestBlockhash();
  await ctx.connection.confirmTransaction({signature, ...latest_blockhash}, "confirmed");


}

main();