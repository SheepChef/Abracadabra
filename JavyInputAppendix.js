/*
 * Copyright (C) 2025 SheepChef (a.k.a. Haruka Hokuto)
 *
 * 这是一个自由软件。
 * 在遵守AIPL-1.1许可证的前提下，
 * 你可以自由复制，修改，分发，使用它。
 *
 * 查阅 Academic Innovation Protection License(AIPL) 来了解更多 .
 * 本作品应随附一份完整的 AIPL-1.1 许可证全文。
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
  "WenyanConfig":{ //文言文生成配置，解密时可以缺省。
    "PunctuationMark": bool;// 指定是否为密文添加标点符号，默认 true/添加;
    "RandomIndex":number,  // 仅WENYAN模式下需要：算法的随机程度，越大随机性越强，默认 50，最大100，超过100将会出错;
    "PianwenMode":bool,    // 仅WENYAN模式下需要：尽可能使用对仗的骈文句式; 与逻辑句式冲突
    "LogicMode":bool,    // 仅WENYAN模式下需要：尽可能使用逻辑句式; 与骈文句式冲突
    "Traditional":bool,    // 仅WENYAN模式下需要：输出繁体中文。
  },
}

*/

function base64ToUint8Array(base64) {
  // 将Base64字符串转换为二进制字符串
  const binaryString = _atob(base64);
  // 将二进制字符串转换为Uint8Array
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(uint8Array) {
  return _btoa(String.fromCharCode.apply(null, uint8Array));
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

  if (input.method == "WENYAN") {
    if (input.inputType == "TEXT") {
      let Abra = new Abracadabra(input.inputType, input.outputType);
      Abra.WenyanInput(
        input.input,
        input.mode,
        input.key,
        input.WenyanConfig,
        input.AdvancedEncConfig
      );
      let Output = Abra.Output();
      if (input.outputType == "UINT8") {
        Output = uint8ArrayToBase64(Output);
      }
      return Output;
    } else if (input.inputType == "UINT8") {
      let Abra = new Abracadabra(input.inputType, input.outputType);
      let UINT8In = base64ToUint8Array(input.input);
      Abra.WenyanInput(
        UINT8In,
        input.mode,
        input.key,
        input.WenyanConfig,
        input.AdvancedEncConfig
      );
      let Output = Abra.Output();
      if (input.outputType == "UINT8") {
        Output = uint8ArrayToBase64(Output);
      }
      return Output;
    } else {
      return "ERROR inputType";
    }
  } else if (input.method == "OLD") {
    if (input.inputType == "TEXT") {
      let Abra = new Abracadabra(input.inputType, input.outputType);
      Abra.Input(input.input, input.mode, input.key, input.q);
      let Output = Abra.Output();
      if (input.outputType == "UINT8") {
        Output = uint8ArrayToBase64(Output);
      }
      return Output;
    } else if (input.inputType == "UINT8") {
      let Abra = new Abracadabra(input.inputType, input.outputType);
      let UINT8In = base64ToUint8Array(input.input);
      Abra.Input(UINT8In, input.mode, input.key, input.q);
      let Output = Abra.Output();
      if (input.outputType == "UINT8") {
        Output = uint8ArrayToBase64(Output);
      }
      return Output;
    } else {
      return "ERROR inputType";
    }
  } else {
    return "ERROR method";
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
