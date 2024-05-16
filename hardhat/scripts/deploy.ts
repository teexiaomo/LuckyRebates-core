import hre from "hardhat";
import {deployTetherUSD} from "./TetherUSD-deploy"
import {deployTaskControlWithToken} from "./TaskControlWithToken-deploy"
import { deployLuckyTokenGift } from "./LuckyTokenGift-deploy";
import { deployWhileListTask,bindTaskControl } from "./task/WhileListTask-deploy";
import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function deply(){
  const tetherUSD = await loadFixture(deployTetherUSD);
  const tetherUSDAddr = await tetherUSD.getAddress();          
  console.log('tetherUSD address:',tetherUSDAddr);

  let luckyTokenGift = await loadFixture(deployLuckyTokenGift);
  const luckyTokenGiftAddr = await luckyTokenGift.getAddress();
  console.log('luckyTokenGift address:',luckyTokenGiftAddr);

  const taskControl = await loadFixture(deployTaskControlWithToken);
  const taskControlAddr = await taskControl.getAddress();
  console.log('TaskControl address:',taskControlAddr);

  const whileListTask = await loadFixture(deployWhileListTask);
  const whileListTaskAddr = await whileListTask.getAddress();
  console.log('whileListTask address:',whileListTaskAddr);

}


deply().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
    });