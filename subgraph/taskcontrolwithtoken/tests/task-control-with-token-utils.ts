import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Approval,
  OwnershipTransferred,
  TaskAdd,
  TicketGet,
  TokenMint,
  Transfer
} from "../generated/TaskControlWithToken/TaskControlWithToken"

export function createApprovalEvent(
  owner: Address,
  spender: Address,
  value: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return approvalEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createTaskAddEvent(taskAddr: Address, weight: BigInt): TaskAdd {
  let taskAddEvent = changetype<TaskAdd>(newMockEvent())

  taskAddEvent.parameters = new Array()

  taskAddEvent.parameters.push(
    new ethereum.EventParam("taskAddr", ethereum.Value.fromAddress(taskAddr))
  )
  taskAddEvent.parameters.push(
    new ethereum.EventParam("weight", ethereum.Value.fromUnsignedBigInt(weight))
  )

  return taskAddEvent
}

export function createTicketGetEvent(
  id: BigInt,
  fromAddress: Address,
  receiveAddress: Address,
  amount: BigInt,
  ticketNumbers: BigInt,
  buy: boolean
): TicketGet {
  let ticketGetEvent = changetype<TicketGet>(newMockEvent())

  ticketGetEvent.parameters = new Array()

  ticketGetEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  ticketGetEvent.parameters.push(
    new ethereum.EventParam(
      "fromAddress",
      ethereum.Value.fromAddress(fromAddress)
    )
  )
  ticketGetEvent.parameters.push(
    new ethereum.EventParam(
      "receiveAddress",
      ethereum.Value.fromAddress(receiveAddress)
    )
  )
  ticketGetEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  ticketGetEvent.parameters.push(
    new ethereum.EventParam(
      "ticketNumbers",
      ethereum.Value.fromUnsignedBigInt(ticketNumbers)
    )
  )
  ticketGetEvent.parameters.push(
    new ethereum.EventParam("buy", ethereum.Value.fromBoolean(buy))
  )

  return ticketGetEvent
}

export function createTokenMintEvent(
  sender: Address,
  taskAddr: Address,
  receiveAddress: Address,
  amount: BigInt
): TokenMint {
  let tokenMintEvent = changetype<TokenMint>(newMockEvent())

  tokenMintEvent.parameters = new Array()

  tokenMintEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  tokenMintEvent.parameters.push(
    new ethereum.EventParam("taskAddr", ethereum.Value.fromAddress(taskAddr))
  )
  tokenMintEvent.parameters.push(
    new ethereum.EventParam(
      "receiveAddress",
      ethereum.Value.fromAddress(receiveAddress)
    )
  )
  tokenMintEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return tokenMintEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferEvent
}
