async function main() {
  const oneYear = 365 * 24 * 60 * 60;
  const amount = ethers.utils.parseEther("0.1");

  const signers = await ethers.getSigners();
  const appointer = signers[0];
  const chainId = network.config.chainId;
  let heirAddress;
  if (chainId === 31337 && signers.length > 1) {
    heirAddress = signers[1].address;
  } else {
    heirAddress = "0x45ddc3e6486b793f7cbf69060aba4652724a42c6";
  }

  const Heritage = await ethers.getContractFactory("Heritage");
  const args = [heirAddress, oneYear];
  const heritage = await Heritage.deploy(...args, { value: amount });

  await heritage.deployed();

  const balance = ethers.utils.formatUnits(await ethers.provider.getBalance(heritage.address));
  const timeAlive = (await heritage.timeAlive()) / (60 * 60 * 24);
  const APPOINTER_ROLE = await heritage.APPOINTER_ROLE();
  const HEIR_ROLE = await heritage.HEIR_ROLE();

  console.log(
    `Heritage deployed to ${heritage.address} with ${balance} ETH for ${timeAlive} days`
  );
  if (await heritage.hasRole(APPOINTER_ROLE, appointer.address)) {
    console.log("Appointer:", appointer.address);
  }
  if (await heritage.hasRole(HEIR_ROLE, heirAddress)) {
    console.log("Heir:", heirAddress);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
