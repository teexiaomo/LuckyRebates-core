import hre from "hardhat";
import {deployMyToken} from "./MyToken-deploy"
import {deployTaskControl} from "./TaskControl-deploy"
import { deployRedEnvelope } from "./LuckyRedEnvelopeV2-deploy";
import { deployWhileListTask,bindTaskControl } from "./WhileListTask-deploy";
import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function deply(){
    await loadFixture(deployMyToken);
    await loadFixture(deployRedEnvelope);
    await loadFixture(deployTaskControl);
    await loadFixture(deployWhileListTask);
    await loadFixture(bindTaskControl);
}


deply().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
    });