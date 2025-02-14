import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box } from '@stacks/ui';

import { Money, createMoneyFromDecimal } from '@shared/models/money.model';
import { RouteUrls } from '@shared/route-urls';

import { useBitcoinContracts } from '@app/common/hooks/use-bitcoin-contracts';
import { i18nFormatCurrency } from '@app/common/money/format-money';
import { useCalculateBitcoinFiatValue } from '@app/query/common/market-data/market-data.hooks';

import { BitcoinContractIcon } from '../icons/bitcoin-contract-icon';
import { BitcoinContractEntryPointLayout } from './bitcoin-contract-entry-point-layout';

interface BitcoinContractEntryPointProps {
  btcAddress: string;
}

export function BitcoinContractEntryPoint({ btcAddress }: BitcoinContractEntryPointProps) {
  const navigate = useNavigate();
  const { sumBitcoinContractCollateralAmounts } = useBitcoinContracts();
  const [isLoading, setIsLoading] = useState(true);
  const calculateFiatValue = useCalculateBitcoinFiatValue();
  const [bitcoinContractSum, setBitcoinContractSum] = useState<Money>(
    createMoneyFromDecimal(0, 'BTC')
  );

  useEffect(() => {
    const getBitcoinContractDataAndSetState = async () => {
      setIsLoading(true);
      const currentBitcoinContractSum = await sumBitcoinContractCollateralAmounts();
      setBitcoinContractSum(currentBitcoinContractSum);
      setIsLoading(false);
    };
    getBitcoinContractDataAndSetState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [btcAddress]);

  function onClick() {
    navigate(RouteUrls.BitcoinContractList);
  }

  return (
    <BitcoinContractEntryPointLayout
      isLoading={isLoading}
      balance={bitcoinContractSum}
      caption={bitcoinContractSum.symbol}
      icon={<Box as={BitcoinContractIcon} />}
      usdBalance={i18nFormatCurrency(calculateFiatValue(bitcoinContractSum))}
      cursor={'pointer'}
      onClick={onClick}
    />
  );
}
