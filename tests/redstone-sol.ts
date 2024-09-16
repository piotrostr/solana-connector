import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RedstoneSol } from "../target/types/redstone_sol";

const samplePayload = Buffer.from([
  69, 84, 72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 53, 139, 198, 94, 186, 1, 145, 250, 215, 39, 80, 0, 0,
  0, 32, 0, 0, 1, 40, 49, 160, 188, 190, 210, 82, 196, 33, 178, 129, 227, 9, 1,
  51, 195, 187, 158, 154, 2, 182, 71, 218, 23, 125, 221, 218, 91, 112, 152, 88,
  76, 13, 224, 16, 182, 62, 14, 156, 245, 159, 57, 135, 252, 143, 172, 252, 250,
  15, 16, 43, 6, 52, 174, 129, 107, 80, 1, 83, 154, 83, 32, 236, 87, 28, 69, 84,
  72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 53, 139, 198, 94, 186, 1, 145, 250, 215, 39, 80, 0, 0, 0, 32,
  0, 0, 1, 177, 94, 90, 215, 134, 137, 220, 206, 94, 5, 80, 44, 91, 40, 0, 255,
  142, 82, 95, 11, 60, 28, 65, 210, 100, 246, 197, 137, 228, 127, 50, 15, 89,
  114, 242, 247, 44, 4, 150, 175, 66, 43, 169, 46, 59, 201, 192, 217, 59, 209,
  57, 229, 218, 77, 49, 195, 95, 160, 168, 142, 106, 251, 17, 87, 28, 69, 84,
  72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 53, 139, 198, 94, 186, 1, 145, 250, 215, 39, 80, 0, 0, 0, 32,
  0, 0, 1, 1, 92, 196, 231, 113, 229, 120, 160, 145, 176, 34, 176, 14, 172, 122,
  210, 135, 180, 157, 84, 183, 61, 49, 59, 20, 6, 191, 7, 38, 214, 180, 223,
  107, 144, 135, 252, 236, 12, 158, 61, 42, 75, 16, 212, 210, 239, 188, 175,
  172, 173, 178, 62, 22, 218, 188, 183, 176, 245, 10, 5, 5, 0, 72, 181, 28, 66,
  84, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 5, 82, 224, 146, 57, 16, 1, 145, 250, 215, 39, 80, 0, 0, 0,
  32, 0, 0, 1, 142, 125, 197, 90, 35, 179, 39, 241, 19, 67, 229, 96, 223, 173,
  193, 139, 213, 182, 231, 216, 45, 145, 249, 233, 99, 44, 170, 157, 220, 21,
  58, 195, 46, 67, 113, 255, 175, 12, 70, 156, 143, 108, 91, 66, 67, 155, 224,
  219, 11, 26, 159, 38, 253, 60, 122, 225, 87, 90, 117, 82, 223, 172, 64, 243,
  28, 66, 84, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 5, 82, 224, 146, 57, 16, 1, 145, 250, 215, 39, 80, 0,
  0, 0, 32, 0, 0, 1, 73, 94, 75, 49, 141, 252, 182, 6, 68, 9, 200, 215, 45, 84,
  209, 192, 11, 252, 154, 59, 176, 106, 5, 32, 152, 83, 151, 145, 141, 161, 108,
  41, 78, 130, 24, 117, 99, 122, 0, 125, 57, 126, 15, 193, 119, 153, 49, 1, 129,
  140, 130, 37, 95, 169, 211, 116, 207, 219, 249, 173, 202, 197, 152, 73, 27,
  66, 84, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 5, 82, 224, 146, 57, 16, 1, 145, 250, 215, 39, 80, 0, 0,
  0, 32, 0, 0, 1, 33, 52, 144, 158, 29, 191, 194, 14, 229, 62, 39, 22, 140, 42,
  134, 254, 202, 208, 132, 169, 208, 143, 203, 78, 114, 40, 79, 187, 26, 82,
  242, 45, 59, 19, 9, 152, 185, 55, 43, 52, 23, 7, 137, 146, 141, 170, 110, 134,
  225, 149, 165, 35, 142, 128, 102, 171, 233, 42, 101, 203, 15, 79, 189, 134,
  27, 0, 6, 0, 0, 0, 0, 0, 2, 237, 87, 1, 30, 0, 0,
]);

describe("redstone-sol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RedstoneSol as Program<RedstoneSol>;

  it.skip("Processes Redstone payload successfully", async () => {
    try {
      // Process the payload
      const cbix = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
        units: 10 ** 6,
      });
      const tx = await program.methods
        .processRedstonePayload(samplePayload)
        .preInstructions([cbix])
        .accounts({
          user: anchor.AnchorProvider.env().wallet.publicKey,
        })
        .rpc();

      console.log("sig:", tx);
    } catch (error) {
      console.error("Error processing payload:", error);
      throw error; // Re-throw the error to fail the test
    }
  });

  it("Updates price accounts correctly", async () => {
    try {
      const cbix = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
        units: 10 ** 6,
      });

      // Derive price account addresses
      const [ethPriceAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("price"), Buffer.from("ETH")],
        program.programId
      );

      const [btcPriceAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("price"), Buffer.from("BTC")],
        program.programId
      );

      // Process the payload
      const tx = await program.methods
        .processRedstonePayload(samplePayload)
        .preInstructions([cbix])
        .accounts({
          user: provider.wallet.publicKey,
        })
        .remainingAccounts([
          { pubkey: ethPriceAccount, isWritable: true, isSigner: false },
          { pubkey: btcPriceAccount, isWritable: true, isSigner: false },
        ])
        .rpc();

      console.log("Transaction signature:", tx);

      // Fetch and verify the updated price accounts
      // console.log("ETH price:", ethPriceData.value.toString());
      // console.log("BTC price:", btcPriceData.value.toString());
      // console.log("ETH timestamp:", ethPriceData.timestamp.toString());
      // console.log("BTC timestamp:", btcPriceData.timestamp.toString());
    } catch (error) {
      console.error(
        "Error processing payload and verifying price accounts:",
        error
      );
      throw error;
    }
  });
});
