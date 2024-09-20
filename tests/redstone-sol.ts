import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RedstoneSol } from "../target/types/redstone_sol";
import { requestRedstonePayload } from "@redstone-finance/sdk";
import { expect } from "chai";

const makePayload = async () => {
  const DATA_SERVICE_ID = "redstone-avalanche-prod";
  const DATA_FEEDS = ["ETH", "BTC", "AVAX", "USDC", "LINK"];
  const UNIQUE_SIGNER_COUNT = 1;

  const res = await requestRedstonePayload(
    {
      dataPackagesIds: DATA_FEEDS,
      dataServiceId: DATA_SERVICE_ID,
      uniqueSignersCount: UNIQUE_SIGNER_COUNT,
    },
    "bytes"
  );

  const payload = Buffer.from(JSON.parse(res));

  console.log("Payload size:", payload.length);

  return payload;
};

function deserializePriceData(data: Buffer): PriceData {
  if (data.length !== 64) {
    // 8 (discriminator) + 32 + 16 + 8 bytes
    throw new Error("Invalid data length for PriceData " + data.length);
  }

  const feedIdBuffer = data.subarray(8, 40);
  const feedId = feedIdBuffer.toString("utf8").replace(/\0+$/, "");
  const valueLow = data.readBigUInt64LE(40);
  const valueHigh = data.readBigUInt64LE(48);
  const value = valueLow + (valueHigh << BigInt(64));
  const timestamp = data.readBigUInt64LE(56);

  return {
    feedId: feedId,
    value: value.toString(),
    timestamp: timestamp.toString(),
  };
}

interface PriceData {
  feedId: string;
  value: string;
  timestamp: string;
}

// Utility function to print compute units used by a transaction
async function printComputeUnitsUsed(
  provider: anchor.AnchorProvider,
  txSignature: string
) {
  const maxRetries = 5;
  const cooldownMs = 200;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const tx = await provider.connection.getTransaction(txSignature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });
      if (tx && tx.meta && tx.meta.computeUnitsConsumed) {
        console.log(`Compute units used: ${tx.meta.computeUnitsConsumed}`);
        return; // Success, exit the function
      }
    } catch (error) {
      // pass
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, cooldownMs));
    }
  }

  console.log(`Failed to retrieve compute units after ${maxRetries} attempts`);
}

describe("redstone-sol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RedstoneSol as Program<RedstoneSol>;

  let payload: Buffer;

  let ethPriceAccount: anchor.web3.PublicKey;
  let btcPriceAccount: anchor.web3.PublicKey;
  let avaxPriceAccount: anchor.web3.PublicKey;
  let usdcPriceAccount: anchor.web3.PublicKey;
  let linkPriceAccount: anchor.web3.PublicKey;

  let cbix: anchor.web3.TransactionInstruction;

  before(async () => {
    payload = await makePayload();
    // Derive price account addresses
    [ethPriceAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("price"), Buffer.from("ETH\0\0")],
      program.programId
    );

    [btcPriceAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("price"), Buffer.from("BTC\0\0")],
      program.programId
    );

    [avaxPriceAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("price"), Buffer.from("AVAX\0")],
      program.programId
    );

    [usdcPriceAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("price"), Buffer.from("USDC\0")],
      program.programId
    );

    [linkPriceAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("price"), Buffer.from("LINK\0")],
      program.programId
    );

    // Set up compute budget instruction
    cbix = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: 10 ** 6,
    });
  });

  it.skip("Processes Redstone payload successfully", async () => {
    try {
      // Process the payload
      const tx = await program.methods
        .processRedstonePayload(payload)
        .preInstructions([cbix])
        .accounts({
          user: provider.wallet.publicKey,
        })
        .rpc();

      console.log("Transaction signature:", tx);

      await printComputeUnitsUsed(provider, tx);
    } catch (error) {
      console.error("Error processing payload:", error);
      throw error; // Re-throw the error to fail the test
    }
  });

  it("Updates price accounts correctly", async () => {
    try {
      // Process the payload
      const tx = await program.methods
        .processRedstonePayload(payload)
        .preInstructions([cbix])
        .accounts({
          user: provider.wallet.publicKey,
        })
        .rpc();

      console.log("Transaction signature:", tx);

      const ethPriceData = deserializePriceData(
        (await provider.connection.getAccountInfo(ethPriceAccount)).data
      );
      const btcPriceData = deserializePriceData(
        (await provider.connection.getAccountInfo(btcPriceAccount)).data
      );
      const avaxPriceData = deserializePriceData(
        (await provider.connection.getAccountInfo(avaxPriceAccount)).data
      );
      const usdcPriceData = deserializePriceData(
        (await provider.connection.getAccountInfo(usdcPriceAccount)).data
      );
      const linkPriceData = deserializePriceData(
        (await provider.connection.getAccountInfo(linkPriceAccount)).data
      );

      expect(ethPriceData.feedId).to.equal("ETH");
      expect(btcPriceData.feedId).to.equal("BTC");
      expect(avaxPriceData.feedId).to.equal("AVAX");
      expect(usdcPriceData.feedId).to.equal("USDC");
      expect(linkPriceData.feedId).to.equal("LINK");

      expect(ethPriceData.value).to.not.equal("0");
      expect(btcPriceData.value).to.not.equal("0");
      expect(avaxPriceData.value).to.not.equal("0");
      expect(usdcPriceData.value).to.not.equal("0");
      expect(linkPriceData.value).to.not.equal("0");

      ethPriceData.feedId &&
        console.log("ETH Price Account Data:", ethPriceData);
      btcPriceData.feedId &&
        console.log("BTC Price Account Data:", btcPriceData);
      avaxPriceData.feedId &&
        console.log("AVAX Price Account Data:", avaxPriceData);
      usdcPriceData.feedId &&
        console.log("USDC Price Account Data:", usdcPriceData);
      linkPriceData.feedId &&
        console.log("LINK Price Account Data:", linkPriceData);

      await printComputeUnitsUsed(provider, tx);
    } catch (error) {
      console.error(
        "Error processing payload and verifying price accounts:",
        error
      );
      throw error;
    }
  });
});
