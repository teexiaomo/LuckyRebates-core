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

export function handleClaimPrize(event: ClaimPrizeEvent): void {
  let entity = new ClaimPrize(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.LuckyRedEnvelopeV2_id = event.params.id
  entity.winner = event.params.winner
  entity.totalAmount = event.params.totalAmount
  entity.autoClaim = event.params.autoClaim

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

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
  entity.LuckyRedEnvelopeV2_id = event.params.id
  entity.winner = event.params.winner
  entity.index = event.params.index
  entity.amount = event.params.amount
  entity.autoClaim = event.params.autoClaim

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRedEnvelopeClaimable(
  event: RedEnvelopeClaimableEvent
): void {
  let entity = new RedEnvelopeClaimable(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.LuckyRedEnvelopeV2_id = event.params.id
  entity.endTime = event.params.endTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRedEnvelopeClosed(event: RedEnvelopeClosedEvent): void {
  let entity = new RedEnvelopeClosed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.LuckyRedEnvelopeV2_id = event.params.id
  entity.endTime = event.params.endTime
  entity.buyTickets = event.params.buyTickets
  entity.getTickets = event.params.getTickets
  entity.injectTickets = event.params.injectTickets

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRedEnvelopeCreated(event: RedEnvelopeCreatedEvent): void {
  let entity = new RedEnvelopeCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.LuckyRedEnvelopeV2_id = event.params.id
  entity.endTime = event.params.endTime
  entity.maxTickets = event.params.maxTickets
  entity.maxPrizeNum = event.params.maxPrizeNum
  entity.ticketPirce = event.params.ticketPirce
  entity.ticketToken = event.params.ticketToken
  entity.getTicketAddr = event.params.getTicketAddr
  entity.autoClaim = event.params.autoClaim

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTicketsGet(event: TicketsGetEvent): void {
  let entity = new TicketsGet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.LuckyRedEnvelopeV2_id = event.params.id
  entity.sender = event.params.sender
  entity.receiveAddress = event.params.receiveAddress
  entity.ticketNumbers = event.params.ticketNumbers

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTicketsInject(event: TicketsInjectEvent): void {
  let entity = new TicketsInject(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.LuckyRedEnvelopeV2_id = event.params.id
  entity.sender = event.params.sender
  entity.ticketNumbers = event.params.ticketNumbers

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTicketsPurchase(event: TicketsPurchaseEvent): void {
  let entity = new TicketsPurchase(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.LuckyRedEnvelopeV2_id = event.params.id
  entity.sender = event.params.sender
  entity.receiveAddress = event.params.receiveAddress
  entity.ticketNumbers = event.params.ticketNumbers

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
