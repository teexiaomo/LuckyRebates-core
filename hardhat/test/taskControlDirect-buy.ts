import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import {deployTetherUSD,TetherUSD} from "../scripts/TetherUSD-deploy"
import {deployRandomGenerator,TestRandomGenerator} from "../scripts/RandomGenerator-deploy"
import { LuckyTokenGift,deployLuckyTokenGift } from "../scripts/LuckyTokenGift-deploy";
import { deployTaskControlDirect,TaskControlDirect } from "../scripts/TaskControlDirect-deploy";
import { deployEmptyTask,EmptyTask } from "../scripts/task/EmptyTask-deploy";
import { expect } from "chai";

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";


describe("task control direct: buy ticket", function (){
    let usdt:TetherUSD;
    let luckyTokenGift:LuckyTokenGift;
    let randomGenerator:TestRandomGenerator;
    let taskControl:TaskControlDirect;
    let owner:HardhatEthersSigner;
    let otherAccount:HardhatEthersSigner;
    before(async function(){
        
        //初始化合约
        usdt = await loadFixture(deployTetherUSD);
        const addr1 = await usdt.getAddress()
        console.log('usdt address:',addr1);

        randomGenerator = await loadFixture(deployRandomGenerator);
        const addr2 = await randomGenerator.getAddress();
        console.log('randomGenerator address:',addr2);
        
        luckyTokenGift = await loadFixture(deployLuckyTokenGift);
        const addr3 = await luckyTokenGift.getAddress();
        console.log('tokenGift address:',addr3);

        taskControl = await loadFixture(deployTaskControlDirect);
        const addr4 = await luckyTokenGift.getAddress();
        console.log('taskControl address:',addr4);

        await (await randomGenerator.setOperatorAddressList(await luckyTokenGift.getAddress(),true)).wait();

        [owner,otherAccount] = await hre.ethers.getSigners();
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
        describe("tokenGift",function(){
            let id:bigint;
            before(async function(){
                //授权用户地址向红包合约转账,捐赠用
                const luckyTokenGiftAddr = await luckyTokenGift.getAddress();
                const approveCall = usdt.approve(luckyTokenGiftAddr,1000000000);
                await expect(approveCall).not.to.be.reverted;
                await (await approveCall).wait();
    
                //给taskControl打点U
                //由于实际购注向红包转账方为taskControl，因此必须给taskControl转U
                const taskControlAddr = await taskControl.getAddress();
                const transferCall = usdt.transfer(taskControlAddr,1000000000);
                await expect(transferCall).not.to.be.reverted;
    
                await (await transferCall).wait();
    
                //创建buy模式红包
                const createTokenGiftCall = luckyTokenGift.createTokenGift(0n,0n,20n,0n);
                await expect(createTokenGiftCall).not.to.be.reverted;
                
                await (await createTokenGiftCall).wait();
    
                id = await luckyTokenGift.viewCurrentTokenGiftId();
                const balance = await usdt.balanceOf(owner);
                console.log('id:%d owner balance:%d',id,balance);
            });
            
            it("inject", async function () {    
                //owner捐赠10注
                const injectTickets = luckyTokenGift.injectTickets(id,10n);
                await expect(injectTickets).not.to.be.reverted;
                const recept = await (await injectTickets).wait();
                
                const balance = await usdt.balanceOf(owner);
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
        
        
        describe("end tokenGift",function(){
            it("end", async function (){
                //结束投注
                const id = await luckyTokenGift.viewCurrentTokenGiftId();
                const endTokenGift = luckyTokenGift.endTokenGift(id);
    
                await expect(endTokenGift).not.to.be.reverted;
                const recept = await (await endTokenGift).wait();
    
                const ownerBalance = await usdt.balanceOf(owner)
                const otherAccountBalance = await usdt.balanceOf(otherAccount)
                
                console.log('id:%d end tx:%s owner Balance:%d otherAccount balance:%d',id,recept?.hash,ownerBalance,otherAccountBalance);
            });
            it("fulfillRandomWords", async function (){
                //注入随机数
                const id = await luckyTokenGift.viewCurrentTokenGiftId();
                
                const fulfillRandomWords = randomGenerator.fulfillRandomWords(id,[1234567n]);
                
                await expect(fulfillRandomWords).not.to.be.reverted;
                const recept = await (await fulfillRandomWords).wait();
                
                console.log('id:%d fulfillRandomWords tx:%s ',id,recept?.hash);
            });
        });
        describe("drawPrize tokenGift",function(){
            //开奖
            it("drawPrize", async function () {
                const id = await luckyTokenGift.viewCurrentTokenGiftId();
                const drawPrize = luckyTokenGift.drawPrize(id,0n);
                await expect(drawPrize).not.to.be.reverted;
                const recept = await (await drawPrize).wait();   
                
                const ownerBalance = await usdt.balanceOf(owner)
                const otherAccountBalance = await usdt.balanceOf(otherAccount)
    
    
                console.log('id:%d drawPrize tx:%s owner Balance:%d otherAccount balance:%d',id,recept?.hash,ownerBalance,otherAccountBalance);
            });
        });
    });
    
});