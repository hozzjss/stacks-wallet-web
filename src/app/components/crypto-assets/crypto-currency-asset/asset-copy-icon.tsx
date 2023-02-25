import { FiCheck, FiCopy } from 'react-icons/fi';

import { Box, Flex, color } from '@stacks/ui';
import { UserAreaSelectors } from '@tests-legacy/integration/user-area.selectors';

export function AssetItemCopyIcon(hasCopied: boolean) {
  return (
    <Flex alignItems="center" justifyContent="center" size="36px">
      {hasCopied ? (
        <Box
          size="16px"
          color={color('text-caption')}
          data-testid={UserAreaSelectors.AccountCopyAddress}
          as={FiCheck}
          mt="2px"
        />
      ) : (
        <Box
          size="16px"
          color={color('text-caption')}
          data-testid={UserAreaSelectors.AccountCopyAddress}
          as={FiCopy}
          mt="2px"
        />
      )}
    </Flex>
  );
}
