import hre from "hardhat";
import {
  AddressLike
} from "ethers";
import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
export type {
  TetherUSD,
} from "../typechain-types";

import { expect } from "chai";

export async function deployTetherUSD() {
  const [owner, otherAccount] = await hre.ethers.getSigners();

  const TetherUSD = await hre.ethers.getContractFactory("TetherUSD");
  const tetherUSD = await TetherUSD.deploy(owner);
  
  await tetherUSD.waitForDeployment();
  //const address = await myToken.getAddress();          
  //console.log('myToken address:',address);
  
  return tetherUSD;
}

/*
//执行部署
deployMyToken().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
  });
*/