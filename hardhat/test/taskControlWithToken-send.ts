import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import {deployMyToken,TetherUSD} from "../scripts/MyToken-deploy"

import { deployRedEnvelope,LuckyRedEnvelopeV2 } from "../scripts/LuckyRedEnvelopeV2-deploy";
import { deployTaskControlWithToken,TaskControlWithToken } from "../scripts/TaskControlWithToken-deploy";
import { deployEmptyTask,EmptyTask } from "../scripts/EmptyTask-deploy";

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import  {
    ZeroAddress
  } from "ethers";



describe("task control with token: sends ticket", function (){
    let myToken:TetherUSD;
    let luckyRedEnvelope:LuckyRedEnvelopeV2;
    let taskControl:TaskControlWithToken;
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

        taskControl = await loadFixture(deployTaskControlWithToken)
        
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
            const setTask = taskControl.setTask(emptyTaskAddr,Math.pow(10,Number(weight)) );
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
    describe("redEnvelope",function(){
        let id:bigint;
        before(async function(){
            //授权用户地址向红包合约转账
            const luckyRedEnvelopeAddr = await luckyRedEnvelope.getAddress();
            const approveCall = myToken.approve(luckyRedEnvelopeAddr,1000000000);
            await expect(approveCall).not.to.be.reverted;
            await (await approveCall).wait() ;


            //创建send模式红包，且绑定send地址为taskControl
            const taskControlAddr = await taskControl.getAddress();
            const myTokenAddr = await myToken.getAddress();
            const createRedEnvelopeDetail = luckyRedEnvelope.createRedEnvelopeDetail(myTokenAddr,1000000n,0n,0n,20n,ZeroAddress,0n,taskControlAddr,0n,true);
            await expect(createRedEnvelopeDetail).not.to.be.reverted;
            
            await (await createRedEnvelopeDetail).wait();

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
            //由于为send模式，因此taskControl将会向luckyRedEnvelope调用sendTickets向otherAccount赠送5注
            const getTicket =  taskControl.connect(otherAccount).getTicket(id,otherAccount,5n);
            
            await expect(getTicket).not.to.be.reverted;
            const recept = await (await getTicket).wait();

            balance = await taskControl.balanceOf(otherAccount);
            console.log('otherAccount token after balance:%d',balance);
        });

    });
    
    
    describe("end redEnvelope",function(){
        it("end", async function (){
            //结束投注
            const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
            const endRedEnvelope = luckyRedEnvelope.endRedEnvelope(id);

            await expect(endRedEnvelope).not.to.be.reverted;
            const recept = await (await endRedEnvelope).wait();

            const balance = await myToken.balanceOf(otherAccount)
            
            console.log('id:%d end tx:%s otherAccount balance:%d',id,recept?.hash,balance);
        });
    });
    describe("drawPrize redEnvelope",function(){
        //开奖
        it("drawPrize", async function () {
            const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
            const drawPrize = luckyRedEnvelope.drawPrize(id,0n);
            await expect(drawPrize).not.to.be.reverted;
            const recept = await (await drawPrize).wait();   
            
            //由于为send模式，最终参与抽奖的只是owner捐赠的10注 ，otherAccount最终获得10注的中奖
            const balance = await myToken.balanceOf(otherAccount)
            
            console.log('id:%d drawPrize tx:%s otherAccount balance:%d',id,recept?.hash,balance);
        });
    });
});