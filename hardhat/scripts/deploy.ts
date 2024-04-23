import hre from "hardhat";
import {deployMyToken} from "./MyToken-deploy"
import {deployTaskControlWithToken} from "./TaskControlWithToken-deploy"
import { deployRedEnvelope } from "./LuckyRedEnvelopeV2-deploy";
import { deployWhileListTask,bindTaskControl } from "./WhileListTask-deploy";
import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function deply(){
  const myToken = await loadFixture(deployMyToken);
  const myTokenAddr = await myToken.getAddress();          
  console.log('myToken address:',myTokenAddr);


  const luckyRedEnvelope =  await loadFixture(deployRedEnvelope);
  const luckyAddr = await luckyRedEnvelope.getAddress();
  console.log('luckyRedEnvelope address:',luckyAddr);

  const taskControl = await loadFixture(deployTaskControlWithToken);
  const taskControlAddr = await taskControl.getAddress();
  console.log('TaskControl address:',taskControlAddr);

  const whileListTask = await loadFixture(deployWhileListTask);
  const whileListTaskAddr = await whileListTask.getAddress();
  console.log('whileListTask address:',whileListTaskAddr);

  const rs = await loadFixture(bindTaskControl);
  const tx = await rs.getTransaction();
  console.log('bindTaskControl tx:',tx?.hash);
}


deply().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
    });