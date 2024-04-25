## 采用sepolia网络:
浏览器:https://sepolia.etherscan.io/

## 合约地址
### token（U） address:
0x314765C2B696e7Ac04e8c61f65aE0372eb33F060

### WETH address:
0xccCf545cf03aA6A9E14e8c7bD4D46cb249b45B1e

### LuckyRedEnvelopeV1 address:
0xdF8167f047A8eD3D9F876F7FF869cb86452c8E88

### LuckyRedEnvelopeV2 address:
0xE601515E7a2B7f7a964adbb4176ca54B08F9E03D
已绑定操作员地址

### TaskControlDirect address:
0x8F1BA803E5C9691F2B0ebe3230B3bA2F0819B9fa
已绑定EmptyTask，权重为1^18

### TaskControlWithToken address:
0xA2A0aC18F965E03443efdd2dfeA3990c07b076E8
已转账500U
已设置price为1000000
已绑定EmptyTask，权重为1
已绑定PayTask，权重为1
已绑定WhileListTask，权重为1

### EmptyTask address:
0x10e474732c98960AF2e612A720c966d8203ed43a

### PayTask address:
0x5e8cAB19578CAa8E5Bc4d65cb2843d5CCB99Ce20
支持支付代币（U）:0x314765C2B696e7Ac04e8c61f65aE0372eb33F060

### WhileListTask address:
0x191dD57a45A4C216C6D0DefcC011EA6C2058fb02
已绑定操作员:0xEF48A41d7882B31E680483C9c6E17F0Cb125CF38

## 操作员地址
*LuckyRedEnvelopeV2:*
0xEF48A41d7882B31E680483C9c6E17F0Cb125CF38

*TaskControlDirect:*
0x874Ba02eC75e3A6FfDDE59FB79E993D4e42053Ac

*TaskControlWithToken:*
0x874Ba02eC75e3A6FfDDE59FB79E993D4e42053Ac


## 使用指南

### 创建及处理红包
+ 通过红包合约操作员地址直接调用LuckyRedEnvelopeV2合约接口



### 任务积分模式(buy模式)
#### 用户获取奖注token
+ 用户（前端）直接调用TaskControlWithToken合约的mintToken接口,可根据用户参与的任务选择传入具体的task合约地址

#### 用户注销奖注token参与红包
+ 用户（前端）直接调用TaskControlWithToken合约的getTicket接口,将会消耗1*10^decimals个token换取1注具体红包活动
+ 可用红包id:3




### 直接投注模式(send模式)
#### 用户直接参与任务获取指定红包投注
+ 用户（前端）直接调用TaskControlDirect合约的getTicket接口,可根据用户参与的任务选择传入具体的task合约地址
+ 需传入红包id，完成指定任务后将直接获取对应数量的红包投注
+ 获取的红包投注数量取决于任务权重及预设decimals
+ 已绑定红包id:2,已注入0.1weth



## 其他
### 如何给mintToken接口的data字段传参数
```
function mintToken(address _taskAddr,address _receiveAddress,bytes calldata data) external;
```
在TaskControl合约的mintToken接口中，data需根据具体task的实际业务合约处理传参
```
function taskCall(address _sender,bytes calldata _data) external  onlyOperator returns(uint256){
        (uint256 value) = abi.decode(_data,(uint256));
        return _taskCall(_sender,value);
    }
```
参考PayTask中，具体data数据通过(uint256 value) = abi.decode(_data,(uint256))被解析为uint256，因此在传参时，需要对原始数据进行encode处理，打包为bytes data。js参考实现:
```
const data = hre.ethers.AbiCoder.defaultAbiCoder().encode(["uint256"],[1000000n]);
```