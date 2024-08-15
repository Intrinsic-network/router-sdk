import { RBTC, Token, WRBTC, CurrencyAmount } from '@intrinsic-finance/sdk-core'
import { Route as V3RouteSDK, Pool, FeeAmount, TickMath, encodeSqrtRatioX96 } from '@intrinsic-finance/intrinsic-sdk'
import { RouteV3 } from './route'
import { Protocol } from './protocol'
import { Route as V2RouteSDK, Pair } from '@uniswap/v2-sdk'
import { RouteV2 } from './route'

describe('RouteV3', () => {
  const rbtc = RBTC.onChain(30)
  const token0 = new Token(30, '0x0000000000000000000000000000000000000001', 18, 't0')
  const token1 = new Token(30, '0x0000000000000000000000000000000000000002', 18, 't1')
  const token2 = new Token(30, '0x0000000000000000000000000000000000000003', 18, 't2')
  const wrbtc = WRBTC[30]

  const pool_0_1 = new Pool(token0, token1, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_0_wrbtc = new Pool(token0, wrbtc, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_1_wrbtc = new Pool(token1, wrbtc, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])

  describe('path', () => {
    it('wraps original v3 route object and successfully constructs a path from the tokens', () => {
      const routeOriginal = new V3RouteSDK([pool_0_1], token0, token1)
      const route = new RouteV3(routeOriginal)
      expect(route.pools).toEqual([pool_0_1])
      expect(route.tokenPath).toEqual([token0, token1])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(token1)
      expect(route.chainId).toEqual(30)
    })
  })

  it('successfully assigns the protocol', () => {
    const routeOriginal = new V3RouteSDK([pool_0_1], token0, token1)
    const route = new RouteV3(routeOriginal)
    expect(route.protocol).toEqual(Protocol.V3)
  })

  it('inherits parameters from extended route class', () => {
    const routeOriginal = new V3RouteSDK([pool_0_1], token0, token1)
    const route = new RouteV3(routeOriginal)
    expect(route.pools).toEqual(routeOriginal.pools)
    expect(route.path).toEqual(routeOriginal.tokenPath)
    expect(route.input).toEqual(routeOriginal.input)
    expect(route.output).toEqual(routeOriginal.output)
    expect(route.midPrice).toEqual(routeOriginal.midPrice)
    expect(route.chainId).toEqual(routeOriginal.chainId)
  })

  it('can have a token as both input and output', () => {
    const routeOriginal = new V3RouteSDK([pool_0_wrbtc, pool_0_1, pool_1_wrbtc], wrbtc, wrbtc)
    const route = new RouteV3(routeOriginal)
    expect(route.pools).toEqual([pool_0_wrbtc, pool_0_1, pool_1_wrbtc])
    expect(route.input).toEqual(wrbtc)
    expect(route.output).toEqual(wrbtc)
  })

  it('supports rbtc input', () => {
    const routeOriginal = new V3RouteSDK([pool_0_wrbtc], rbtc, token0)
    const route = new RouteV3(routeOriginal)
    expect(route.pools).toEqual([pool_0_wrbtc])
    expect(route.input).toEqual(rbtc)
    expect(route.output).toEqual(token0)
  })

  it('supports rbtc output', () => {
    const routeOriginal = new V3RouteSDK([pool_0_wrbtc], token0, rbtc)
    const route = new RouteV3(routeOriginal)
    expect(route.pools).toEqual([pool_0_wrbtc])
    expect(route.input).toEqual(token0)
    expect(route.output).toEqual(rbtc)
  })

  describe('#midPrice', () => {
    const pool_0_1 = new Pool(
      token0,
      token1,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(1, 5),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 5)),
      []
    )
    const pool_1_2 = new Pool(
      token1,
      token2,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(15, 30),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(15, 30)),
      []
    )
    const pool_0_wrbtc = new Pool(
      token0,
      wrbtc,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(3, 1),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(3, 1)),
      []
    )
    const pool_1_wrbtc = new Pool(
      token1,
      wrbtc,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(1, 7),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 7)),
      []
    )

    it('correct for 0 -> 1', () => {
      const routeOriginal = new V3RouteSDK([pool_0_1], token0, token1)
      const price = new RouteV3(routeOriginal).midPrice
      expect(price.toFixed(4)).toEqual('0.2000')
      expect(price.baseCurrency.equals(token0)).toEqual(true)
      expect(price.quoteCurrency.equals(token1)).toEqual(true)
    })

    it('is cached', () => {
      const routeOriginal = new V3RouteSDK([pool_0_1], token0, token1)
      const route = new RouteV3(routeOriginal)
      expect(route.midPrice).toStrictEqual(route.midPrice)
    })

    it('correct for 1 -> 0', () => {
      const routeOriginal = new V3RouteSDK([pool_0_1], token1, token0)
      const price = new RouteV3(routeOriginal).midPrice
      expect(price.toFixed(4)).toEqual('5.0000')
      expect(price.baseCurrency.equals(token1)).toEqual(true)
      expect(price.quoteCurrency.equals(token0)).toEqual(true)
    })

    it('correct for 0 -> 1 -> 2', () => {
      const routeOriginal = new V3RouteSDK([pool_0_1, pool_1_2], token0, token2)
      const price = new RouteV3(routeOriginal).midPrice
      expect(price.toFixed(4)).toEqual('0.1000')
      expect(price.baseCurrency.equals(token0)).toEqual(true)
      expect(price.quoteCurrency.equals(token2)).toEqual(true)
    })

    it('correct for 2 -> 1 -> 0', () => {
      const routeOriginal = new V3RouteSDK([pool_1_2, pool_0_1], token2, token0)
      const price = new RouteV3(routeOriginal).midPrice
      expect(price.toFixed(4)).toEqual('10.0000')
      expect(price.baseCurrency.equals(token2)).toEqual(true)
      expect(price.quoteCurrency.equals(token0)).toEqual(true)
    })

    it('correct for rbtc -> 0', () => {
      const routeOriginal = new V3RouteSDK([pool_0_wrbtc], rbtc, token0)
      const price = new RouteV3(routeOriginal).midPrice
      expect(price.toFixed(4)).toEqual('0.3333')
      expect(price.baseCurrency.equals(rbtc)).toEqual(true)
      expect(price.quoteCurrency.equals(token0)).toEqual(true)
    })

    it('correct for 1 -> wrbtc', () => {
      const price = new V3RouteSDK([pool_1_wrbtc], token1, wrbtc).midPrice
      expect(price.toFixed(4)).toEqual('0.1429')
      expect(price.baseCurrency.equals(token1)).toEqual(true)
      expect(price.quoteCurrency.equals(wrbtc)).toEqual(true)
    })

    it('correct for rbtc -> 0 -> 1 -> wrbtc', () => {
      const routeOriginal = new V3RouteSDK([pool_0_wrbtc, pool_0_1, pool_1_wrbtc], rbtc, wrbtc)
      const price = new RouteV3(routeOriginal).midPrice
      expect(price.toSignificant(4)).toEqual('0.009524')
      expect(price.baseCurrency.equals(rbtc)).toEqual(true)
      expect(price.quoteCurrency.equals(wrbtc)).toEqual(true)
    })

    it('correct for wrbtc -> 0 -> 1 -> rbtc', () => {
      const routeOriginal = new V3RouteSDK([pool_0_wrbtc, pool_0_1, pool_1_wrbtc], wrbtc, rbtc)
      const price = new RouteV3(routeOriginal).midPrice
      expect(price.toSignificant(4)).toEqual('0.009524')
      expect(price.baseCurrency.equals(wrbtc)).toEqual(true)
      expect(price.quoteCurrency.equals(rbtc)).toEqual(true)
    })
  })
})

