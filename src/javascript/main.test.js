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

import { expect, test, bench } from "vitest";

import { Abracadabra } from "./main";

const Rand = Math.random() * 100000000000;
const TestString = Rand.toString();

const TestLinks = [
  "https://pan.baidu.com",
  "https://drive.google.com",
  "https://bilibili.com",
  "https://twitter.com",
  "https://github.com",
  "https://pixiv.net",
  "https://bangumi.moe",
  "magnet:?xt=urn:btih:C0FE00AD10B9D9A90A0750D1B5B9F6C6B8F2F5B6",
  "https://test.cn",
  "https://test.cc",
  "https://test.jp",
  "https://test.one",
];

function generateRandomUint8Array(length) {
  // 创建一个指定长度的 Uint8Array
  const uint8Array = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    uint8Array[i] = Math.floor(Math.random() * 256);
  }

  return uint8Array;
}

const TestData = [
  generateRandomUint8Array(1000),
  generateRandomUint8Array(2048),
];

test("加/解密测试", { timeout: 15000 }, () => {
  const Abra = new Abracadabra();
  let TestTemp = TestString;
  let TestTemp2 = TestString;
  let TestTemp3 = TestString;

  //将随机字符串用仿真加密循环加/解密6次，判断一致性和中途是否出错。
  for (let i = 0; i <= 6; i++) {
    Abra.WenyanInput(TestTemp, "ENCRYPT", "ABRACADABRA", {
      PunctuationMark: i % 2 == 0,
      RandomIndex: 50,
      PianwenMode: i % 2 == 0,
      LogicMode: i % 2 != 0,
      Traditional: i % 2 != 0,
    });
    TestTemp = Abra.Output();
  }

  for (let i = 0; i <= 6; i++) {
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA");
    TestTemp = Abra.Output();
  }

  //将随机字符串用传统加密循环加/解密6次，判断一致性和中途是否出错。
  for (let i = 0; i <= 6; i++) {
    Abra.OldInput(TestTemp2, "ENCRYPT", "ABRACADABRA", true);
    TestTemp2 = Abra.Output();
  }

  for (let i = 0; i <= 6; i++) {
    Abra.OldInput(TestTemp2, "DECRYPT", "ABRACADABRA");
    TestTemp2 = Abra.Output();
  }
  expect(TestTemp).toBe(TestString);
  expect(TestTemp2).toBe(TestString);

  //测试传统加密标志位

  Abra.OldInput(TestTemp3, "AUTO", "ABRACADABRA");
  TestTemp3 = Abra.Output();
  Abra.OldInput(TestTemp3, "AUTO", "ABRACADABRA");
  TestTemp3 = Abra.Output();

  expect(TestTemp3).toBe(TestString);

  const XiongyueWord =
    "呋擊眠魚堅笨唬咬呱洞物沒呦山誒註歡動笨意非覺呆誘嘿吖盜噗嗥溫沒洞魚啽和現現很哞呦蜜呱和出偶人嗷誒訴偶冬果果很森喜嗅噤很覺家森類雜拙呆意雜常吃";
  const ExpectedXiongyueWordDecRes = "我能看见，有些东西就在遥远的另一边";

  Abra.BearDecode(XiongyueWord);
  TestTemp3 = Abra.Output();
  expect(TestTemp3).toBe(ExpectedXiongyueWordDecRes);

  const XiongyueWord2 =
    "呋食你噔你囑吃有現蜂擊常出嗄嗄雜和捕氏囑嚄樣誘哈肉嘍誘嚄有嚁告嗅嗚嘶覺眠麼眠類住蜜誘家嗚嚁和冬萌會我呆嗅歡堅嗚歡吖很唬啽達笨會訴嘍嗚動喜樣囑歡嗥啽性沒擊歡住怎類取笨達嗚嗥喜森住捕嗡山蜜擊嗡嗥家啽冬嗅達蜂嗄怎你咬山眠冬會啽類偶偶告吖捕森呦註你現魚洞達破嘿哈噗蜜捕哮破呱寶嗷和發咯喜嚁堅達我萌噔樣哞我哈住嚄類家爾現家誘哈爾既嗄發取嘶出蜜圖盜喜嘶住既達誘註和歡有唬註襲爾捕喜嗒盜和嘍肉冬山會果既麼哞住沒哈氏達住更雜嗥註取盜哞萌訴意告噔嗡嘿嚄咯囑嗥物雜歡很哞怎嗄住偶嘶襲住會吖眠雜樣出森囑沒取爾意誒溫爾蜜麼性爾嗄爾覺噔嗥有嗥常物噔哞囑人既冬嗥咯破堅呦捕溫既氏歡噔啽森誒嘍肉嘶萌嚁啽咯吃呆很吖很吃更溫喜眠發吃嗷覺物森擊麼蜜破家有訴堅你哮囑覺森更嗄溫拙誘你沒拙圖嗥眠樣發寶喜告取破拙嗷怎誒果註肉呱很怎嚄拙怎萌歡人盜更註食嗥性發堅告噗洞咬蜂破爾常嚄怎咬性象拙嘶住吃註達啽嘿眠咬山嗅發囑很蜜森非常嚁取你動嗚偶嘶萌物嗷常捕嘶蜜常噤唬誘吖誘出意物果人怎蜜襲嗚動堅達訴麼我和哈冬蜜麼果物很你家哈樣食洞人嘍魚意噗盜果吖現吃類哞山性拙發會更擊象捕出類歡象哞現果樣性寶蜜襲山覺呆和沒盜咯我洞萌喜破會達沒嘍取很寶意蜜哞吖嗡更噔呱食噗噗爾唬動我笨拙嗡註嚄象噗嗥咬吃嘍吃擊和山覺發樣會哈擊怎咬囑嘶笨告嗚食意更囑偶哈冬山哈蜜呆哞和噗拙爾告食很哈嗡家噔覺發麼會現眠達呱告爾達歡會吃更笨誘既物眠很常意寶果物捕嗡呦你噤萌森人寶覺咯圖常襲非很噗嗷你很圖達有家有偶既嗥我哞擊咯吃類誘氏喜嗅覺有蜜偶既吖山現嘍噗咬沒肉意麼噤嗚吖啽人會嗚發嘿發會笨更嚄喜住眠咯歡捕氏啽嚁我物堅哈噔嗡誒嘍魚誒訴住嗅有動哞哮嘶會家怎嚄象和噔常哮誘達笨我誘偶取哈會你圖告常咯洞冬和嗡擊嚄雜我性盜洞歡噗嗒達圖捕意註吖萌捕和嘍嗅嘶物擊雜物家嚄拙嗄哈動吖破冬覺唬哈和歡冬沒你嗚樣肉森笨怎取取意嗥唬意有家圖嘍魚囑森嗄吃會人現噤象和人寶盜破非圖破吖非嘿現嗡蜂哮萌森笨沒麼眠盜吃笨蜜噤哮擊哞哈嚁人冬會啽洞嘶人寶哮嗅嘶咯出噔笨咬喜嗄偶哮咬呱雜類魚非既象嘶哮嗥哮嘿圖嘿笨樣象襲笨呦破盜嗡眠告嘍歡達住取歡破吃現蜂爾溫冬覺象嗚誒嘍住萌破拙物堅我意捕達呱麼沒噗嚁達性嗥物會覺嗷物咯哞麼吃達既會非呦嗅既蜂沒沒盜啽象出堅盜嗒嗚怎誘我家怎動啽出山象吖怎捕萌萌蜂吖噤寶盜會你噤嗥笨意嚄溫類肉雜盜噗現咯出唬嗚物有既註冬擊動吖山你嘶盜擊魚很象性噔嗅嗷類發嘍既眠家取喜嗄雜噔啽冬我啽會果爾呱意樣怎沒哞偶呆更嚁笨啽嗥你物歡爾果現山動肉山蜂咬森非註萌哮吃襲寶象爾常哮肉嗷沒哈非嗒會嚄唬咯果爾象眠嗷洞咯盜眠註雜唬象現性森嗥山我爾出呦洞萌噤拙咬肉既眠沒嚁嗒爾嚁萌噤唬嗚動襲堅家山啽噤告人嘿告訴樣果眠啽類魚噗萌物覺果嘿盜蜂蜜常咬和類常擊蜂歡嚄常笨現嗥出你笨既家取呆嘿圖捕噔嗄我誒眠噔象嗡盜囑嚄訴果動唬訴呦嘍住很萌既嗒呆呱嘿麼捕拙嗒告肉達嗚沒怎覺哞既笨堅咯出圖嗷嘍圖哞肉嚁住哈既冬咯物嗄氏嗄吃哈唬溫襲爾魚非堅呦咯達麼呦哞嗡洞嚄嗡有眠嘶破沒果家咯噤溫寶雜會動冬我森囑哈現哈嗥沒咯圖有嗷山更擊現盜魚喜喜沒嚄圖雜更訴盜呦嗚動呦嗚氏註動嘶沒更蜜沒喜吃我取冬魚吖圖會溫噤嘍住類哈嘿溫噗果常呦動嗥笨性呦物破動意嗚捕嗥溫誘嘿嗚捕告拙噤我肉氏嚁家樣肉類很哮訴嗡現象呱家啽嗡覺註動嘶噔象告嗚魚既爾人森啽哞堅嗥覺會喜擊咬物爾動人覺嗚告哮捕果常盜食告嗚吖非人噗誒氏嘍襲氏嗡嘶氏寶捕麼嗥蜂呆家動嗡拙魚呆哞嚄噤萌會住物住嘿寶山告嗅洞發爾訴盜嗒告嘿盜哮呆嗡呦歡寶冬嗒訴堅嗚哞囑覺偶嗚沒爾破非偶會笨嚄唬麼誒覺嘍象嚄歡會寶呆哞嗡哞眠現溫物發怎既眠住訴魚怎囑出咯發象森和噤很動有性襲魚嘍洞和和山動物呦常咬和嗡笨覺嗅呆你食性魚出山象呱取誘";
  const ExpectedXiongyueWordDecRes2 =
    "\n诶..朋友们好啊，我是混元形意太极门掌门人——马保国刚才有个朋友问我马老师发生什么事了，我说怎么回事，给我发了几张截图。我一看！嗷！原来是昨天，有两个年轻人。三十多岁，一个体重，九十多公斤，一个体重八十多公斤。他们说，诶...有一个说是我在健身房练功颈椎练坏了，马老师你能不能教教我浑元功法，诶...帮助治疗一下，我的颈椎病。我说可以。我说你在健身房练死劲儿，不好用，他不服气。诶...我说小朋友，你两个手来折我一个手指头，他折不动。他说你这也没用。我说我这个有用，这是化劲儿，传统功夫是讲化劲儿的，四两拨千金。二百多斤的英国大力士，都握不动我这一个手指头啊…哈！他非要和我试试，我说可以。诶…我一说完他啪就站起来了，很快啊！然后上来就是一个左正蹬，吭，一个右鞭腿一个左刺拳，我全部防区（口误）防出去了啊！防出去以后自然是传统功夫以点到为止，右拳放到他鼻子上没打他，我笑一下准备收拳，因为这时间，按传统功夫的点到为止他已经输了。如果这一拳发力，一拳就把他鼻子打骨折了，放在鼻子上没有打他，他也承认，我先打到他面部。他不知道拳放在他鼻子上，他承认我先打到他面部，啊！我收拳的时间不打了，他突然袭击，左刺拳来打我脸，啊，我大意了啊，没有闪，诶…他的左拳给我眼，啊，右眼，蹭了一下，但没关系啊！他也说，啊他截图也说了，两分多钟以后，当时流眼泪了，捂着眼，我说停停。然后两分钟...钟以后，两分多钟以后诶就好啦，我说小伙子你不讲武德你不懂，我说马老师对不...对不起，我不懂规矩。啊，我是…他说他是乱打的，他可不是乱打的啊，正蹬鞭腿左刺拳，训练有素，后来他说他练过三四年泰拳。啊，看来是，有备而来！这两个年轻人不讲武德，来骗！来偷袭，我六十九岁的老同志。这好吗？这不好！我劝！这位年轻人好自为之，好好反思，以后不要再犯这样的聪明，小聪明，啊，呃…武林要以和为贵，要讲武德，不要搞窝里斗。谢谢朋友们！";

  Abra.BearDecode(XiongyueWord2);
  TestTemp3 = Abra.Output();
  expect(TestTemp3).toBe(ExpectedXiongyueWordDecRes2);
});

