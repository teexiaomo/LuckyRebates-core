# Hardhat Project


Try running some of the following tasks:

## 介绍
### 中奖设置：
 + 通过创建红包时的PrizeNum调节中奖奖注数
 + 中奖投注奖金额随机，总数等于抽奖总额度（无抽成下）
 + 若PrizeNum为0，则参与投注数均中奖，此时中奖率100%
 + 若参与投注数小于PrizeNum，实际中奖数即为真实投注数，此时中奖率100%
 + 若参与投注数大于PrizeNum，实际中奖数为PrizeNum
 + 若无人参与投注，所有参与捐赠的奖注将会退回
  
### buy模式红包：
 + 通过createRedEnvelope或者createRedEnvelopeDetail创建
 + 抽奖总额度 = 捐赠额度 + 投注额度
 + 参与抽奖奖注数 = 投注奖注数

### send模式红包：
 + 仅能通过createRedEnvelopeDetail创建，且必须设置sendAllowAddr地址
 + sendAllowAddr地址作为调用方可以直接获得奖注，由sendAllowAddr指定奖注的派发规则
 + 抽奖总额度 = 捐赠额度
 + 参与抽奖奖注数 = 派发奖注数
  


## 编译
```shell
yarn hardhat compile
```

## 部署
```shell
yarn hardhat run ./scripts/deploy.ts
```

## 测试
通过eoa账户测试buy模式
```shell
yarn hardhat test ./test/eoa-buy.ts
```

通过eoa账户测试send模式
```shell
yarn hardhat test ./test/eoa-send.ts
```

通过TaskControl测试buy模式
```shell
yarn hardhat test ./test/taskControl-buy.ts
```

通过TaskControl测试send模式
```shell
yarn hardhat test ./test/taskControl-send.ts
```

## 添加task
1. 实现Itask接口的task合约
```
function runTask(address sender,uint256 value,bytes calldata data) external  returns(uint256);
```

2. 将实现并部署的task合约绑定到TaskControl合约,设置权重
```
function setTask(address _taskAddr,uint256 _weight)external;
```

3. 通过TaskControl合约执行task任务，获取token
```
function mintToken(address _taskAddr,address _receiveAddress,uint256 _value,bytes calldata _data) external;
```

4. 消耗token，参与指定红包，领取奖注
```
function getTicket(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)external;
```

其中buy模式红包需要TaskControl合约拥有足够购买投注的资产
send模式红包需要TaskControl合约被绑定为sendAllowAddr

