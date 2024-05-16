import hre from "hardhat";

import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import {deployEmptyTask} from "../task/EmptyTask-deploy"
export type {
    CrossChainReceiverTask,
} from "../../typechain-types";

import type {
    BigNumberish,
    AddressLike,
  } from "ethers";

let _router:AddressLike;    //源链router
let _link:AddressLike;      //源链link代币地址
let _destinationChainSelector: BigNumberish;    //目标链selector
let _controlReceiverTask: AddressLike;  //目标链的跨链任务地址



export async function deployCrossChainSenderTaskControl() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const CrossChainSenderTaskControl = await hre.ethers.getContractFactory("CrossChainSenderTaskControl");
    const crossChainSenderTaskControl = await CrossChainSenderTaskControl.deploy(_router,_link,_destinationChainSelector,_controlReceiverTask);
    await crossChainSenderTaskControl.waitForDeployment();
    
    return crossChainSenderTaskControl;
}



//绑定跨链任务
export async function bindEmptyTask() {

    const  emptyTask  = await loadFixture(deployEmptyTask);
    const  crossChainSenderTaskControl  = await loadFixture(deployCrossChainSenderTaskControl);
    
    const emptyTaskAddress = await emptyTask.getAddress();
    const rs = await crossChainSenderTaskControl.setTask(emptyTaskAddress,1);
    await rs.wait();
    
    return {emptyTask,crossChainSenderTaskControl};
}
