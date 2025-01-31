import { CachedRoutesBucket, CachedRoutesStrategy } from '../../../../../../lib/handlers/router-entities/route-caching'
import { CacheMode, ChainId } from '@monocerus/smart-order-router'
import { CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { expect } from 'chai'

describe('CachedRoutesStrategy', () => {
  const WETH = new Token(ChainId.MAINNET, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18, 'WETH')
  let strategy: CachedRoutesStrategy

  beforeEach(() => {
    strategy = new CachedRoutesStrategy({
      pair: 'WETH/USD',
      tradeType: TradeType.EXACT_INPUT,
      chainId: ChainId.MAINNET,
      buckets: [
        new CachedRoutesBucket({ bucket: 1, blocksToLive: 2, cacheMode: CacheMode.Tapcompare }),
        new CachedRoutesBucket({ bucket: 5, blocksToLive: 2, cacheMode: CacheMode.Tapcompare }),
        new CachedRoutesBucket({ bucket: 10, blocksToLive: 1, cacheMode: CacheMode.Tapcompare }),
        new CachedRoutesBucket({ bucket: 50, blocksToLive: 1, cacheMode: CacheMode.Tapcompare }),
        new CachedRoutesBucket({ bucket: 100, blocksToLive: 1, cacheMode: CacheMode.Tapcompare }),
        new CachedRoutesBucket({ bucket: 500, blocksToLive: 1, cacheMode: CacheMode.Tapcompare }),
      ],
    })
  })

  describe('#getCachingBucket', () => {
    it('find the first bucket that fits the amount', () => {
      const currencyAmount = CurrencyAmount.fromRawAmount(WETH, 1 * 10 ** WETH.decimals)
      const cachingParameters = strategy.getCachingBucket(currencyAmount)

      expect(cachingParameters).to.not.be.undefined
      expect(cachingParameters?.bucket).to.eq(1)
    })

    it('find the bucket, searching in the middle amounts', () => {
      const currencyAmount = CurrencyAmount.fromRawAmount(WETH, 42 * 10 ** WETH.decimals)
      const cachingParameters = strategy.getCachingBucket(currencyAmount)

      expect(cachingParameters).to.not.be.undefined
      expect(cachingParameters?.bucket).to.eq(50)
    })

    it('looks for bucket in higher amounts', () => {
      const currencyAmount = CurrencyAmount.fromRawAmount(WETH, 500 * 10 ** WETH.decimals)
      const cachingParameters = strategy.getCachingBucket(currencyAmount)

      expect(cachingParameters).to.not.be.undefined
      expect(cachingParameters?.bucket).to.eq(500)
    })

    it('returns undefined once we are out of range', () => {
      const currencyAmount = CurrencyAmount.fromRawAmount(WETH, 501 * 10 ** WETH.decimals)
      const cachingParameters = strategy.getCachingBucket(currencyAmount)

      expect(cachingParameters).to.be.undefined
    })
  })
})
