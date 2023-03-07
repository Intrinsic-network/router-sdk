import { CurrencyAmount, RBTC, Token, WRBTC } from '@intrinsic-network/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { encodeSqrtRatioX96, FeeAmount, Pool } from '@intrinsic-network/intrinsic-sdk'
import { MixedRouteSDK } from '../entities/mixedRoute/route'
import { encodeMixedRouteToPath } from './encodeMixedRouteToPath'

describe('#encodeMixedRouteToPath', () => {
  const rbtc = RBTC.onChain(30)
  const token0 = new Token(30, '0x0000000000000000000000000000000000000001', 18, 't0', 'token0')
  const token1 = new Token(30, '0x0000000000000000000000000000000000000002', 18, 't1', 'token1')
  const token2 = new Token(30, '0x0000000000000000000000000000000000000003', 18, 't2', 'token2')

  const wrbtc = WRBTC[30]

  const pool_0_1_medium = new Pool(token0, token1, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_1_2_low = new Pool(token1, token2, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_0_wrbtc = new Pool(token0, wrbtc, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_1_wrbtc = new Pool(token1, wrbtc, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])

  const pair_0_1 = new Pair(CurrencyAmount.fromRawAmount(token0, '100'), CurrencyAmount.fromRawAmount(token1, '200'))
  const pair_1_2 = new Pair(CurrencyAmount.fromRawAmount(token1, '150'), CurrencyAmount.fromRawAmount(token2, '150'))
  const pair_0_wrbtc = new Pair(CurrencyAmount.fromRawAmount(token0, '100'), CurrencyAmount.fromRawAmount(wrbtc, '100'))
  const pair_1_wrbtc = new Pair(CurrencyAmount.fromRawAmount(token1, '175'), CurrencyAmount.fromRawAmount(wrbtc, '100'))
  const pair_2_wrbtc = new Pair(CurrencyAmount.fromRawAmount(token2, '150'), CurrencyAmount.fromRawAmount(wrbtc, '100'))

  const route_0_V3_1 = new MixedRouteSDK([pool_0_1_medium], token0, token1)
  const route_0_V3_1_V3_2 = new MixedRouteSDK([pool_0_1_medium, pool_1_2_low], token0, token2)
  const route_0_V3_wrbtc = new MixedRouteSDK([pool_0_wrbtc], token0, rbtc)
  const route_0_V3_1_V3_wrbtc = new MixedRouteSDK([pool_0_1_medium, pool_1_wrbtc], token0, rbtc)
  const route_wrbtc_V3_0 = new MixedRouteSDK([pool_0_wrbtc], rbtc, token0)
  const route_wrbtc_V3_0_V3_1 = new MixedRouteSDK([pool_0_wrbtc, pool_0_1_medium], rbtc, token1)

  const route_0_V2_1 = new MixedRouteSDK([pair_0_1], token0, token1)
  const route_0_V2_1_V2_2 = new MixedRouteSDK([pair_0_1, pair_1_2], token0, token2)
  const route_wrbtc_V2_0 = new MixedRouteSDK([pair_0_wrbtc], rbtc, token0)
  const route_wrbtc_V2_0_V2_1 = new MixedRouteSDK([pair_0_wrbtc, pair_0_1], rbtc, token1)
  const route_0_V2_wrbtc = new MixedRouteSDK([pair_0_wrbtc], token0, rbtc)
  const route_0_V2_1_V2_wrbtc = new MixedRouteSDK([pair_0_1, pair_1_wrbtc], token0, rbtc)

  const route_0_V3_1_V2_wrbtc = new MixedRouteSDK([pool_0_1_medium, pair_1_wrbtc], token0, rbtc)
  const route_0_V3_wrbtc_V2_1_V2_2 = new MixedRouteSDK([pool_0_wrbtc, pair_1_wrbtc, pair_1_2], token0, token2)
  const route_0_V3_1_v3_wrbtc_V2_2 = new MixedRouteSDK([pool_0_1_medium, pool_1_wrbtc, pair_2_wrbtc], token0, token2)

  describe('pure V3', () => {
    it('packs them for exact input single hop', () => {
      expect(encodeMixedRouteToPath(route_0_V3_1)).toEqual(
        '0x0000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002'
      )
    })

    it('packs them correctly for multihop exact input', () => {
      expect(encodeMixedRouteToPath(route_0_V3_1_V3_2)).toEqual(
        '0x0000000000000000000000000000000000000001000bb800000000000000000000000000000000000000020001f40000000000000000000000000000000000000003'
      )
    })

    it('wraps rbtc input for exact input single hop', () => {
      expect(encodeMixedRouteToPath(route_wrbtc_V3_0)).toEqual(
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb80000000000000000000000000000000000000001'
      )
    })

    it('wraps rbtc input for exact input multihop', () => {
      expect(encodeMixedRouteToPath(route_wrbtc_V3_0_V3_1)).toEqual(
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb80000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002'
      )
    })

    it('wraps rbtc output for exact input single hop', () => {
      expect(encodeMixedRouteToPath(route_0_V3_wrbtc)).toEqual(
        '0x0000000000000000000000000000000000000001000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      )
    })

    it('wraps rbtc output for exact input multihop', () => {
      expect(encodeMixedRouteToPath(route_0_V3_1_V3_wrbtc)).toEqual(
        '0x0000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      )
    })
  })

  describe('pure V2', () => {
    it('packs them for exact input single hop', () => {
      expect(encodeMixedRouteToPath(route_0_V2_1)).toEqual(
        '0x00000000000000000000000000000000000000018000000000000000000000000000000000000000000002'
      )
    })

    it('packs them correctly for multihop exact input', () => {
      expect(encodeMixedRouteToPath(route_0_V2_1_V2_2)).toEqual(
        '0x000000000000000000000000000000000000000180000000000000000000000000000000000000000000028000000000000000000000000000000000000000000003'
      )
    })

    it('wraps rbtc input for exact input single hop', () => {
      expect(encodeMixedRouteToPath(route_wrbtc_V2_0)).toEqual(
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc28000000000000000000000000000000000000000000001'
      )
    })

    it('wraps rbtc input for exact input multihop', () => {
      expect(encodeMixedRouteToPath(route_wrbtc_V2_0_V2_1)).toEqual(
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc280000000000000000000000000000000000000000000018000000000000000000000000000000000000000000002'
      )
    })

    it('wraps rbtc output for exact input single hop', () => {
      expect(encodeMixedRouteToPath(route_0_V2_wrbtc)).toEqual(
        '0x0000000000000000000000000000000000000001800000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      )
    })

    it('wraps rbtc output for exact input multihop', () => {
      expect(encodeMixedRouteToPath(route_0_V2_1_V2_wrbtc)).toEqual(
        '0x00000000000000000000000000000000000000018000000000000000000000000000000000000000000002800000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      )
    })
  })

  describe('mixed route', () => {
    it('packs them for exact input v3 -> v2 with wrapped rbtc output', () => {
      expect(encodeMixedRouteToPath(route_0_V3_1_V2_wrbtc)).toEqual(
        '0x0000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002800000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      )
    })

    it('packs them for exact input v3 -> v2 -> v2', () => {
      expect(encodeMixedRouteToPath(route_0_V3_wrbtc_V2_1_V2_2)).toEqual(
        '0x0000000000000000000000000000000000000001000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc280000000000000000000000000000000000000000000028000000000000000000000000000000000000000000003'
      )
    })

    it('packs them for exact input v3 -> v3 -> v2', () => {
      expect(encodeMixedRouteToPath(route_0_V3_1_v3_wrbtc_V2_2)).toEqual(
        '0x0000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc28000000000000000000000000000000000000000000003'
      )
    })
  })
})
