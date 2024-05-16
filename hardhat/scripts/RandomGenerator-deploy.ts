import hre from "hardhat";
import {
  AddressLike
} from "ethers";
import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
export type {
    TestRandomGenerator,
} from "../typechain-types";

import { expect } from "chai";
import {deployLuckyTokenGift} from "./LuckyTokenGift-deploy"

export async function deployRandomGenerator() {
  const [owner, otherAccount] = await hre.ethers.getSigners();

  const TestRandomGenerator = await hre.ethers.getContractFactory("TestRandomGenerator");
  const randomGenerator = await TestRandomGenerator.deploy();
  
  await randomGenerator.waitForDeployment();
  //const address = await myToken.getAddress();          
  //console.log('myToken address:',address);
  
  return randomGenerator;
}
