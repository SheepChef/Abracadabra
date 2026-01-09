//Copyright (c) 2014 Gerald Yeo <contact@fusedthought.com>
/*
 * This file contains modified code from otplib.
 * Original Copyright (c) 2014 Gerald Yeo <contact@fusedthought.com>
 * Modifications made:
 * - Browser Support
 */

/*
 * 本文件不适用AIPL-1.1许可证，遵循其原有许可证。
 */

import { createDigest, createRandomBytes } from '@otplib/plugin-crypto-js';
import { keyDecoder, keyEncoder } from '@otplib/plugin-base32-enc-dec';
import {
  Authenticator,
  AuthenticatorOptions,
  HOTP,
  HOTPOptions,
  TOTP,
  TOTPOptions
} from '@otplib/core';

import * as buffer from 'buffer';

// @ts-ignore
if (typeof window === 'object' && typeof window.Buffer === 'undefined') {
  // @ts-ignore
  window.Buffer = buffer.Buffer; /* globals buffer */
}

export const hotp = new HOTP<HOTPOptions>({
  createDigest
});

export const totp = new TOTP<TOTPOptions>({
  createDigest
});

export const authenticator = new Authenticator<AuthenticatorOptions>({
  createDigest,
  createRandomBytes,
  keyDecoder,
  keyEncoder
});