test("链接压缩测试", { timeout: 15000 }, () => {
  //测试链接压缩。
  const Abra = new Abracadabra();

  TestLinks.forEach((item) => {
    //测试不同链接的加解密一致性
    let TestTemp = "";
    let TestTemp2 = "";
    Abra.WenyanInput(item, "ENCRYPT", "ABRACADABRA", {
      RandomIndex: 100,
    });
    TestTemp = Abra.Output();
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA");
    TestTemp = Abra.Output();

    Abra.OldInput(item, "ENCRYPT", "ABRACADABRA", true);
    TestTemp2 = Abra.Output();
    Abra.OldInput(TestTemp2, "DECRYPT", "ABRACADABRA");
    TestTemp2 = Abra.Output();

    expect(TestTemp).toBe(item);
    expect(TestTemp2).toBe(item);
  });
});

test("随机数据加密测试", { timeout: 15000 }, () => {
  //测试随机数据的加密。
  const Abra = new Abracadabra("UINT8", "UINT8");

  TestData.forEach((data) => {
    let TestTemp;
    let TestTemp2;
    let TestTemp3;
    Abra.WenyanInput(data, "ENCRYPT", "ABRACADABRA", {
      RandomIndex: 100,
    });
    TestTemp = Abra.Output();
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA");
    TestTemp = Abra.Output();

    Abra.OldInput(data, "ENCRYPT", "ABRACADABRA", true);
    TestTemp2 = Abra.Output();
    Abra.OldInput(TestTemp2, "DECRYPT", "ABRACADABRA");
    TestTemp2 = Abra.Output();

    //传统模式，自动判别
    Abra.OldInput(data, "AUTO", "ABRACADABRA");
    TestTemp3 = Abra.Output();
    Abra.OldInput(TestTemp3, "AUTO", "ABRACADABRA");
    TestTemp3 = Abra.Output();

    expect(TestTemp).toStrictEqual(data);
    expect(TestTemp2).toStrictEqual(data);
    expect(TestTemp3).toStrictEqual(data);
  });
});

