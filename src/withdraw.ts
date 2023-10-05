import { AnchorProvider, BN } from "@coral-xyz/anchor";
import {
    WhirlpoolContext, buildWhirlpoolClient, ORCA_WHIRLPOOL_PROGRAM_ID,
    PDAUtil, PriceMath, PoolUtil, IGNORE_CACHE, collectFeesQuote, collectRewardsQuote, TickArrayUtil,
} from "@orca-so/whirlpools-sdk";
import { config } from 'dotenv';
import { DecimalUtil, Percentage } from "@orca-so/common-sdk";
import Decimal from "decimal.js";
import { TOKEN_PROGRAM_ID, unpackAccount } from "@solana/spl-token";
import * as web3 from '@solana/web3.js';
config();


async function main() {
    const provider = AnchorProvider.env();
    const ctx = WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID);
    const client = buildWhirlpoolClient(ctx);

    console.log("endpoint:", ctx.connection.rpcEndpoint);
    console.log("wallet pubkey:", ctx.wallet.publicKey.toBase58());

    const DEVNET_WHIRLPOOLS_CONFIG = new web3.PublicKey("2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ");
    //const poolAddress = "HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ"; // SOL/USDC
    // old pool - 7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm

    //const usdc = { mint: new web3.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), decimals: 6 };
    const wsol = { mint: new web3.PublicKey("So11111111111111111111111111111111111111112"), decimals: 9 };
    const t2080 = {mint: new web3.PublicKey("Dwri1iuy5pDFf2u2GwwsH2MxjR6dATyDv9En9Jk8Fkof"), decimals: 9};

    const tick_spacing = 128;//64;
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
    console.log("whirlpool tick spacing:", whirlpool.getData().tickSpacing);
    console.log("whirlpool token A:", whirlpool.getTokenAInfo(), " tokenB ", whirlpool.getTokenBInfo());

    // get position
    // Get all token accounts
    const token_accounts = (await ctx.connection.getTokenAccountsByOwner(ctx.wallet.publicKey,
        { programId: TOKEN_PROGRAM_ID })).value;

    // Get candidate addresses for the position
    const whirlpool_position_candidate_pubkeys = token_accounts.map((ta) => {
        const parsed = unpackAccount(ta.pubkey, ta.account);

        // Derive the address of Whirlpool's position from the mint address (whether or not it exists)
        const pda = PDAUtil.getPosition(ctx.program.programId, parsed.mint);

        // Output candidate info
        console.log(
            "TokenAccount:", ta.pubkey.toBase58(),
            "\n  mint:", parsed.mint.toBase58(),
            "\n  amount:", parsed.amount.toString(),
            "\n  pda:", pda.publicKey.toBase58()
        );

        // Returns the address of the Whirlpool position only if the number of tokens is 1 (ignores empty token accounts and non-NFTs)
        return new BN(parsed.amount.toString()).eq(new BN(1)) ? pda.publicKey : undefined;
    }).filter(pubkey => pubkey !== undefined);

    // Get data from Whirlpool position addresses
    const whirlpool_position_candidate_datas = await ctx.fetcher.getPositions(whirlpool_position_candidate_pubkeys, IGNORE_CACHE);
    // Leave only addresses with correct data acquisition as position addresses
    const whirlpool_positions = whirlpool_position_candidate_pubkeys.filter((pubkey, i) =>
        whirlpool_position_candidate_datas[i] !== null
    );

    // Output the address of the positions
    whirlpool_positions.map((position_pubkey) => console.log("position:", position_pubkey.toBase58()));

    // Print liquidity
    const p = '263gHDTSypHuMbdjWnmaFes87dCJ3xaKyyzFh75VUx4D';
    // Get the status of the position
    const position = await client.getPosition(p);
    const data = position.getData();

    // Get the pool to which the position belongs
    const pool = await client.getPool(data.whirlpool);
    const token_a = pool.getTokenAInfo();
    const token_b = pool.getTokenBInfo();
    const price = PriceMath.sqrtPriceX64ToPrice(pool.getData().sqrtPrice, token_a.decimals, token_b.decimals);

    // Get the price range of the position
    const lower_price = PriceMath.tickIndexToPrice(data.tickLowerIndex, token_a.decimals, token_b.decimals);
    const upper_price = PriceMath.tickIndexToPrice(data.tickUpperIndex, token_a.decimals, token_b.decimals);

    // Calculate the amount of tokens that can be withdrawn from the position
    const amounts = PoolUtil.getTokenAmountsFromLiquidity(
        data.liquidity,
        pool.getData().sqrtPrice,
        PriceMath.tickIndexToSqrtPriceX64(data.tickLowerIndex),
        PriceMath.tickIndexToSqrtPriceX64(data.tickUpperIndex),
        true
    );

    // Output the status of the position
    console.log("position:", p);
    console.log("\twhirlpool address:", data.whirlpool.toBase58());
    console.log("\twhirlpool price:", price.toFixed(token_b.decimals));
    console.log("\ttokenA:", token_a.mint.toBase58());
    console.log("\ttokenB:", token_b.mint.toBase58());
    console.log("\tliquidity:", data.liquidity.toString());
    console.log("\tlower:", data.tickLowerIndex, lower_price.toFixed(token_b.decimals));
    console.log("\tupper:", data.tickUpperIndex, upper_price.toFixed(token_b.decimals));
    console.log("\tamountA:", DecimalUtil.fromBN(amounts.tokenA, token_a.decimals).toString());
    console.log("\tamountB:", DecimalUtil.fromBN(amounts.tokenB, token_b.decimals).toString());
    console.log('position data', data);

      // Get TickArray and Tick
  if (tick_spacing !== whirlpool.getData().tickSpacing){
    throw Error(`tick spacing wrong, ${tick_spacing} ${whirlpool.getData().tickSpacing}`);
  };
  const tick_array_lower_pubkey = PDAUtil.getTickArrayFromTickIndex(position.getData().tickLowerIndex, tick_spacing, whirlpool_pubkey, ctx.program.programId).publicKey;
  const tick_array_upper_pubkey = PDAUtil.getTickArrayFromTickIndex(position.getData().tickUpperIndex, tick_spacing, whirlpool_pubkey, ctx.program.programId).publicKey;
  const tick_array_lower = await ctx.fetcher.getTickArray(tick_array_lower_pubkey);
  const tick_array_upper = await ctx.fetcher.getTickArray(tick_array_upper_pubkey);
  const tick_lower = TickArrayUtil.getTickFromArray(tick_array_lower, position.getData().tickLowerIndex, tick_spacing);
  const tick_upper = TickArrayUtil.getTickFromArray(tick_array_upper, position.getData().tickUpperIndex, tick_spacing);

  // Get trade fee
  const quote_fee = await collectFeesQuote({
    whirlpool: whirlpool.getData(),
    position: position.getData(),
    tickLower: tick_lower,
    tickUpper: tick_upper,
  });

  const decimalsA = whirlpool.getTokenAInfo().decimals;
  const decimalsB = whirlpool.getTokenBInfo().decimals;
  console.log("fee tokenA(devSAMO):", DecimalUtil.adjustDecimals(new Decimal(quote_fee.feeOwedA.toString()), decimalsA));
  console.log("fee tokenB(devUSDC):", DecimalUtil.adjustDecimals(new Decimal(quote_fee.feeOwedB.toString()), decimalsB));

  // Get rewards
  const quote_reward = await collectRewardsQuote({
    whirlpool: whirlpool.getData(),
    position: position.getData(),
    tickLower: tick_lower,
    tickUpper: tick_upper,
  });

  quote_reward.map((reward, i) => {
    const reward_info = whirlpool.getData().rewardInfos[i];

    if ( PoolUtil.isRewardInitialized(reward_info) ) {
      
      console.log(
        `reward[${i}]:`,
        reward.toString(),
        reward_info.mint.toBase58()
      );
    }
    else {
      console.log(`reward[${i}]: NOT INITIALIZED`);
    }
  }); 
}

main();