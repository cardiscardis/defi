import { ethers } from "ethers";
import JudeABI from "./Jude.json";
import JudeSwapABI from "./JudeSwap.json";

// const address = "0x6D2452E0F1A5a7C90611e1F4Dfa4017C43C5b28C";

export const tokenContract = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const { ethereum } = window;

  if (ethereum) {
    const signer = provider.getSigner();

    const contractReader = new ethers.Contract(
      process.env.JUDE_TOKEN_ADDRESS || '0x3253179cb19925be07fA3B1F9E7437a9b1eF1a4e',
      JudeABI.abi, signer
    );

    return contractReader;
  }
};

export const swapContract = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const { ethereum } = window;

  if (ethereum) {
    const signer = provider.getSigner();

    const contractReader = new ethers.Contract(
      process.env.JUDE_SWAP_ADDRESS || '0x7DEC610cb11472adC2AABDb2a4C85D7eF935c8BF',
      JudeSwapABI.abi,
      signer
    );


    return contractReader;
  }
};
