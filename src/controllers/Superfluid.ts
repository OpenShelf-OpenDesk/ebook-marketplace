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

export async function createFlow(_sender, _recipient, _flowrate: number) {
  const tx = await _sender.flow({
    recipient: _recipient,
    flowRate: String(calculateFlowrateInSeconds(_flowrate)),
  });
  return tx;
}

export async function deleteFlow(_sender, _recipient) {
  const tx = await _sender.flow({ recipient: _recipient, flowRate: 0 });
  return tx;
}

export async function editFlow(_sender, _recipient, _newFlowrate: number) {
  const tx = await _sender.flow({
    recipient: _recipient,
    flowRate: String(calculateFlowrateInSeconds(_newFlowrate)),
  });
  return tx;
}

export function formatPrice(_price: number) {
  return (Math.round(_price * 100) / 100).toFixed(2);
}

export function calculateFlowrateInSeconds(_monthlyFlowrate) {
  const _frm = new BigNumber(_monthlyFlowrate).shiftedBy(18);
  const _frs = _frm / (86400 * 30);
  return Math.floor(_frs);
}
