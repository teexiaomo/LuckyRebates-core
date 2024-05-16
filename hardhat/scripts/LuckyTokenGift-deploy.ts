import hre from "hardhat";
import {
  AddressLike
} from "ethers";
import {deployTetherUSD} from "./TetherUSD-deploy"
import {deployRandomGenerator} from "./RandomGenerator-deploy"
import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
export type {
  LuckyTokenGift
} from "../typechain-types";

export async function deployLuckyTokenGift() {
    const  tetherUSD  = await loadFixture(deployTetherUSD);
    const  randomGenerator = await loadFixture(deployRandomGenerator);

    const [owner, otherAccount] = await hre.ethers.getSigners();

    const LuckyTokenGift = await hre.ethers.getContractFactory("LuckyTokenGift");
    const luckyTokenGift = await LuckyTokenGift.deploy(await tetherUSD.getAddress(),1000000n,await randomGenerator.getAddress());
    await luckyTokenGift.waitForDeployment();
    
    return luckyTokenGift;
}

