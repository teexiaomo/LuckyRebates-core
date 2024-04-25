import {
  Approval as ApprovalEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  TaskAdd as TaskAddEvent,
  TicketGet as TicketGetEvent,
  TokenMint as TokenMintEvent,
  Transfer as TransferEvent,
  TaskControlWithToken
} from "../generated/TaskControlWithToken/TaskControlWithToken"
import {
  Approval,
  OwnershipTransferred,
  TaskAdd,
  TicketGet,
  TokenMint,
  Transfer,
  UserInfo
} from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

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

export function handleTaskAdd(event: TaskAddEvent): void {
  let entity = new TaskAdd(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.operatorAddress = event.transaction.from
  entity.taskAddr = event.params.taskAddr
  entity.weight = event.params.weight

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTicketGet(event: TicketGetEvent): void {
  let userInfo = UserInfo.load(event.params.fromAddress)
  if (userInfo == null){
    userInfo = new UserInfo(event.params.fromAddress)
  }
  let contract = TaskControlWithToken.bind(event.address)
  userInfo.balance  = contract.balanceOf(event.params.fromAddress)
  userInfo.save()

  let entity = new TicketGet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.redEnvelope = event.params.id
  entity.fromAddress = event.params.fromAddress
  entity.receiveAddress = event.params.receiveAddress
  entity.amount = event.params.amount
  entity.ticketNumbers = event.params.ticketNumbers
  entity.buy = event.params.buy

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.userInfo = event.params.fromAddress

  entity.save()
}

export function handleTokenMint(event: TokenMintEvent): void {
  let userInfo = UserInfo.load(event.params.receiveAddress)
  if (userInfo == null){
    userInfo = new UserInfo(event.params.receiveAddress)
  }
  let contract = TaskControlWithToken.bind(event.address)
  userInfo.balance  = contract.balanceOf(event.params.receiveAddress)
  userInfo.save()

  let entity = new TokenMint(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.taskAddr = event.params.taskAddr
  entity.receiveAddress = event.params.receiveAddress
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.userInfo = event.params.receiveAddress
  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
