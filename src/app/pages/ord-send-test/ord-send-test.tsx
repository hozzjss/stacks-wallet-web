import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { Text } from '@stacks/ui';
import BigNumber from 'bignumber.js';
import get from 'lodash.get';
import * as btc from 'micro-btc-signer';

import { isNumber } from '@shared/utils';

import { useBitcoinFeeRate } from '@app/query/bitcoin/fees/fee-estimates.hooks';
import { TaprootUtxo } from '@app/query/bitcoin/ordinals/use-taproot-address-utxos.query';

import { BtcSizeFeeEstimator } from '../send/send-crypto-asset-form/family/bitcoin/fees/btc-size-fee-estimator';

//
// Description of mess: From homepage we're navigating with route state the info
// needed to construct the tx.

// Ord sends restricted to 1 input and 1 output
const btcTxSizer = new BtcSizeFeeEstimator();
const assumedTxSize = btcTxSizer.calcTxSize({ input_count: 1, p2tr_output_count: 1 });
function calculateInscriptionSendTxFee(feeRate: number) {
  return new BigNumber(feeRate).multipliedBy(assumedTxSize.txVBytes);
}

const arbitrarySmallMarginNumber = 10;

function throwIfUtxoCannotCoverFee(fee: BigNumber, utxoValue: number) {
  const remainder = new BigNumber(utxoValue).minus(fee);
  // eslint-disable-next-line no-console
  console.log('remainder', { remainder: remainder.toString(), fee: fee.toString(), utxoValue });
  if (remainder.isLessThan(arbitrarySmallMarginNumber))
    throw new Error('Insufficient value to cover fee');
}

// schema doesn't have full type info, copying for now
// if we do yup infer trick, let's type full schema
export interface Inscription {
  address: string;
  content: string;
  'content length': string;
  'content type': string;
  'genesis fee': string;
  'genesis height': string;
  'genesis transaction': string;
  id: string;
  inscription_number: number;
  location: string;
  offset: string;
  output: string;
  'output value': string;
  preview: string;
  sat: string;
  timestamp: string;
  title: string;
}

function useSendOrdRouteState() {
  const location = useLocation();
  return {
    inscription: get(location, 'state.inscription', null) as Inscription | null,
    utxo: get(location, 'state.utxo', null) as TaprootUtxo | null,
  };
}

export function OrdSendTest() {
  const { inscription, utxo } = useSendOrdRouteState();
  const { data: fees } = useBitcoinFeeRate();

  if (!fees || !inscription || !utxo) return null;

  const txFee = calculateInscriptionSendTxFee(fees.fastestFee);

  console.log(inscription);

  throwIfUtxoCannotCoverFee(txFee, Number(inscription['output value']));

  if (!inscription) return null;

  function sign() {
    if (!fees || !inscription || !utxo) return null;

    const tr = btc.p2tr();

    const tx = new btc.Transaction();
    tx.addInput({
      txid: utxo.txid,
      index: utxo.vout,
    });
    tx.addOutputAddress('bc1q0k7kvfw3u535txfdmpknlz9jztkeq4tqqptf77', 100n);
    // tx.sign(privKey);
    tx.finalize();
    console.log('hex', tx.hex);
  }

  return (
    <Text textStyle="body.small" fontSize="12px" onClick={() => console.log()}>
      <pre>{JSON.stringify(inscription, null, 2)}</pre>
      <br />
      <pre>{JSON.stringify({ utxo }, null, 2)}</pre>
      <button onClick={sign}>sign</button>
      <OrdToSend txid={inscription} />
    </Text>
  );
}

function OrdToSend({ inscription }: { inscription: Inscription }) {
  useMemo(() => {
    console.log('useMemo', inscription);
    const psbt = new btc.Transaction();
    psbt.addInput({});

    console.log(psbt);
  }, [inscription]);

  return (
    <>
      <br />
      {/* {JSON.stringify(inscriptionMetadata, null, 2)}
      <br />
      {JSON.stringify(inscription, null, 2)} */}
    </>
  );
}
