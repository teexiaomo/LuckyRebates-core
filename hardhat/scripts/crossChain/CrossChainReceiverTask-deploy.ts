import hre from "hardhat";

import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

export type {
    CrossChainReceiverTask,
    CrossChainSenderTaskControl,
} from "../../typechain-types";


import {TaskControlWithToken,deployTaskControlWithToken} from "../TaskControlWithToken-deploy"

import type {
    BigNumberish,
    AddressLike,
  } from "ethers";

let _router:AddressLike;    //目标链router
let _sourceChainSelector: BigNumberish; //源链selector
let _crossChainSenderTaskControl:AddressLike;   //  源链的跨链TaskControl地址

export async function deployCrossChainReceiverTask() {
    const  taskControl  = await loadFixture(deployTaskControlWithToken);

    const CrossChainReceiverTask = await hre.ethers.getContractFactory("CrossChainReceiverTask");
    const crossChainSenderTaskControl = await CrossChainReceiverTask.deploy(_router,await taskControl.getAddress());
    await crossChainSenderTaskControl.waitForDeployment();
    
    return crossChainSenderTaskControl;
}


export async function bindTaskControlWithToken(){
    const taskControl  = await loadFixture(deployTaskControlWithToken);
    const crossChainSenderTaskControl = await loadFixture(deployCrossChainReceiverTask);


    const rs = await taskControl.setTask(await crossChainSenderTaskControl.getAddress(),1);
    await rs.wait();

    return {crossChainSenderTaskControl,taskControl}
}


//绑定跨链任务
export async function setCrossChainSender() {
    const crossChainSenderTaskControl = await loadFixture(deployCrossChainReceiverTask);
    
    const rs = await crossChainSenderTaskControl.setCrossChainSender(_sourceChainSelector,_crossChainSenderTaskControl,true);
    await rs.wait();
    
    return crossChainSenderTaskControl;
}
