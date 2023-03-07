import { Interface } from '@ethersproject/abi'
import { Percent, Token, validateAndParseAddress } from '@intrinsic-network/sdk-core'
import { abi } from '@intrinsic-network/swap-router-contracts/artifacts/contracts/interfaces/IPeripheryPaymentsWithFeeExtended.sol/IPeripheryPaymentsWithFeeExtended.json'
import { FeeOptions, Payments, toHex } from '@intrinsic-network/intrinsic-sdk'
import JSBI from 'jsbi'

function encodeFeeBips(fee: Percent): string {
  return toHex(fee.multiply(10_000).quotient)
}

export abstract class PaymentsExtended {
  public static INTERFACE: Interface = new Interface(abi)

  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static encodeUnwrapWRBTC(amountMinimum: JSBI, recipient?: string, feeOptions?: FeeOptions): string {
    // if there's a recipient, just pass it along
    if (typeof recipient === 'string') {
      return Payments.encodeUnwrapWRBTC(amountMinimum, recipient, feeOptions)
    }

    if (!!feeOptions) {
      const feeBips = encodeFeeBips(feeOptions.fee)
      const feeRecipient = validateAndParseAddress(feeOptions.recipient)

      return PaymentsExtended.INTERFACE.encodeFunctionData('unwrapWRBTCWithFee(uint256,uint256,address)', [
        toHex(amountMinimum),
        feeBips,
        feeRecipient,
      ])
    } else {
      return PaymentsExtended.INTERFACE.encodeFunctionData('unwrapWRBTC(uint256)', [toHex(amountMinimum)])
    }
  }

  public static encodeSweepToken(
    token: Token,
    amountMinimum: JSBI,
    recipient?: string,
    feeOptions?: FeeOptions
  ): string {
    // if there's a recipient, just pass it along
    if (typeof recipient === 'string') {
      return Payments.encodeSweepToken(token, amountMinimum, recipient, feeOptions)
    }

    if (!!feeOptions) {
      const feeBips = encodeFeeBips(feeOptions.fee)
      const feeRecipient = validateAndParseAddress(feeOptions.recipient)

      return PaymentsExtended.INTERFACE.encodeFunctionData('sweepTokenWithFee(address,uint256,uint256,address)', [
        token.address,
        toHex(amountMinimum),
        feeBips,
        feeRecipient,
      ])
    } else {
      return PaymentsExtended.INTERFACE.encodeFunctionData('sweepToken(address,uint256)', [
        token.address,
        toHex(amountMinimum),
      ])
    }
  }

  public static encodePull(token: Token, amount: JSBI): string {
    return PaymentsExtended.INTERFACE.encodeFunctionData('pull', [token.address, toHex(amount)])
  }

  public static encodeWrapRBTC(amount: JSBI): string {
    return PaymentsExtended.INTERFACE.encodeFunctionData('wrapRBTC', [toHex(amount)])
  }
}
