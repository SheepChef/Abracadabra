/*
 * Copyright (C) 2025-2026 SheepChef (a.k.a. Haruka Hokuto)
 *
 * 这是一个源代码公开的软件。
 * 在遵守AIPL-1.2许可证的前提下，
 * 你可以自由复制，修改，分发，使用它。
 *
 * 查阅 Academic Innovation Protection License(AIPL) 来了解更多 .
 * 本作品应随附一份完整的 AIPL-1.2 许可证全文。
 *
 */

// 这是在编译后附加到Artifact后面的额外内容
// 使得Javy可以将其编译成WASM

/*

传入的参数应当是JSON

{
  "method":"", // WENYAN | OLD
  "inputType":"", // TEXT | UINT8
  "outputType":"", // TEXT | UINT8
  "input":"",  // 输入的数据，如果是TEXT请直接输入纯文本，如果是任意字节，请输入Base64编码字符串
  "mode":"",   // ENCRYPT | DECRYPT | AUTO   // AUTO 仅在 method 指定 OLD 时合法 
  "key":"",    // 加密密钥，一个字符串 //如果缺省，自动使用默认值
  "q":bool,    // OLD模式下，决定是否添加标志位
  "WenyanConfig":{...}, //文言文生成配置，详情见JavaScript接口定义。
  "AdvancedEncConfig":{...} //高级加密配置，详情见JavaScript接口定义。
}

*/

const B64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function encodeBase64(data) {
  let out = "";
  // 如果是字符串，按照字符编码处理；如果是 Uint8Array，直接按字节处理
  const isString = typeof data === "string";
  const length = data.length;

  for (let i = 0; i < length; i += 3) {
    const c1 = isString ? data.charCodeAt(i) & 0xff : data[i];
    const c2 =
      i + 1 < length
        ? isString
          ? data.charCodeAt(i + 1) & 0xff
          : data[i + 1]
        : NaN;
    const c3 =
      i + 2 < length
        ? isString
          ? data.charCodeAt(i + 2) & 0xff
          : data[i + 2]
        : NaN;

    out += B64_CHARS.charAt(c1 >> 2);
    out += B64_CHARS.charAt(((c1 & 3) << 4) | (isNaN(c2) ? 0 : c2 >> 4));
    out += isNaN(c2)
      ? "="
      : B64_CHARS.charAt(((c2 & 15) << 2) | (isNaN(c3) ? 0 : c3 >> 6));
    out += isNaN(c2) || isNaN(c3) ? "=" : B64_CHARS.charAt(c3 & 63);
  }
  return out;
}

function decodeBase64(b64, asUint8Array = false) {
  const cleanB64 = String(b64).replace(/[^A-Za-z0-9+/]/g, "");

  if (asUint8Array) {
    // 专门为解密逻辑准备：直接还原为二进制流
    const bufferLength =
      (cleanB64.length * 3) / 4 -
      (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);
    const buffer = new Uint8Array(bufferLength);
    let bufIndex = 0;

    for (let i = 0; i < cleanB64.length; i += 4) {
      const e1 = B64_CHARS.indexOf(cleanB64.charAt(i));
      const e2 = B64_CHARS.indexOf(cleanB64.charAt(i + 1));
      const e3 = B64_CHARS.indexOf(cleanB64.charAt(i + 2));
      const e4 = B64_CHARS.indexOf(cleanB64.charAt(i + 3));

      buffer[bufIndex++] = (e1 << 2) | (e2 >> 4);
      if (e3 !== -1) buffer[bufIndex++] = ((e2 & 15) << 4) | (e3 >> 2);
      if (e4 !== -1) buffer[bufIndex++] = ((e3 & 3) << 6) | e4;
    }
    return buffer;
  } else {
    // 普通字符串还原
    let out = "";
    for (let i = 0; i < cleanB64.length; i += 4) {
      const e1 = B64_CHARS.indexOf(cleanB64.charAt(i));
      const e2 = B64_CHARS.indexOf(cleanB64.charAt(i + 1));
      const e3 = B64_CHARS.indexOf(cleanB64.charAt(i + 2));
      const e4 = B64_CHARS.indexOf(cleanB64.charAt(i + 3));

      out += String.fromCharCode((e1 << 2) | (e2 >> 4));
      if (e3 !== -1) out += String.fromCharCode(((e2 & 15) << 4) | (e3 >> 2));
      if (e4 !== -1) out += String.fromCharCode(((e3 & 3) << 6) | e4);
    }
    return out;
  }
}

function base64ToUint8Array(base64) {
  // 将Base64字符串转换为二进制字符串
  const binaryString = decodeBase64(base64);
  // 将二进制字符串转换为Uint8Array
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(uint8Array) {
  return encodeBase64(String.fromCharCode.apply(null, uint8Array));
}

// Read input from stdin
const Javyinput = JavyreadInput();
// Call the function with the input
const Javyresult = index(Javyinput);
// Write the result to stdout
JavywriteOutput(Javyresult);

// The main function.
function index(input) {
  if (input === "ERROR") {
    return "INCORRECT JSON";
  }

  let Abra;
  try {
    Abra = new Abracadabra(input.inputType, input.outputType);
  } catch (e) {
    return `ERROR inputType or outputType${e.toString()}`;
  }

  let decodedInput = input.input;
  if (input.inputType === "UINT8") {
    decodedInput = base64ToUint8Array(input.input);
  }

  try {
    if (input.method === "WENYAN") {
      Abra.WenyanInput(
        decodedInput,
        input.mode,
        input.key,
        input.WenyanConfig,
        input.AdvancedEncConfig
      );
    } else if (input.method === "OLD") {
      Abra.OldInput(decodedInput, input.mode, input.key, input.q);
    } else if (input.method === "BEAR") {
      Abra.BearDecode(decodedInput);
    } else {
      return "ERROR method";
    }

    let Output = Abra.Output();

    if (input.outputType === "UINT8") {
      if (Array.isArray(Output)) {
        Output = Output.map((arr) => uint8ArrayToBase64(arr));
      } else {
        Output = uint8ArrayToBase64(Output);
      }
    }

    return Output;
  } catch (e) {
    return "ERROR: " + (e.message || e.toString());
  }
}

// Read input from stdin
function JavyreadInput() {
  const chunkSize = 1024;
  const inputChunks = [];
  let totalBytes = 0;

  // Read all the available bytes
  while (1) {
    const buffer = new Uint8Array(chunkSize);
    // Stdin file descriptor
    const fd = 0;
    const bytesRead = Javy.IO.readSync(fd, buffer);

    totalBytes += bytesRead;
    if (bytesRead === 0) {
      break;
    }
    inputChunks.push(buffer.subarray(0, bytesRead));
  }

  // Assemble input into a single Uint8Array
  const { finalBuffer } = inputChunks.reduce(
    (context, chunk) => {
      context.finalBuffer.set(chunk, context.bufferOffset);
      context.bufferOffset += chunk.length;
      return context;
    },
    { bufferOffset: 0, finalBuffer: new Uint8Array(totalBytes) }
  );

  const InputDecoded = new TextDecoder().decode(finalBuffer);
  try {
    return JSON.parse(InputDecoded);
  } catch {
    return "ERROR";
  }
}

// Write output to stdout
function JavywriteOutput(output) {
  const encodedOutput = new TextEncoder().encode(JSON.stringify(output));
  const buffer = new Uint8Array(encodedOutput);
  // Stdout file descriptor
  const fd = 1;
  Javy.IO.writeSync(fd, buffer);
}
