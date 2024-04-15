// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.20;

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
        address _getTicketAddr,     //若为0x0，则表明为buyTickets模式，仅允许buyTickets；若为非0x0地址，则为getTickets模式，仅允许_getTicketAddr地址对第三方通过getTickets赠送奖注
        uint256 _secret,
        bool _autoClaim             //是否自动领取，若为false，需要中奖用户自行通过claimPrize领奖
    )external;

    //向奖池捐赠资产额度，不参与抽奖，任何地址可调用，需要approve授权
    function injectTickets(uint256 _id,uint256 _ticketNumbers)external;

    //在getTickets模式下可被_getTicketAddr地址调用，指定领取奖注额度
    function getTickets(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)external;

    //在buyTickets模式下可被任何地址调用，需要approve额度
    function buyTickets(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)external;

    //结束投注，调用后该红包不再接受injectTickets/getTickets/buyTickets
    function endRedEnvelope(uint256 _id)external;

    //开奖，若_autoClaim为true，则自动向中奖用户派奖
    function drawPrize(uint256 _id,uint256 _nonce)external;

    //开奖后，若_autoClaim为false，需要中奖用户调用该接口手动领奖
    function claimPrize(uint256 _id)external;

}