import { useEffect, useState } from 'react';

import { Text } from '@stacks/ui';
import { useField } from 'formik';

import { MarketData } from '@shared/models/market.model';
import { Money, createMoneyFromDecimal } from '@shared/models/money.model';

import { baseCurrencyAmountInQuote } from '@app/common/money/calculate-money';
import { i18nFormatCurrency } from '@app/common/money/format-money';

interface SenfFiatInputProps {
  marketData: MarketData;
  assetSymbol?: string;
}

export function SendFiatValue({ marketData, assetSymbol = '' }: SenfFiatInputProps) {
  const [field] = useField('amount');
  const [assetValue, setAssetValue] = useState<Money>(createMoneyFromDecimal(0, assetSymbol));

  useEffect(() => {
    let amount = Number(field.value);

    if (isNaN(amount)) {
      amount = 0;
    }
    const assetAmount = createMoneyFromDecimal(amount, assetSymbol);
    setAssetValue(assetAmount);
  }, [field.value, assetSymbol]);

  return (
    <Text>
      {Number(field.value) > 0 && '~'}{' '}
      {i18nFormatCurrency(baseCurrencyAmountInQuote(assetValue, marketData))}
    </Text>
  );
}
