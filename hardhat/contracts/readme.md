## 采用sepolia网络:
浏览器:https://sepolia.etherscan.io/

## 合约地址
### token address:
0x314765C2B696e7Ac04e8c61f65aE0372eb33F060

### LuckyRedEnvelopeV1 address:
0xdF8167f047A8eD3D9F876F7FF869cb86452c8E88

### LuckyRedEnvelopeV2 address:
0xE601515E7a2B7f7a964adbb4176ca54B08F9E03D
已绑定操作员地址

### DefaultTaskControl address:
0xA2A0aC18F965E03443efdd2dfeA3990c07b076E8

### EmptyTask address:
0x10e474732c98960AF2e612A720c966d8203ed43a
已绑定DefaultTaskControl，权重为1

## PayTask address:
0x5e8cAB19578CAa8E5Bc4d65cb2843d5CCB99Ce20
支持支付代币:0x314765C2B696e7Ac04e8c61f65aE0372eb33F060
已绑定DefaultTaskControl，权重为1


## 操作员地址
*LuckyRedEnvelopeV2:*
0xEF48A41d7882B31E680483C9c6E17F0Cb125CF38


*DefaultTaskControl:*
0x874Ba02eC75e3A6FfDDE59FB79E993D4e42053Ac

## 使用指南
### 创建及处理红包
通过红包合约操作员地址直接调用LuckyRedEnvelopeV2合约接口

### 用户获取奖注token
用户（前端）直接调用DefaultTaskControl合约的mintToken接口,可根据用户参与的任务选择传入具体的task合约地址

### 用户注销奖注token参与红包
用户（前端）直接调用DefaultTaskControl合约的getTicket接口,将会消耗1*10^decimals个token换取1注具体红包活动

## 其他
### 如何给mintToken接口的data字段传参数
```
function mintToken(address _taskAddr,address _receiveAddress,bytes calldata data) external;
```
在DefaultTaskControl合约的mintToken接口中，data需根据具体task的实际业务合约处理传参
```
function taskCall(address _sender,bytes calldata _data) external  onlyOperator returns(uint256){
        (uint256 value) = abi.decode(_data,(uint256));
        return _taskCall(_sender,value);
    }
```
参考PayTask中，具体data数据通过(uint256 value) = abi.decode(_data,(uint256))被解析为uint256，因此在传参时，需要对原始数据进行encode处理，打包为bytes data。js参考实现：
```
const data = hre.ethers.AbiCoder.defaultAbiCoder().encode(["uint256"],[1000000n]);
```