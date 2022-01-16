const hre = require("hardhat");
const fs = require("fs");

import { sf } from "../superfluid_config.json";

async function main() {
  // Types ------------------------------------------------------
  // const Types = await hre.ethers.getContractFactory("Types");
  // const TypesInstance = await Types.deploy();
  // await TypesInstance.deployed();
  // const TypesAddresss = TypesInstance.address;
  // console.log(`Types library deployed to : ${TypesAddresss}`);

  // Publisher ------------------------------------------------------
  const Publisher = await hre.ethers.getContractFactory("Publisher");
  const PublisherInstance = await hre.upgrades.deployProxy(Publisher);
  await PublisherInstance.deployed();
  const PublisherAddress = PublisherInstance.address;
  console.log(`Publisher deployed to : ${PublisherAddress}`);

  // Distributor ------------------------------------------------------
  const Distributor = await hre.ethers.getContractFactory("Distributor");
  const DistributorInstance = await hre.upgrades.deployProxy(Distributor, [
    sf.network.polytest.acceptedToken,
    PublisherAddress,
  ]);
  await DistributorInstance.deployed();
  const DistributorAddress = DistributorInstance.address;
  console.log(`Distributor deployed to : ${DistributorAddress}`);

  // Rentor ------------------------------------------------------
  const Rentor = await hre.ethers.getContractFactory("Rentor");
  const RentorInstance = await hre.upgrades.deployProxy(Rentor, [
    sf.network.polytest.host,
    sf.network.polytest.cfa,
    sf.network.polytest.acceptedToken,
    PublisherAddress,
  ]);
  await RentorInstance.deployed();
  const RentorAddress = RentorInstance.address;
  console.log(`Rentor deployed to : ${RentorAddress}`);

  // saving contract address to a file ----------------------------
  const contract_address = JSON.stringify({
    publisher: PublisherAddress,
    distributor: DistributorAddress,
    rentor: RentorAddress,
  });

  fs.writeFileSync(
    `${__dirname}/../new_contract_addresses.json`,
    contract_address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
