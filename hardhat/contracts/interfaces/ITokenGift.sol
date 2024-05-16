// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

interface ITokenGift{
    enum Status {
        Pending,
        Open,
        Close,
        Claimable
    }
    enum Model{
        BuyModel,
        SendModel
    }
    event TokenGiftCreated(
        uint256 indexed id,
        uint16 model,
        uint256 endTime,
        uint256 maxTickets, 
        uint256 maxPrizeNum,
        uint256 ticketPirce,
        address ticketToken,
        address allowAddr,
        bool autoClaim
    );

    event TokenGiftClosed(
        uint256 indexed id,
        uint256 endTime,
        uint256 buyTickets,
        uint256 sendTickets,
        uint256 injectTickets
    );

    event TokenGiftClaimable(
        uint256 indexed id,
        uint256 endTime
    );

    //ticketIndex表明购注的起始编号
    //若ticketIndex为23，ticketNumbers为1，则奖注的编号为23
    //若ticketIndex为0，ticketNumbers为10，则奖注的编号为0-9
    event TicketsPurchase(
        uint256 indexed id,
        address indexed sender,
        address indexed receiveAddress,
        uint256 ticketIndex,    
        uint256 ticketNumbers
    );

    event TicketsGet(
        uint256 indexed id,
        address indexed sender,
        address indexed receiveAddress,
        uint256 ticketIndex,
        uint256 ticketNumbers
    );

    event TicketsInject(
        uint256 indexed id,
        address indexed sender,
        uint256 ticketNumbers
    );


    event PrizeDrawn(
        uint256 indexed id,
        address indexed winner,
        uint256 indexed index,
        uint256 amount,
        bool autoClaim
    );

    event ClaimPrize(
        uint256 indexed id,
        address indexed winner,
        uint256 totalAmount,
        bool autoClaim
    );
    /**
     * @notice create the TokenGift，采用默认代币地址及配置，默认为仅支持buyTickets模式
     * @dev Callable by operator
     * @param _endTime: endTime of the TokenGift，0 = no limit
     * @param _maxTickets: max ticket of the TokenGift，0 = no limit
     * @param _maxPrizeNum: prize num of the TokenGift，0为100%中奖
     * @param _secret: 
     */
    function createTokenGift(
        uint256 _endTime,
        uint256 _maxTickets,
        uint256 _maxPrizeNum,
        uint256 _secret
    )external;
    
    //精细化创建红包，指定该批次红包的代币及奖注价格，
    function createTokenGiftDetail(
        address _tokenAddress,  //代币地址
        uint16 _model,  //0:为buyModel;1:sendModel
        uint256 _ticketPirce,
        uint256 _endTime,
        uint256 _maxTickets,
        uint256 _maxPrizeNum,
        address _injectAddress,     //可在创建活动时即向该红包奖池捐赠代币，需approve额度
        uint256 _injectTicketNum,   //初始化时捐赠额度，0为不捐赠
        address _allowAddr,     //指定可调用地址，若设置非0x0，则仅允许该地址调用，否则允许任意地址调用
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
    function endTokenGift(uint256 _id)external;

    //开奖，若_autoClaim为true，则自动向中奖用户派奖
    function drawPrize(uint256 _id,uint256 _nonce)external;

    //开奖后，若_autoClaim为false，需要中奖用户调用该接口手动领奖
    function claimPrize(uint256 _id)external;

    //查询指定红包明细
    function viewTokenGiftStatus(uint256 _id)external view  returns (Status);
    function viewTokenGiftModel(uint256 _id)external view  returns (Model);
    function viewTokenGiftTicketToken(uint256 _id)external view  returns (address);
    function viewTokenGiftTicketPrice(uint256 _id)external view  returns (uint256);


    //查询最新红包id
    function viewCurrentTokenGiftId() external view returns(uint256);

    //查询指定用户可领取的中奖金额
    function viewTokenGiftClaimPrize(uint256 _id,address _user)external view returns(uint256);

}