import {
  ClaimPrize as ClaimPrizeEvent,
  DefaultAutoClaimChange as DefaultAutoClaimChangeEvent,
  DefaultTokenChange as DefaultTokenChangeEvent,
  OperatorAddress as OperatorAddressEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PrizeDrawn as PrizeDrawnEvent,
  RedEnvelopeClaimable as RedEnvelopeClaimableEvent,
  RedEnvelopeClosed as RedEnvelopeClosedEvent,
  RedEnvelopeCreated as RedEnvelopeCreatedEvent,
  TicketsGet as TicketsGetEvent,
  TicketsInject as TicketsInjectEvent,
  TicketsPurchase as TicketsPurchaseEvent
} from "../generated/LuckyRedEnvelopeV2/LuckyRedEnvelopeV2"
import {
  RedEnvelope,
  UserInfo,
  ClaimPrize,
  DefaultAutoClaimChange,
  DefaultTokenChange,
  OperatorAddress,
  OwnershipTransferred,
  PrizeDrawn,
  RedEnvelopeClaimable,
  RedEnvelopeClosed,
  RedEnvelopeCreated,
  TicketsGet,
  TicketsInject,
  TicketsPurchase
} from "../generated/schema"
import {
  BigInt,
  Bytes,
  Address
}from "@graphprotocol/graph-ts"

export function handleClaimPrize(event: ClaimPrizeEvent): void {
  let entity = new ClaimPrize(
    Bytes.fromUTF8(event.params.id.toString() + event.params.winner.toString())
  )
  
  entity.winner = event.params.winner
  entity.totalAmount = event.params.totalAmount
  entity.autoClaim = event.params.autoClaim

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  

  let id = event.params.id.toString()
  entity.redEnvelope = id
  entity.userInfo = event.params.winner

  entity.save()
}

export function handleDefaultAutoClaimChange(
  event: DefaultAutoClaimChangeEvent
): void {
  let entity = new DefaultAutoClaimChange(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.defaultAutoClaim = event.params.defaultAutoClaim

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDefaultTokenChange(event: DefaultTokenChangeEvent): void {
  let entity = new DefaultTokenChange(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.defaultTicketToken = event.params.defaultTicketToken
  entity.defaultTicketPirce = event.params.defaultTicketPirce

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOperatorAddress(event: OperatorAddressEvent): void {
  let entity = new OperatorAddress(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.operatorAddress = event.params.operatorAddress
  entity.opt = event.params.opt

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePrizeDrawn(event: PrizeDrawnEvent): void {
  let entity = new PrizeDrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.winner = event.params.winner
  entity.index = event.params.index
  entity.amount = event.params.amount
  entity.autoClaim = event.params.autoClaim

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.redEnvelope = event.params.id.toString()
  entity.userInfo = event.params.winner
  entity.claimPrize = Bytes.fromUTF8(event.params.id.toString() + event.params.winner.toString())
  entity.save()

}

export function handleRedEnvelopeClaimable(
  event: RedEnvelopeClaimableEvent
): void {
  let id = event.params.id.toString()
  let entity = new RedEnvelopeClaimable(
    id
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  let redEnvelope = RedEnvelope.load(id)
  if (redEnvelope != null){
    redEnvelope.status = 3
    redEnvelope.save()
  }
  entity.redEnvelope = id

  entity.save()
}

export function handleRedEnvelopeClosed(event: RedEnvelopeClosedEvent): void {
  let id = event.params.id.toString()
  let entity = new RedEnvelopeClosed(
    id
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  let redEnvelope = RedEnvelope.load(id)
  if (redEnvelope != null){
    redEnvelope.status = 2
    redEnvelope.endTimeTimestamp = event.params.endTime
    redEnvelope.buyTickets = event.params.buyTickets
    redEnvelope.getTickets = event.params.getTickets
    redEnvelope.injectTickets = event.params.injectTickets

    redEnvelope.save()
  }
  
  entity.redEnvelope = id

  entity.save()
}

export function handleRedEnvelopeCreated(event: RedEnvelopeCreatedEvent): void {
  let id = event.params.id.toString()
  let redEnvelope = new RedEnvelope(
    id
  )
  redEnvelope.status = 1
  redEnvelope.buyTickets = new BigInt(0)
  redEnvelope.getTickets = new BigInt(0)
  redEnvelope.getTicketAddr = event.params.getTicketAddr
  redEnvelope.injectTickets = new BigInt(0)
  redEnvelope.startTimestamp = event.block.timestamp
  redEnvelope.maxTickets = event.params.maxTickets
  redEnvelope.maxPrizeNum = event.params.maxPrizeNum

  redEnvelope.ticketToken = event.params.ticketToken
  redEnvelope.ticketPirce = event.params.ticketPirce
  redEnvelope.autoClaim = event.params.autoClaim
  
  
  if (event.params.getTicketAddr ==  Address.zero()){
    redEnvelope.model = 1
  }else{
    redEnvelope.model = 2
  }
  
  redEnvelope.save()

  let entity = new RedEnvelopeCreated(
    id
  )
  
  entity.endTime = event.params.endTime
  entity.maxTickets = event.params.maxTickets
  entity.maxPrizeNum = event.params.maxPrizeNum
  entity.getTicketAddr = event.params.getTicketAddr
  entity.ticketPirce = event.params.ticketPirce
  entity.autoClaim = event.params.autoClaim

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.redEnvelope = id

  entity.save()
}

export function handleTicketsGet(event: TicketsGetEvent): void {
  let userInfo = UserInfo.load(event.params.receiveAddress)
  if (userInfo == null ){
    userInfo = new UserInfo(event.params.receiveAddress)
    userInfo.save()
  } 

  let entity = new TicketsGet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  
  entity.sender = event.params.sender
  entity.receiveAddress = event.params.receiveAddress
  entity.ticketNumbers = event.params.ticketNumbers

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  let id = event.params.id.toString()
 
  entity.redEnvelope = id
  entity.userInfo = event.params.receiveAddress

  entity.save()

  let redEnvelope = RedEnvelope.load(id)
  if (redEnvelope != null){
    redEnvelope.getTickets = redEnvelope.getTickets.plus(event.params.ticketNumbers)
    redEnvelope.save()
  }

  entity.save()
}

export function handleTicketsInject(event: TicketsInjectEvent): void {
  let entity = new TicketsInject(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  
  entity.sender = event.params.sender
  entity.ticketNumbers = event.params.ticketNumbers

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  
  let id = event.params.id.toString()
  entity.redEnvelope = id

  entity.save()
  
  let redEnvelope = RedEnvelope.load(id)
  if (redEnvelope != null){
    redEnvelope.injectTickets = redEnvelope.injectTickets.plus(event.params.ticketNumbers)
    redEnvelope.save()
  }
}

export function handleTicketsPurchase(event: TicketsPurchaseEvent): void {
  let userInfo = UserInfo.load(event.params.receiveAddress)
  if (userInfo == null ){
    userInfo = new UserInfo(event.params.receiveAddress)
    userInfo.save()
  } 

  let entity = new TicketsPurchase(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  
  entity.sender = event.params.sender
  entity.receiveAddress = event.params.receiveAddress
  entity.ticketNumbers = event.params.ticketNumbers

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  let id = event.params.id.toString()
 
  entity.redEnvelope = id
  entity.userInfo = event.params.receiveAddress

  entity.save()

  let redEnvelope = RedEnvelope.load(id)
  if (redEnvelope != null){
    redEnvelope.buyTickets = redEnvelope.buyTickets.plus(event.params.ticketNumbers)
    redEnvelope.save()
  }
}
