require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: __dirname + "/.env" });

module.exports = {
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      accounts: {
        mnemonic:
          "feature mushroom junk smart leaf merry manual ball waste lunar toddler decrease",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
      },

      chainId: 1337,
    },
    polytest: {
      url: `${process.env.MUMBAI_ALCHEMY_URL}`, // using alchemy instead of moralis. add your own URL in .env
      gasPrice: 1000000000,
      accounts: [`0x${process.env.MUMBAI_DEPLOYER_PRIV_KEY}`],
    },
  },
  solidity: "0.8.4",
};

export {};
