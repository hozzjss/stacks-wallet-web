import { StacksMainnet } from '@stacks/network';
import { generateNewAccount, generateWallet, restoreWalletAccounts } from '@stacks/wallet-sdk';
import memoize from 'promise-memoize';

import { gaiaUrl } from '@shared/constants';
import { logger } from '@shared/logger';
import { InternalMethods } from '@shared/message-types';
import { BackgroundMessages } from '@shared/messages';

function validateMessagesAreFromExtension(sender: chrome.runtime.MessageSender) {
  // Only respond to internal messages from our UI, not content scripts in other applications
  return sender.url?.startsWith(chrome.runtime.getURL(''));
}

const deriveWalletWithAccounts = memoize(async (secretKey: string, highestAccountIndex: number) => {
  // Here we only want the resulting `Wallet` objects, but the API
  // requires a password (so it can also return an encrypted key)
  const wallet = await generateWallet({ secretKey, password: '' });

  // If possible, we try to generate accounts using the `restoreWalletAccounts`
  // method. This does the same as the catch case, with the addition that it will
  // also try and fetch usernames associated with an account
  try {
    return await restoreWalletAccounts({
      wallet,
      gaiaHubUrl: gaiaUrl,
      network: new StacksMainnet(),
    });
  } catch (e) {
    // To generate a new account, the wallet-sdk requires the entire `Wallet` to
    // be supplied so that it can count the `wallet.accounts[]` length, and return
    // a new `Wallet` object with all the accounts. As we want to generate them
    // all, we must set the updated value and read it again in the loop
    logger.warn('Falling back to manual account generation without Gaia.');
    let walWithAccounts = wallet;
    for (let i = 0; i < highestAccountIndex; i++) {
      walWithAccounts = generateNewAccount(walWithAccounts);
    }
    return walWithAccounts;
  }
});

// Persists keys in memory for the duration of the background scripts life
const inMemoryKeys = new Map();

export async function internalBackgroundMessageHandler(
  message: BackgroundMessages,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  // eslint-disable-next-line no-console
  console.log(message);
  if (!validateMessagesAreFromExtension(sender)) {
    logger.error('Error: Received background script msg from ' + sender.url);
    sendResponse();
    return;
  }
  logger.debug('Internal message', message);
  switch (message.method) {
    case InternalMethods.RequestDerivedStxAccounts: {
      const { secretKey, highestAccountIndex } = message.payload;
      const walletsWithAccounts = await deriveWalletWithAccounts(secretKey, highestAccountIndex);
      sendResponse(walletsWithAccounts);
      break;
    }

    case InternalMethods.ShareInMemoryKeyToBackground: {
      const { keyId, secretKey } = message.payload;

      inMemoryKeys.set(keyId, secretKey);
      sendResponse();
      break;
    }

    case InternalMethods.RequestInMemoryKeys: {
      sendResponse(Object.fromEntries(inMemoryKeys));
      sendResponse();
      break;
    }

    case InternalMethods.RemoveInMemoryKeys: {
      inMemoryKeys.clear();
      sendResponse();
      break;
    }
  }
  // As browser is instructed that, if there is a response it will be
  // asyncronous, we must always return a response, even if empty
  sendResponse();
}
