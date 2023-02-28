import { useCallback } from 'react';

import BigNumber from 'bignumber.js';
import { getAddressInfo, validate } from 'bitcoin-address-validation';

import { createMoney } from '@shared/models/money.model';

import { satToBtc } from '@app/common/money/unit-conversion';
import { useCurrentBitcoinAddressBalance } from '@app/query/bitcoin/address/address.hooks';
import { useGetUtxosByAddressQuery } from '@app/query/bitcoin/address/utxos-by-address.query';
import { useBitcoinFeeRate } from '@app/query/bitcoin/fees/fee-estimates.hooks';
import { useCurrentBtcNativeSegwitAccountAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { BtcSizeFeeEstimator } from '../fees/btc-size-fee-estimator';

export function useCalculateMaxBitcoinSpend() {
  const currentAccountBtcAddress = useCurrentBtcNativeSegwitAccountAddressIndexZero();
  const balance = useCurrentBitcoinAddressBalance();
  const { data: utxos } = useGetUtxosByAddressQuery(currentAccountBtcAddress);
  const { data: feeRate } = useBitcoinFeeRate();

  return useCallback(
    (address: string = '') => {
      if (!utxos || !feeRate)
        return {
          spendAllFee: 0,
          amount: createMoney(0, 'BTC'),
          spendableBitcoin: new BigNumber(0),
        };

      const txSizer = new BtcSizeFeeEstimator();
      const addressInfo = validate(address) ? getAddressInfo(address) : null;
      const addressTypeWithFallback = addressInfo ? addressInfo.type : 'p2wpkh';
      const size = txSizer.calcTxSize({
        input_script: 'p2wpkh',
        input_count: utxos.length,
        [`${addressTypeWithFallback}_output_count`]: 2,
      });
      const fee = Math.ceil(size.txVBytes * feeRate.fastestFee);

      const spendableAmount = BigNumber.max(0, balance.amount.minus(fee));

      return {
        spendAllFee: fee,
        amount: createMoney(spendableAmount, 'BTC'),
        spendableBitcoin: satToBtc(spendableAmount),
      };
    },
    [balance.amount, feeRate, utxos]
  );
}
