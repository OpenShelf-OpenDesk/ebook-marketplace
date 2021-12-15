import SuperfluidSDK from "@superfluid-finance/js-sdk";
import { Web3Provider } from "@ethersproject/providers";
import BigNumber from "bignumber.js";

let sf;

export const initializeSF = async () => {
  sf = new SuperfluidSDK.Framework({
    ethers: new Web3Provider(window.ethereum),
    tokens: ["MATIC"],
  });
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

export async function createFlow(
  _sender,
  _recipient,
  _flowrate: number,
  userData
) {
  const tx = await _sender.flow({
    recipient: _recipient,
    flowRate: String(calculateFlowrateInSeconds(_flowrate)),
    userData: userData,
  });
  return tx;
}

export async function deleteFlow(_sender, _recipient, userData) {
  const tx = await _sender.flow({
    recipient: _recipient,
    flowRate: "0",
    userData,
  });
  return tx;
}

export async function editFlow(_sender, _recipient, _newFlowrate: number) {
  const tx = await _sender.flow({
    recipient: _recipient,
    flowRate: String(calculateFlowrateInSeconds(_newFlowrate)),
  });
  return tx;
}

export function calculateFlowrateInSeconds(monthlyFlowrate) {
  const frm = new BigNumber(monthlyFlowrate).shiftedBy(18);
  const frs = Number(frm) / (86400 * 30);
  return Math.floor(frs);
}
