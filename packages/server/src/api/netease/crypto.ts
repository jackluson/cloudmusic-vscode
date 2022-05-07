import {
  constants,
  createCipheriv,
  createHash,
  publicEncrypt,
  randomBytes,
} from "crypto";

const iv = Buffer.from("0102030405060708");
const presetKey = Buffer.from("0CoJUm6Qyw8W8jud");
const base62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const publicKey =
  "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB\n-----END PUBLIC KEY-----";
const eapiKey = "e82ckenh8dichen8";

const aesEncrypt = (
  buffer: Buffer,
  mode: string,
  key: Uint8Array | Buffer | string,
  iv: Buffer | string
) => {
  const cipher = createCipheriv(`aes-128-${mode}`, key, iv);
  return Buffer.concat([cipher.update(buffer), cipher.final()]);
};

const rsaEncrypt = (buffer: Uint8Array) => {
  return publicEncrypt(
    { key: publicKey, padding: constants.RSA_NO_PADDING },
    Buffer.concat([Buffer.alloc(128 - buffer.length), buffer])
  );
};

export const weapi = (
  object: Record<string, number | string | boolean>
): { params: string; encSecKey: string } => {
  const text = JSON.stringify(object);
  const secretKey = randomBytes(16).map((n) =>
    base62.charAt(n % 62).charCodeAt(0)
  );
  return {
    params: aesEncrypt(
      Buffer.from(
        aesEncrypt(Buffer.from(text), "cbc", presetKey, iv).toString("base64")
      ),
      "cbc",
      secretKey,
      iv
    ).toString("base64"),
    encSecKey: rsaEncrypt(secretKey.reverse()).toString("hex"),
  };
};

export const eapi = (
  url: string,
  object: Record<string, unknown>
): { params: string } => {
  const text = JSON.stringify(object);
  const message = `nobody${url}use${text}md5forencrypt`;
  const digest = createHash("md5").update(message).digest("hex");
  const data = `${url}-36cd479b6b5-${text}-36cd479b6b5-${digest}`;
  return {
    params: aesEncrypt(Buffer.from(data), "ecb", eapiKey, "")
      .toString("hex")
      .toUpperCase(),
  };
};