test("高级加密测试", { timeout: 40000 }, () => {
  //测试随机数据的高级加密。
  const Abra = new Abracadabra("UINT8", "UINT8");

  TestData.forEach((data) => {
    let TestTemp;
    let TOTPEpochFreeze = Date.now();
    Abra.WenyanInput(
      data,
      "ENCRYPT",
      "ABRACADABRA",
      {
        RandomIndex: 100,
      },
      {
        Enable: true,
        UseStrongIV: true,
        UseHMAC: true,
        UsePBKDF2: true,
        UseTOTP: true,
        TOTPEpoch: TOTPEpochFreeze,
      }
    );
    TestTemp = Abra.Output();
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA", undefined, {
      TOTPEpoch: TOTPEpochFreeze,
    });
    TestTemp = Abra.Output();

    Abra.WenyanInput(
      TestTemp,
      "ENCRYPT",
      "ABRACADABRA",
      {
        RandomIndex: 100,
      },
      {
        Enable: true,
        UseStrongIV: true,
        UseHMAC: true,
        UsePBKDF2: true,
        UseTOTP: false,
        TOTPEpoch: TOTPEpochFreeze,
      }
    );
    TestTemp = Abra.Output();
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA", undefined, {
      TOTPEpoch: TOTPEpochFreeze,
    });
    TestTemp = Abra.Output();
    Abra.WenyanInput(
      TestTemp,
      "ENCRYPT",
      "ABRACADABRA",
      {
        RandomIndex: 100,
      },
      {
        Enable: true,
        UseStrongIV: true,
        UseHMAC: true,
        UsePBKDF2: false,
        UseTOTP: false,
        TOTPEpoch: TOTPEpochFreeze,
      }
    );
    TestTemp = Abra.Output();
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA", undefined, {
      TOTPEpoch: TOTPEpochFreeze,
    });
    TestTemp = Abra.Output();
    Abra.WenyanInput(
      TestTemp,
      "ENCRYPT",
      "ABRACADABRA",
      {
        RandomIndex: 100,
      },
      {
        Enable: true,
        UseStrongIV: true,
        UseHMAC: false,
        UsePBKDF2: false,
        UseTOTP: false,
        TOTPEpoch: TOTPEpochFreeze,
      }
    );
    TestTemp = Abra.Output();
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA", undefined, {
      TOTPEpoch: TOTPEpochFreeze,
    });
    TestTemp = Abra.Output();
    Abra.WenyanInput(
      TestTemp,
      "ENCRYPT",
      "ABRACADABRA",
      {
        RandomIndex: 100,
      },
      {
        Enable: true,
        UseStrongIV: false,
        UseHMAC: false,
        UsePBKDF2: false,
        UseTOTP: false,
        TOTPEpoch: TOTPEpochFreeze,
      }
    );
    TestTemp = Abra.Output();
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA", undefined, {
      TOTPEpoch: TOTPEpochFreeze,
    });
    TestTemp = Abra.Output();
    Abra.WenyanInput(
      TestTemp,
      "ENCRYPT",
      "ABRACADABRA",
      {
        RandomIndex: 100,
      },
      {
        Enable: true,
        UseStrongIV: true,
        UseHMAC: false,
        UsePBKDF2: true,
        UseTOTP: true,
        TOTPEpoch: TOTPEpochFreeze,
      }
    );
    TestTemp = Abra.Output();
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA", undefined, {
      TOTPEpoch: TOTPEpochFreeze,
    });
    TestTemp = Abra.Output();
    Abra.WenyanInput(
      TestTemp,
      "ENCRYPT",
      "ABRACADABRA",
      {
        RandomIndex: 100,
      },
      {
        Enable: true,
        UseStrongIV: true,
        UseHMAC: false,
        UsePBKDF2: true,
        UseTOTP: false,
        TOTPEpoch: TOTPEpochFreeze,
      }
    );
    TestTemp = Abra.Output();
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA", undefined, {
      TOTPEpoch: TOTPEpochFreeze,
    });
    TestTemp = Abra.Output();
    Abra.WenyanInput(
      TestTemp,
      "ENCRYPT",
      "ABRACADABRA",
      {
        RandomIndex: 100,
      },
      {
        Enable: true,
        UseStrongIV: false,
        UseHMAC: true,
        UsePBKDF2: true,
        UseTOTP: true,
        TOTPBaseKey: "https://pixiv.net",
        TOTPEpoch: 1767928233717,
        TOTPTimeStep: 0,
      }
    );
    TestTemp = Abra.Output();
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA", undefined, {
      TOTPBaseKey: "https://pixiv.net",
      TOTPEpoch: 1767928319717,
      TOTPTimeStep: 0,
    });
    TestTemp = Abra.Output();

    expect(TestTemp).toStrictEqual(data);
  });
});
