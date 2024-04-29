import { BigNumber, ethers } from "ethers";
import { swapContract, tokenContract } from "./contract";
import { toEth, toWei } from "./ether-utils";

export const swapEthToToken = async(tokenName, amount) => {
  try {
    let tx = { value: toWei(amount) };

    const contractObj = await swapContract();
    const data = await contractObj.swapEthToToken(tokenName, tx);

    const receipt = await data.wait();
    return receipt;
  } catch (e) {
    return parseErrorMsg(e);
  }
}

export async function hasValidAllowance(owner, tokenName, amount) {
  try {
    /* const contractObj = await contract();
    const address = await contractObj.getTokenAddress(tokenName); */

    const tokenContractObj = await tokenContract();
    const data = await tokenContractObj.allowance(
      owner,
      "0x6D2452E0F1A5a7C90611e1F4Dfa4017C43C5b28C"
    );

    const result = BigNumber.from(data.toString()).gte(
      BigNumber.from(toWei(amount))
    );

    return result;
  } catch (e) {
    return parseErrorMsg(e);
  }
}

export async function swapTokenToEth(tokenName, amount) {
  try {
    const contractObj = await swapContract();
    const data = await contractObj.swapTokenToEth(tokenName, toWei(amount));

    const receipt = await data.wait();
    return receipt;
  } catch (e) {
    return parseErrorMsg(e);
  }
}


export async function getTokenBalance(tokenName, address) {
  const contractObj = await swapContract();
  const balance = contractObj.getBalance(tokenName, address);
  return balance;
}

export async function getTokenAddress(tokenName) {
  try {
    const contractObj = await contract();
    const address = await contractObj.getTokenAddress(tokenName);
    return address;
  } catch (e) {
    return parseErrorMsg(e);
  }
}

export async function increaseAllowance(tokenName, amount) {
  try {
    /* const contractObj = await contract();
    const address = await contractObj.getTokenAddress(tokenName); */

    const tokenContractObj = await tokenContract();
    const data = await tokenContractObj.approve(
      "0x6D2452E0F1A5a7C90611e1F4Dfa4017C43C5b28C",
      toWei(amount)
    );

    const receipt = await data.wait();
    return receipt;
  } catch (e) {
    return parseErrorMsg(e);
  }
}

// function toWei(amount) {
//   const toWei = ethers.utils.parseUnits(amount.toString());
//   return toWei.toString();
// }

function parseErrorMsg(e) {
  const json = JSON.parse(JSON.stringify(e));
  return json?.reason || json?.error?.message;
}
