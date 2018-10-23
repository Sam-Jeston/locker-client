const nacl = require('js-nacl/lib/nacl_factory.js')

function getInstance(): Promise<any> {
  return new Promise(res => {
    nacl.instantiate((inst: any) => res(inst))
  })
}

export async function generateKeypair() {
  const instance = await getInstance()
  console.log(instance)
  const {boxPk, boxSk} = instance.crypto_box_keypair()
  return {pk: instance.to_hex(boxPk), sk: instance.to_hex(boxSk)}
}

export async function importKeypair(pkHex: string) {
  const instance = await getInstance()
  const pk = instance.from_hex(pkHex)
  const {boxPk, boxSk} = instance.crypto_box_keypair_from_raw_sk(pk)
  return {pk: instance.to_hex(boxPk), sk: instance.to_hex(boxSk)}
}

export async function generatePrecomputedKey(ourSkHex: string, theirPkHex: string) {
  const instance = await getInstance()
  const ourSk = instance.from_hex(ourSkHex)
  const theirPk = instance.from_hex(theirPkHex)
  return instance.to_hex(instance.crypto_box_precompute(theirPk, ourSk).boxK)
}

export async function seal(text: string, precomputedKeyHex: string) {
  const instance = await getInstance()
  const precomputedKey = instance.from_hex(precomputedKeyHex)
  const nonce = instance.crypto_box_random_nonce()
  const cipherText = instance.crypto_box_precomputed(instance.encode_utf8(text), nonce, {boxK: precomputedKey})
  return {
    cipherText: instance.to_hex(cipherText),
    nonce: instance.to_hex(nonce)
  }
}

export async function open(cipherTextHex: string, nonceHex: string, precomputedKeyHex: string) {
  const instance = await getInstance()
  const precomputedKey = instance.from_hex(precomputedKeyHex)
  const nonce = instance.from_hex(nonceHex)
  const cipherText = instance.from_hex(cipherTextHex)
  const decrypted = instance.crypto_box_open_precomputed(cipherText, nonce, {boxK: precomputedKey})
  return instance.decode_utf8(decrypted)
}

export async function example() {
  const keypair1 = await generateKeypair()
  const keypair2 = await generateKeypair()
  const text = 'This is super secret'

  // Keypair 1 perspective
  const precompedKey1 = await generatePrecomputedKey(keypair1.sk, keypair2.pk)
  console.log(precompedKey1)
  const cipherText = await seal(text, precompedKey1)
  console.log(cipherText)

  const decyptedText = await open(cipherText.cipherText, cipherText.nonce, precompedKey1)
  console.log(decyptedText)

  // Keypair 2 perspective
  const precompedKey2 = await generatePrecomputedKey(keypair1.sk, keypair2.pk)
  console.log(precompedKey2)

  const decyptedText2 = await open(cipherText.cipherText, cipherText.nonce, precompedKey2)
  console.log(decyptedText2)
}
