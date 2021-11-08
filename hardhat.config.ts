require('@nomiclabs/hardhat-waffle');

module.exports = {
  networks: {
    ganache: {
      url: 'HTTP://127.0.0.1:7545',
      accounts: {
        mnemonic:
          'job spice hotel chunk kitchen spring enhance acoustic rent nerve cave advance',
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
      },

      chainId: 1337,
    },
  },
  solidity: '0.8.4',
};

export {};
