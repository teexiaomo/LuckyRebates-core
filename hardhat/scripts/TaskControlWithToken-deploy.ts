import hre from "hardhat";
import {deployLuckyTokenGift} from "./LuckyTokenGift-deploy"
import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
export type {
  TaskControlWithToken
} from "../typechain-types";

  export async function deployTaskControlWithToken() {
    const  luckyTokenGift  = await loadFixture(deployLuckyTokenGift);
    //const { myToken } = await deployMyToken();
    const luckyTokenGiftAddr = await luckyTokenGift.getAddress();

    const [owner, otherAccount] = await hre.ethers.getSigners();

    const TaskControl = await hre.ethers.getContractFactory("TaskControlWithToken");
    const taskControl = await TaskControl.deploy(luckyTokenGiftAddr,true,true);
    await taskControl.waitForDeployment();

    //const address = await taskControl.getAddress();
    //console.log('TaskControl address:',address);
    return taskControl;
}
