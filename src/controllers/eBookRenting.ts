const SuperfluidSDK = require("@superfluid-finance/js-sdk");
import { Web3Provider } from "@ethersproject/providers";

const sf = new SuperfluidSDK.Framework({
  ethers: new Web3Provider(window.ethereum),
  // tokens: ["MATIC"],
});

const initializeSF = async () => {
  await sf.initialize();
};
initializeSF();

export function createUser(_walletAddress: string, _tokenAddress: string) {
  const newUser = sf.user({ address: _walletAddress, token: _tokenAddress });
  return newUser;
}

export async function createFlow(_sender, _recipient, _flowrate: number) {
  const tx = await _sender.flow({ recipient: _recipient, flowRate: _flowrate });
}

export async function deleteFlow(_sender, _recipient, _flowrate: number) {
  const tx = await _sender.flow({ recipient: _recipient, flowRate: 0 });
}

export async function editFlow(_sender, _recipient, _newFlowrate: number) {
  const tx = await _sender.flow({
    recipient: _recipient,
    flowRate: _newFlowrate,
  });
}

export default sf;
