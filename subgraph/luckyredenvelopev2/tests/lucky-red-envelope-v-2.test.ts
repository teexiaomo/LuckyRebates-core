import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { ClaimPrize } from "../generated/schema"
import { ClaimPrize as ClaimPrizeEvent } from "../generated/LuckyRedEnvelopeV2/LuckyRedEnvelopeV2"
import { handleClaimPrize } from "../src/lucky-red-envelope-v-2"
import { createClaimPrizeEvent } from "./lucky-red-envelope-v-2-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let id = BigInt.fromI32(234)
    let winner = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let totalAmount = BigInt.fromI32(234)
    let autoClaim = "boolean Not implemented"
    let newClaimPrizeEvent = createClaimPrizeEvent(
      id,
      winner,
      totalAmount,
      autoClaim
    )
    handleClaimPrize(newClaimPrizeEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ClaimPrize created and stored", () => {
    assert.entityCount("ClaimPrize", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ClaimPrize",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "winner",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ClaimPrize",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "totalAmount",
      "234"
    )
    assert.fieldEquals(
      "ClaimPrize",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "autoClaim",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
