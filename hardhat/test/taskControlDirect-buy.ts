import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import {deployMyToken,TetherUSD} from "../scripts/MyToken-deploy"

import { deployRedEnvelope,LuckyRedEnvelopeV2 } from "../scripts/LuckyRedEnvelopeV2-deploy";
import { deployTaskControlDirect,TaskControlDirect } from "../scripts/TaskControlDirect-deploy";
import { deployEmptyTask,EmptyTask } from "../scripts/EmptyTask-deploy";
import { expect } from "chai";

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";


describe("task control direct: buy ticket", function (){
    let myToken:TetherUSD;
    let luckyRedEnvelope:LuckyRedEnvelopeV2;
    let taskControl:TaskControlDirect;
    let owner:HardhatEthersSigner;
    let otherAccount:HardhatEthersSigner;
    before(async function(){
        //初始化合约
        myToken = await loadFixture(deployMyToken);
        const addr1 = await myToken.getAddress();
        console.log('myToken address:',addr1);

        luckyRedEnvelope = await loadFixture(deployRedEnvelope);
        const addr2 = await luckyRedEnvelope.getAddress();
        console.log('redEnvelope address:',addr2);

        [owner,otherAccount] = await hre.ethers.getSigners();

        taskControl = await loadFixture(deployTaskControlDirect)
        
    });
    describe("bind task",function(){
        let emptyTask:EmptyTask;
        before(async function(){
            //部署具体任务：emptyTask：任意地址执行该合约即可
            emptyTask = await loadFixture(deployEmptyTask);
            const emptyTaskAddr = await emptyTask.getAddress();
            console.log('emptyTask address:',emptyTaskAddr);
            
            //绑定emptyTask到taskControl，设置权重为1
            const setTask = taskControl.setTask(emptyTaskAddr,1n);
            await expect(setTask).not.to.be.reverted;
            await (await setTask).wait();     
            
        });
        describe("redEnvelope",function(){
            let id:bigint;
            before(async function(){
                //授权用户地址向红包合约转账
                const luckyRedEnvelopeAddr = await luckyRedEnvelope.getAddress();
                const approveCall = myToken.approve(luckyRedEnvelopeAddr,1000000000);
                await expect(approveCall).not.to.be.reverted;
                await (await approveCall).wait() ;
    
                //给taskControl打点U
                //由于实际购注向红包转账方为taskControl，因此必须给taskControl转U
                const taskControlAddr = await taskControl.getAddress();
                const transferCall = myToken.transfer(taskControlAddr,1000000000);
                await expect(transferCall).not.to.be.reverted;
    
                await (await transferCall).wait();
    
                //创建buy模式红包
                const createRedEnvelopeCall = luckyRedEnvelope.createRedEnvelope(0n,0n,20n,0n);
                await expect(createRedEnvelopeCall).not.to.be.reverted;
                
                await (await createRedEnvelopeCall).wait();
    
                id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
                const balance = await myToken.balanceOf(owner);
                console.log('id:%d owner balance:%d',id,balance);
            });
            
            it("inject", async function () {    
                //owner捐赠10注
                const injectTickets = luckyRedEnvelope.injectTickets(id,10n);
                await expect(injectTickets).not.to.be.reverted;
                const recept = await (await injectTickets).wait();
                
                const balance = await myToken.balanceOf(owner);
                console.log('id:%d inject tx:%s owner balance:%d',id,recept?.hash,balance);
            });
            it("owner getTicket",async function () {
                const emptyTaskAddr = await emptyTask.getAddress()
                //将合约参数通过abi.encode处理后传入
                const data = hre.ethers.AbiCoder.defaultAbiCoder().encode(["uint256"],[10n]);
                //owner 执行任务，获取ticket
                const getTicket =  taskControl.getTicket(id,emptyTaskAddr,owner,data);
                await expect(getTicket).not.to.be.reverted;
                const recept = await (await getTicket).wait();
    
            });
    
            it("otherAccount getTicket",async function () {
                const emptyTaskAddr = await emptyTask.getAddress()
                //将合约参数通过abi.encode处理后传入
                const data = hre.ethers.AbiCoder.defaultAbiCoder().encode(["uint256"],[5n]);
                //otherAccount 执行任务，获取ticket
                const getTicket =  taskControl.connect(otherAccount).getTicket(id,emptyTaskAddr,otherAccount,data);
                
                await expect(getTicket).not.to.be.reverted;
                const recept = await (await getTicket).wait();
            });
    
        });
        
        
        describe("end redEnvelope",function(){
            it("end", async function (){
                //结束投注
                const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
                const endRedEnvelope = luckyRedEnvelope.endRedEnvelope(id);
    
                await expect(endRedEnvelope).not.to.be.reverted;
                const recept = await (await endRedEnvelope).wait();
    
                const ownerBalance = await myToken.balanceOf(owner)
                const otherAccountBalance = await myToken.balanceOf(otherAccount)
                
                console.log('id:%d end tx:%s owner Balance:%d otherAccount balance:%d',id,recept?.hash,ownerBalance,otherAccountBalance);
            });
        });
        describe("drawPrize redEnvelope",function(){
            //开奖
            it("drawPrize", async function () {
                const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
                const drawPrize = luckyRedEnvelope.drawPrize(id,0n);
                await expect(drawPrize).not.to.be.reverted;
                const recept = await (await drawPrize).wait();   
                
                const ownerBalance = await myToken.balanceOf(owner)
                const otherAccountBalance = await myToken.balanceOf(otherAccount)
    
    
                console.log('id:%d drawPrize tx:%s owner Balance:%d otherAccount balance:%d',id,recept?.hash,ownerBalance,otherAccountBalance);
            });
        });
    });
    
});