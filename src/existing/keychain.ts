import { Platform } from 'react-native'
import argon2 from 'react-native-argon2'
import Keychain, { getSupportedBiometryType } from 'react-native-keychain'
import uuid from 'react-native-uuid'

export interface Secret {
  key: string
  salt: string
}

export const hashPIN = async (PIN: string, salt: string): Promise<string> => {
  try {
    const result = await argon2(PIN, salt, {})
    const { rawHash } = result

    return rawHash
  } catch (error) {
    throw new Error(`Error generating hash for PIN ${String((error as Error)?.message ?? error)}`)
  }
}

export enum KeychainServices {
  Salt = 'secret.wallet.salt',
  Key = 'secret.wallet.key',
}

const keyFauxUserName = 'WalletFauxPINUserName'
const saltFauxUserName = 'WalletFauxSaltUserName'

export interface WalletSalt {
  salt: string
}

export interface WalletKey {
  key: string
}

export const optionsForKeychainAccess = (service: KeychainServices, useBiometrics = false): Keychain.Options => {
  const opts: Keychain.Options = {
    accessible: useBiometrics ? Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY : Keychain.ACCESSIBLE.ALWAYS,
    service,
  }

  if (useBiometrics) {
    opts.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_ANY
  }

  if (Platform.OS === 'android') {
    opts.securityLevel = Keychain.SECURITY_LEVEL.ANY
    if (!useBiometrics) {
      opts.storage = Keychain.STORAGE_TYPE.AES
    } else {
      opts.storage = Keychain.STORAGE_TYPE.RSA
    }
  }

  return opts
}

export const secretForPIN = async (PIN: string, salt?: string): Promise<Secret> => {
  const mySalt = salt ?? uuid.v4().toString()
  const myKey = await hashPIN(PIN, mySalt)
  const secret: Secret = {
    key: myKey,
    salt: mySalt,
  }

  return secret
}

export const wipeWalletKey = async (useBiometrics: boolean) => {
  const opts = optionsForKeychainAccess(KeychainServices.Key, useBiometrics)
  await Keychain.resetGenericPassword(opts)
}

export const storeWalletKey = async (secret: WalletKey, useBiometrics = false): Promise<boolean> => {
  const opts = optionsForKeychainAccess(KeychainServices.Key, useBiometrics)
  const secretAsString = JSON.stringify(secret)
  await wipeWalletKey(useBiometrics)
  const result = await Keychain.setGenericPassword(keyFauxUserName, secretAsString, opts)
  return Boolean(result)
}

export const storeWalletSalt = async (secret: WalletSalt): Promise<boolean> => {
  const opts = optionsForKeychainAccess(KeychainServices.Salt, false)
  const secretAsString = JSON.stringify(secret)
  const result = await Keychain.setGenericPassword(saltFauxUserName, secretAsString, opts)
  return Boolean(result)
}

export const storeWalletSecret = async (secret: Secret, useBiometrics = false): Promise<boolean> => {
  let keyResult = false
  if (secret.key) {
    keyResult = await storeWalletKey({ key: secret.key }, useBiometrics)
  }

  const saltResult = await storeWalletSalt({ salt: secret.salt })

  return keyResult && saltResult
}

export const loadWalletSalt = async (): Promise<WalletSalt | undefined> => {
  let salt: WalletSalt | undefined = undefined
  const opts: Keychain.Options = {
    service: KeychainServices.Salt,
  }
  const result = await Keychain.getGenericPassword(opts)
  if (!result) {
    return
  }

  // salt data is stored and returned as a string and needs to be parsed
  const parsedSalt = JSON.parse(result.password)
  if (!parsedSalt.salt) {
    throw new Error('Wallet salt failed to load')
  }

  salt = {
    salt: parsedSalt.salt,
  }

  return salt
}

export const loadWalletKey = async (title?: string, description?: string): Promise<WalletKey | undefined> => {
  let opts: Keychain.Options = {
    service: KeychainServices.Key,
  }

  if (title && description) {
    opts = {
      ...opts,
      authenticationPrompt: {
        title,
        description,
      },
    }
  }
  const result = await Keychain.getGenericPassword(opts)

  if (!result) {
    return
  }

  return JSON.parse(result.password) as WalletKey
}

export const loadWalletSecret = async (title?: string, description?: string): Promise<Secret | undefined> => {
  let salt: WalletSalt | undefined
  let key: WalletKey | undefined
  let secret: Secret | undefined = undefined
  try {
    salt = await loadWalletSalt()
    key = await loadWalletKey(title, description)
  } catch (e: any) {
    throw new Error(e?.message ?? e)
  }

  if (!salt?.salt || !key) {
    throw new Error('Wallet secret is missing key property')
  }

  secret = {
    key: key.key,
    salt: salt.salt,
  }

  return secret
}

export const clearAllKeychainData = async () => {
  try {
    await Keychain.resetGenericPassword({
      service: KeychainServices.Key,
    })
    await Keychain.resetGenericPassword({
      service: KeychainServices.Salt,
    })
  } catch (error) {
    console.error('Error clearing keychain data:', error)
  }
}

export const setPIN = async (PIN: string, useBiometry: boolean): Promise<boolean> => {
  const secret = await secretForPIN(PIN)
  if (!useBiometry) {
    await wipeWalletKey(useBiometry)
  }
  await storeWalletSecret(secret, useBiometry)
  return true
}

export const checkPIN = async (PIN: string): Promise<Secret | false> => {
  try {
    const secret = await loadWalletSalt()

    if (!secret?.salt) {
      return false
    }

    const hash = await hashPIN(PIN, secret.salt)
    // this is a placeholder where would normally compare the hash to the wallet secret.key
    const correctHash = await hashPIN('123456', secret.salt) // Default PIN for testing
    if (hash === correctHash) {
      return { key: hash, salt: secret.salt }
    } else {
      return false
    }
  } catch (e) {
    console.error('Error checking PIN:', e)
    throw e
  }
}

export const isBiometricsActive = async (): Promise<boolean> => {
  const result = await getSupportedBiometryType()
  return Boolean(result)
}