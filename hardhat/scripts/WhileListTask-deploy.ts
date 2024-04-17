import hre from "hardhat";
import {deployTaskControl} from "./TaskControl-deploy"
import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";

  export async function deployWhileListTask() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const WhileListTask = await hre.ethers.getContractFactory("WhileListTask");
    const whileListTask = await WhileListTask.deploy([owner]);
    await whileListTask.waitForDeployment();


    const address = await whileListTask.getAddress();
    console.log('whileListTask address:',address);

    return { whileListTask, owner, otherAccount };
}
export async function bindTaskControl(){
    const { whileListTask } = await loadFixture(deployWhileListTask);
    const { taskControl } = await loadFixture(deployTaskControl);
    
    const whileListTaskAddress = await whileListTask.getAddress();
    const rs = await taskControl.setTask(whileListTaskAddress,1);
    const tx = await rs.getTransaction();
    rs.wait();
    console.log('bindTaskControl tx:',tx?.hash);
}

//执行部署
/*
bindTaskControl().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
    });
*/
