const hre = require("hardhat");
const fs = require("fs");

import { sf } from "../superfluid_config.json";

export async function main() {
  // eBookDonator -------------------------------------------------------
  const eBookDonatorContract = await hre.ethers.getContractFactory(
    "eBookDonator"
  );
  const eBookDonator = await eBookDonatorContract.deploy();

  await eBookDonator.deployed();
  const eBookDonatorContractAddress = eBookDonator.address;
  console.log(`eBookDonator deployed to : ${eBookDonatorContractAddress}`);

  // eBookRenter -------------------------------------------------------
  const eBookRenterContract = await hre.ethers.getContractFactory(
    "eBookRenting"
  );
  const eBookRenter = await eBookRenterContract.deploy(
    sf.network.polytest.host,
    sf.network.polytest.cfa,
    sf.network.polytest.acceptedToken
  );

  await eBookRenter.deployed();
  const eBookRenterContractAddress = eBookRenter.address;
  console.log(`eBookRenter deployed to : ${eBookRenterContractAddress}`);

  // StorageStructures -------------------------------------------------------
  const StorageStructuresContract = await hre.ethers.getContractFactory(
    "StorageStructures"
  );
  const StorageStructures = await StorageStructuresContract.deploy(
    eBookDonatorContractAddress,
    eBookRenterContractAddress
  );
  await StorageStructures.deployed();
  const StorageStructuresContractAddress = StorageStructures.address;
  console.log(
    `StorageStructures deployed to : ${StorageStructuresContractAddress}`
  );

  // eBookMarketLaunch -------------------------------------------------------
  const eBookMarketLaunchContract = await hre.ethers.getContractFactory(
    "eBookMarketLaunch"
  );
  const eBookMarketLaunch = await eBookMarketLaunchContract.deploy(
    StorageStructuresContractAddress
  );
  const eBookMarketLaunchContractAddress = eBookMarketLaunch.address;
  console.log(
    `eBookMarketLaunch deployed to : ${eBookMarketLaunchContractAddress}`
  );

  // eBookExchange ------------------------------------------------------
  const eBookExchangeContract = await hre.ethers.getContractFactory(
    "eBookExchange"
  );
  const eBookExchange = await eBookExchangeContract.deploy(
    StorageStructuresContractAddress
  );
  const eBookExchangeContractAddress = eBookExchange.address;
  console.log(`eBookExchange deployed to : ${eBookExchangeContractAddress}`);

  // saving contract address to a file

  const contract_address = JSON.stringify({
    eBookDonator: eBookDonatorContractAddress,
    eBookRenter: eBookRenterContractAddress,
    StorageStructures: StorageStructuresContractAddress,
    eBookMarketLaunch: eBookMarketLaunchContractAddress,
    eBookExchange: eBookExchangeContractAddress,
  });

  fs.writeFileSync(`${__dirname}/../contract_address.json`, contract_address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
