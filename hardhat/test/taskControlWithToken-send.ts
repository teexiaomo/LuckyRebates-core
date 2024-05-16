import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import {deployTetherUSD,TetherUSD} from "../scripts/TetherUSD-deploy"
import {deployRandomGenerator,TestRandomGenerator} from "../scripts/RandomGenerator-deploy"
import { LuckyTokenGift,deployLuckyTokenGift  } from "../scripts/LuckyTokenGift-deploy";
import { deployTaskControlWithToken,TaskControlWithToken } from "../scripts/TaskControlWithToken-deploy";
import { deployEmptyTask,EmptyTask } from "../scripts/task/EmptyTask-deploy";

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import  {
    ZeroAddress
  } from "ethers";



describe("task control with token: sends ticket", function (){
    let usdt:TetherUSD;
    let luckyTokenGift:LuckyTokenGift;
    let randomGenerator:TestRandomGenerator;
    let taskControl:TaskControlWithToken;
    let owner:HardhatEthersSigner;
    let otherAccount:HardhatEthersSigner;
    before(async function(){
        //初始化合约
        usdt = await loadFixture(deployTetherUSD);
        const addr1 = await usdt.getAddress();
        console.log('usdt address:',addr1);

        randomGenerator = await loadFixture(deployRandomGenerator);
        const addr2 = await randomGenerator.getAddress();
        console.log('randomGenerator address:',addr2);
        
        luckyTokenGift = await loadFixture(deployLuckyTokenGift);
        const addr3 = await luckyTokenGift.getAddress();
        console.log('tokenGift address:',addr3);

        taskControl = await loadFixture(deployTaskControlWithToken);
        const addr4 = await luckyTokenGift.getAddress();
        console.log('taskControl address:',addr4);

        await (await randomGenerator.setOperatorAddressList(await luckyTokenGift.getAddress(),true)).wait();

        [owner,otherAccount] = await hre.ethers.getSigners();

        
        
    });
    describe("do task",function(){
        let emptyTask:EmptyTask;
        before(async function(){
            //部署具体领取任务：emptyTask：任意地址执行即可以免费领取投注
            emptyTask = await loadFixture(deployEmptyTask);
            const emptyTaskAddr = await emptyTask.getAddress();
            console.log('emptyTask address:',emptyTaskAddr);
            
            //绑定emptyTask到taskControl，设置权重为10**decimals
            const weight = await taskControl.decimals();
            const setTask = taskControl.setTask(emptyTaskAddr,BigInt(Math.pow(10,Number(weight))) );
            await expect(setTask).not.to.be.reverted;
            await (await setTask).wait();     
            
        });
        it("get task token", async function () {
            //完成emptyTask任务领取10个投注token
            const emptyTaskAddr = await emptyTask.getAddress();
            //将合约参数通过abi.encode处理后传入
            const data = hre.ethers.AbiCoder.defaultAbiCoder().encode(["uint256"],[10n]);
            const mintToken = taskControl.mintToken(emptyTaskAddr,otherAccount,data);
            await expect(mintToken).not.to.be.reverted;
            const recept = await (await mintToken).wait();
            
            const balance = await taskControl.balanceOf(otherAccount);
            console.log('get token tx:%s otherAccount token balance:%d',recept?.hash,balance);
        });

    });
    describe("tokenGift",function(){
        let id:bigint;
        before(async function(){
            //授权用户地址向红包合约转账
            const luckyTokenGiftAddr = await luckyTokenGift.getAddress();
            const approveCall = usdt.approve(luckyTokenGiftAddr,1000000000);
            await expect(approveCall).not.to.be.reverted;
            await (await approveCall).wait() ;


            //创建send模式红包，且绑定send地址为taskControl
            const taskControlAddr = await taskControl.getAddress();
            const usdtAddr = await usdt.getAddress();
            const createTokenGiftDetail = luckyTokenGift.createTokenGiftDetail(usdtAddr,1n,1000000n,0n,0n,20n,ZeroAddress,0n,taskControlAddr,0n,true);
            await expect(createTokenGiftDetail).not.to.be.reverted;
            
            await (await createTokenGiftDetail).wait();

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
            console.log('id:%d inject tx:%s balance:%d',id,recept?.hash,balance);
        });
        it("owner getTicket",async function () {
            //owner通过taskControl领取5注
            let balance = await taskControl.balanceOf(owner);
            console.log('owner token before balance:%d',balance);

            //owner 尝试消耗5token领取5投注，由于token不足执行失败
            const getTicket =  taskControl.getTicket(id,owner,5n);
            
            await expect(getTicket).to.be.reverted;
            //const recept = await (await getTicket).wait();

            //balance = await taskControl.balanceOf(owner);
            //console.log('owner token after balance:%d',recept.hash,balance);
        });

        it("otherAccount getTicket",async function () {
            //otherAccount通过taskControl领取5注
            let balance = await taskControl.balanceOf(otherAccount);
            console.log('otherAccount token before balance:%d',balance);
            
            //otherAccount 尝试消耗5token领取5投注
            //由于为send模式，因此taskControl将会向luckyTokenGift调用sendTickets向otherAccount赠送5注
            const getTicket =  taskControl.connect(otherAccount).getTicket(id,otherAccount,5n);
            
            await expect(getTicket).not.to.be.reverted;
            const recept = await (await getTicket).wait();

            balance = await taskControl.balanceOf(otherAccount);
            console.log('otherAccount token after balance:%d',balance);
        });

    });
    
    
    describe("end tokenGift",function(){
        it("end", async function (){
            //结束投注
            const id = await luckyTokenGift.viewCurrentTokenGiftId();
            const endTokenGift = luckyTokenGift.endTokenGift(id);

            await expect(endTokenGift).not.to.be.reverted;
            const recept = await (await endTokenGift).wait();

            const balance = await usdt.balanceOf(otherAccount)
            
            console.log('id:%d end tx:%s otherAccount balance:%d',id,recept?.hash,balance);
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
            
            //由于为send模式，最终参与抽奖的只是owner捐赠的10注 ，otherAccount最终获得10注的中奖
            const balance = await usdt.balanceOf(otherAccount)
            
            console.log('id:%d drawPrize tx:%s otherAccount balance:%d',id,recept?.hash,balance);
        });
    });
});