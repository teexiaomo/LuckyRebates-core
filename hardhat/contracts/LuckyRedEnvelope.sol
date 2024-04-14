// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LuckyRedEnvelope is ReentrancyGuard, Ownable{
    using SafeERC20 for IERC20;
    IERC20 public ticketToken;
    address public operatorAddress;

    uint256 public currentId;

    bool public defaultAutoClaim;
    uint256 public defaultTicketPirce;


    enum Status {
        Pending,
        Open,
        Close,
        Claimable
    }

    struct RedEnvelope{
        Status status;
        uint256 startTime;
        uint256 endTime;
        uint256 maxTickets; 
        uint256 userTickets;    //用户投注数
        uint256 injectTickets;  //捐赠数
        uint256 userAddrNum;
        uint256 ticketPirce;
        bool autoClaim;
        //uint256 secret;
    }

    struct Ticket{
        uint256 ticketNumbers;
        address receiveAddress;
    }

    mapping(uint256 => RedEnvelope) private _redEnvelopes;
    mapping(uint256 => mapping(uint256 => Ticket)) private _tickets;
    mapping(uint256 => mapping(address => uint256)) private _userAddrTicketNum;
    mapping(uint256 => mapping(uint256 => address)) private _userAddrIndex;
    mapping(uint256 => mapping(address => uint256)) private _amount2claimed;


    modifier onlyOperator() {
        require(msg.sender == operatorAddress, "Not operator");
        _;
    }
    event NewOperatorAddress(address operatorAddress);
    event DefaultChange(uint256 defaultTicketPirce,bool defaultAutoClaim);

    event RedEnvelopeCreated(
        uint256 indexed id,
        uint256 startTime,
        uint256 endTime,
        uint256 maxTickets,
        uint256 ticketPirce,
        bool autoClaim
    );

    event RedEnvelopeClosed(
        uint256 indexed id,
        uint256 endTime,
        uint256 userTickets,
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

    constructor(address _tokenAddress,uint256 _defaultTicketPirce,address _operatorAddress)Ownable(address(msg.sender)){
        ticketToken = IERC20(_tokenAddress);
        operatorAddress = _operatorAddress;
        defaultAutoClaim = true;
        defaultTicketPirce = _defaultTicketPirce;
    }

    function setOperatorAddress(
        address _operatorAddress
    )external onlyOwner{
        require(_operatorAddress != address(0), "Cannot be zero address");
        operatorAddress = _operatorAddress;

        emit NewOperatorAddress(_operatorAddress);
    }

    function setDefaultTicketPirce(uint256 _defaultTicketPirce) external onlyOperator{
        defaultTicketPirce = _defaultTicketPirce;
        emit DefaultChange(defaultTicketPirce,defaultAutoClaim);
    }

    function setDefaultAutoClaim(bool _defaultAutoClaim) external onlyOperator{
        defaultAutoClaim = _defaultAutoClaim;
        emit DefaultChange(defaultTicketPirce,defaultAutoClaim);
    }


    /**
     * @notice create the RedEnvelope
     * @dev Callable by operator
     * @param _endTime: endTime of the RedEnvelope
     * @param _maxTickets: max ticket of the RedEnvelope
     * @param _secret: 
     */
    function createRedEnvelope(
        uint256 _endTime,
        uint256 _maxTickets,
        uint256 _injectTickets,
        uint256 _secret
    )external onlyOperator nonReentrant{
        //TODO:require
        currentId++;
        _redEnvelopes[currentId] = RedEnvelope({
            status: Status.Open,
            startTime: block.timestamp,
            endTime: _endTime,
            maxTickets:_maxTickets,
            userTickets:0,
            injectTickets:0,
            userAddrNum:0,
            ticketPirce:defaultTicketPirce,
            autoClaim:defaultAutoClaim
        });
        emit RedEnvelopeCreated(currentId,block.timestamp,_endTime,_maxTickets,defaultTicketPirce,defaultAutoClaim);

        if (_injectTickets > 0){
            // Calculate number of token to this contract
            uint256 amountTokenToTransfer = defaultTicketPirce * _injectTickets;

            // Transfer cake tokens to this contract
            ticketToken.safeTransferFrom(address(msg.sender), address(this), amountTokenToTransfer);
            _redEnvelopes[currentId].injectTickets += _injectTickets;
            emit TicketsInject(currentId,address(msg.sender),_injectTickets);
       }

    }

    function buyTickets(
        uint256 _id,
        address _receiveAddress,
        uint256 _ticketNumbers
    )external nonReentrant{
        require(_redEnvelopes[_id].status == Status.Open, "RedEnvelope is not open");
        if (_redEnvelopes[_id].endTime != 0){
            require(block.timestamp < _redEnvelopes[_id].endTime, "RedEnvelope is over time");
        }
        if (_redEnvelopes[_id].maxTickets != 0){
            require(_redEnvelopes[_id].userTickets + _ticketNumbers <= _redEnvelopes[_id].maxTickets, "RedEnvelope is over ticket");
        }

        // Calculate number of token to this contract
        uint256 amountTokenToTransfer = _redEnvelopes[_id].ticketPirce * _ticketNumbers;

        // Transfer cake tokens to this contract
        ticketToken.safeTransferFrom(address(msg.sender), address(this), amountTokenToTransfer);

        uint256 curUserTicketNum = _redEnvelopes[_id].userTickets;
        for (uint256 i = 0; i < _ticketNumbers; i++){
            _tickets[_id][curUserTicketNum + i] = Ticket({
                ticketNumbers: _ticketNumbers,
                receiveAddress: _receiveAddress
            });
        } 
        _redEnvelopes[_id].userTickets = _redEnvelopes[_id].userTickets + _ticketNumbers;
        if (_userAddrTicketNum[_id][_receiveAddress] == 0){
            _userAddrIndex[_id][_redEnvelopes[_id].userAddrNum] = _receiveAddress;
            _redEnvelopes[_id].userAddrNum = _redEnvelopes[_id].userAddrNum + 1;
        }
        _userAddrTicketNum[_id][_receiveAddress] = _userAddrTicketNum[_id][_receiveAddress] + _ticketNumbers;

        emit TicketsPurchase(_id,address(msg.sender),_receiveAddress,_ticketNumbers);
    }


    function endRedEnvelope(
        uint256 _id
    )external onlyOperator nonReentrant{
        require(_redEnvelopes[_id].status == Status.Open, "RedEnvelope is not open");
        //require(block.timestamp > _redEnvelopes[_id].endTime || _redEnvelopes[_id].userTickets == _redEnvelopes[_id].maxTickets, "RedEnvelope is over");
        _redEnvelopes[_id].status = Status.Close;

        emit RedEnvelopeClosed(_id,block.timestamp,_redEnvelopes[_id].userTickets,_redEnvelopes[_id].injectTickets);
    }

    function drawPrize(
        uint256 _id,
        uint256 _nonce
    )external onlyOperator nonReentrant{
        require(_redEnvelopes[_id].status == Status.Close, "RedEnvelope not close");
        _redEnvelopes[_id].status = Status.Claimable;
        uint256 totalTickets = _redEnvelopes[_id].userTickets + _redEnvelopes[_id].injectTickets;
        emit RedEnvelopeClaimable(_id,block.timestamp);

        if (totalTickets == 0){
            return ;
        }

        //TODO: get randomWord
        uint256 randomWord = _nonce;
        uint256 amountToken =  _redEnvelopes[_id].ticketPirce * totalTickets; 

        uint256[] memory _randoms = _getSortRandoms(randomWord,_redEnvelopes[_id].userTickets,amountToken);

        _calculatePrize(_id,_randoms);
        
        //用地址为单位去领取
        if(_redEnvelopes[_id].autoClaim){
            for(uint256 i = 0;i < _redEnvelopes[_id].userAddrNum;i++){
                if(_amount2claimed[_id][_userAddrIndex[_id][i]] != 0){
                    _claimPrize(_id,_userAddrIndex[_id][i]);
                }
            }
        }
    }

    function _calculatePrize(uint256 _id,uint256[] memory _randoms)internal{
        //以用户投注总数为维度开奖
        uint256 totalSendAmount = 0;
        for (uint256 i = 0; i < _redEnvelopes[_id].userTickets; i++){
            uint256 sendValue = _randoms[i] - totalSendAmount;
            
            address _receiveAddress = _tickets[_id][i].receiveAddress;
            emit PrizeDrawn(_id,_receiveAddress,i,sendValue,_redEnvelopes[_id].autoClaim);
            _amount2claimed[_id][_receiveAddress] += sendValue;
            totalSendAmount += sendValue;
        }
    }


    function _leftRotate(uint256 _value,uint32 _shift)internal pure returns(uint256){
        return (_value << _shift) | (_value >> (256 - _shift));
    }

    function _deriveRandom(uint256 _seed,uint256 i)internal pure returns(uint256){
        //TODO:
        uint32 shift = uint32(i % 256);
        return uint256(keccak256(abi.encodePacked(i,_leftRotate(_seed,shift))));
    }

    //通过_seed，一共生成_num个随机数,分布在0-_range之间，并且按照从小到大排序
    //最后一个数必为range
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

        ticketToken.safeTransfer(_winner, amountTokenToTransfer);
        _amount2claimed[_id][_winner] = 0;
        emit ClaimPrize(_id,_winner,amountTokenToTransfer,_redEnvelopes[_id].autoClaim);
    }

    function redEnvelopeStatus(uint256 _id) public view  returns (Status){
        return _redEnvelopes[_id].status;
    }
}