// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.20;

interface IRedEnvelope{
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
        uint256 _maxPrizeNum,
        uint256 _secret
    )external;
    
    function createRedEnvelopeDetail(
        address _tokenAddress,
        uint256 _ticketPirce,
        uint256 _endTime,
        uint256 _maxTickets,
        uint256 _maxPrizeNum,
        address _injectAddress,
        uint256 _injectTicketNum,
        address _getTicketAddr,
        uint256 _secret
    )external;

    function injectTickets(uint256 _id,uint256 _ticketNumbers)external;

    function getTickets(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)external;

    function buyTickets(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)external;

    function endRedEnvelope(uint256 _id)external;

    function drawPrize(uint256 _id,uint256 _nonce)external;

    function claimPrize(uint256 _id)external;

    function viewRedEnvelopeStatus(uint256 _id) external view returns(uint);

    function viewCurrentRedEnvelopeId() external view returns(uint256);
    //function viewRedEnvelopeGet(uint256 _id,address _user)external view;
    //function viewRedEnvelopePrize(uint256 _id,address _user)external view;

}