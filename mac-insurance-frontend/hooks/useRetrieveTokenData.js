import { ethers } from "ethers";
import ethLogo from "../public/ethLogo.png";
import daiLogo from "../public/dai-logo.png";
import usdcLogo from "../public/usdc-logo.png";
import snxLogo from "../public/snx-logo.png";

export const useRetrieveTokenData = (tokenAddress) => {
  const tokenData = {
    name: "",
    logo: "",
  };
  const checkSumAddress = ethers.utils.getAddress(tokenAddress);
  switch (checkSumAddress) {
    case "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735":
      tokenData.name = "DAI";
      tokenData.logo = daiLogo;
      break;
    case "0xc778417E063141139Fce010982780140Aa0cD5Ab":
      tokenData.name = "WETH";
      tokenData.logo = ethLogo;
      break;
    case "0xeb8f08a975Ab53E34D8a0330E0D34de942C95926":
      tokenData.name = "USDC";
      tokenData.logo = usdcLogo;
      break;
    case "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b":
      tokenData.name = "USDC";
      tokenData.logo = usdcLogo;
      break;
    case "0xc778417E063141139Fce010982780140Aa0cD5Ab":
      tokenData.name = "SNX";
      tokenData.logo = snxLogo;
      break;
    default:
      break;
  }
  return tokenData;
};
