
export default class KeyRepository {
  constructor() {
    this.keyStore = {};
  }

  getKeys(businessKey) {
    return this.keyStore[businessKey] || null;
  }

  putKeys(businessKey, publicKey, iv) {
    this.keyStore[businessKey] = {
      publicKey: publicKey,
      iv: iv
    };
  }
}
