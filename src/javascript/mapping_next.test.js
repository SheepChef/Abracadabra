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

import { expect, test } from "vitest";
import { WenyanSimulator } from "./ChineseMappingHelper";

const Map = new WenyanSimulator(" ").Map;

function Check(Map2) {
  const Map_Obj = JSON.parse(Map2);

  const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var LETTERS_ROUND_1 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var LETTERS_ROUND_2 = "FbPoDRStyJKAUcdahfVXlqwnOGpHZejzvmrBCigQILxkYMuWTEsN";
  //手动随机打乱的乱序轮
  var LETTERS_ROUND_3 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const BIG_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const NUMBERS = "1234567890";
  const SYMBOLS = "+/=";
  const NUMBERSYMBOL = "0123456789+/=";
  let ErrorOccur = false;

  let DecodeTable = {};
  let PayloadLetter = "";
  for (let i = 0; i < 52; i++) {
    DecodeTable[LETTERS[i]] = [];
    DecodeTable[LETTERS[i]].push(
      Map_Obj["Actual"]["N"]["alphabet"][LETTERS[i]]
    );
    DecodeTable[LETTERS[i]].push(
      Map_Obj["Actual"]["A"]["alphabet"][LETTERS[i]]
    );
    DecodeTable[LETTERS[i]].push(
      Map_Obj["Actual"]["V"]["alphabet"][LETTERS[i]]
    );
    PayloadLetter =
      PayloadLetter + Map_Obj["Actual"]["N"]["alphabet"][LETTERS[i]];
    PayloadLetter =
      PayloadLetter + Map_Obj["Actual"]["A"]["alphabet"][LETTERS[i]];
    PayloadLetter =
      PayloadLetter + Map_Obj["Actual"]["V"]["alphabet"][LETTERS[i]];
    if (
      Map_Obj["Actual"]["A"]["alphabet"][LETTERS[i]] !=
      Map_Obj["Actual"]["AD"]["alphabet"][LETTERS[i]]
    ) {
      DecodeTable[LETTERS[i]].push(
        Map_Obj["Actual"]["AD"]["alphabet"][LETTERS[i]]
      );
      PayloadLetter =
        PayloadLetter + Map_Obj["Actual"]["AD"]["alphabet"][LETTERS[i]];
    }
  }
  for (let i = 0; i < 13; i++) {
    DecodeTable[NUMBERSYMBOL[i]] = [];
    DecodeTable[NUMBERSYMBOL[i]].push(
      Map_Obj["Actual"]["N"]["numbersymbol"][NUMBERSYMBOL[i]]
    );
    DecodeTable[NUMBERSYMBOL[i]].push(
      Map_Obj["Actual"]["A"]["numbersymbol"][NUMBERSYMBOL[i]]
    );
    DecodeTable[NUMBERSYMBOL[i]].push(
      Map_Obj["Actual"]["V"]["numbersymbol"][NUMBERSYMBOL[i]]
    );
    PayloadLetter =
      PayloadLetter + Map_Obj["Actual"]["N"]["numbersymbol"][NUMBERSYMBOL[i]];
    PayloadLetter =
      PayloadLetter + Map_Obj["Actual"]["A"]["numbersymbol"][NUMBERSYMBOL[i]];
    PayloadLetter =
      PayloadLetter + Map_Obj["Actual"]["V"]["numbersymbol"][NUMBERSYMBOL[i]];
    if (
      Map_Obj["Actual"]["A"]["numbersymbol"][NUMBERSYMBOL[i]] !=
      Map_Obj["Actual"]["AD"]["numbersymbol"][NUMBERSYMBOL[i]]
    ) {
      DecodeTable[NUMBERSYMBOL[i]].push(
        Map_Obj["Actual"]["AD"]["numbersymbol"][NUMBERSYMBOL[i]]
      );
      PayloadLetter =
        PayloadLetter +
        Map_Obj["Actual"]["AD"]["numbersymbol"][NUMBERSYMBOL[i]];
    }
  }

  for (let i = 0; i < 3; i++) {
    //第一重循环，选择Payload

    if (i == 0) {
      //在Begin句式库中选择。
      for (let c = 0; c < Map_Obj["Sentences"]["Begin"].length; c++) {
        //开始选择句式
        let Sentence = Map_Obj["Sentences"]["Begin"][c].split("/");
        //Sentence是列表，按照/分割的句式
        let CorrectPayload = parseInt(Sentence[0]);
        let ActualPayload = 0;
        if (
          Sentence[0][1] != "B" &&
          Sentence[0][1] != "C" &&
          Sentence[0][1] != "D" &&
          Sentence[0][1] != "E"
        ) {
          ErrorOccur = true;
          console.warn(
            "Incorrect Begin Sentence:" + Map_Obj["Sentences"]["Begin"][c]
          );
        }
        for (let d = 1; d < Sentence.length; d++) {
          if (
            Sentence[d] == "A" ||
            Sentence[d] == "AD" ||
            Sentence[d] == "V" ||
            Sentence[d] == "N"
          ) {
            ActualPayload++;
          } else {
            if (
              PayloadLetter.indexOf(Sentence[d]) != -1 &&
              Sentence[d] != "Q" &&
              Sentence[d] != "P"
            ) {
              ErrorOccur = true;
              console.warn(
                "Incorrect Begin Sentence:" +
                  Map_Obj["Sentences"]["Begin"][c] +
                  " || " +
                  Sentence[d]
              );
            } else if (Sentence[d].length > 1) {
              let temp = Array.from(Sentence[d]);
              temp.forEach((item) => {
                if (PayloadLetter.indexOf(item) != -1) {
                  ErrorOccur = true;
                  console.warn(
                    "Incorrect Begin Sentence:" +
                      Map_Obj["Sentences"]["Begin"][c] +
                      " || " +
                      Sentence[d]
                  );
                }
              });
            }
          }
        }
        if (ActualPayload != CorrectPayload) {
          ErrorOccur = true;
          console.warn(
            "Incorrect Begin Sentence:" + Map_Obj["Sentences"]["Begin"][c]
          );
        }
      }
    } else if (i == 1) {
      for (let c = 0; c < Map_Obj["Sentences"]["Main"].length; c++) {
        //开始选择句式
        let Sentence = Map_Obj["Sentences"]["Main"][c].split("/");
        //Sentence是列表，按照/分割的句式
        let CorrectPayload = parseInt(Sentence[0]);
        let ActualPayload = 0;
        if (
          Sentence[0][1] != "B" &&
          Sentence[0][1] != "C" &&
          Sentence[0][1] != "D" &&
          Sentence[0][1] != "E"
        ) {
          ErrorOccur = true;
          console.warn(
            "Incorrect Main Sentence:" + Map_Obj["Sentences"]["Main"][c]
          );
        }
        for (let d = 1; d < Sentence.length; d++) {
          if (
            Sentence[d] == "A" ||
            Sentence[d] == "AD" ||
            Sentence[d] == "V" ||
            Sentence[d] == "N"
          ) {
            ActualPayload++;
          } else {
            if (
              PayloadLetter.indexOf(Sentence[d]) != -1 &&
              Sentence[d] != "Q" &&
              Sentence[d] != "P" &&
              Sentence[d] != "R"
            ) {
              ErrorOccur = true;
              console.warn(
                "Incorrect Main Sentence:" +
                  Map_Obj["Sentences"]["Main"][c] +
                  " || " +
                  Sentence[d]
              );
            } else if (Sentence[d].length > 1) {
              let temp = Array.from(Sentence[d]);
              temp.forEach((item) => {
                if (PayloadLetter.indexOf(item) != -1) {
                  ErrorOccur = true;
                  console.warn(
                    "Incorrect Main Sentence:" +
                      Map_Obj["Sentences"]["Main"][c] +
                      " || " +
                      Sentence[d]
                  );
                }
              });
            }
          }
        }

        if (ActualPayload != CorrectPayload) {
          ErrorOccur = true;
          console.warn(
            "Incorrect Main Sentence:" + Map_Obj["Sentences"]["Main"][c]
          );
        }
      }
    } else if (i == 2) {
      for (let c = 0; c < Map_Obj["Sentences"]["End"].length; c++) {
        //开始选择句式
        let Sentence = Map_Obj["Sentences"]["End"][c].split("/");
        //Sentence是列表，按照/分割的句式
        let CorrectPayload = parseInt(Sentence[0]);
        let ActualPayload = 0;
        if (
          Sentence[0][1] != "B" &&
          Sentence[0][1] != "C" &&
          Sentence[0][1] != "D" &&
          Sentence[0][1] != "E"
        ) {
          ErrorOccur = true;
          console.warn(
            "Incorrect End Sentence:" + Map_Obj["Sentences"]["End"][c]
          );
        }
        for (let d = 1; d < Sentence.length; d++) {
          if (
            Sentence[d] == "A" ||
            Sentence[d] == "AD" ||
            Sentence[d] == "V" ||
            Sentence[d] == "N"
          ) {
            ActualPayload++;
          } else {
            if (
              PayloadLetter.indexOf(Sentence[d]) != -1 &&
              Sentence[d] != "Q" &&
              Sentence[d] != "P"
            ) {
              ErrorOccur = true;
              console.warn(
                "Incorrect End Sentence:" +
                  Map_Obj["Sentences"]["End"][c] +
                  " || " +
                  Sentence[d]
              );
            } else if (Sentence[d].length > 1) {
              let temp = Array.from(Sentence[d]);
              temp.forEach((item) => {
                if (PayloadLetter.indexOf(item) != -1) {
                  ErrorOccur = true;
                  console.warn(
                    "Incorrect End Sentence:" +
                      Map_Obj["Sentences"]["End"][c] +
                      " || " +
                      Sentence[d]
                  );
                }
              });
            }
          }
        }
        if (ActualPayload != CorrectPayload) {
          ErrorOccur = true;
          console.warn(
            "Incorrect End Sentence:" + Map_Obj["Sentences"]["End"][c]
          );
        }
      }
    }
  }
  if (ErrorOccur) {
    return false;
  } else {
    return "Sentence Verified";
  }
}

test("句式合法性", () => {
  expect(Check(Map)).toBe("Sentence Verified");
});
