require('@nomiclabs/hardhat-waffle');

module.exports = {
  networks: {
    ganache: {
      url: 'HTTP://127.0.0.1:8545',
      accounts: {
        mnemonic:
          'throw palm spice hurt grain govern firm damage case inquiry plug crucial',
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },

      chainId: 1337,
    },
  },
  solidity: '0.8.4',
};

export {};
