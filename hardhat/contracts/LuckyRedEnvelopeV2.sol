// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IRedEnvelope.sol";
//import "hardhat/console.sol";

contract LuckyRedEnvelopeV2 is IRedEnvelope,ReentrancyGuard, Ownable{
    using SafeERC20 for IERC20;

    address public defaultTicketToken;
    
    uint256 public currentId;
    uint256 public defaultTicketPirce;
    
    bool public defaultAutoClaim;

    mapping(address => bool) public operatorAddressList;

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
        uint256 getTickets;     //用户获取投注数
        uint256 injectTickets;  //捐赠数
        uint256 userAddrNum;
        uint256 userTxNum;
        uint256 injectAddrNum;
        uint256 ticketPirce;
        address getTicketAddr;  //可调用领取接口的地址，若设置非0x0，则仅允许getTickets，否则仅允许buyTickets
        uint256 secret;
        bool autoClaim; 
    }

    struct Ticket{
        uint256 totalNumbers;
        address receiveAddress;
        bool buy;
    }

     

    mapping(uint256 => RedEnvelope) private _redEnvelopes;
    mapping(uint256 => mapping(uint256 => Ticket)) private _tickets;
    mapping(uint256 => mapping(uint256 => bool)) private _prizedticketIndex;
  
    mapping(uint256 => mapping(address => uint256)) private _userAddrTicketNum;
    mapping(uint256 => mapping(uint256 => address)) private _userAddrIndex;
    mapping(uint256 => mapping(address => uint256)) private _amount2claimed;

    mapping(uint256 => mapping(uint256 => address)) private _injectAddrIndex;
    mapping(uint256 => mapping(address => uint256)) private _injectTicketMap;

    /*
    modifier notContract() {
        require(!_isContract(msg.sender), "Contract not allowed");
        require(msg.sender == tx.origin, "Proxy contract not allowed");
        _;
    }*/

    modifier onlyOperator() {
        require(operatorAddressList[msg.sender] == true, "Not operator");
        _;
    }
    event OperatorAddress(address operatorAddress,bool opt);
    event DefaultAutoClaimChange(bool defaultAutoClaim);
    event DefaultTokenChange(address defaultTicketToken,uint256 defaultTicketPirce);


    event RedEnvelopeCreated(
        uint256 indexed id,
        uint256 endTime,
        uint256 maxTickets,
        uint256 maxPrizeNum,
        uint256 ticketPirce,
        address ticketToken,
        address getTicketAddr,
        bool autoClaim
    );

    event RedEnvelopeClosed(
        uint256 indexed id,
        uint256 endTime,
        uint256 buyTickets,
        uint256 getTickets,
        uint256 injectTickets
    );

    event RedEnvelopeClaimable(
        uint256 indexed id,
        uint256 endTime
    );


    event TicketsPurchase(
        uint256 indexed id,
        address indexed sender,
        address indexed receiveAddress,
        uint256 ticketNumbers
    );

    event TicketsGet(
        uint256 indexed id,
        address indexed sender,
        address indexed receiveAddress,
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

    constructor(address _operatorAddress,address _defaultTicketToken,uint256 _defaultTicketPirce)Ownable(address(msg.sender)){
        operatorAddressList[_operatorAddress] = true;
        defaultAutoClaim = true;
        defaultTicketToken = _defaultTicketToken;
        defaultTicketPirce = _defaultTicketPirce;
        emit OperatorAddress(_operatorAddress,true);
        emit DefaultAutoClaimChange(defaultAutoClaim);
        emit DefaultTokenChange(defaultTicketToken,defaultTicketPirce);
    }

    function setOperatorAddress(
        address _operatorAddress,
        bool _opt
    )external onlyOwner{
        require(_operatorAddress != address(0), "Cannot be zero address");
        operatorAddressList[_operatorAddress] = _opt;

        emit OperatorAddress(_operatorAddress,_opt);
    }

    function setDefaultAutoClaim(bool _defaultAutoClaim) external onlyOperator{
        defaultAutoClaim = _defaultAutoClaim;
        emit DefaultAutoClaimChange(defaultAutoClaim);
    }

     function setTicketToken(address _defaultTicketToken,uint256 _defaultTicketPirce) external onlyOperator{
        defaultTicketToken = _defaultTicketToken;
        defaultTicketPirce = _defaultTicketPirce;
        emit DefaultTokenChange(defaultTicketToken,defaultTicketPirce);
    }

    
    function _createRedEnvelope(address _tokenAddress,
        uint256 _ticketPirce,
        uint256 _endTime,
        uint256 _maxTickets,
        uint256 _maxPrizeNum,
        uint256 _secret,
        bool _autoClaim
        )internal{
        currentId++;
        RedEnvelope storage redEnvelope = _redEnvelopes[currentId];
        redEnvelope.ticketToken = _tokenAddress;
        redEnvelope.status = Status.Open;
        redEnvelope.endTime = _endTime;
        redEnvelope.maxTickets = _maxTickets;
        redEnvelope.maxPrizeNum = _maxPrizeNum;
        redEnvelope.ticketPirce = _ticketPirce;
        redEnvelope.secret = _secret;
        redEnvelope.autoClaim = _autoClaim;
    }

    
    function createRedEnvelope(
        uint256 _endTime,
        uint256 _maxTickets,
        uint256 _maxPrizeNum,
        uint256 _secret
    )external onlyOperator nonReentrant{
        _createRedEnvelope(defaultTicketToken,defaultTicketPirce,_endTime,_maxTickets,
            _maxPrizeNum,_secret,defaultAutoClaim);
        emit RedEnvelopeCreated(currentId,_endTime,_maxTickets,_maxPrizeNum,defaultTicketPirce,defaultTicketToken,address(0),defaultAutoClaim);
    }

    /**
     * @notice create the RedEnvelope
     * @dev Callable by operator
     * @param _endTime: endTime of the RedEnvelope
     * @param _maxTickets: max ticket of the RedEnvelope
     * @param _secret: 
     */
    function createRedEnvelopeDetail(
        address _tokenAddress,
        uint256 _ticketPirce,
        uint256 _endTime,
        uint256 _maxTickets,
        uint256 _maxPrizeNum,
        address _injectAddress,
        uint256 _injectTicketNum,
        address _getTicketAddr,
        uint256 _secret,
        bool _autoClaim
    )external onlyOperator nonReentrant{
        _createRedEnvelope(_tokenAddress,_ticketPirce,_endTime,_maxTickets,
            _maxPrizeNum,_secret,_autoClaim);
        _redEnvelopes[currentId].getTicketAddr = _getTicketAddr;

        emit RedEnvelopeCreated(currentId,_endTime,_maxTickets,_maxPrizeNum,_ticketPirce,_tokenAddress,_getTicketAddr,_autoClaim);
        if (_injectTicketNum > 0){
            // Calculate number of token to this contract
            _injectTickets(currentId,_injectAddress,_injectTicketNum);
        }
    }

    function injectTickets(uint256 _id,uint256 _ticketNumbers)external nonReentrant{
        require(_ticketNumbers != 0,"inject no zero");
        require(_redEnvelopes[_id].status == Status.Open, "RedEnvelope is not open");
        if (_redEnvelopes[_id].endTime != 0){
            require(block.timestamp < _redEnvelopes[_id].endTime, "RedEnvelope is over time");
        }
        _injectTickets(_id,address(msg.sender),_ticketNumbers);
    }

    function _injectTickets(uint256 _id,address _injectAddress,uint256 _ticketNumbers)internal{
        uint256 amountTokenToTransfer = _redEnvelopes[_id].ticketPirce * _ticketNumbers;

        // Transfer cake tokens to this contract
        IERC20(_redEnvelopes[_id].ticketToken).safeTransferFrom(address(_injectAddress), address(this), amountTokenToTransfer);
        _redEnvelopes[currentId].injectTickets += _ticketNumbers;

        if ( _injectTicketMap[currentId][_injectAddress] == 0){
            _injectAddrIndex[currentId][_redEnvelopes[currentId].injectAddrNum] = _injectAddress;
            _redEnvelopes[currentId].injectAddrNum += 1;
        }
        _injectTicketMap[currentId][_injectAddress] += _ticketNumbers;

        emit TicketsInject(currentId,address(_injectAddress),_ticketNumbers);
    }

    function _fillTicket(uint256 _id,address _receiveAddress,uint256 _ticketNumbers,bool _buy)internal{
           /*
           uint256 curUserTicketNum = _redEnvelopes[_id].buyTickets + _redEnvelopes[_id].getTickets;
            
            for (uint256 i = 0; i < _ticketNumbers; i++){
                _tickets[_id][curUserTicketNum + i] = Ticket({
                    receiveAddress: _receiveAddress,
                    buy:_buy,
                    prize:false
                });
            } */
            uint256 totalNumbers = 0;
            if (_redEnvelopes[_id].userTxNum != 0){
                totalNumbers = _tickets[_id][_redEnvelopes[_id].userTxNum - 1].totalNumbers;
            }
            _tickets[_id][_redEnvelopes[_id].userTxNum] = Ticket({
                    //ticketNumbers: _ticketNumbers,
                    receiveAddress: _receiveAddress,
                    totalNumbers: totalNumbers + _ticketNumbers,
                    buy:_buy
                });

            if (_buy){
                _redEnvelopes[_id].buyTickets = _redEnvelopes[_id].buyTickets + _ticketNumbers;
            }else{
                _redEnvelopes[_id].getTickets = _redEnvelopes[_id].getTickets + _ticketNumbers;
            }
            
            if (_userAddrTicketNum[_id][_receiveAddress] == 0){
                _userAddrIndex[_id][_redEnvelopes[_id].userAddrNum] = _receiveAddress;
                _redEnvelopes[_id].userAddrNum += 1;
            }
            _redEnvelopes[_id].userTxNum += 1;
            _userAddrTicketNum[_id][_receiveAddress] = _userAddrTicketNum[_id][_receiveAddress] + _ticketNumbers;
    }

    function getTickets(
        uint256 _id,
        address _receiveAddress,
        uint256 _ticketNumbers
    )external nonReentrant{
        require(_redEnvelopes[_id].status == Status.Open, "RedEnvelope is not open");
        require(_redEnvelopes[_id].getTicketAddr != address(0), "no get ticket model");
        require(_redEnvelopes[_id].getTicketAddr == address(msg.sender), "not allow get ticket");
        require(_ticketNumbers != 0 ,"ticketNumbers no zero");
        if (_redEnvelopes[_id].endTime != 0){
            require(block.timestamp < _redEnvelopes[_id].endTime, "RedEnvelope is over time");
        }
        if (_redEnvelopes[_id].maxTickets != 0){
            require(_redEnvelopes[_id].buyTickets + _ticketNumbers <= _redEnvelopes[_id].maxTickets, "RedEnvelope is over ticket");
        }
        _fillTicket(_id,_receiveAddress,_ticketNumbers,false);
        
        emit TicketsGet(_id,address(msg.sender),_receiveAddress,_ticketNumbers);
    }

    function buyTickets(
        uint256 _id,
        address _receiveAddress,
        uint256 _ticketNumbers
    )external nonReentrant{
        require(_redEnvelopes[_id].status == Status.Open, "RedEnvelope is not open");
        require(_redEnvelopes[_id].getTicketAddr == address(0), "no buy ticket model");
        require(_ticketNumbers != 0 ,"ticketNumbers no zero");
        if (_redEnvelopes[_id].endTime != 0){
            require(block.timestamp < _redEnvelopes[_id].endTime, "RedEnvelope is over time");
        }
        if (_redEnvelopes[_id].maxTickets != 0){
            require(_redEnvelopes[_id].buyTickets + _ticketNumbers <= _redEnvelopes[_id].maxTickets, "RedEnvelope is over ticket");
        }

        // Calculate number of token to this contract
        uint256 amountTokenToTransfer = _redEnvelopes[_id].ticketPirce * _ticketNumbers;

        // Transfer cake tokens to this contract
        IERC20(_redEnvelopes[_id].ticketToken).safeTransferFrom(address(msg.sender), address(this), amountTokenToTransfer);

        _fillTicket(_id,_receiveAddress,_ticketNumbers,true);

        emit TicketsPurchase(_id,address(msg.sender),_receiveAddress,_ticketNumbers);
    }


    function endRedEnvelope(
        uint256 _id
    )external onlyOperator nonReentrant{
        require(_redEnvelopes[_id].status == Status.Open, "RedEnvelope is not open");
        //require(block.timestamp > _redEnvelopes[_id].endTime || _redEnvelopes[_id].buyTickets == _redEnvelopes[_id].maxTickets, "RedEnvelope is over");
        _redEnvelopes[_id].status = Status.Close;

        emit RedEnvelopeClosed(_id,block.timestamp,_redEnvelopes[_id].buyTickets,_redEnvelopes[_id].getTickets,_redEnvelopes[_id].injectTickets);
    }

    function _returnInject(uint256 _id)internal{
        for (uint256 i = 0;i <  _redEnvelopes[_id].injectAddrNum;i ++){
            uint256 amountTokenToTransfer = _redEnvelopes[_id].ticketPirce * _injectTicketMap[_id][_injectAddrIndex[_id][i]];
            IERC20(_redEnvelopes[_id].ticketToken).safeTransfer(_injectAddrIndex[_id][i], amountTokenToTransfer);
        }
    }

    /*
    function _getTicket(uint256 _id,uint256 _index) internal view returns (Ticket storage){
        uint256 ticketNum = 0;
        for(uint256 i = 0;i < _redEnvelopes[_id].userTxNum;i++){
            ticketNum +=_tickets[_id][i].ticketNumbers;
            if (ticketNum >= _index){
               return _tickets[_id][i];
            }
        }
        require(false,"index out range");
        return _tickets[_id][0];
    }*/

    //二分查找
    function _getTicketbyIndex(uint256 _id,uint256 _index) internal view returns (Ticket storage){
        require(_tickets[_id][_redEnvelopes[_id].userTxNum - 1].totalNumbers > _index,"index out range");
        uint256 left = 0;
        uint256 right = _redEnvelopes[_id].userTxNum - 1;
        //console.log("_index is %d ", _index);
        do{
            uint256 mid = (left + right) / 2;
            if (_tickets[_id][mid].totalNumbers > _index){
                right = mid ;
            }else if(_tickets[_id][mid].totalNumbers <= _index){
                left = mid + 1;
            }
            if (left >= right){
                return _tickets[_id][right];
            }
        }while(true);
        return _tickets[_id][0];
    }

    function drawPrize(
        uint256 _id,
        uint256 _nonce
    )external onlyOperator nonReentrant{
        require(_redEnvelopes[_id].status == Status.Close, "RedEnvelope not close");
        _redEnvelopes[_id].status = Status.Claimable;
        emit RedEnvelopeClaimable(_id,block.timestamp);
        uint256 userTickets = _redEnvelopes[_id].buyTickets + _redEnvelopes[_id].getTickets;
        if ( userTickets == 0){
            //返还注入金额
            _returnInject(_id);
            //_removeEnvelope(_id);
            return ;
        }

        //TODO: get randomWord
        uint256 randomWord = _nonce;
        
        uint256 drawNum = userTickets;
        if (drawNum > _redEnvelopes[_id].maxPrizeNum && _redEnvelopes[_id].maxPrizeNum != 0){
            drawNum = _redEnvelopes[_id].maxPrizeNum;
        }

        //计算中奖值
        uint256 totalTickets = _redEnvelopes[_id].injectTickets + _redEnvelopes[_id].buyTickets;
        uint256 amountToken =  _redEnvelopes[_id].ticketPirce * totalTickets; 
        uint256[] memory randomsAmount = _getSortRandoms(randomWord,drawNum,amountToken);

        _calculatePrize(_id,drawNum,randomsAmount);
        
        //用地址为单位去领取
        if(_redEnvelopes[_id].autoClaim){
            for(uint256 i = 0;i < _redEnvelopes[_id].userAddrNum;i++){
                if(_amount2claimed[_id][_userAddrIndex[_id][i]] != 0){
                    _claimPrize(_id,_userAddrIndex[_id][i]);
                }
                //delete _userAddrTicketNum[_id][_userAddrIndex[_id][i]];
                //delete _userAddrIndex[_id][i];
                //_removeEnvelope(_id);
            }
        }
        //非autoClaim不清理
    }

    function _calculatePrize(uint256 _id,uint256 _drawNum,uint256[] memory _randomsAmount)internal{
        uint256 totalSendAmount = 0;
        uint256 userTickets = _redEnvelopes[_id].buyTickets + _redEnvelopes[_id].getTickets;
        //以用户投注总数或最大中奖数为维度开奖
        for (uint256 i = 0; i < _drawNum; i++){
            uint256 sendValue = _randomsAmount[i] - totalSendAmount;
            uint256 index = i;
            if (_drawNum != userTickets){
                //需随机生成中奖的用户
                index = _deriveRandom(_randomsAmount[i],i) % userTickets;
                for (;_prizedticketIndex[_id][index] != false;){
                    index++;
                    if (index == userTickets){
                        index = 0;
                    }
                }
            }
            _prizedticketIndex[_id][index] = true;
            Ticket storage ticket = _getTicketbyIndex(_id,index);
            emit PrizeDrawn(_id,ticket.receiveAddress,index,sendValue,_redEnvelopes[_id].autoClaim);
            _amount2claimed[_id][ticket.receiveAddress] += sendValue;
            totalSendAmount += sendValue;
        }        
    }


    function _leftRotate(uint256 _value,uint32 _shift)internal pure returns(uint256){
        return (_value << _shift) | (_value >> (256 - _shift));
    }

    function _deriveRandom(uint256 _seed,uint256 i)internal pure returns(uint256){
        //TODO:
        uint32 shift = uint32(i % 256);
        return uint256(keccak256(abi.encodePacked(_seed,_leftRotate(_seed,shift))));
    }

    //通过_seed，一共生成_num个随机数,分布在0-_range之间，去重并且按照从小到大排序
    //最后一个数必为range
    //TODO：极端情况下会重复，导致该奖注中奖，且金额为0
    function _getSortRandoms(uint256 _seed,uint256 _num,uint256 _range) internal pure returns(uint256[] memory){
        uint256[] memory randons = new uint256[](_num);
        uint256 seed = _seed;
        for (uint256 i = 0; i < _num - 1; i++){
            seed = _deriveRandom(seed,i);
            uint256 value = seed % _range;
            uint256 j = i;
            while((j >= 1) && value < randons[j - 1]){
                randons[j] = randons[j-1];
                j--;
            }
            randons[j] = value;
        }
        randons[_num-1] = _range;
        return randons;
    }


    function claimPrize(uint256 _id)external nonReentrant{
        require(_redEnvelopes[_id].status == Status.Claimable, "RedEnvelope not claimable");
        require(_redEnvelopes[_id].autoClaim == false, "RedEnvelope auto claim");
        _claimPrize(_id,address(msg.sender));
    }

    function _claimPrize(uint256 _id,address _winner)internal {
        require(_amount2claimed[_id][_winner] != 0, "no prize");
        // Calculate number of token to this contract

        uint256 amountTokenToTransfer = _amount2claimed[_id][_winner];

        IERC20(_redEnvelopes[_id].ticketToken).safeTransfer(_winner, amountTokenToTransfer);
        delete _amount2claimed[_id][_winner];
        emit ClaimPrize(_id,_winner,amountTokenToTransfer,_redEnvelopes[_id].autoClaim);
    }

    /*
    function _removeEnvelope(uint256 _id)internal{
        for (uint256 i = 0; i < _redEnvelopes[_id].injectAddrNum; i++){
            delete _injectTicketMap[_id][_injectAddrIndex[_id][i]];
            delete _injectAddrIndex[_id][i];
        }
        for (uint256 i = 0; i < _redEnvelopes[_id].userTxNum; i++) {
            delete _tickets[_id][i];
        }
        delete _redEnvelopes[_id];
    }*/

    //查询指定红包状态
    function viewRedEnvelopeStatus(uint256 _id) public view  returns (uint){
        return uint(_redEnvelopes[_id].status);
    }

    //查询最新红包id
    function  viewCurrentRedEnvelopeId() external view returns(uint256){
        return currentId;
    }

 
    //查询红包详情
    function viewRedEnvelope(uint256 _id)external view returns (RedEnvelope memory){
        return _redEnvelopes[_id];
    }

    //查询指定用户可领取的中奖金额
    function viewRedEnvelopeClaimPrize(uint256 _id,address _user)external view returns(uint256){
        return _amount2claimed[_id][_user];
    }
}

