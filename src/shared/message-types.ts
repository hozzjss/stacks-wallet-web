import { FinishedTxPayload, SignatureData, SponsoredFinishedTxPayload } from '@stacks/connect';

export const MESSAGE_SOURCE = 'stacks-wallet' as const;

export const CONTENT_SCRIPT_PORT = 'content-script' as const;

export enum ExternalMethods {
  transactionRequest = 'transactionRequest',
  transactionResponse = 'transactionResponse',
  authenticationRequest = 'authenticationRequest',
  authenticationResponse = 'authenticationResponse',
  signatureRequest = 'signatureRequest',
  signatureResponse = 'signatureResponse',
  structuredDataSignatureRequest = 'structuredDataSignatureRequest',
  structuredDataSignatureResponse = 'structuredDataSignatureResponse',
}

export enum InternalMethods {
  RequestDerivedStxAccounts = 'RequestDerivedStxAccounts',
  ShareInMemoryKeyToBackground = 'ShareInMemoryKeyToBackground',
  RequestInMemoryKeys = 'RequestInMemoryKeys',
  RemoveInMemoryKeys = 'RemoveInMemoryKeys',
  OriginatingTabClosed = 'OriginatingTabClosed',
  CheckServiceWorkerStatus = 'CheckServiceWorkerStatus',
}

export type ExtensionMethods = ExternalMethods | InternalMethods;

interface BaseMessage {
  source: typeof MESSAGE_SOURCE;
  method: ExtensionMethods;
}

/**
 * Content Script <-> Background Script
 */
export interface Message<Methods extends ExtensionMethods, Payload = undefined>
  extends BaseMessage {
  method: Methods;
  payload: Payload;
}

type AuthenticationRequestMessage = Message<ExternalMethods.authenticationRequest, string>;

export type AuthenticationResponseMessage = Message<
  ExternalMethods.authenticationResponse,
  {
    authenticationRequest: string;
    authenticationResponse: string;
  }
>;

type SignatureRequestMessage = Message<ExternalMethods.signatureRequest, string>;

export type SignatureResponseMessage = Message<
  ExternalMethods.signatureResponse,
  {
    signatureRequest: string;
    signatureResponse: SignatureData | string;
  }
>;

type StructuredDataSignatureRequestMessage = Message<
  ExternalMethods.structuredDataSignatureRequest,
  string
>;

type TransactionRequestMessage = Message<ExternalMethods.transactionRequest, string>;

export type TxResult = SponsoredFinishedTxPayload | FinishedTxPayload;

export type TransactionResponseMessage = Message<
  ExternalMethods.transactionResponse,
  {
    transactionRequest: string;
    transactionResponse: TxResult | string;
  }
>;

export type LegacyMessageFromContentScript =
  | AuthenticationRequestMessage
  | TransactionRequestMessage
  | SignatureRequestMessage
  | StructuredDataSignatureRequestMessage;

export type LegacyMessageToContentScript =
  | AuthenticationResponseMessage
  | TransactionResponseMessage
  | SignatureResponseMessage;
