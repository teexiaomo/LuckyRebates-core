import { bigInt } from "@graphprotocol/graph-ts"
import {
  ClaimPrize as ClaimPrizeEvent,
  DefaultChange as DefaultChangeEvent,
  NewOperatorAddress as NewOperatorAddressEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PrizeDrawn as PrizeDrawnEvent,
  RedEnvelopeClaimable as RedEnvelopeClaimableEvent,
  RedEnvelopeClosed as RedEnvelopeClosedEvent,
  RedEnvelopeCreated as RedEnvelopeCreatedEvent,
  TicketsInject as TicketsInjectEvent,
  TicketsPurchase as TicketsPurchaseEvent
} from "../generated/LuckyRedEnvelope/LuckyRedEnvelope"
import {
  RedEnvelope,
  UserInfo,
  ClaimPrize,
  DefaultChange,
  NewOperatorAddress,
  OwnershipTransferred,
  PrizeDrawn,
  RedEnvelopeClaimable,
  RedEnvelopeClosed,
  RedEnvelopeCreated,
  TicketsInject,
  TicketsPurchase
} from "../generated/schema"
import {
  BigInt,
  Bytes
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

export function handleDefaultChange(event: DefaultChangeEvent): void {
  let entity = new DefaultChange(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.defaultTicketPirce = event.params.defaultTicketPirce
  entity.defaultAutoClaim = event.params.defaultAutoClaim

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()   
}

export function handleNewOperatorAddress(event: NewOperatorAddressEvent): void {
  let entity = new NewOperatorAddress(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.operatorAddress = event.params.operatorAddress

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
    redEnvelope.userTickets = event.params.userTickets
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
  redEnvelope.userTickets = new BigInt(0)
  redEnvelope.injectTickets = new BigInt(0)
  redEnvelope.startTimestamp = event.params.startTime
  redEnvelope.maxTickets = event.params.maxTickets
  redEnvelope.ticketPirce = event.params.ticketPirce
  redEnvelope.autoClaim = event.params.autoClaim
  redEnvelope.save()

  let entity = new RedEnvelopeCreated(
    id
  )
  
  entity.setEndTime = event.params.endTime
  entity.setMaxTickets = event.params.maxTickets
  entity.setTicketPirce = event.params.ticketPirce
  entity.setAutoClaim = event.params.autoClaim

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.redEnvelope = id
  
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
    redEnvelope.userTickets = redEnvelope.userTickets.plus(event.params.ticketNumbers)
    redEnvelope.save()
  }
}
