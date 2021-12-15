import chai from "chai";
import { solidity } from "ethereum-waffle";
chai.use(solidity);

const hardhat = require("hardhat");
const { ethers } = hardhat;
const { LazyMinter } = require("./lib");

async function deploy() {
  const [minter, redeemer, _] = await ethers.getSigners();

  let factory = await ethers.getContractFactory("eBookPublisher", minter);
  const contract = await factory.deploy(1, minter.address, 100, "abcdefg", 5);

  // the redeemerContract is an instance of the contract that's wired up to the redeemer's signing key
  const redeemerFactory = factory.connect(redeemer);
  const redeemerContract = redeemerFactory.attach(contract.address);
  return {
    minter,
    redeemer,
    contract,
    redeemerContract,
  };
}

describe("eBookPublisher", function () {
  it("Should deploy", async function () {
    const signers = await ethers.getSigners();
    const minter = signers[0].address;
    let factory = await ethers.getContractFactory("eBookPublisher");
    const contract = await factory.deploy(1, minter, 100, "abcdefg", 5);
    await contract.deployed();
  });

  it("Should redeem an NFT from a signed voucher", async function () {
    const { minter, redeemer, contract, redeemerContract } = await deploy();

    const lazyMinter = new LazyMinter({ contract, signer: minter });
    const voucher = await lazyMinter.createVoucher(1, redeemer.address, 0);
    await chai
      .expect(redeemerContract.redeem(voucher))
      .to.emit(contract, "TransferSingle") // transfer from null address to minter
      .withArgs(
        contract.address,
        "0x0000000000000000000000000000000000000000",
        minter.address,
        1,
        1
      )
      .and.to.emit(contract, "TransferSingle") // transfer from minter to redeemer
      .withArgs(contract.address, minter.address, redeemer.address, 1, 1);
  });

  // it("Should fail to redeem an NFT that's already been claimed", async function () {
  //   const { contract, redeemerContract, redeemer, minter } = await deploy();

  //   const lazyMinter = new LazyMinter({ contract, signer: minter });
  //   const voucher = await lazyMinter.createVoucher(
  //     1,
  //     "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
  //   );

  //   await expect(redeemerContract.redeem(redeemer.address, voucher))
  //     .to.emit(contract, "Transfer") // transfer from null address to minter
  //     .withArgs(
  //       "0x0000000000000000000000000000000000000000",
  //       minter.address,
  //       voucher.tokenId
  //     )
  //     .and.to.emit(contract, "Transfer") // transfer from minter to redeemer
  //     .withArgs(minter.address, redeemer.address, voucher.tokenId);

  //   await expect(
  //     redeemerContract.redeem(redeemer.address, voucher)
  //   ).to.be.revertedWith("ERC721: token already minted");
  // });

  // it("Should fail to redeem an NFT voucher that's signed by an unauthorized account", async function () {
  //   const { contract, redeemerContract, redeemer, minter } = await deploy();

  //   const signers = await ethers.getSigners();
  //   const rando = signers[signers.length - 1];

  //   const lazyMinter = new LazyMinter({ contract, signer: rando });
  //   const voucher = await lazyMinter.createVoucher(
  //     1,
  //     "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
  //   );

  //   await expect(
  //     redeemerContract.redeem(redeemer.address, voucher)
  //   ).to.be.revertedWith("Signature invalid or unauthorized");
  // });

  // it("Should fail to redeem an NFT voucher that's been modified", async function () {
  //   const { contract, redeemerContract, redeemer, minter } = await deploy();

  //   const signers = await ethers.getSigners();
  //   const rando = signers[signers.length - 1];

  //   const lazyMinter = new LazyMinter({ contract, signer: rando });
  //   const voucher = await lazyMinter.createVoucher(
  //     1,
  //     "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
  //   );
  //   voucher.tokenId = 2;
  //   await expect(
  //     redeemerContract.redeem(redeemer.address, voucher)
  //   ).to.be.revertedWith("Signature invalid or unauthorized");
  // });

  // it("Should fail to redeem an NFT voucher with an invalid signature", async function () {
  //   const { contract, redeemerContract, redeemer, minter } = await deploy();

  //   const signers = await ethers.getSigners();
  //   const rando = signers[signers.length - 1];

  //   const lazyMinter = new LazyMinter({ contract, signer: rando });
  //   const voucher = await lazyMinter.createVoucher(
  //     1,
  //     "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
  //   );

  //   const dummyData = ethers.utils.randomBytes(128);
  //   voucher.signature = await minter.signMessage(dummyData);

  //   await expect(
  //     redeemerContract.redeem(redeemer.address, voucher)
  //   ).to.be.revertedWith("Signature invalid or unauthorized");
  // });

  // it("Should redeem if payment is >= minPrice", async function () {
  //   const { contract, redeemerContract, redeemer, minter } = await deploy();

  //   const lazyMinter = new LazyMinter({ contract, signer: minter });
  //   const minPrice = ethers.constants.WeiPerEther; // charge 1 Eth
  //   const voucher = await lazyMinter.createVoucher(
  //     1,
  //     "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  //     minPrice
  //   );

  //   await expect(
  //     redeemerContract.redeem(redeemer.address, voucher, { value: minPrice })
  //   )
  //     .to.emit(contract, "Transfer") // transfer from null address to minter
  //     .withArgs(
  //       "0x0000000000000000000000000000000000000000",
  //       minter.address,
  //       voucher.tokenId
  //     )
  //     .and.to.emit(contract, "Transfer") // transfer from minter to redeemer
  //     .withArgs(minter.address, redeemer.address, voucher.tokenId);
  // });

  // it("Should fail to redeem if payment is < minPrice", async function () {
  //   const { contract, redeemerContract, redeemer, minter } = await deploy();

  //   const lazyMinter = new LazyMinter({ contract, signer: minter });
  //   const minPrice = ethers.constants.WeiPerEther; // charge 1 Eth
  //   const voucher = await lazyMinter.createVoucher(
  //     1,
  //     "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  //     minPrice
  //   );

  //   const payment = minPrice.sub(10000);
  //   await expect(
  //     redeemerContract.redeem(redeemer.address, voucher, { value: payment })
  //   ).to.be.revertedWith("Insufficient funds to redeem");
  // });

  // it("Should make payments available to minter for withdrawal", async function () {
  //   const { contract, redeemerContract, redeemer, minter } = await deploy();

  //   const lazyMinter = new LazyMinter({ contract, signer: minter });
  //   const minPrice = ethers.constants.WeiPerEther; // charge 1 Eth
  //   const voucher = await lazyMinter.createVoucher(
  //     1,
  //     "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  //     minPrice
  //   );

  //   // the payment should be sent from the redeemer's account to the contract address
  //   await expect(
  //     await redeemerContract.redeem(redeemer.address, voucher, {
  //       value: minPrice,
  //     })
  //   ).to.changeEtherBalances(
  //     [redeemer, contract],
  //     [minPrice.mul(-1), minPrice]
  //   );

  //   // minter should have funds available to withdraw
  //   expect(await contract.availableToWithdraw()).to.equal(minPrice);

  //   // withdrawal should increase minter's balance
  //   await expect(await contract.withdraw()).to.changeEtherBalance(
  //     minter,
  //     minPrice
  //   );

  //   // minter should now have zero available
  //   expect(await contract.availableToWithdraw()).to.equal(0);
  // });
});
