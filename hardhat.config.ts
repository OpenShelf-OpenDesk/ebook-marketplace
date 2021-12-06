require('@nomiclabs/hardhat-waffle');

module.exports = {
  networks: {
    ganache: {
      url: 'HTTP://127.0.0.1:7545',
      accounts: {
        mnemonic:
          'amount equip close excuse animal loyal extend diesel govern allow clock note',
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
