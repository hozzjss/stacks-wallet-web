import { useMemo } from 'react';

import { baseCurrencyAmountInQuote } from '@app/common/money/calculate-money';
import { i18nFormatCurrency } from '@app/common/money/format-money';
import { useBitcoinAssetBalance } from '@app/query/bitcoin/address/address.hooks';
import { useCryptoCurrencyMarketData } from '@app/query/common/market-data/market-data.hooks';
import { useCurrentBtcNativeSegwitAccountAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

export function useBtcAssetBalance() {
  const btcMarketData = useCryptoCurrencyMarketData('BTC');
  const btcAddress = useCurrentBtcNativeSegwitAccountAddressIndexZero();
  const btcAssetBalance = useBitcoinAssetBalance(btcAddress);

  return useMemo(
    () => ({
      btcAddress,
      btcAssetBalance,
      btcUsdBalance: i18nFormatCurrency(
        baseCurrencyAmountInQuote(btcAssetBalance.balance, btcMarketData)
      ),
    }),
    [btcAddress, btcAssetBalance, btcMarketData]
  );
}
