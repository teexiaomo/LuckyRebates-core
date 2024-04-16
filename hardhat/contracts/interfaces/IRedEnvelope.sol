// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.20;



enum Status {
    Pending,
    Open,
    Close,
    Claimable
}
struct RedEnvelope{
    address ticketToken;
    Status status;
    uint256 endTime;
    uint256 maxTickets;
    uint256 maxPrizeNum;    //最大中奖数
    uint256 buyTickets;    //用户购买投注数
    uint256 sendTickets;     //用户获取投注数
    uint256 injectTickets;  //捐赠数
    uint256 userAddrNum;
    uint256 userTxNum;
    uint256 injectAddrNum;
    uint256 ticketPirce;
    address sendAllowAddr;  //可调用领取接口的地址，若设置非0x0，则仅允许getTickets，否则仅允许buyTickets
    uint256 secret;
    bool autoClaim; 
}

struct Ticket{
    uint256 totalNumbers;
    address receiveAddress;
    bool buy;
}

interface IRedEnvelope{

    /**
     * @notice create the RedEnvelope，采用默认代币地址及配置，默认为仅支持buyTickets模式
     * @dev Callable by operator
     * @param _endTime: endTime of the RedEnvelope，0 = no limit
     * @param _maxTickets: max ticket of the RedEnvelope，0 = no limit
     * @param _maxPrizeNum: prize num of the RedEnvelope，0为100%中奖
     * @param _secret: 
     */
    function createRedEnvelope(
        uint256 _endTime,
        uint256 _maxTickets,
        uint256 _maxPrizeNum,
        uint256 _secret
    )external;
    
    //精细化创建红包，指定该批次红包的代币及奖注价格，
    function createRedEnvelopeDetail(
        address _tokenAddress,  //代币地址
        uint256 _ticketPirce,
        uint256 _endTime,
        uint256 _maxTickets,
        uint256 _maxPrizeNum,
        address _injectAddress,     //可在创建活动时即向该红包奖池捐赠代币，需approve额度
        uint256 _injectTicketNum,   //初始化时捐赠额度，0为不捐赠
        address _sendAllowAddr,     //若为0x0，则表明为buyTickets模式，仅允许buyTickets；若为非0x0地址，则为sendTickets模式，仅允许_sendTicketAddr地址对第三方通过sendTickets赠送奖注
        uint256 _secret,
        bool _autoClaim             //是否自动领取，若为false，需要中奖用户自行通过claimPrize领奖
    )external;

    //向奖池捐赠资产额度，不参与抽奖，任何地址可调用，需要approve授权
    function injectTickets(uint256 _id,uint256 _ticketNumbers)external;

    //在sendTickets模式下可被SendAllowAddr地址调用，指定领取奖注额度
    function sendTickets(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)external;

    //在buyTickets模式下可被任何地址调用，需要approve额度
    function buyTickets(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)external;

    //结束投注，调用后该红包不再接受injectTickets/getTickets/buyTickets
    function endRedEnvelope(uint256 _id)external;

    //开奖，若_autoClaim为true，则自动向中奖用户派奖
    function drawPrize(uint256 _id,uint256 _nonce)external;

    //开奖后，若_autoClaim为false，需要中奖用户调用该接口手动领奖
    function claimPrize(uint256 _id)external;

    //查询指定红包状态
    function viewRedEnvelopeStatus(uint256 _id)external view  returns (uint);
    //查询最新红包id
    function viewCurrentRedEnvelopeId() external view returns(uint256);
    //查询红包详情
    function viewRedEnvelope(uint256 _id)external view returns (RedEnvelope memory);
    //查询指定用户可领取的中奖金额
    function viewRedEnvelopeClaimPrize(uint256 _id,address _user)external view returns(uint256);

}