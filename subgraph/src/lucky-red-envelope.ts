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

export function handleClaimPrize(event: ClaimPrizeEvent): void {
  let entity = new ClaimPrize(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.LuckyRedEnvelope_id = event.params.id
  entity.winner = event.params.winner
  entity.totalAmount = event.params.totalAmount
  entity.autoClaim = event.params.autoClaim

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

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
  entity.LuckyRedEnvelope_id = event.params.id
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
  entity.LuckyRedEnvelope_id = event.params.id
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
  entity.LuckyRedEnvelope_id = event.params.id
  entity.endTime = event.params.endTime
  entity.userTickets = event.params.userTickets
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
  entity.LuckyRedEnvelope_id = event.params.id
  entity.startTime = event.params.startTime
  entity.endTime = event.params.endTime
  entity.maxTickets = event.params.maxTickets
  entity.ticketPirce = event.params.ticketPirce
  entity.autoClaim = event.params.autoClaim

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTicketsInject(event: TicketsInjectEvent): void {
  let entity = new TicketsInject(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.LuckyRedEnvelope_id = event.params.id
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
  entity.LuckyRedEnvelope_id = event.params.id
  entity.sender = event.params.sender
  entity.receiveAddress = event.params.receiveAddress
  entity.ticketNumbers = event.params.ticketNumbers

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