describe('RouteV2', () => {
  const rbtc = RBTC.onChain(30)
  const token0 = new Token(30, '0x0000000000000000000000000000000000000001', 18, 't0')
  const token1 = new Token(30, '0x0000000000000000000000000000000000000002', 18, 't1')
  const wrbtc = WRBTC[30]
  const pair_0_1 = new Pair(CurrencyAmount.fromRawAmount(token0, '100'), CurrencyAmount.fromRawAmount(token1, '200'))
  const pair_0_wrbtc = new Pair(CurrencyAmount.fromRawAmount(token0, '100'), CurrencyAmount.fromRawAmount(wrbtc, '100'))
  const pair_1_wrbtc = new Pair(CurrencyAmount.fromRawAmount(token1, '175'), CurrencyAmount.fromRawAmount(wrbtc, '100'))

  it('successfully assigns the protocol', () => {
    const routeOriginal = new V2RouteSDK([pair_0_1], token0, token1)
    const route = new RouteV2(routeOriginal)
    expect(route.protocol).toEqual(Protocol.V2)
  })

  it('inherits parameters from extended route class', () => {
    const routeOriginal = new V2RouteSDK([pair_0_1], token0, token1)
    const route = new RouteV2(routeOriginal)
    expect(route.pools).toEqual(routeOriginal.pairs)
    expect(route.path).toEqual(routeOriginal.path)
    expect(route.input).toEqual(routeOriginal.input)
    expect(route.output).toEqual(routeOriginal.output)
    expect(route.midPrice).toEqual(routeOriginal.midPrice)
    expect(route.chainId).toEqual(routeOriginal.chainId)
  })

  it('constructs a path from the tokens', () => {
    const routeOriginal = new V2RouteSDK([pair_0_1], token0, token1)
    const route = new RouteV2(routeOriginal)
    expect(route.pairs).toEqual([pair_0_1])
    expect(route.path).toEqual([token0, token1])
    expect(route.input).toEqual(token0)
    expect(route.output).toEqual(token1)
    expect(route.chainId).toEqual(30)
  })

  it('can have a token as both input and output', () => {
    const routeOriginal = new V2RouteSDK([pair_0_wrbtc, pair_0_1, pair_1_wrbtc], wrbtc, wrbtc)
    const route = new RouteV2(routeOriginal)
    expect(route.pairs).toEqual([pair_0_wrbtc, pair_0_1, pair_1_wrbtc])
    expect(route.input).toEqual(wrbtc)
    expect(route.output).toEqual(wrbtc)
  })

  it('supports rbtc input', () => {
    const routeOriginal = new V2RouteSDK([pair_0_wrbtc], rbtc, token0)
    const route = new RouteV2(routeOriginal)
    expect(route.pairs).toEqual([pair_0_wrbtc])
    expect(route.input).toEqual(rbtc)
    expect(route.output).toEqual(token0)
  })

  it('supports rbtc output', () => {
    const routeOriginal = new V2RouteSDK([pair_0_wrbtc], token0, rbtc)
    const route = new RouteV2(routeOriginal)
    expect(route.pairs).toEqual([pair_0_wrbtc])
    expect(route.input).toEqual(token0)
    expect(route.output).toEqual(rbtc)
  })
})
