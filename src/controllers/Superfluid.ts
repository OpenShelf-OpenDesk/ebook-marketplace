const SuperfluidSDK = require("@superfluid-finance/js-sdk");
import { Web3Provider } from "@ethersproject/providers";

const sf = new SuperfluidSDK.Framework({
  ethers: new Web3Provider(window.ethereum),
  tokens: ["MATIC"],
});

export const initializeSF = async () => {
  await sf.initialize();
  return sf;
};

export function createUser(_walletAddress: string) {
  const newUser = sf.user({
    address: _walletAddress,
    token: sf.tokens.MATICx.address,
  });
  return newUser;
}

export async function createFlow(_sender, _recipient, _flowrate: string) {
  const tx = await _sender.flow({ recipient: _recipient, flowRate: _flowrate });
  return tx;
}

export async function deleteFlow(_sender, _recipient) {
  const tx = await _sender.flow({ recipient: _recipient, flowRate: 0 });
  return tx;
}

export async function editFlow(_sender, _recipient, _newFlowrate: string) {
  const tx = await _sender.flow({
    recipient: _recipient,
    flowRate: _newFlowrate,
  });
  return tx;
}
