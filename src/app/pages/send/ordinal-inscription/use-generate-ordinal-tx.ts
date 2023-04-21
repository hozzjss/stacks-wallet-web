import * as btc from '@scure/btc-signer';

import { logger } from '@shared/logger';
import { OrdinalSendFormValues } from '@shared/models/form.model';

import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/address/address.hooks';
import { useBitcoinFeeRate } from '@app/query/bitcoin/fees/fee-estimates.hooks';
import { TaprootUtxo } from '@app/query/bitcoin/ordinals/use-taproot-address-utxos.query';
import { useBitcoinLibNetworkConfig } from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';
import { useCurrentAccountNativeSegwitSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootSigner } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';

import { selectInscriptionTransferCoins } from './select-inscription-coins';

export function useGenerateSignedOrdinalTx(trInput: TaprootUtxo) {
  const createTapRootSigner = useCurrentAccountTaprootSigner();
  const createNativeSegwitSigner = useCurrentAccountNativeSegwitSigner();
  const networkMode = useBitcoinLibNetworkConfig();
  const { data: feeRate } = useBitcoinFeeRate();
  const { data: nativeSegwitUtxos } = useCurrentNativeSegwitUtxos();

  function coverFeeFromAdditionalUtxos(values: OrdinalSendFormValues) {
    const trSigner = createTapRootSigner?.(trInput.addressIndex);
    const nativeSegwitSigner = createNativeSegwitSigner?.(0);

    if (!trSigner || !nativeSegwitSigner || !nativeSegwitUtxos || !feeRate) return;

    const result = selectInscriptionTransferCoins({
      recipient: values.recipient,
      inscriptionInput: trInput,
      nativeSegwitUtxos,
      changeAddress: nativeSegwitSigner.payment.address!,
      feeRate: feeRate.halfHourFee,
    });

    if (!result.success) return null;

    const { inputs, outputs, txFee } = result;

    try {
      const tx = new btc.Transaction();

      // Inscription input
      tx.addInput({
        txid: trInput.txid,
        index: trInput.vout,
        tapInternalKey: trSigner.payment.tapInternalKey,
        witnessUtxo: {
          script: trSigner.payment.script,
          amount: BigInt(trInput.value),
        },
      });

      // Fee-covering Native Segwit inputs
      inputs.forEach(input =>
        tx.addInput({
          txid: input.txid,
          index: input.vout,
          witnessUtxo: {
            amount: BigInt(input.value),
            script: nativeSegwitSigner.payment.script,
          },
        })
      );

      // Recipient and change outputs
      outputs.forEach(output => tx.addOutputAddress(output.address, output.value, networkMode));

      // We know the first is TR and the rest are native segwit
      for (let i = 0; i < tx.inputsLength; i++) {
        if (i === 0) {
          trSigner.signIndex(tx, i);
          continue;
        }
        nativeSegwitSigner.signIndex(tx, i);
      }

      tx.finalize();
      return { hex: tx.hex, fee: txFee };
    } catch (e) {
      logger.error('Unable to sign transaction');
      return null;
    }
  }

  return { coverFeeFromAdditionalUtxos };
}