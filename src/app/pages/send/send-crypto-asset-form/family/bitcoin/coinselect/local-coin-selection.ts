import { getAddressInfo, validate } from 'bitcoin-address-validation';

import { UtxoResponseItem } from '@app/query/bitcoin/bitcoin-client';

import { BtcSizeFeeEstimator } from '../fees/btc-size-fee-estimator';

interface DetermineUtxosForSpendArgs {
  utxos: UtxoResponseItem[];
  amount: number;
  feeRate: number;
  recipient: string;
}
export function determineUtxosForSpend({
  utxos,
  amount,
  feeRate,
  recipient,
}: DetermineUtxosForSpendArgs) {
  if (!validate(recipient)) throw new Error('Cannot calculate spend of invalid address type');

  const addressInfo = getAddressInfo(recipient);

  const orderedUtxos = utxos.sort((a, b) => b.value - a.value);

  const txSizer = new BtcSizeFeeEstimator();

  const neededUtxos = [];
  let sum = 0n;
  let sizeInfo = null;

  for (const utxo of orderedUtxos) {
    sizeInfo = txSizer.calcTxSize({
      // Only p2wpkh is supported by the wallet
      input_script: 'p2wpkh',
      input_count: neededUtxos.length,
      // From the address of the recipient, we infer the output type
      [addressInfo.type + '_output_count']: 2,
    });
    if (sum >= BigInt(amount) + BigInt(Math.ceil(sizeInfo.txVBytes * feeRate))) break;

    sum += BigInt(utxo.value);
    neededUtxos.push(utxo);
  }

  if (!sizeInfo) throw new Error('Transaction size must be defined');

  const fee = Math.ceil(sizeInfo.txVBytes * feeRate);

  const outputs = [
    // outputs[0] = the desired amount going to recipient
    { value: BigInt(amount), address: recipient },
    // outputs[1] = the remainder to be returned to a change address
    { value: sum - BigInt(amount) - BigInt(fee) },
  ];

  return {
    orderedUtxos,
    inputs: neededUtxos,
    outputs,
    size: sizeInfo.txVBytes,
    fee,
  };
}
