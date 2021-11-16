import { useEffect } from 'react';

import {
  useLocalTransactionInputsState,
  useTxForSettingsState,
} from '@store/transactions/transaction.hooks';
import { LoadingKeys, useLoading } from '@common/hooks/use-loading';

export const ShowDelay = ({
  setShowing,
  beginShow,
  isShowing,
}: {
  setShowing: (value: boolean) => void;
  beginShow: boolean;
  isShowing: boolean;
}) => {
  const [tx] = useTxForSettingsState();
  const [txData] = useLocalTransactionInputsState();
  const { setIsIdle } = useLoading(LoadingKeys.SEND_TOKENS_FORM);
  useEffect(() => {
    if (beginShow && tx && !isShowing && txData) {
      setShowing(true);
      setIsIdle();
    }
  }, [beginShow, tx, setShowing, txData, isShowing, setIsIdle]);

  return null;
};