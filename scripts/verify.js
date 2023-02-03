async function main() {
  const oneYear = 365 * 24 * 60 * 60;
  const heirAddress = "0x45ddc3e6486b793f7cbf69060aba4652724a42c6";
  const args = [heirAddress, oneYear];
  const heritageAddress = "0xE3c7AbdaB482773381c823F823e1ccEF198A9809";
  const chainId = network.config.chainId;

  if (chainId !== 31337 && process.env.ETHERSCAN_KEY) {
    console.log("Verifying contract ...");
    try {
      await run("verify:verify", {
        address: heritageAddress,
        constructorArguments: args,
      });
    } catch (e) {
      if (e.message.toLowerCase().includes("already verified")) {
        console.log("Already verified!");
      } else {
        console.log(e);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
