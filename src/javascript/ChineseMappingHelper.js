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

import {
  GetRandomIndex,
  insertStringAtIndex,
  difference,
  AddPadding,
  shuffle,
  ValueNoise1D,
  unpackFlexibleTransferConfig,
} from "./Misc.js";
import { RoundObfusOLD, RoundObfus } from "./RoundObfusHelper.js";
import {
  CallbackObj,
  FlexibleTransferDataObj,
  FLEXIBLE_TRANSFER_MAGIC,
  DilutionConfig,
} from "./CoreHandler.js";
import * as OpenCC from "opencc-js";
import { Base64 } from "js-base64";

export class WenyanSimulator {
  /**
   *
   * 文言文仿真器(V3)的主类
   * 初始化时传入明文密钥和可选的调试用回调函数
   *
   * @param {string}key 明文密钥，哈希后用于转轮混淆
   * @param {any}callback 回调函数，用于调试
   * @constructor
   */
  constructor(key, callback = null) {
    this.Map =
      '{"Actual":{"N":{"alphabet":{"a":"人","b":"镜","c":"鹏","d":"曲","e":"霞","f":"绸","g":"裳","h":"路","i":"岩","j":"叶","k":"鲤","l":"月","m":"雪","n":"冰","o":"局","p":"恋","q":"福","r":"铃","s":"琴","t":"家","u":"天","v":"韵","w":"书","x":"莺","y":"璃","z":"雨","A":"文","B":"涧","C":"水","D":"花","E":"风","F":"棋","G":"楼","H":"鹤","I":"鸢","J":"灯","K":"雁","L":"星","M":"声","N":"树","O":"茶","P":"竹","Q":"兰","R":"苗","S":"心","T":"语","U":"礼","V":"梦","W":"庭","X":"木","Y":"驿","Z":"火"},"numbersymbol":{"0":"森","1":"夏","2":"光","3":"林","4":"物","5":"云","6":"夜","7":"城","8":"春","9":"空","+":"雀","/":"鹂","=":"鸳"}},"V":{"alphabet":{"a":"关","b":"赴","c":"呈","d":"添","e":"停","f":"成","g":"走","h":"达","i":"行","j":"称","k":"见","l":"学","m":"听","n":"买","o":"作","p":"弹","q":"写","r":"定","s":"谈","t":"动","u":"旅","v":"返","w":"度","x":"开","y":"筑","z":"选","A":"流","B":"指","C":"换","D":"探","E":"放","F":"看","G":"报","H":"事","I":"泊","J":"现","K":"迸","L":"彰","M":"需","N":"飞","O":"游","P":"求","Q":"御","R":"航","S":"歌","T":"读","U":"振","V":"登","W":"任","X":"留","Y":"奏","Z":"连"},"numbersymbol":{"0":"知","1":"至","2":"致","3":"去","4":"画","5":"说","6":"进","7":"信","8":"取","9":"问","+":"笑","/":"视","=":"言"}},"MV":["欲","应","可","能","将","请","想","必","当"],"A":{"alphabet":{"a":"莹","b":"畅","c":"新","d":"高","e":"静","f":"美","g":"绿","h":"佳","i":"善","j":"良","k":"瀚","l":"明","m":"早","n":"宏","o":"青","p":"遥","q":"速","r":"慧","s":"绚","t":"绮","u":"寒","v":"冷","w":"银","x":"灵","y":"绣","z":"北","A":"临","B":"南","C":"俊","D":"捷","E":"骏","F":"益","G":"雅","H":"舒","I":"智","J":"谜","K":"彩","L":"余","M":"短","N":"秋","O":"乐","P":"怡","Q":"瑞","R":"惠","S":"和","T":"纯","U":"悦","V":"迷","W":"长","X":"少","Y":"近","Z":"清"},"numbersymbol":{"0":"远","1":"极","2":"安","3":"聪","4":"秀","5":"旧","6":"浩","7":"盈","8":"快","9":"悠","+":"后","/":"轻","=":"坚"}},"AD":{"alphabet":{"a":"诚","b":"畅","c":"新","d":"高","e":"静","f":"恒","g":"愈","h":"谨","i":"善","j":"良","k":"频","l":"笃","m":"早","n":"湛","o":"昭","p":"遥","q":"速","r":"朗","s":"祗","t":"攸","u":"徐","v":"咸","w":"皆","x":"灵","y":"恭","z":"弥","A":"临","B":"允","C":"公","D":"捷","E":"淳","F":"益","G":"雅","H":"舒","I":"嘉","J":"勤","K":"协","L":"永","M":"短","N":"歆","O":"乐","P":"怡","Q":"已","R":"忻","S":"和","T":"谧","U":"悦","V":"稍","W":"长","X":"少","Y":"近","Z":"尚"},"numbersymbol":{"0":"远","1":"极","2":"安","3":"竟","4":"悉","5":"渐","6":"颇","7":"辄","8":"快","9":"悠","+":"后","/":"轻","=":"曾"}}},"Virtual":{"zhi":["之"],"hu":["乎"],"zhe":["者"],"ye":["也"],"for":["为"],"ba":["把"],"le":["了"],"er":["而"],"this":["此","斯"],"still":["仍"],"with":["与","同"],"also":["亦","也"],"is":["是","乃"],"not":["未","莫"],"or":["或"],"more":["更"],"make":["使","将","让"],"and":["与","同"],"anti":["非","不"],"why":["为何","奈何","何哉"],"but":["但","却","则","而","况","且"],"like":["似","如","若"],"if":["若","倘"],"int":["哉","呼","噫","焉"],"self":["自"],"by":["以","于"],"number":["一","二","三","四","五","六","七","八","九","十"],"numberpairfiltered":["一二","二三","三四","三五","四五","五六","六七","七八"],"magnitude":["百","千","万"],"dynasty":["秦","汉","魏","晋","唐","宋"],"country":["韩","赵","魏","楚","齐"],"zi":["子"],"gentlemen":["老","庄","孟","孔","荀","墨","韩非","君","慎","孙","晏","申","颜"],"SignAnimal":["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"],"SignBranch":["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"],"SignBranchAnimal":["子鼠","丑牛","寅虎","卯兔","辰龙","巳蛇","午马","未羊","申猴","酉鸡","戌狗","亥猪"],"HeavenStems":["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"],"ReignTitle":["建元","贞观","宣德","弘治","正德","崇德","顺治","康熙","熙宁"]},"Sentences":{"Begin":["1D/非/N/ye","1B/N/曰/R","1Z/zi/曰/R","1Z/gentlemen/zi/曰/R","1B/gentlemen/zi/AD/然/曰/R","1B/若夫/N","1C/anti/MV/V/ye/P","1Z/zi/曰/R","1Z/gentlemen/zi/曰/R","2B/A/N/曰/R","2B/N/以/A","2C/N/anti/在/A","2C/N/make/N/zhi","2C/MV/N/zhe/A","2E/有/N/则/A","2E/不/入/于/N/、/则/入/于/N/P","2C/V/zhe/V/zhi","2D/but/MV/A/zhe/A","2Z/HeavenStems/SignBranch/年","2Z/HeavenStems/SignBranchAnimal/年","2Z/ReignTitle/number/年","3C/N/V/by/N","3B/初，/N/V/by/N","3B/夫/N/anti/V/by/N","3B/AD/V/zhi/谓/A","3C/A/N/为/N/兮","3B/V/而/V/zhi/zhi/谓/A","3B/N/，/N/zhi/N/ye/P","3D/A/之/V/者/必/有/N/P","3D/入/出/而/无/V/其/形/，/是/谓/A/N/P","3D/有/所/V/N/，/则/不/得/其/V/P","3D/世/之/观/V/者/，/唯/能/AD/V/其/间/P","4D/非/N/不/A/，/V/不/A","4C/A/N/AD/V","4C/V/N/以/V/N","4C/有/number/magnitude/A/N/，/number/magnitude/A/N/P","4C/numberpairfiltered/个/A/N/外/，/numberpairfiltered/点/A/N/前/P","4D/A/者/自/V/也/，/而/N/自/V/也/P","4E/N/不在/A/，/有/N/则/A/P","4E/上/不/V/N/，/下/不/V/N/P","4D/A/N/常有/，/而/A/N/不常有/P","4D/V/N/者/，/N/之/N/也/P","4E/N/有/MV/V/，/N/有/AD/然/P","4D/N/无/N/，/无以/V/N","4D/欲/V/其/N/者/，/先/V/其/N/P","4D/今/夫/N/，/一/N/之/多/，/及/其/A/A/P","4D/有/所/A/，/有/所/V/，/然/而/MV/V/其/N/者/也/P","4D/V/之/不/为/N/，/V/之/不/为/N/P","4D/吾/为/N/之/所/V/，/N/亦/为/吾/所/V/P","5D/V/N/而/V/A/，/V/zhi/道/ye/P","5D/A/N/之/N/，/like/N/like/N/P","5E/N/zhi/V/V/，/实为/A/A/P","5C/本/MV/V/A/，/anti/V/N/N","5C/N/之/无/N/，/N/V/之/N","5D/V/N/而/V/之/者/，/非/其/N/AD/也/P","5B/今/V/N/以/V/A/N","5B/N/乃/V/V/N/zhi/N","5B/N/N/无/V/，/V/而/必/V/P","5B/今/N/乃/A/N/A/N","5C/A/N/V/A/N","5B/夫/N/、/N/不/MV/AD/V/N","5D/不/有/A/N/，/何/V/A/N/Q","5D/以/A/N/为/N/者/，/N/MV/弗/而/V/之/P","6B/以/N/V/，/like/V/N/V/N","6B/A/N/zhi/N/，/V/zhi/以/V/其/N","6B/A/N/V/于/N/而/V/N","6B/A/N/未/V/N/、/N/之/N","6B/V/A/N/若/V/A/N","6C/A/N/为/N/兮/，/A/N/为/N/P","6D/不/V/N/，/不/V/N/，/当/以/AD/V/论/P","6D/A/则为/V/N/，/A/则为/V/N/P","6D/若/居/A/N/之/N/，/则/当/A/N/之/V/P","6D/N/无/N/则/V/，/N/无/N/则/V/P","6D/A/者/V/而/V/之/，/A/者/V/而/V/之/P","6D/N/受/命/于/N/，/固/AD/然/V/于/A/N/P","6D/V/N/而/不/能/V/，/V/而/不/能/V/，/N/也/P","6D/常/有/N/V/A/N/，/请/N/为/N/P","6D/A/而/V/，/A/而/V/者/，/A/N/也/P","7D/夫/A/之/N/V/N/者/，/其/所以/AD/V/者/N/也/P","7C/N/以/A/A/，/AD/V/A/N","7B/V/N/A/，/A/N/V/N","7B/N/V/以/N/V/，/V/不/V/N","7C/N/N/V/N/，/A/于/N/N","7D/MV/AD/V/A/N/，/but/V/V/不/A","7C/或/V/N/V/N/，/V/N/于/N","7E/则有/N/A/N/A/，/N/N/具/V","7D/V/A/N/zhe/，/常/V/其/所/A/，/而/V/其/所/A/P","7D/A/N/之/N/，/常/V/于/其/所/AD/V/而/不/V/之/处/P","7D/A/N/之/N/不在/N/，/在乎/A/N/之/N/也/P","8D/V/A/N/，/V/A/N/，/by/MV/A/zhi/N/P","8D/N/anti/AD/V/zhe/by/AD/V/zhe/V/，/anti/MV/AD/V/P","8D/N/anti/MV/V/N/，/still/继/N/V/，/why/，/and/N/而/anti/V/N/ye/P","8C/V/N/A/A/，/V/N/A/A","8C/N/V/A/N/，/N/V/A/N","8C/N/在/A/N/，/A/N/zhi/A/，/V/于/N/P","8C/A/N/AD/V/，/N/N/AD/V","8C/A/N/V/N/，/N/N/V/N/P","8B/尝/V/A/N/，/AD/V/A/N/zhi/N","8D/予/V/夫/A/N/A/N/，/在/A/N/之/N","8D/N/V/于/A/N/，/而/N/V/于/A/N","8D/N/V/N/为/N/，/N/V/N/为/N/P","8B/N/A/即/N/A/，/N/A/即/N/A/P","8D/虽/无/N/N/zhi/V/，/亦/V/以/AD/V/A/N/P","8D/是/故/A/N/有/A/N/，/必/AD/V/以/得/之/，/AD/V/以/失/之/P","8D/A/N/之/A/N/，/常/为/A/N/之/A/N/P","9D/A/N/V/zhi/而不/V/zhi/、亦/make/A/N/er/复/V/A/N/ye/P","9D/N/MV/V/N/V/V/，/but/N/N/AD/V/P","9B/以/N/，/当/V/A/N/，/非/N/V/N/所/MV/AD/V/P","9C/此/N/有/A/N/A/N/，/A/N/A/N/P","9D/是/N/ye/，/N/A/N/A/，/N/A/N/A/P"],"Main":["1B/非/N/ye","1B/N/曰/R","1Z/zi/曰/R","1Z/gentlemen/zi/曰/R","1B/gentlemen/zi/AD/然/曰/R","1C/anti/MV/V/ye","2C/N/make/N/zhi","2C/MV/N/zhe/A","2E/有/N/则/A","2E/不/入/于/N/、/则/入/于/N/P","2C/V/zhe/V/zhi","2C/but/MV/A/zhe/A","2Z/HeavenStems/SignBranch/年","2Z/HeavenStems/SignBranchAnimal/年","2Z/ReignTitle/number/年","2D/道/N/惟/微/，/谓/微/妙/而/难/V/也/P","2D/惟/大/N/之/有/V/，/越/百/代/而/孤/峙/P","2D/然/N/息/不/忘/，/即/不/得/V/P","3C/N/with/N/V","3B/N/曰，何/A/zhi/V/Q","3D/入/出/而/无/V/其/形/，/是/谓/A/N/P","3D/有/所/V/N/，/则/不/得/其/V/P","3D/世/之/观/V/者/，/唯/能/AD/V/其/间/P","4C/A/N/AD/V","4C/V/N/以/V/N","4C/有/number/magnitude/A/N/，/number/magnitude/A/N/P","4C/numberpairfiltered/个/A/N/外/，/numberpairfiltered/点/A/N/前/P","4D/N/无/N/，/无以/V/N/P","4D/此/谓/V/N/在/V/其/N/P","4D/今/夫/N/，/一/N/之/多/，/及/其/A/A/P","4D/有/所/A/，/有/所/V/，/然/而/MV/V/其/N/者/也/P","4D/欲/V/其/N/者/，/先/V/其/N/P","4E/上/不/V/N/，/下/不/V/N/P","4D/A/者/自/V/也/，/而/N/自/V/也/P","4D/V/N/者/，/N/之/N/也/P","4D/以/此/V/N/，/何/N/不/V/Q","4E/N/不在/A/，/有/N/则/A/P","4C/N/有/MV/V/，/N/有/AD/然/P","4D/N/非/V/而/V/之/者/，/孰/MV/无/N/P","4D/A/N/常有/，/而/A/N/不常有/P","4D/吾/为/N/之/所/V/，/N/亦/为/吾/所/V/P","4C/不/以/N/V/，/不/以/N/V/P","4D/有/N/V/者/，/不/得/其/N/则/V/P","4D/V/之/不/为/N/，/V/之/不/为/N/P","5B/今/V/N/以/V/A/N","5B/N/乃/V/V/N/zhi/N","5B/N/N/无/V/，/V/而/必/V/P","5C/本/MV/V/A/，/anti/V/N/N","5D/V/N/而/V/之/者/，/非/其/N/AD/也/P","5D/故/N/于/A/N/之/N/，/有/所/V/int/P","5D/A/N/之/N/，/like/N/like/N/P","5D/以/A/N/为/N/者/，/N/MV/弗/而/V/之/P","5D/故/夫/A/N/之/N/，/不/可/make/其/V/于/N/也/P","5D/N/不/为/A/，/而/有/时/乎/为/A/，/谓/A/N/者/也/P","5D/于/是/A/N/之/N/AD/然/V/矣/P","5B/今/N/乃/A/N/A/N","5E/每/有/V/N/，/便/AD/然/V/N/P","5D/N/V/而/A/N/V/也","5E/不/有/A/N/，/何/V/A/N/Q","5C/N/之/无/N/，/N/V/之/N","6D/N/A/N/A/，/则/所/V/得/其/A/P","6D/V/AD/而/V/AD/，/anti/MV/V/于/N/也/P","6D/A/而/V/，/A/而/V/者/，/A/N/也/P","6B/以/N/V/，/like/V/N/V/N","6B/V/A/N/若/V/A/N","6C/N/V/，/V/N/V/N","6E/虽/V/V/A/A/，/A/A/不/同/P","6D/而/A/N/zhi/N/，/V/zhi/以/V/其/N/P","6B/A/N/V/于/N/而/V/N","6B/A/N/未/V/N/、/N/之/N","6C/V/A/N/，/V/A/N","6C/A/N/为/N/兮/，/A/N/为/N/P","6D/V/MV/with/其/N/，/而/V/MV/V/以/N/者/，/N/也/P","6D/A/N/必/有/A/N/V/之者/、/予/可/无/N/也/P","6D/将/有/V/，/则/V/A/N/以/V/N/P","6D/不/V/N/，/不/V/N/，/当/以/AD/V/论/P","6D/A/则为/V/N/，/A/则为/V/N/P","6D/N/无/N/则/V/，/N/无/N/则/V/P","6D/A/者/V/而/V/之/，/A/者/V/而/V/之/P","6D/若/居/A/N/之/N/，/则/当/A/N/之/V/P","6D/N/受/命/于/N/，/固/AD/然/V/于/A/N/P","6D/V/N/而/不/能/V/，/V/而/不/能/V/，/N/也/P","6D/常/有/N/V/A/N/，/请/N/为/N/P","7D/夫/A/之/N/V/N/者/，/其/所以/AD/V/者/N/也/P","7B/N/V/以/N/V/，/V/不/V/N","7C/N/N/V/N/，/A/于/N/N","7D/MV/AD/V/A/N/，/but/V/V/不/A","7C/或/V/N/V/N/，/V/N/于/N","7D/V/A/N/zhe/，/常/V/其/所/A/，/而/V/其/所/A/P","7D/A/N/之/不/V/也/AD/矣/，/欲/N/之/无/N/也/AD/矣/P","7D/A/N/之/N/，/常/V/于/其/所/AD/V/而/不/V/之/处/P","7D/A/N/之/N/不在/N/，/在乎/A/N/之/N/也/P","7D/A/N/之/N/，/V/之/N/而/V/之/N/也/P","7D/是故/A/N/不必不如/N/，/N/不必/A/于/A/N/P","7B/有/A/N/、/A/N/、/A/N/之/N/P","8D/N/anti/MV/V/N/，/still/继/N/V/，/why/，/and/N/而/anti/V/N/ye/P","8E/是/故/无/A/无/A/，/无/A/无/A/，/N/之/所/V/、/N/之/所/V/ye/P","8C/V/N/A/A/，/V/N/A/A","8B/N/在/A/N/，/A/N/zhi/A/，/V/于/N/P","8B/like/A/N/V/N/，/不/V/N/V/之/N/P","8C/A/N/AD/V/，/N/N/AD/V","8D/A/N/之/A/N/，/常/为/A/N/之/A/N/P","8C/A/N/V/N/，/N/N/V/N/P","8D/虽/无/N/N/zhi/V/，/亦/V/以/AD/V/A/N/P","8D/予/V/夫/A/N/A/N/，/在/A/N/之/N","8D/故/V/A/N/者/，/当/V/A/N/之/A/N/P","8D/N/V/于/A/N/，/而/N/V/于/A/N","8D/N/V/N/为/N/，/N/V/N/为/N/P","8B/N/A/即/N/A/，/N/A/即/N/A/P","8B/A/N/MV/A/N/之/A/，/V/N/中/之/A","8D/N/V/于/A/N/之上/，/AD/V/于/A/N/之间/P","8D/是/故/A/N/有/A/N/，/必/AD/V/以/得/之/，/AD/V/以/失/之/P","8D/故/其/N/不/可/以/V/N/，/A/N/V/N/而/不/MV/N/P","8B/使/其/A/N/AD/V/，/A/N/AD/V/P","9B/N/MV/V/N/V/V/，/but/N/N/AD/V","9D/A/N/V/zhi/而不/V/zhi/、亦/make/A/N/er/复/V/A/N/ye/P","9D/以/N/，/当/V/A/N/，/非/N/V/N/所/MV/AD/V/P","9C/此/N/有/A/N/A/N/，/A/N/A/N/P","9E/是/N/ye/，/N/A/N/A/，/N/A/N/A","9E/V/A/N/，/N/A/N/A/，/乃/AD/V","9D/何/其/AD/也/，/岂/V/之/AD/而/V/之/AD/int/，/抑/本/其/A/A/之/N/而/also/自/于/N/int/Q","9D/V/A/N/，/V/A/N/，/此/A/N/所/以/A/也/P"],"End":["1B/非/N/ye","1C/anti/MV/V/ye","2C/唯/N/V/zhi","2B/V/by/N","2D/其/also/A/hu/其/V/ye/P","2C/N/make/N/zhi","2C/MV/N/zhe/A","2E/有/N/则/A","2C/V/zhe/V/zhi","2C/but/MV/A/zhe/A","2D/道/N/惟/微/，/谓/微/妙/而/难/V/也/P","2D/惟/大/N/之/有/V/，/越/百/代/而/孤/峙/P","2D/然/N/息/不/忘/，/即/不/得/V/P","3D/入/出/而/无/V/其/形/，/是/谓/A/N/P","3D/有/所/V/N/，/则/不/得/其/V/P","3D/世/之/观/V/者/，/唯/能/AD/V/其/间/P","3C/V/在/A/N","3D/今/zhi/V/zhe/，/亦将有/V/于/this/N/P","3D/某也/A/，/某也/A/，/可/不/A/哉","3D/有/所/V/N/，/则/不/得/其/V/P","4B/V/N/zhi/N/by/N","4D/A/者/自/V/也/，/而/N/自/V/也/P","4C/A/N/AD/V","4C/V/N/以/V/N","4D/N/无/N/，/无以/V/N","4D/V/N/者/，/N/之/N/也/P","4D/以/此/V/N/，/何/N/不/V/Q","4D/噫/，/A/N/ye/，/N/谁/与/V/Q","4D/此/谓/V/N/在/V/其/N/P","4D/今/夫/N/，/一/N/之/多/，/及/其/A/A/P","4D/有/所/A/，/有/所/V/，/然/而/MV/V/其/N/者/也/P","4E/上/不/V/N/，/下/不/V/N/P","4D/欲/V/其/N/者/，/先/V/其/N/P","4D/有/N/V/者/，/不/得/其/N/则/V/P","4C/不/以/N/V/，/不/以/N/V/P","4D/V/之/不/为/N/，/V/之/不/为/N/P","4D/然/则/A/N/自/N/V/矣/P","5B/请/V/N/zhi/N/中/，/是/N/zhi/N/P","5D/今/V/N/以/V/A/N","5B/N/乃/V/V/N/zhi/N","5B/N/N/无/V/，/V/而/必/V/P","5C/本/MV/V/A/，/anti/V/N/N","5D/V/N/而/V/之/者/，/非/其/N/AD/也/P","5D/以/A/N/为/N/者/，/N/MV/弗/而/V/之/P","5D/A/N/之/N/，/like/N/like/N/P","5D/N/不/为/A/，/而/有/时/乎/为/A/，/谓/A/N/者/也/P","5D/于/是/A/N/之/N/AD/然/V/矣/P","5D/故/N/于/A/N/之/N/，/有/所/V/int/P","5D/故/夫/A/N/之/N/，/不/可/make/其/V/于/N/也/P","5B/今/N/乃/A/N/A/N","5D/N/V/而/A/N/V/也","5E/不/有/A/N/，/何/V/A/N/Q","5C/N/之/无/N/，/N/V/之/N","6C/A/N/为/N/兮/，/A/N/为/N/P","6D/以/N/V/，/like/V/N/V/N","6D/A/zhi/V/N/，/亦/like/今/zhi/V/N/，/A/夫/P","6D/A/者/V/而/V/之/，/A/者/V/而/V/之/P","6D/若/居/A/N/之/N/，/则/当/A/N/之/V/P","6D/V/AD/而/V/AD/，/anti/MV/V/于/N/也/P","6D/A/而/V/，/A/而/V/者/，/A/N/也/P","6B/N/V/，/V/N/V/N","6E/V/N/之/N/，/为/N/V/者/，/可以/V/矣/P","6D/V/MV/with/其/N/，/而/V/MV/V/以/N/者/，/N/也/P","6D/A/N/必/有/A/N/V/之者/、/予/可/无/N/也/P","6E/虽/V/V/A/A/，/A/A/不/同/P","6D/将/有/V/，/则/V/A/N/以/V/N/P","6D/不/V/N/，/不/V/N/，/当/以/AD/V/论/P","6D/A/则为/V/N/，/A/则为/V/N/P","6D/N/受/命/于/N/，/固/AD/然/V/于/A/N/P","6D/N/无/N/则/V/，/N/无/N/则/V/P","6D/N/A/N/A/，/则/所/V/得/其/A/P","6D/常/有/N/V/A/N/，/请/N/为/N/P","6D/V/N/而/不/能/V/，/V/而/不/能/V/，/N/也/P","7D/夫/A/之/N/V/N/者/，/其/所以/AD/V/者/N/也/P","7D/N/V/以/N/V/，/V/不/V/N","7C/N/N/V/N/，/A/于/N/N","7D/MV/AD/V/A/N/，/but/V/V/不/A","7E/或/V/N/V/N/，/V/N/于/N","7D/A/N/之/N/不在/N/，/在乎/A/N/之/N/也/P","7D/A/N/之/N/，/V/之/N/而/V/之/N/也/P","7D/是故/A/N/不必不如/N/，/N/不必/A/于/A/N/P","7B/有/A/N/、/A/N/、/A/N/之/N/P","8E/虽/N/A/N/A/，/所/以/V/N/，其/N/A/ye/P","8B/like/A/N/V/N/，/不/V/N/V/之/N/P","8B/N/A/即/N/A/，/N/A/即/N/A/P","8D/何必/V/N/V/N/，/V/N/zhi/N/N/哉/P","8D/N/anti/MV/V/N/，/still/继/N/V/，/why/，/and/N/而/anti/V/N/ye/P","8D/是/故/A/N/有/A/N/，/必/AD/V/以/得/之/，/AD/V/以/失/之/P","8D/故/其/N/不/可/以/V/N/，/A/N/V/N/而/不/MV/N/P","8C/V/N/A/A/，/V/N/A/A","8B/N/在/A/N/，/A/N/zhi/A/，/V/于/N/P","8C/A/N/AD/V/，/N/N/AD/V","8D/虽/无/N/N/zhi/V/，/亦/V/以/AD/V/A/N/P","8D/N/V/N/为/N/，/N/V/N/为/N/P","8D/故/V/A/N/者/，/当/V/A/N/之/A/N/P","8D/N/V/于/A/N/之上/，/AD/V/于/A/N/之间/P","8C/使/其/A/N/AD/V/，/A/N/AD/V/P","9D/A/N/V/zhi/而不/V/zhi/、亦/make/A/N/er/复/V/A/N/ye/P","9B/N/MV/V/N/V/V/，/but/N/N/AD/V","9D/以/N/，/当/V/A/N/，/非/N/V/N/所/MV/AD/V/P","9C/此/N/有/A/N/A/N/，/A/N/A/N/P","9B/是/N/ye/，/N/A/N/A/，/N/A/N/A/P","9D/何/其/AD/也/，/岂/V/之/AD/而/V/之/AD/int/，/抑/本/其/A/A/之/N/而/also/自/于/N/int/Q","9D/V/A/N/，/V/A/N/，/此/A/N/所/以/A/也/P"]}}';
    this.Normal_Characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/=1234567890"; //表内有映射的所有字符组成的字符串
    this.LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.BIG_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.NUMBERS = "1234567890";
    this.SYMBOLS = "+/=";
    this.NUMBERSYMBOL = "0123456789+/=";

    this.NULL_STR = "孎"; //默认忽略的占位字符，一个生僻字。
    this.callback = callback;

    this.RoundObufsHelper = new RoundObfus(key, callback);

    this.Map_Obj = JSON.parse(this.Map);

    this.CompatibilityDecodeTable = { q: ["褔"] }; //兼容上个版本的密文解密
    this.DecodeTable = {};
    this.PayloadLetter = "";
    this.InitDecodeTable();
  }
  /**
   *
   * 三重转轮混淆的封装函数(加密时)
   *
   * 给定一个键(key)，返回混淆后的对应字母
   *
   * @param {string}keyIn 要传入混淆层的字母
   * @returns {string} 返回混淆后的字母
   */
  RoundKeyMatch(keyIn) {
    return this.RoundObufsHelper.RoundKeyMatch(keyIn);
  }
  /**
   *
   * 三重转轮混淆的封装函数(解密时)
   *
   * 给定一个键(key)，返回逆混淆后的对应字母
   *
   * @param{string}keyIn 要传入混淆层的字母
   * @returns{string} 返回逆混淆后的字母
   */
  DRoundKeyMatch(keyIn) {
    return this.RoundObufsHelper.DRoundKeyMatch(keyIn);
  }
  /**
   *
   * 三重转轮混淆的封装函数
   *
   * 控制转轮的轮转，调用此函数即执行一次轮转操作
   *
   * @returns {undefined} 不返回任何值
   */
  RoundKey() {
    this.RoundObufsHelper.RoundKey();
    return;
  }
  /**
   *
   * 三重转轮混淆 和 汉字映射 的封装函数(加密)
   *
   * 传入一个待混淆的字母，以及其词类，返回一个混淆之后映射的汉字
   *
   * @param {string}text 要传入混淆层的字母
   * @param {string}type 词性，决定了混淆后采用的汉字映射表(应该为N/V/A/AD)
   * @returns {string} 返回一个汉字
   */
  getCryptText(text, type) {
    //查表函数
    let letter = String(text); //源文本
    let idx, idx2, idx3, idx4;

    idx = this.LETTERS.indexOf(letter); //是否是小写字母
    idx2 = this.BIG_LETTERS.indexOf(letter); //是否是大写字母
    idx3 = this.NUMBERS.indexOf(letter); //是否是数字
    idx4 = this.SYMBOLS.indexOf(letter); //是否是符号

    if (["N", "V", "A", "AD"].indexOf(type) === -1) {
      /* v8 ignore next 2 */
      return this.NULL_STR;
    }

    //判断并查表
    if (idx != -1 || idx2 != -1) {
      let mapObj = this.Map_Obj["Actual"][type]["alphabet"];
      if (mapObj[letter]) {
        return String(mapObj[this.RoundKeyMatch(letter)]);
      }
    } else if (idx3 != -1 || idx4 != -1) {
      let mapObj = this.Map_Obj["Actual"][type]["numbersymbol"];
      if (mapObj[letter]) {
        return String(mapObj[this.RoundKeyMatch(letter)]);
      }
    }

    /* v8 ignore next 2 */
    return this.NULL_STR;
  }
  /**
   *
   * 三重转轮混淆 和 汉字映射 的封装函数(解密)
   *
   * 传入一个汉字，返回一个反向查表和逆混淆之后的字母
   *
   * @param {string}text 要传入混淆层的汉字
   * @returns {string} 返回一个逆混淆后的字母
   */
  findOriginText(text) {
    //反向查表函数
    let letter = String(text);
    if (this.InverseDecodeTable && this.InverseDecodeTable[letter]) {
      return this.DRoundKeyMatch(this.InverseDecodeTable[letter]);
    }

    /* v8 ignore next 2 */
    return this.NULL_STR;
  }
  /**
   *
   * 初始化汉字逆映射表
   *
   * 将四个汉字映射表合并，生成一个汉字逆映射表
   *
   * @returns {undefined} 无返回值
   */
  InitDecodeTable() {
    for (let i = 0; i < 52; i++) {
      this.DecodeTable[this.LETTERS[i]] = [];
      this.DecodeTable[this.LETTERS[i]].push(
        this.Map_Obj["Actual"]["N"]["alphabet"][this.LETTERS[i]]
      );
      this.DecodeTable[this.LETTERS[i]].push(
        this.Map_Obj["Actual"]["A"]["alphabet"][this.LETTERS[i]]
      );
      this.DecodeTable[this.LETTERS[i]].push(
        this.Map_Obj["Actual"]["V"]["alphabet"][this.LETTERS[i]]
      );
      if (this.CompatibilityDecodeTable.hasOwnProperty(this.LETTERS[i])) {
        this.CompatibilityDecodeTable[this.LETTERS[i]].forEach((item) => {
          this.DecodeTable[this.LETTERS[i]].push(item);
          this.PayloadLetter = this.PayloadLetter + item;
        });
      }
      this.PayloadLetter =
        this.PayloadLetter +
        this.Map_Obj["Actual"]["N"]["alphabet"][this.LETTERS[i]];
      this.PayloadLetter =
        this.PayloadLetter +
        this.Map_Obj["Actual"]["A"]["alphabet"][this.LETTERS[i]];
      this.PayloadLetter =
        this.PayloadLetter +
        this.Map_Obj["Actual"]["V"]["alphabet"][this.LETTERS[i]];
      if (
        this.Map_Obj["Actual"]["A"]["alphabet"][this.LETTERS[i]] !=
        this.Map_Obj["Actual"]["AD"]["alphabet"][this.LETTERS[i]]
      ) {
        this.DecodeTable[this.LETTERS[i]].push(
          this.Map_Obj["Actual"]["AD"]["alphabet"][this.LETTERS[i]]
        );
        this.PayloadLetter =
          this.PayloadLetter +
          this.Map_Obj["Actual"]["AD"]["alphabet"][this.LETTERS[i]];
      }
    }
    for (let i = 0; i < 13; i++) {
      this.DecodeTable[this.NUMBERSYMBOL[i]] = [];
      this.DecodeTable[this.NUMBERSYMBOL[i]].push(
        this.Map_Obj["Actual"]["N"]["numbersymbol"][this.NUMBERSYMBOL[i]]
      );
      this.DecodeTable[this.NUMBERSYMBOL[i]].push(
        this.Map_Obj["Actual"]["A"]["numbersymbol"][this.NUMBERSYMBOL[i]]
      );
      this.DecodeTable[this.NUMBERSYMBOL[i]].push(
        this.Map_Obj["Actual"]["V"]["numbersymbol"][this.NUMBERSYMBOL[i]]
      );
      this.PayloadLetter =
        this.PayloadLetter +
        this.Map_Obj["Actual"]["N"]["numbersymbol"][this.NUMBERSYMBOL[i]];
      this.PayloadLetter =
        this.PayloadLetter +
        this.Map_Obj["Actual"]["A"]["numbersymbol"][this.NUMBERSYMBOL[i]];
      this.PayloadLetter =
        this.PayloadLetter +
        this.Map_Obj["Actual"]["V"]["numbersymbol"][this.NUMBERSYMBOL[i]];
      if (
        this.Map_Obj["Actual"]["A"]["numbersymbol"][this.NUMBERSYMBOL[i]] !=
        this.Map_Obj["Actual"]["AD"]["numbersymbol"][this.NUMBERSYMBOL[i]]
      ) {
        this.DecodeTable[this.NUMBERSYMBOL[i]].push(
          this.Map_Obj["Actual"]["AD"]["numbersymbol"][this.NUMBERSYMBOL[i]]
        );
        this.PayloadLetter =
          this.PayloadLetter +
          this.Map_Obj["Actual"]["AD"]["numbersymbol"][this.NUMBERSYMBOL[i]];
      }
    }

    //在内存中构建一个反查表，方便直接查表，牺牲内存空间换速度
    this.InverseDecodeTable = {};
    for (let key in this.DecodeTable) {
      this.DecodeTable[key].forEach((item) => {
        if (this.InverseDecodeTable !== undefined) {
          this.InverseDecodeTable[item] = key;
        }
      });
    }
  }

  /**
   * 工具函数
   * 使用一个简单的算法，减少载荷分配数组中的相邻重复项
   *
   * 例如[1,3,3,4] 将被交换为 [1,3,4,3]
   *
   * 传入一个数组，返回一个处理后的数组
   *
   * @param{Array}arr 传入待处理的数组
   * @returns{Array} 返回处理后的数组
   */
  avoidAdjacentDuplicates(arr) {
    if (arr.length <= 1) return arr;
    const newArr = [...arr];
    let hasAdjacent = true;
    let maxTries = newArr.length;

    while (hasAdjacent && maxTries > 0) {
      hasAdjacent = false;
      for (let i = 0; i < newArr.length - 1; i++) {
        if (newArr[i] === newArr[i + 1]) {
          hasAdjacent = true;
          // 尝试在i+2位置之后找一个可以交换的元素
          for (let j = i + 2; j < newArr.length; j++) {
            if (
              newArr[j] !== newArr[i] &&
              (j === 0 || newArr[j - 1] !== newArr[i]) &&
              (j === newArr.length - 1 || newArr[j + 1] !== newArr[i])
            ) {
              [newArr[i + 1], newArr[j]] = [newArr[j], newArr[i + 1]];
              break;
            }
          }
          break;
        }
      }
      maxTries--;
    }
    return newArr;
  }

  /**
   * 工具函数
   * 使用一个简单的算法，合并载荷分配数组中的过量杂碎数字(<3)，避免文本过度碎片化
   *
   * 例如[1,1,1,3,4] 将被处理为 [1,2,3,4]
   *
   * 传入一个数组，返回一个处理后的数组
   *
   * @param{Array}arr 传入待处理的数组
   * @param{number}factor 传入一个因子，决定保留多少比例的杂碎数字(越大越少)
   * @returns{Array} 返回处理后的数组
   */
  mergeNumbers(arr, factor) {
    // 分离小于3的数字和其他数字
    const lessThan3 = arr.filter((num) => num < 3);
    const rest = arr.filter((num) => num >= 3);

    // 根据因子计算需要保留的小于3的数字数量
    const preserveCount = Math.max(
      0,
      Math.floor((1 - factor) * lessThan3.length)
    );

    // 保留部分数字
    const preserved = [];
    const toMerge = [];

    // 随机选择要保留的数字
    const temp = [...lessThan3];
    for (let i = 0; i < preserveCount; i++) {
      const randomIndex = Math.floor(Math.random() * temp.length);
      preserved.push(temp.splice(randomIndex, 1)[0]);
    }
    toMerge.push(...temp);

    // 如果没有需要合并的数字，直接返回
    if (toMerge.length === 0) {
      return [...shuffle(rest), ...shuffle(preserved)];
    }

    // 计算需要合并的总和
    const sum = toMerge.reduce((acc, val) => acc + val, 0);

    // 计算合并后的数字数量范围
    const minSegments = Math.ceil(sum / 9); // 最少段数
    const maxSegments = Math.min(toMerge.length, Math.floor(sum / 3)); // 最多段数
    let bestSegmentCount = minSegments;

    // 寻找最优合并段数
    let minVariance = Infinity;
    for (let k = minSegments; k <= maxSegments; k++) {
      const base = Math.floor(sum / k);
      const remainder = sum % k;
      const values = [];

      // 生成k个数值
      for (let i = 0; i < k; i++) {
        values.push(i < remainder ? base + 1 : base);
      }

      // 计算方差（均匀度）
      const mean = sum / k;
      const variance =
        values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / k;

      // 更新最优解
      if (variance < minVariance) {
        minVariance = variance;
        bestSegmentCount = k;
      }
    }

    // 生成合并后的数字
    const base = Math.floor(sum / bestSegmentCount);
    const remainder = sum % bestSegmentCount;
    const merged = [];

    for (let i = 0; i < bestSegmentCount; i++) {
      merged.push(i < remainder ? base + 1 : base);
    }

    // 组合结果并返回
    return [...shuffle(rest), ...shuffle(preserved), ...merged];
  }
  /**
   * 封装函数
   * 处理载荷分配数组，使其杂碎项更少，减少相邻数字相等的机率
   *
   * 传入一个二维数组(各个段落的载荷数组)和因子，返回一个处理后的二维数组
   *
   * @param {Array}twoDArray 传入待处理的数组
   * @param {number}factor 传入一个因子，决定保留多少比例的杂碎数字(越大越少)
   * @returns {Array} 返回处理后的二维数组
   */
  processArray(twoDArray, factor) {
    return twoDArray.map((subArray) => {
      // 检查是否需要合并
      if (subArray.length > 6) {
        const countLessThan3 = subArray.filter((num) => num < 3).length;
        if (countLessThan3 / subArray.length > 0.35) {
          subArray = this.mergeNumbers(subArray, factor);
        }
      }

      // 打乱顺序
      subArray = shuffle(subArray);
      // 避免相邻重复
      return this.avoidAdjacentDuplicates(subArray);
    });
  }
  /**
   * 工具函数
   * 使用一个简单的算法，把一段文言文密文的总载荷根据一定比例分成三部分(对应开头，主体，和结尾)，返回一个数组
   *
   * @param {number}num 传入一段密文的总载荷
   * @returns {Array} 返回处理后的数组
   */
  distributeInteger(num) {
    //把文言文密文的载荷根据一定比例分成三份(一段)
    if (num <= 3) {
      // 如果 num 小于等于 3，则无法满足每个元素都大于 0 的要求
      return []; // 返回空数组，表示无法分配
    }

    let maxPart = Math.floor(num * 0.2); // 计算每个部分的最大值
    let remaining = num - 2 * maxPart; // 计算剩余部分

    const result = [maxPart, remaining, maxPart]; // 创建包含三个整数的数组

    return result;
  }

  /**
   * 工具函数
   * 使用一个简单的算法，把过长的文言文密文总载荷分成多个段，返回一个数组
   *
   * @param {number}totalLength 传入一段密文的总载荷
   * @param {number}minLen 指定一段密文的最低载荷量
   * @param {number}maxLen 指定一段密文的最高载荷量
   * @returns {Array} 返回处理后的数组
   */
  distributePayload(totalLength, minLen = 20, maxLen = 80) {
    //传入非法的值将直接抛出错误
    if (minLen < 20 || maxLen > 200 || maxLen < minLen) {
      throw new Error("Invalid Payload Distribution Argument.");
    }
    // 容错：如果总长甚至不够一个最小段落
    if (totalLength <= maxLen) return [totalLength];

    const chunks = [];
    let remaining = totalLength;
    let paragraphIndex = 0;

    //将噪声生成器实例化
    const noiseGen = new ValueNoise1D();

    while (remaining > 0) {
      // 获取当前波形值 (0.0 ~ 1.0)
      // 步长 0.5 决定了波形的平缓程度。值越小，相邻段落长度越接近
      let waveFactor = noiseGen.get(paragraphIndex * 0.5);

      //映射到具体长度
      let currentLen = Math.floor(minLen + waveFactor * (maxLen - minLen));

      //边界收敛
      if (currentLen >= remaining || remaining - currentLen < minLen) {
        chunks.push(remaining); // 把剩下的全部打包成最后一段
        break;
      }

      chunks.push(currentLen);
      remaining -= currentLen;
      paragraphIndex++;
    }

    return chunks;
  }

  /**
   * 关键流程函数
   * 使用算法选择文言稀释句式，用户需要传入相关配置参数。
   *
   * @param {number}PayloadLength 一段密文的载荷数
   * @param {number}RandomIndex 随机因子(0~100)，越大，给出的句式越随机
   * @param {number[]|boolean}RandomParagraphing 随机分段范围参数
   * @param {DilutionConfig}DilutionConfigObj 文言文稀释配置
   * @returns {Array} 返回处理后的数组
   */
  selectDilutionSentence(
    PayloadLength,
    RandomIndex,
    RandomParagraphing,
    DilutionConfigObj
  ) {
    //只有启用稀释时才允许进入本函数，非法调用报错。
    if (!DilutionConfigObj.Enable) {
      throw new Error("Unexpected Function Call to selectDilutionSentence()");
    }

    /** 目标载荷率 */
    const TargetPayloadRate = DilutionConfigObj.DilutionTargetRate;
    /** 目标理想文本长度 */
    const IdealTotalCharacterCount = PayloadLength / TargetPayloadRate;
    /** 指定的载荷模板库 */
    const Corpus = DilutionConfigObj.Corpus;
    /** 指定的采样模式 */
    const SampleMode = DilutionConfigObj.SampleMode;
    /** 指定的载荷分布方式 */
    const PayloadDistributionMode = DilutionConfigObj.PayloadDistribution;
    /** 指定的文体过滤器 */
    const FilterMode = DilutionConfigObj.FilterMode;
    /** 指定的诗词句式过滤器 */
    const PoemFilterMode = DilutionConfigObj.PoemFilterMode;
    /** 指定的文体随机性因子 */
    const StyleRandomIndex = DilutionConfigObj.StyleRandomIndex ?? 0;

    //验证载荷、目标率和模式
    //验证几个参数的合法性
    if (!Number.isSafeInteger(PayloadLength) || PayloadLength < 0) {
      throw new Error("Invalid Dilution Payload Length.");
    }
    if (
      !Number.isFinite(TargetPayloadRate) ||
      TargetPayloadRate < 0.01 ||
      TargetPayloadRate > 1
    ) {
      throw new Error("Invalid Dilution Target Rate.");
    }
    if (!Number.isFinite(RandomIndex) || RandomIndex < 0 || RandomIndex > 100) {
      throw new Error("Incorrect Random Index");
    }
    if (
      !["ALL", "ESSAY", "POEM", "LYRIC"].includes(FilterMode) ||
      !["ALL", "FOUR", "FIVE", "SEVEN"].includes(PoemFilterMode) ||
      !["SMART", "RANDOM"].includes(SampleMode) ||
      !["UNIFORM", "CONCENTRATE"].includes(PayloadDistributionMode)
    ) {
      throw new Error("Invalid Dilution Sampling Mode.");
    }
    //如果未传入任何语料，抛出错误。
    if (!Corpus) {
      throw new Error("Missing Dilution Corpus.");
    }
    //空载荷返回空结果。
    if (PayloadLength === 0) {
      return [];
    }

    //一些运行时参数，这些运行时参数可以调整，后续也可以让用户手动指定

    const MAX_ANCHOR_SEARCH_TIME = 80; //最多搜索几个锚点位置
    const ANCHOR_SEARCH_WINDOW_SIZE = 300; //每个锚点后面，按顺序扫描多少条模板
    const NEIGHBORHOOD_SIZES = [16, 64, 256, 512, 1024, 2048]; //逐级扩张的邻域范围
    const MAX_NORMAL_SCAN_COUNT = 131072; //每段正常采样的扫描上限
    const MAX_JUMP_COUNT = 256; //每段正常采样的远跳上限
    const MAX_CLOSING_SCAN_COUNT = 2048; //每段优化找零的扫描上限
    const MAX_ZERO_PAYLOAD_STREAK = 128; //连续零载荷句的上限
    const MAX_FALLBACK_CANDIDATES = 32; //临时找零缓存的上限
    const CONCENTRATION_REGION_RATIO = 0.8; //集中区域占本段目标长度的比例
    const CONCENTRATION_REGION_POSITION = null; //null 为随机，0~1 指定区域起点的相对位置
    const PARAGRAPH_LENGTH_FACTOR = 2; //显示段落长度相对原分段配置的倍乘系数
    const BUDGET_WEIGHT = 4; //剩余长度适配的权重
    const DISTRIBUTION_WEIGHT = 2; //段内载荷分布的权重
    const MIN_CANDIDATE_QUALITY = 0.005; //正常采样的最低预算质量

    //判断可用的文体类型。
    //正常采样和找零共用同一组硬过滤，未提供的文体不参与搜索。
    const AllowedTypes = ["B", "S", "C"].filter((Type) => {
      if (FilterMode === "ALL") {
        //不过滤
        return Corpus[Type] != null;
      } else if (FilterMode === "ESSAY") {
        //仅古文模式，保留 B
        if (Type !== "B") {
          return false;
        }
        return Corpus[Type] != null;
      } else if (FilterMode === "POEM") {
        //仅诗词模式，保留 S
        if (Type !== "S") {
          return false;
        }
        return Corpus[Type] != null;
      } else if (FilterMode === "LYRIC") {
        //仅诗词模式，保留 S
        if (Type !== "C") {
          return false;
        }
        return Corpus[Type] != null;
      }
    });

    for (const Type of AllowedTypes) {
      //核对句式模板的数量和Manifest里写的数量是否匹配，不匹配即为非法模板，丢出错误。
      if (
        !Array.isArray(Corpus[Type].Sentences) ||
        Corpus[Type].Metadata?.SentenceCount !== Corpus[Type].Sentences.length
      ) {
        throw new Error(`Invalid Dilution Corpus: ${Type}.`);
      }
    }

    //如果事实上某个类型模板的可用句数量为0，那么也丢出错误。
    const AvailableTypes = AllowedTypes.filter((Type) => {
      const SentenceCount = Corpus[Type].Sentences.length;
      return SentenceCount > 0;
    });

    if (!AvailableTypes.length) {
      throw new Error("Empty Allowed Dilution Corpus.");
    }

    //执行诗词长度过滤的初始化。
    //如果不过滤(ALL)则将得到 undefined ，此后会跳过诗词分句长度检查。
    const PoemLengths = {
      FOUR: 4,
      FIVE: 5,
      SEVEN: 7,
    };
    const PoemLength = PoemLengths[PoemFilterMode];

    //读取和抽样工具的定义部分

    /**
     * 工具函数
     *
     * 用于读取和对象化某个位置索引的模板
     *
     * 读取模板的整数 P/L 并核对载荷位点。不合句式的诗词跳过，损坏的数据直接报错。
     *
     * 模板位置包含文体，两个数组之间不计算连续距离。
     *
     * @param{{ Type: "B" | "S" | "C", Index: number }} Position 传入索引
     *
     */
    const ReadTemplate = (Position) => {
      //先照着索引直接读一个模板
      const Sentences = Corpus[Position.Type].Sentences;
      const RawTemplate = Sentences[Position.Index];

      //应当是一个字符串，不是字符串立刻丢出错误
      if (typeof RawTemplate !== "string") {
        throw new Error("Invalid Dilution Template.");
      }

      /*
      模板语法
      
      例如
      "3/14/0.21/B/N/生/富/贵/何/所/望/，/恨/不/A/嫁/东/N"
      
      P(载荷量)/L(模板总字符长度)/R(模板的载荷率)/文体类型(B/S)/句式
      R 只是元数据，不参与精确预算计算。

      */
      const Parts = RawTemplate.split("/");
      const P = Number(Parts[0]); //模板的载荷量，必须填入
      const L = Number(Parts[1]); //模板的总有效长度，不包含末尾标点
      const Tokens = Parts.slice(4);

      //执行校验，注意，校验后续可以移除，
      //计算实际的载荷量
      const PayloadTokens = Tokens.filter((Token) => {
        return ["V", "N", "A", "AD"].includes(Token);
      });
      const ActualPayload = PayloadTokens.length;

      //计算实际的模板总长度
      //载荷占位符均只生成一个字，普通文本按字符数累计。末尾标点不计入 L。
      let ActualLength = Tokens.reduce((Count, Token) => {
        if (["V", "N", "A", "AD"].includes(Token)) {
          return Count + 1;
        } else {
          //按 Unicode 码点计数，避免把一个生僻字的代理对算成两个字符。
          const TokenCharacters = [...Token];
          return Count + TokenCharacters.length;
        }
      }, 0);

      //考虑末尾标点
      const LastTokenIndex = Tokens.length - 1;
      const LastToken = Tokens[LastTokenIndex];
      //沿用规则库的末尾标点口径，不能把自动句末标点重复算进 L。
      const HasEndSymbol = /[，、；：。？！]|^[PQRT]$/.test(LastToken);
      if (HasEndSymbol) {
        ActualLength -= 1;
      }

      //执行判断，如果校验有问题，抛出错误。
      if (
        !Number.isSafeInteger(P) ||
        P < 0 ||
        !Number.isSafeInteger(L) ||
        L <= 0 ||
        Parts[3] !== Position.Type ||
        ActualPayload !== P ||
        ActualLength !== L
      ) {
        throw new Error(
          `Invalid Dilution Template: ${Position.Type}/${Position.Index}.`
        );
      }

      //这段是针对诗句分句字数的校验，如果分句长度和指定的不一致，则拒绝读取
      if (Position.Type === "S" && PoemLength) {
        //先把载荷位点替成单字，再按标点拆句；不改变原模板内容。
        const TextTokens = Tokens.map((Token) => {
          if (["V", "N", "A", "AD"].includes(Token)) {
            return "字";
          } else {
            return Token;
          }
        });
        const Text = TextTokens.join("");
        const SplitClauses = Text.split(/[，、；：。？！PQR]/);
        //连续标点或末尾标点会产生空分句，过滤后只检查实际文字部分。
        const Clauses = SplitClauses.filter(Boolean);
        if (!Clauses.length) {
          //没有有效分句时无法满足指定诗体，继续寻找其他模板。
          return null;
        }
        const HasInvalidClauseLength = Clauses.some((Clause) => {
          const ClauseLength = [...Clause].length;
          return ClauseLength !== PoemLength;
        });
        if (HasInvalidClauseLength) {
          //字数不合属于正常过滤，不是语料损坏，交给调用处继续找下一条。
          return null;
        }
      }
      return {
        ...Position,
        P,
        L,
        Tokens,
        Key: `${Position.Type}/${Position.Index}`,
      };
    };

    /**
     *
     * 工具函数
     *
     * 生成一个伪随机的合法索引位置。
     * 随机起点只在允许的文体数组中产生，不假定 B/S 共享原始顺序。
     *
     * @returns{{Type:"B"|"S",Index:number}}
     *
     */
    const RandomPosition = () => {
      const TypeRandomIndex = GetRandomIndex(AvailableTypes.length * 100);
      const Type = AvailableTypes[Math.floor(TypeRandomIndex / 100)];
      const SentenceCount = Corpus[Type].Sentences.length;
      const Index = GetRandomIndex(SentenceCount);
      return {
        Type,
        Index,
      };
    };

    /**
     * 工具函数
     *
     * 用于递增某个索引的下标(增加一)。
     *
     * 这里只推进同一数组的下标；是否越界、是否允许环绕，由搜索阶段决定。
     *
     * @param{{ Type: "B" | "S" | "C", Index: number }} Template 传入索引
     * @returns{{Type:"B" | "S" | "C",Index:number}}
     *
     */
    const NextPosition = (Template) => {
      return {
        Type: Template.Type,
        Index: Template.Index + 1,
      };
    };

    /**
     * 工具函数
     *
     * 用于有随机性地在一组候选模板中选择一个。
     *
     * 按最终权重随机选一句，保留多样性
     *
     * @param{[{Template: { Type: "B" | "S" | "C", Index: number }, Quality: number, Weight:number}]} Candidates 传入索引
     * @returns{{Type:"B" | "S" | "C",Index:number}}
     *
     */
    const PickCandidate = (Candidates) => {
      const TotalWeight = Candidates.reduce((Total, Candidate) => {
        return Total + Candidate.Weight;
      }, 0);
      const CandidateRandomIndex = GetRandomIndex(1000000);
      const RandomRatio = CandidateRandomIndex / 1000000;
      let Rand = RandomRatio * TotalWeight;
      for (const Candidate of Candidates) {
        Rand -= Candidate.Weight;
        //随机位置落进当前候选的权重区间，就返回这一条，不固定取最高分。
        if (Rand < 0) {
          return Candidate.Template;
        }
      }
      //浮点边界未在循环内命中时，沿用原来的末项返回保障。
      const LastCandidateIndex = Candidates.length - 1;
      return Candidates[LastCandidateIndex].Template;
    };

    //执行载荷层的噪声分段，与普通模式不同，这里采用递推而不是递归。
    //沿用现有噪声分段器，单段时也使用同一个外层循环。
    const distributedPayload = this.distributePayload(
      PayloadLength,
      RandomParagraphing[0],
      RandomParagraphing[1]
    );

    //校验配额，最终版本可以省略。
    const HasInvalidPayloadLength = distributedPayload.some((Length) => {
      return !Number.isSafeInteger(Length) || Length <= 0;
    });
    if (HasInvalidPayloadLength) {
      //任何一个配额非法就立即停止，不再计算整篇的配额总和。
      throw new Error("Invalid Dilution Payload Distribution.");
    }

    const DistributedPayloadLength = distributedPayload.reduce(
      (Total, Length) => {
        return Total + Length;
      },
      0
    );

    if (DistributedPayloadLength !== PayloadLength) {
      //所有段都合法仍须核对总量，防止分段丢失或多分配载荷。
      throw new Error("Invalid Dilution Payload Distribution.");
    }

    //进入第二重噪声分段，这个分段是为了防止Dilution时候单重分段仍然容易导致单段文本过长而设计的。
    //其核心思想是计算总字符数，如果总字符数超出分段限制则强制换行，并不提前分配任何东西。
    //显示分段单独使用噪声选目标，不再调用载荷分段器，也不改变载荷配额。
    const ConfiguredMinParagraphLength = RandomParagraphing[0] ?? 20;
    const ScaledMinParagraphLength =
      ConfiguredMinParagraphLength * PARAGRAPH_LENGTH_FACTOR;
    const MinParagraphLength = Math.ceil(ScaledMinParagraphLength);

    const ConfiguredMaxParagraphLength = RandomParagraphing[1] ?? 80;
    const ScaledMaxParagraphLength =
      ConfiguredMaxParagraphLength * PARAGRAPH_LENGTH_FACTOR;
    const MaxParagraphLength = Math.ceil(ScaledMaxParagraphLength);
    let ParagraphNoiseGen = null;
    let ParagraphIndex = 0;

    /**
     *
     * 工具函数
     *
     * 滚动计算二重分段的目标长度。
     *
     * @returns{number}
     *
     */
    const NextParagraphLength = () => {
      if (!ParagraphNoiseGen) {
        //理想长度没有超限时不会调用这里，也就不会额外创建噪声生成器。
        ParagraphNoiseGen = new ValueNoise1D();
      }
      const NoisePosition = ParagraphIndex * 0.5;
      const WaveFactor = ParagraphNoiseGen.get(NoisePosition);
      ParagraphIndex++;

      const ParagraphLengthRange = MaxParagraphLength - MinParagraphLength;
      const ParagraphLengthOffset = WaveFactor * ParagraphLengthRange;
      const ParagraphLength = MinParagraphLength + ParagraphLengthOffset;
      return Math.floor(ParagraphLength);
    };

    //进入组句循环

    //循环外变量用于控制全篇的状态。

    //全篇预算只累计已经完成的载荷段；已用模板和找零缓存则跨段保留。
    let Result = []; //组句结果
    let CompletedPayloadLength = 0; //已经完成的载荷量，只包括完整分段
    let TotalCharacterCount = 0; //已经完成分段的有效长度
    let LastSelectedTemplate = null; //上一段最后实际选中的模板引用
    const UsedTemplates = new Set(); //已使用的所有模板，重复只作为软惩罚
    const FallbackCandidates = new Map(); //临时正载荷找零候选缓存

    for (const CurrentPayloadLength of distributedPayload) {
      //计算本段的总字符数目标长度 CurrentIdealTotalCharacterCount (并非强制性)
      //前段的长度偏差由剩余载荷共同承担，本段配额仍保持噪声分段的原值。
      const RemainingIdealCharacterCount =
        IdealTotalCharacterCount - TotalCharacterCount;
      const CurrentWeightedCharacterCount =
        RemainingIdealCharacterCount * CurrentPayloadLength;
      const RemainingGlobalPayloadLength =
        PayloadLength - CompletedPayloadLength;
      const CurrentIdealCharacterCount =
        CurrentWeightedCharacterCount / RemainingGlobalPayloadLength;
      //前面的段偏长，后面各段就缩短。前面偏短，后面就获得更多长度分配。
      //但载荷分段数组本身不变
      const CurrentIdealTotalCharacterCount = Math.max(
        0,
        CurrentIdealCharacterCount
      );
      //决定本段是否额外显示分段，不超过上限就不分段
      //超过时才启用显示长度计数和噪声目标。
      const CurrentLengthParagraphing =
        CurrentIdealTotalCharacterCount > MaxParagraphLength;
      let CurrentParagraphCharacterCount = 0;
      const CurrentParagraphBreaks = []; //先记录候选切分位置，整段生成后再决定是否追加 Z
      let CurrentParagraphTarget;
      if (CurrentLengthParagraphing) {
        //只有理想长度超出显示上限，才消耗一次噪声目标。
        CurrentParagraphTarget = NextParagraphLength();
      } else {
        CurrentParagraphTarget = 0;
      }

      //接下来计算本段的所有状态。
      //下面的进度只属于当前载荷段，提交单句时不同时更新全篇累计值。
      let CurrentResult = []; //本段选中的所有模板
      let CurrentCompletedPayloadLength = 0; //本段的载荷字数总和
      let CurrentTotalCharacterCount = 0; //本段已确定的字符数量总和
      let CurrentLastSelectedTemplate = LastSelectedTemplate; //从上一段继承的位置
      //阶段只向 normal → greedy → forced 推进，不回退、不递归重新选句。
      let CurrentSamplingPhase = "normal"; //搜索阶段，分为normal greedy 和 forced
      let CurrentScanPosition = null; //
      let CurrentScannedCount = 0; //正常阶段检查总数，包含锚点探测
      let CurrentJumpCount = 0; //正常邻域未能选出模板的次数
      let CurrentClosingScanCount = 0; //优化找零检查总数，不与正常阶段混算
      let CurrentZeroPayloadStreak = 0;
      //集中模式区域外可能需要较多零载荷句，仍受长度预算和扫描总量约束。
      let CurrentZeroPayloadLimit;
      if (PayloadDistributionMode === "CONCENTRATE") {
        CurrentZeroPayloadLimit = Math.max(
          MAX_ZERO_PAYLOAD_STREAK,
          Math.ceil(CurrentIdealTotalCharacterCount)
        );
      } else {
        CurrentZeroPayloadLimit = MAX_ZERO_PAYLOAD_STREAK;
      }
      //指定起点时不取随机数；未指定时每个载荷段仍取一次，包括均匀模式。
      let RegionPosition;
      if (CONCENTRATION_REGION_POSITION != null) {
        RegionPosition = CONCENTRATION_REGION_POSITION;
      } else {
        const RegionRandomIndex = GetRandomIndex(1000000);
        RegionPosition = RegionRandomIndex / 1000000;
      }
      //区域宽度固定为配置比例，起点只能在剩余空白比例中移动，避免越过段尾。
      const RegionPositionRange = 1 - CONCENTRATION_REGION_RATIO;
      const CurrentRegionStart = RegionPosition * RegionPositionRange;

      //以下工具只服务当前载荷段，因此放在 for 内，评分时读取本段最新进度。
      //先排除超出余量的候选，再综合长度压力、分布进度、连续性和重复情况评分。
      const ScoreTemplate = (Template, IgnoreContinuity) => {
        //每次评分重新读取本段余量，上一轮候选不能带着旧预算直接复用。
        const RemainingPayload =
          CurrentPayloadLength - CurrentCompletedPayloadLength;
        const RemainingLength =
          CurrentIdealTotalCharacterCount - CurrentTotalCharacterCount;
        //载荷位点必须全部填满，超过余量的模板不能截取一部分使用。
        if (Template.P > RemainingPayload) {
          return null;
        }
        if (Template.P === 0) {
          //找零阶段必须推进正载荷，不能继续提交纯稀释句。
          if (CurrentSamplingPhase !== "normal") {
            return null;
          }
          //长度预算不足以容纳整条零载荷句时，也停止接受它。
          if (RemainingLength <= Template.L) {
            return null;
          }
          //连续零载荷已到上限时，要求下一次提交恢复正载荷进展。
          if (CurrentZeroPayloadStreak >= CurrentZeroPayloadLimit) {
            return null;
          }
        }

        //用选后余量衡量长度压力，不使用四舍五入后的 R 反推预算。
        let ExpectedLength;
        if (RemainingLength > 0) {
          //候选承担多少剩余载荷，就按同样比例分配剩余理想长度。
          const WeightedRemainingLength = RemainingLength * Template.P;
          ExpectedLength = WeightedRemainingLength / RemainingPayload;
        } else {
          //预算已经用完时，候选不再获得额外理想长度，但仍须完成载荷。
          ExpectedLength = 0;
        }
        //仍有预算时比较理想长度，超支时转为衡量每个载荷需要的字符数。
        let LengthError;
        if (RemainingLength > 0) {
          const LengthDifference = Math.abs(Template.L - ExpectedLength);
          const RemainingLengthPerPayload = RemainingLength / RemainingPayload;
          //分母至少为 4，并照顾单个载荷的平均长度，避免小余量放大误差。
          const LengthScale = Math.max(
            4,
            ExpectedLength,
            RemainingLengthPerPayload
          );
          LengthError = LengthDifference / LengthScale;
        } else {
          //已经超支时比较每个载荷要用多少字符，较短且载荷较高的模板更有利。
          const PayloadScale = Math.max(1, Template.P);
          LengthError = Template.L / PayloadScale;
        }
        //误差平方越大，分母越大；这一项只降低质量，不改变模板合法性。
        const WeightedLengthError = BUDGET_WEIGHT * LengthError;
        const LengthPenalty = 1 + WeightedLengthError * LengthError;
        let Quality = 1 / LengthPenalty;
        if (Template.P === RemainingPayload && RemainingLength > 0) {
          //这一条会用完剩余载荷，额外比较它与全部剩余长度的偏差。
          const ClosingLengthDifference = Math.abs(
            RemainingLength - Template.L
          );
          const ClosingLengthScale = Math.max(1, Template.L);
          const ClosingLengthPenalty =
            1 + ClosingLengthDifference / ClosingLengthScale;
          Quality /= ClosingLengthPenalty;
        }
        let Weight = Quality;
        //均匀模式跟随线性进度；集中模式只在指定连续区域内提高期望载荷。
        if (CurrentIdealTotalCharacterCount > 0) {
          const SelectedCharacterCount =
            CurrentTotalCharacterCount + Template.L;
          const Progress =
            SelectedCharacterCount / CurrentIdealTotalCharacterCount;
          let PayloadProgress;
          if (PayloadDistributionMode === "CONCENTRATE") {
            //把全段进度换算成集中区域内的进度，区域外稍后会被限制到 0 或 1。
            const ProgressWithinRegion = Progress - CurrentRegionStart;
            PayloadProgress = ProgressWithinRegion / CONCENTRATION_REGION_RATIO;
          } else {
            //均匀模式直接跟随文本进度，不使用上面随机产生的区域起点。
            PayloadProgress = Progress;
          }
          const UpperBoundedProgress = Math.min(1, PayloadProgress);
          const BoundedProgress = Math.max(0, UpperBoundedProgress);
          const DesiredPayload = CurrentPayloadLength * BoundedProgress;
          const SelectedPayloadLength =
            CurrentCompletedPayloadLength + Template.P;
          const DistributionError = SelectedPayloadLength - DesiredPayload;
          //比较选后实际载荷和期望载荷；偏差越大，指数惩罚越强。
          const WeightedDistributionError =
            -DISTRIBUTION_WEIGHT * DistributionError;
          const DistributionExponent =
            WeightedDistributionError * DistributionError;
          const DistributionPenalty = Math.exp(DistributionExponent);
          Weight *= DistributionPenalty;
          //最后一条正载荷不能过早结束本段，否则后面不再有机会追加稀释句。
          if (Template.P === RemainingPayload) {
            const UnfilledLength = Math.max(0, RemainingLength - Template.L);
            const ClosingScale = Math.max(4, Template.L);
            const ClosingError = UnfilledLength / ClosingScale;
            const WeightedClosingError = -BUDGET_WEIGHT * ClosingError;
            const ClosingExponent = WeightedClosingError * ClosingError;
            const ClosingPenalty = Math.exp(ClosingExponent);
            Weight *= ClosingPenalty;
          }
        }
        //质量门槛不受来源距离影响；连续性和去重只改变随机选择的相对权重。
        Quality = Weight;
        if (
          !IgnoreContinuity &&
          CurrentLastSelectedTemplate?.Type === Template.Type &&
          Template.Index > CurrentLastSelectedTemplate.Index
        ) {
          //只对同数组内的前向距离减权，不把跨数组下标当成连续距离。
          const PositionDistance =
            Template.Index - CurrentLastSelectedTemplate.Index;
          const ForwardDistance = PositionDistance - 1;
          //紧接上一模板的下一条距离为零，不因连续性而减权。
          const ContinuityPenalty = 1 + ForwardDistance / 16;
          Weight /= ContinuityPenalty;
        }
        if (UsedTemplates.has(Template.Key)) {
          //重复是软惩罚，候选稀少或闭合时仍允许复用。
          Weight *= 0.2;
        }
        //指数计算可能下溢为零，给抽样权重保留最小正数；Quality 的门槛不变。
        const CandidateWeight = Math.max(Number.MIN_VALUE, Weight);
        return {
          Template,
          Quality,
          Weight: CandidateWeight,
        };
      };

      //只保留少量正载荷候选，优先确保缓存里有可反复使用的 P=1 闭合模板。
      const RememberTemplate = (Template) => {
        //零载荷无法闭合余量；已缓存的 Key 也不重复插入或改变原有顺序。
        if (Template.P > 0 && !FallbackCandidates.has(Template.Key)) {
          if (FallbackCandidates.size < MAX_FALLBACK_CANDIDATES) {
            FallbackCandidates.set(Template.Key, Template);
          } else if (Template.P === 1) {
            //缓存满后只考虑补入缺失的 P=1，不为普通候选反复替换缓存。
            const CachedTemplates = [...FallbackCandidates.values()];
            const HasUnitPayloadTemplate = CachedTemplates.some((Candidate) => {
              return Candidate.P === 1;
            });
            if (!HasUnitPayloadTemplate) {
              //缓存尚无 P=1，替换最早加入的一项，保留单位载荷闭合能力。
              const CachedKeys = FallbackCandidates.keys();
              const OldestKey = CachedKeys.next().value;
              FallbackCandidates.delete(OldestKey);
              FallbackCandidates.set(Template.Key, Template);
            }
          }
        }
      };

      //比较随机锚点与上一段继承位置，选择附近合法候选质量较好的起点。
      const SelectAnchor = (IgnoreContinuity) => {
        let CurrentAnchor = null;
        let BestQuality = -1;
        const CurrentAnchors = [];
        const ViableAnchors = []; //可行的锚点
        if (!IgnoreContinuity && CurrentLastSelectedTemplate) {
          //继承上一条的后续位置；已到数组末尾时不把环绕当成连续延伸。
          const NextTemplateIndex = CurrentLastSelectedTemplate.Index + 1;
          const SentenceCount =
            Corpus[CurrentLastSelectedTemplate.Type].Sentences.length;
          if (NextTemplateIndex < SentenceCount) {
            const InheritedPosition = NextPosition(CurrentLastSelectedTemplate);
            CurrentAnchors.push(InheritedPosition);
          }
        }
        for (let i = 0; i < MAX_ANCHOR_SEARCH_TIME; i++) {
          const Position = RandomPosition();
          const HasDuplicateAnchor = CurrentAnchors.some((Anchor) => {
            if (Anchor.Type !== Position.Type) {
              return false;
            }
            return Anchor.Index === Position.Index;
          });
          if (!HasDuplicateAnchor) {
            //文体和下标都相同才视为重复；重复抽中时不额外补抽。
            CurrentAnchors.push(Position);
          }
        }
        for (const Anchor of CurrentAnchors) {
          let Quality = 0; //窗口内全部合法候选的质量总和，包含零载荷句
          let Count = 0; //只统计正载荷候选，防止选择只能稀释却不能推进的区域
          const End = Math.min(
            Corpus[Anchor.Type].Sentences.length,
            Anchor.Index + ANCHOR_SEARCH_WINDOW_SIZE
          );
          for (
            let i = Anchor.Index;
            i < End && CurrentScannedCount < MAX_NORMAL_SCAN_COUNT;
            i++
          ) {
            CurrentScannedCount++;
            const Position = {
              Type: Anchor.Type,
              Index: i,
            };
            const Template = ReadTemplate(Position);
            if (!Template) {
              //诗词子过滤没有通过，仍消耗一次检查，但不进入评分与缓存。
              continue;
            }
            RememberTemplate(Template);
            const Candidate = ScoreTemplate(Template, IgnoreContinuity);
            if (Candidate) {
              Quality += Candidate.Quality;
            }
            if (Candidate && Template.P > 0) {
              Count++;
            }
          }
          if (Count) {
            const AnchorQuality = Quality / Math.max(1, End - Anchor.Index);

            ViableAnchors.push(Anchor);

            //按整个计划窗口长度求平均；质量严格更好才替换，同分保留先前锚点。
            if (AnchorQuality > BestQuality) {
              BestQuality = AnchorQuality;
              CurrentAnchor = Anchor;
            }
          }
        }

        if (
          StyleRandomIndex > 0 &&
          ViableAnchors.length > 1 &&
          GetRandomIndex(10000) < StyleRandomIndex * 100
        ) {
          //如果用户设置了随机因子，那么考虑随机因子。
          //随机因子会让锚点选择和特定载荷率目标下的最优选择解耦。
          return ViableAnchors[GetRandomIndex(ViableAnchors.length)];
        }
        return CurrentAnchor;
      };

      let ReuseFallback;
      while (CurrentCompletedPayloadLength < CurrentPayloadLength) {
        //本轮先寻找一条候选；只有下方统一提交处才能更改载荷和字符进度。
        let SelectedTemplate = null;
        //RANDOM 始终重新随机定位；SMART 按 RandomIndex 的概率暂时忽略连续性。
        let IgnoreContinuity;
        if (SampleMode === "RANDOM") {
          //纯随机采样不执行 SMART 的概率抽取，保留原来的短路行为。
          IgnoreContinuity = true;
        } else {
          const ContinuityRandomIndex = GetRandomIndex(10000);
          const ContinuityRandomThreshold = RandomIndex * 100;
          IgnoreContinuity = ContinuityRandomIndex < ContinuityRandomThreshold;
        }
        if (CurrentSamplingPhase === "normal") {
          if (
            CurrentScannedCount >= MAX_NORMAL_SCAN_COUNT ||
            CurrentJumpCount >= MAX_JUMP_COUNT
          ) {
            //正常搜索成本已到上限，只切换阶段，不修改已提交的载荷。
            CurrentSamplingPhase = "greedy";
            continue;
          }
          if (!CurrentScanPosition || IgnoreContinuity) {
            if (IgnoreContinuity) {
              //本轮放弃连续性时直接随机定位，仍保留后面的预算评分。
              CurrentScanPosition = RandomPosition();
            } else {
              //需要连续性但尚无起点时，比较继承位置和随机锚点的局部质量。
              CurrentScanPosition = SelectAnchor(false);
            }
          }
          if (!CurrentScanPosition) {
            //锚点评估没有可用区域时，转入同一允许集合内的找零流程。
            CurrentSamplingPhase = "greedy";
            continue;
          }
          let CurrentCandidates = [];
          let CurrentNeighborhoodLevel = 0;
          let ScannedWidth = 0;
          //扩大窗口时只扫描新增范围；选中后从实际选中位置继续，而非扫描终点。
          //等级已在上面初始化为零，所以 for 的初始化位置留空。
          for (
            ;
            CurrentNeighborhoodLevel < NEIGHBORHOOD_SIZES.length;
            CurrentNeighborhoodLevel++
          ) {
            const Width = NEIGHBORHOOD_SIZES[CurrentNeighborhoodLevel];
            const End = Math.min(
              Corpus[CurrentScanPosition.Type].Sentences.length,
              CurrentScanPosition.Index + Width
            );
            for (
              let i = CurrentScanPosition.Index + ScannedWidth;
              i < End && CurrentScannedCount < MAX_NORMAL_SCAN_COUNT;
              i++
            ) {
              CurrentScannedCount++;
              const Template = ReadTemplate({
                Type: CurrentScanPosition.Type,
                Index: i,
              });
              if (!Template) {
                //不符合当前诗词子集时跳过，不能因为候选少而静默放宽过滤。
                continue;
              }
              RememberTemplate(Template);
              const Candidate = ScoreTemplate(Template, IgnoreContinuity);
              if (Candidate) {
                CurrentCandidates.push(Candidate);
              }
            }
            ScannedWidth = Width;
            //Quality 只反映预算与分布适配，距离和重复只影响最终抽样的 Weight。
            const GoodCandidates = CurrentCandidates.filter((Candidate) => {
              return Candidate.Quality >= MIN_CANDIDATE_QUALITY;
            });
            if (GoodCandidates.length >= 3) {
              //完整候选池必须包含正载荷；合格池本身仍允许只包含零载荷句。
              const HasPositivePayloadCandidate = CurrentCandidates.some(
                (Candidate) => {
                  return Candidate.Template.P > 0;
                }
              );
              if (HasPositivePayloadCandidate) {
                //质量和数量足够，接受本轮抽样，不再继续扩大窗口。
                SelectedTemplate = PickCandidate(GoodCandidates);
                break;
              }
            }
          }
          if (!SelectedTemplate) {
            //整个扩张邻域都未选出模板，记一次失败并让下一轮重新选起点。
            CurrentJumpCount++;
            CurrentScanPosition = null;
            continue;
          }
        } else if (CurrentSamplingPhase === "greedy") {
          //优化找零只接受正载荷，允许有限向前搜索及环绕，预算耗尽后进入强制闭合。
          let CurrentCandidates = [];
          let Position = CurrentScanPosition;
          if (!Position) {
            //只有没有可继承的扫描位置时才额外抽取随机起点。
            Position = RandomPosition();
          }
          const RemainingClosingScanCount =
            MAX_CLOSING_SCAN_COUNT - CurrentClosingScanCount;
          const ScanCount = Math.min(256, RemainingClosingScanCount);
          for (let i = 0; i < ScanCount; i++) {
            if (Position.Index >= Corpus[Position.Type].Sentences.length) {
              //到达数组末尾，切到下一允许文体；只有一个数组时从自身开头环绕。
              const CurrentTypeIndex = AvailableTypes.indexOf(Position.Type);
              const NextTypeIndex =
                (CurrentTypeIndex + 1) % AvailableTypes.length;
              const Type = AvailableTypes[NextTypeIndex];
              Position = {
                Type,
                Index: 0,
              };
            }
            CurrentClosingScanCount++;
            const Template = ReadTemplate(Position);
            //即使这一条被过滤，扫描游标也前进，避免下一批重复停在同一位置。
            Position = {
              Type: Position.Type,
              Index: Position.Index + 1,
            };
            if (!Template) {
              continue;
            }
            RememberTemplate(Template);
            const Candidate = ScoreTemplate(Template, true);
            if (Candidate) {
              CurrentCandidates.push(Candidate);
            }
          }
          CurrentScanPosition = Position;
          if (CurrentCandidates.length) {
            //本批只要有合法正载荷就选择，不要求正常阶段的最低候选数量。
            const CandidateWeights = CurrentCandidates.map((Candidate) => {
              return Candidate.Weight;
            });
            const BestQuality = Math.max(...CandidateWeights);
            //这里沿用 Weight 做相对优选，保留最佳权重八成以上的候选再随机选择。
            const BestCandidates = CurrentCandidates.filter((Candidate) => {
              return Candidate.Weight >= BestQuality * 0.8;
            });
            SelectedTemplate = PickCandidate(BestCandidates);
          } else if (CurrentClosingScanCount >= MAX_CLOSING_SCAN_COUNT) {
            //优化扫描耗尽且没有候选，不再继续追求 K，改为保证载荷闭合。
            CurrentSamplingPhase = "forced";
          }
          if (!SelectedTemplate) {
            //尚未找到可提交句子，阶段可能已经更新；交给下一轮继续，不扣载荷。
            continue;
          }
        } else {
          //强制闭合先按缓存顺序取能承载余量的模板，不再追求 K、连续性或去重。
          const RemainingPayload =
            CurrentPayloadLength - CurrentCompletedPayloadLength;
          const CachedTemplates = [...FallbackCandidates.values()];
          //ForceFallBackSearch 是测试用属性。正常情况下应当是undefined.
          if (!DilutionConfigObj?.ForceFallBackSearch) {
            const IsEligible = (Template) => {
              return Template.P > 0 && Template.P <= RemainingPayload;
            };

            //保留一个必要时允许复用的候选。
            ReuseFallback = CachedTemplates.find(IsEligible) ?? null;

            //优先寻找尚未使用过的缓存模板。
            SelectedTemplate = CachedTemplates.find((Template) => {
              return IsEligible(Template) && !UsedTemplates.has(Template.Key);
            });
          }
          if (!SelectedTemplate || DilutionConfigObj?.ForceFallBackSearch) {
            //缓存没有能装下当前余量的模板，才进入确定性的全库搜索。(或者使用测试用属性强行跳转)
            //强制闭合最多扫描允许集合一整轮，找到正载荷即推进，P=1 可缓存复用。
            let FirstType = CurrentScanPosition?.Type;
            if (!FirstType) {
              FirstType = AvailableTypes[0];
            }

            let ScanStartIndex = CurrentScanPosition?.Index;
            if (!ScanStartIndex) {
              ScanStartIndex = 0;
            }
            //游标可能正好指向数组末尾，通过取模回到合法下标后开始这一轮搜索。
            const FirstSentenceCount = Corpus[FirstType].Sentences.length;
            const FirstIndex = ScanStartIndex % FirstSentenceCount;
            for (
              let t = 0;
              t < AvailableTypes.length && !SelectedTemplate;
              t++
            ) {
              const FirstTypeIndex = AvailableTypes.indexOf(FirstType);
              const CurrentTypeIndex =
                (FirstTypeIndex + t) % AvailableTypes.length;
              const Type = AvailableTypes[CurrentTypeIndex];
              const Count = Corpus[Type].Sentences.length;
              for (let i = 0; i < Count; i++) {
                //先从当前数组的扫描位置环绕，其余文体数组从头开始检查。
                let StartIndex;
                if (t === 0) {
                  StartIndex = FirstIndex;
                } else {
                  StartIndex = 0;
                }
                const Index = (StartIndex + i) % Count;
                const Template = ReadTemplate({ Type, Index });
                if (!Template || Template.P === 0) {
                  //过滤不合格或不能推进载荷的模板，仍遵守同一允许文体集合。
                  continue;
                }
                RememberTemplate(Template);
                if (Template.P <= RemainingPayload) {
                  //强制阶段取第一条能承载余量的合法模板，不再比较软性评分。
                  if (!UsedTemplates.has(Template.Key)) {
                    SelectedTemplate = Template;
                    break;
                  }
                  //旧模板只能作为最后的保险。
                  if (!ReuseFallback) {
                    ReuseFallback = Template;
                  }
                }
              }
            }
          }
          if (!SelectedTemplate) {
            SelectedTemplate = ReuseFallback;
          }
          if (!SelectedTemplate) {
            //允许集合已完整检查仍无法承载余量，明确失败，不静默跨文体兜底。
            throw new Error(
              "Cannot Complete Dilution Payload with Allowed Templates."
            );
          }
        }

        //只有提交时才改变载荷和长度，输出仍由现有 enMap 填充及组装。
        const CurrentSentence = SelectedTemplate.Tokens.slice();
        //把换行意图附在模板数组上，由 enMap 在自动标点之后换行，不占用载荷位点。
        if (
          SelectedTemplate.Type === "S" &&
          DilutionConfigObj.PoemAutoLineBreak !== false
        ) {
          //诗词只附加单换行意图，实际换行留给 enMap 完成标点后处理。
          CurrentSentence.PoemAutoLineBreak = true;
        }
        CurrentResult.push(CurrentSentence);
        CurrentCompletedPayloadLength += SelectedTemplate.P;
        CurrentTotalCharacterCount += SelectedTemplate.L;
        if (SelectedTemplate.P === 0) {
          CurrentZeroPayloadStreak = CurrentZeroPayloadStreak + 1;
        } else {
          //提交了正载荷后，重新开始计算后续连续零载荷句。
          CurrentZeroPayloadStreak = 0;
        }
        CurrentLastSelectedTemplate = SelectedTemplate;
        //从实际输出的位置继续，而不是从候选窗口已经探测到的最远位置继续。
        CurrentScanPosition = NextPosition(SelectedTemplate);
        UsedTemplates.add(SelectedTemplate.Key);
        //L 已计内部标点但不计末尾标点，这里补计一字；显示换行不改变 K 的预算口径。
        CurrentParagraphCharacterCount += SelectedTemplate.L + 1;
        if (
          CurrentLengthParagraphing &&
          CurrentParagraphCharacterCount > CurrentParagraphTarget &&
          CurrentCompletedPayloadLength < CurrentPayloadLength
        ) {
          //此时还不知道最终尾段长度，只记录句末位置，不立即插入 Z。
          CurrentParagraphBreaks.push({
            Index: CurrentResult.length - 1,
            CharacterCount: CurrentTotalCharacterCount + CurrentResult.length,
          });
          //只重置显示段落长度；本载荷段的预算、已完成载荷和搜索阶段全部保留。
          CurrentParagraphCharacterCount = 0;
          CurrentParagraphTarget = NextParagraphLength();
        }
      }
      if (CurrentCompletedPayloadLength !== CurrentPayloadLength) {
        //这是载荷配额的硬性核对，文本长度可以有误差，载荷数量不可以。
        throw new Error("Incorrect Dilution Segment Payload.");
      }

      //全部句子生成后再落实显示分段；不足下限的尾段并入前段，不拆句或重新选句。
      const CurrentSegmentCharacterCount =
        CurrentTotalCharacterCount + CurrentResult.length;
      for (const ParagraphBreak of CurrentParagraphBreaks) {
        const RemainingCharacterCount =
          CurrentSegmentCharacterCount - ParagraphBreak.CharacterCount;
        if (RemainingCharacterCount < MinParagraphLength) {
          //后面的切分位置只会留下更短的尾段，保留原载荷段末尾的 Z 即可。
          break;
        }
        const Sentence = CurrentResult[ParagraphBreak.Index];
        Sentence.push("Z");
      }

      //载荷段原有的边界照常保留，累计状态只在本段完整结束后更新一次。
      const LastSentenceIndex = CurrentResult.length - 1;
      const LastSentence = CurrentResult[LastSentenceIndex];
      LastSentence.push("Z");
      for (const Sentence of CurrentResult) {
        Result.push(Sentence);
      }
      //本载荷段已经完整完成，现在才把局部进度并入全篇状态，供下一段滚动预算使用。
      CompletedPayloadLength += CurrentCompletedPayloadLength;
      TotalCharacterCount += CurrentTotalCharacterCount;
      LastSelectedTemplate = CurrentLastSelectedTemplate;
      try {
        if (this.callback != null) {
          //调试回调只观察已完成的载荷段，回调出错不影响选句结果。
          this.callback(new CallbackObj("ENC_SENTENCES", Result.toString()));
        }
      } catch (err) {
        // continue regardless of error
      }
    }
    if (CompletedPayloadLength !== PayloadLength) {
      throw new Error("Incorrect Dilution Total Payload.");
    }
    return Result;
  }
  /**
   * 关键流程函数
   * 使用算法选择句式，用户可指定一律使用何种句式(骈文/逻辑)
   *
   * @param {number}PayloadLength 一段密文的载荷数
   * @param {number}RandomIndex 随机因子(0~100)，越大，给出的句式越随机
   * @param {number[]|boolean}RandomParagraphing 随机分段范围参数
   * @param {boolean}p 是否强制用对仗骈文
   * @param {boolean}l 是否强制用逻辑句式
   * @returns {Array} 返回处理后的数组
   */
  selectSentence(
    PayloadLength,
    RandomIndex = 0,
    RandomParagraphing = [20, 80],
    p,
    l
  ) {
    //句式选择函数。
    //P 强制对仗骈文
    //L 强制多用逻辑句式
    //句式选择算法
    //RandomIndex 随机指数，越大，给出的句式越随机，最大100。
    /* v8 ignore next 7 */
    if (RandomIndex > 100 || RandomIndex < 0) {
      //错误的输入。
      throw new Error("Incorrect Random Index");
    }
    if (p && l) {
      throw new Error("Contradictory Mode Setting");
    }
    if (
      RandomParagraphing[0] < 20 ||
      RandomParagraphing[1] > 200 ||
      RandomParagraphing[1] < RandomParagraphing[0]
    ) {
      throw new Error("Invalid Payload Distribution Argument.");
    }
    if (PayloadLength > RandomParagraphing[1] && RandomParagraphing !== false) {
      //如果密文太长了，那么自动分段
      let distributedPayload = this.distributePayload(
        PayloadLength,
        RandomParagraphing[0],
        RandomParagraphing[1]
      );
      let Result = [];
      distributedPayload.forEach((Payload) => {
        Result = Result.concat(
          this.selectSentence(Payload, RandomIndex, false, p, l)
        );
        Result[Result.length - 1].push("Z");
        try {
          if (this.callback != null)
            this.callback(new CallbackObj("ENC_SENTENCES", Result.toString()));
        } catch (err) {
          // continue regardless of error
        }
      });
      return Result;
    }

    let selectRand;

    let DividedPayload = this.distributeInteger(PayloadLength); //把Payload平均分配给三个部分。

    let SegmentedPayload = [new Array(), new Array(), new Array()]; //二维数组，保存分配之后的负载。

    let ElementResult = []; //最终要返回的语素序列

    //分配负载到一个二维数组中
    for (let i = 0; i < 3; i++) {
      //第一重循环，选择Payload

      let Payload = DividedPayload[i];

      for (let a = 0; a < Payload; ) {
        //第二重循环，用算法选择句式，满足载荷
        selectRand = GetRandomIndex(101) + RandomIndex;
        let PossiblePayload = [];
        for (let b = 1; b <= Payload - a; b++) {
          //三重，求取所有可能载荷。
          if (b == 9) {
            //最大为9
            PossiblePayload.push(b);
            break;
          }
          PossiblePayload.push(b);
        }
        //这里给出的可能载荷数组应当是从小到大的。
        let TargetPayload = 0;
        if (selectRand <= 100) {
          //选择贪心最优解之一
          if (PossiblePayload[PossiblePayload.length - 1] > 6) {
            //如果可以选到6以上
            let GreedyRand = GetRandomIndex(91); //在三个多逻辑句式的载荷量之间随机选一个
            if (GreedyRand < 30) {
              TargetPayload = PossiblePayload[PossiblePayload.length - 3];
            } else if (GreedyRand >= 30 && GreedyRand < 60) {
              TargetPayload = PossiblePayload[PossiblePayload.length - 2];
            } else {
              TargetPayload = PossiblePayload[PossiblePayload.length - 1];
            }
          } else {
            TargetPayload = PossiblePayload.pop() ?? 0; //目标Payload，参照这个去库里寻句式。
          }
        } else if (selectRand > 100 && selectRand <= 200) {
          //随机选择一个，不一定是最优解
          TargetPayload =
            PossiblePayload[GetRandomIndex(PossiblePayload.length)];
        }

        if (TargetPayload == 0) {
          throw new Error("No Available Target Payload.");
        }

        SegmentedPayload[i].push(TargetPayload);
        a = a + TargetPayload;
      }
    }

    SegmentedPayload = this.processArray(
      SegmentedPayload,
      1 - RandomIndex / 100
    );

    //开始根据分配好的载荷执行组句
    for (let i = 0; i < 3; i++) {
      let Lib = "";

      switch (i) {
        case 0:
          Lib = "Begin";
          break;
        case 1:
          Lib = "Main";
          break;
        case 2:
          Lib = "End";
          break;
      }

      for (let a = 0; a < SegmentedPayload[i].length; a++) {
        let PossibleSentences = []; // 所有挑选出来的可能句式，选择时任选其一。
        let PossiblePianSentences = []; // 所有可能的骈文句式。
        let PossibleLogicSentences = []; // 所有可能的逻辑句式
        let PossibleNonPayloadSentences = []; // 所有可能的非载荷句式

        let TargetPayload = SegmentedPayload[i][a]; //目标负载
        for (let c = 0; c < this.Map_Obj["Sentences"][Lib].length; c++) {
          //开始选择句式
          let Sentence = this.Map_Obj["Sentences"][Lib][c].split("/"); //Sentence是列表，按照/分割的句式
          if (parseInt(Sentence[0]) == TargetPayload) {
            if (Sentence[0][1] != "Z") {
              PossibleSentences.push(Sentence.slice(1));
            }
            if (Sentence[0][1] == "C" || Sentence[0][1] == "E") {
              PossiblePianSentences.push(Sentence.slice(1));
            }
            if (Sentence[0][1] == "D" || Sentence[0][1] == "E") {
              PossibleLogicSentences.push(Sentence.slice(1));
            }
            if (Sentence[0][1] == "Z") {
              PossibleNonPayloadSentences.push(Sentence.slice(1));
            }
          }
        }

        let TargetSentence;
        if (p) {
          if (PossiblePianSentences.length != 0) {
            TargetSentence =
              PossiblePianSentences[
                GetRandomIndex(PossiblePianSentences.length)
              ];
          } else {
            TargetSentence =
              PossibleSentences[GetRandomIndex(PossibleSentences.length)];
          }
        } else if (l) {
          if (PossibleLogicSentences.length != 0) {
            TargetSentence =
              PossibleLogicSentences[
                GetRandomIndex(PossibleLogicSentences.length)
              ];
          } else {
            TargetSentence =
              PossibleSentences[GetRandomIndex(PossibleSentences.length)];
          }
        } else {
          let LogiRand = GetRandomIndex(101); //给骈文和逻辑句式一个直接的插入概率
          //LogiRand max 200
          if (LogiRand > 25) {
            // 如果大于25，也就是说进入此的概率是75%
            TargetSentence =
              PossibleSentences[GetRandomIndex(PossibleSentences.length)]; //随机选句子
          } else {
            let PianOrLogi = GetRandomIndex(2); //0 or 1

            if (PianOrLogi == 0) {
              //选骈文。
              if (PossiblePianSentences.length != 0) {
                //没有可用句式就随机选
                TargetSentence =
                  PossiblePianSentences[
                    GetRandomIndex(PossiblePianSentences.length)
                  ];
              } else {
                TargetSentence =
                  PossibleSentences[GetRandomIndex(PossibleSentences.length)];
              }
            } else {
              //选逻辑句式
              if (PossibleLogicSentences.length != 0) {
                TargetSentence =
                  PossibleLogicSentences[
                    GetRandomIndex(PossibleLogicSentences.length)
                  ];
              } else {
                TargetSentence =
                  PossibleSentences[GetRandomIndex(PossibleSentences.length)];
              }
            }
          }
        }
        ElementResult.push(TargetSentence);
        try {
          if (this.callback != null)
            this.callback(
              new CallbackObj("ENC_SENTENCES", ElementResult.toString())
            );
        } catch (err) {
          // continue regardless of error
        }
      }
    }

    return ElementResult;
  }
  /**
   * 汉字映射总流程函数(加密)
   *
   * @param {string}OriginStr 需要映射的字符串(Base64字符串)
   * @param {boolean}q 是否保留标点，传入真值即保留
   * @param {number}r 随机因子(0~100)，越大，给出的句式越随机
   * @param {Array}rp 超长密文所使用的分段函数每段载荷上下限。传入 min 和 max，默认 35/80。min 小于 35 或者 max < min 将会出错
   * @param {boolean}p 是否强制用对仗骈文
   * @param {boolean}l 是否强制用逻辑句式
   * @param {boolean}t 是否使用繁体输出
   * @param {DilutionConfig}d 文言文稀释配置
   * @returns {string} 返回汉字字符串(加密结果)
   */
  enMap(OriginStr, q, r, rp, p, l, t, d) {
    let TempStr1 = "",
      temp = "";

    let size = OriginStr.length;

    //从这里开始做文章，开始文言文仿真，以及三重轮转对表。
    let Sentence;
    if (d.Enable) {
      Sentence = this.selectDilutionSentence(OriginStr.length, r, rp, d); //选择稀释句式
    } else {
      Sentence = this.selectSentence(OriginStr.length, r, rp, p, l, d); //选择句式
    }
    let i = 0;
    let Finished = false;
    let hasSpecialEndSymbol = false; //标记，此短句是否有特殊符号
    let CommaCounter = 0; //逗号/顿号计数
    let CommaNumInSentence = 0; //统计短句内部的逗号

    let LastQuoteMark = false; //为避免连续冒号和引号，设立状态变量。
    let LastQuote = 0; //下引号的状态(上引号的距离)

    let NoAutoSymbol = false; //指定某一轮不自动添加标点符号

    this.RoundKey(); //首次对表前，先转动一次转轮
    for (let j = 0; j < Sentence.length; j++) {
      hasSpecialEndSymbol = false;
      CommaNumInSentence = 0;
      for (let k = 0; k < Sentence[j].length; k++) {
        //统计短句内部的逗号
        if (Sentence[j][k] == "，" || Sentence[j][k] == "、") {
          CommaNumInSentence++;
        }
      }
      if (LastQuoteMark) {
        LastQuote++;
      }
      for (let k = 0; k < Sentence[j].length; k++) {
        if (
          Sentence[j][k] == "V" ||
          Sentence[j][k] == "N" ||
          Sentence[j][k] == "A" ||
          Sentence[j][k] == "AD"
        ) {
          //拆解句式，对表。
          //这里会把载荷字给映射到对应的汉字，但是根据载荷字的类型而有所不同。
          temp = OriginStr[i];
          TempStr1 = TempStr1 + this.getCryptText(temp, Sentence[j][k]);
          this.RoundKey(); //每加密一个载荷字，就旋转一次转轮。
          i++;
        } else if (Sentence[j][k] == "MV") {
          //情态动词(非载荷字)，随机选择。
          TempStr1 =
            TempStr1 +
            this.Map_Obj["Actual"]["MV"][
              GetRandomIndex(this.Map_Obj["Actual"]["MV"].length)
            ];
        } else if (this.Map_Obj["Virtual"].hasOwnProperty(Sentence[j][k])) {
          //虚词(非载荷字)，随机选择。
          TempStr1 =
            TempStr1 +
            this.Map_Obj["Virtual"][Sentence[j][k]][
              GetRandomIndex(this.Map_Obj["Virtual"][Sentence[j][k]].length)
            ];
        } else if (Sentence[j][k] == "P") {
          //插入句号
          //倒数第二个句式禁止出现句号和问号
          if (j == Sentence.length - 2) {
            continue;
          }

          hasSpecialEndSymbol = true;
          TempStr1 = TempStr1 + "。";
        } else if (Sentence[j][k] == "R") {
          //插入冒号和引号
          if (LastQuoteMark == false) {
            //如果上个句式不是冒号句
            LastQuoteMark = true;
            TempStr1 = TempStr1 + "：“";
            LastQuote = 0;
            CommaCounter = 0;
          } else if (LastQuote == 1) {
            //进入此分支，意味着不会再次添加冒号
            //上个块是冒号句，这句话就不增加冒号(禁止连续两个冒号)
            LastQuote = 0; //如果两个连续冒号句子，那么会在下一个句子关闭引号，而非本句
            TempStr1 = TempStr1 + "，"; //加上逗号
            NoAutoSymbol = true;
            CommaCounter++;
          }
        } else if (Sentence[j][k] == "Z") {
          //插入段落分隔。
          if (!hasSpecialEndSymbol) {
            //如果最后没有特殊符号，那么使用句号。
            hasSpecialEndSymbol = true;
            TempStr1 = TempStr1 + "。";
          }
          if (q && LastQuoteMark && LastQuote > 0) {
            //如果有未完成的冒号句，关闭冒号句
            TempStr1 = TempStr1 + "” ";
            LastQuote = 0;
            LastQuoteMark = false;
          }
          if (i != size) {
            //整块密文的最后一句话后面不插入分隔
            TempStr1 = TempStr1 + "\n\n";
          }
        } else if (Sentence[j][k] == "Q") {
          //插入问号
          //倒数第二个句式禁止出现句号，问号和感叹号
          if (j == Sentence.length - 2) {
            continue;
          }
          hasSpecialEndSymbol = true;
          TempStr1 = TempStr1 + "？";
        } else if (Sentence[j][k] == "T") {
          //插入问号
          //倒数第二个句式禁止出现句号，问号和感叹号
          if (j == Sentence.length - 2) {
            continue;
          }
          hasSpecialEndSymbol = true;
          TempStr1 = TempStr1 + "！";
        } else {
          TempStr1 = TempStr1 + Sentence[j][k]; //如果是句式中的其他字符，那么直接追加到句子中
        }
        if (i == size) {
          //如果已填充的有效载荷满足了预计添加的载荷，那么标记已完成。
          Finished = true;
        }
        try {
          if (this.callback != null)
            this.callback(new CallbackObj("ENC_MAPTEMP", TempStr1));
        } catch (err) {
          // continue regardless of error
        }
      }
      //这里是句式和句式的外层控制循环
      if (Finished) {
        //如果已完成，检查最后一个句式后是否有特殊符号，没有的话，自动添加句号
        if (q && !hasSpecialEndSymbol) {
          TempStr1 = TempStr1 + "。";
        }
        if (q && LastQuoteMark && LastQuote > 0) {
          //如果有未完成的冒号句，关闭冒号句
          TempStr1 = TempStr1 + "” ";
          LastQuote = 0;
          LastQuoteMark = false;
        }
        //古诗词在末句标点及引号处理完成后换行，已有段落换行时不重复追加。
        if (Sentence[j].PoemAutoLineBreak && !TempStr1.endsWith("\n")) {
          TempStr1 = TempStr1 + "\n";
        }
        NoAutoSymbol = false;
        try {
          if (this.callback != null)
            this.callback(new CallbackObj("ENC_MAPTEMP", TempStr1));
        } catch (err) {
          // continue regardless of error
        }

        break;
      } else {
        if (q && !hasSpecialEndSymbol && !NoAutoSymbol) {
          //如果连续出现三个以上的逗号，那么自动加上一个句号
          let TestCommaCount = CommaCounter + (CommaNumInSentence + 1); //计算本句添加后可能的最大逗号数量
          if (CommaCounter < 3 || j == Sentence.length - 2) {
            //如果逗号数量没到门槛，而且这不是倒数第二个句式，那么就添加逗号
            if (TestCommaCount >= 3 && j != Sentence.length - 2) {
              //最大逗号数量也不能超过门槛
              TempStr1 = TempStr1 + "。";
              CommaCounter = 0;
            } else {
              if (LastQuoteMark && LastQuote > 0) {
                //如果有未完成的冒号句，关闭冒号句
                TempStr1 = TempStr1 + "” ";
                LastQuote = 0;
                LastQuoteMark = false;
              }
              if (!LastQuoteMark && LastQuote == 0) {
                TempStr1 = TempStr1 + "，";
                CommaCounter += CommaNumInSentence + 1;
              }
            }
          } else {
            //超过门槛就加上句号，然后重置逗号计数器
            TempStr1 = TempStr1 + "。";
            CommaCounter = 0;
          }
        }
        if (LastQuoteMark && LastQuote > 0) {
          //如果有未完成的冒号句，关闭冒号句
          TempStr1 = TempStr1 + "” ";
          LastQuote = 0;
          LastQuoteMark = false;
        }
        if (hasSpecialEndSymbol) {
          CommaCounter = 0;
        }
        if (NoAutoSymbol) {
          NoAutoSymbol = false;
        }
        //普通诗句只换一行；Z 已处理的段落边界仍保留原来的双换行。
        if (Sentence[j].PoemAutoLineBreak && !TempStr1.endsWith("\n")) {
          TempStr1 = TempStr1 + "\n";
        }
      }
    }

    if (!q) {
      //如果指定去除标点。除去自动添加的标点外，还要去除句式中的既有标点。
      let TempStrQ = "";
      for (let i = 0; i < TempStr1.length; i++) {
        if (
          TempStr1[i] != "，" &&
          TempStr1[i] != "。" &&
          TempStr1[i] != "、" &&
          TempStr1[i] != "？" &&
          TempStr1[i] != "：" &&
          TempStr1[i] != "“" &&
          TempStr1[i] != "”" &&
          TempStr1[i] != " " &&
          TempStr1[i] != "！"
        ) {
          TempStrQ = TempStrQ + TempStr1[i];
        }
      }
      TempStr1 = TempStrQ;
    }

    if (t) {
      //如果指定执行繁体字输出
      const converter = OpenCC.Converter({ from: "cn", to: "hk" });
      let TempStrQ = "";
      for (let i = 0; i < TempStr1.length; i++) {
        if (
          TempStr1[i] != "，" &&
          TempStr1[i] != "。" &&
          TempStr1[i] != "、" &&
          TempStr1[i] != "？" &&
          TempStr1[i] != "：" &&
          TempStr1[i] != "“" &&
          TempStr1[i] != "”" &&
          TempStr1[i] != " "
        ) {
          TempStrQ = TempStrQ + converter(TempStr1[i]);
        } else {
          TempStrQ = TempStrQ + TempStr1[i];
        }
      }
      TempStr1 = TempStrQ;
    }

    return TempStr1;
  }
  /**
   * 汉字逆映射总流程函数(解密)
   *
   * @param {string}OriginStr 需要逆映射的字符串(一串汉字)
   * @param {string}key 明文密钥，用于解密灵活传输标头
   * @returns {string|FlexibleTransferDataObj[]} 返回Base64字符串(逆映射结果)
   */
  deMap(OriginStr, key) {
    let TempStr1 = "",
      TempStrz = "";
    let temp = "",
      temp2 = "",
      group = "",
      findtemp = "";
    let size = OriginStr.length;

    //强制简体转换
    const converter = OpenCC.Converter({ from: "hk", to: "cn" });

    let TempStrQ = "";
    for (let i = 0; i < OriginStr.length; i++) {
      if (
        OriginStr[i] != "，" &&
        OriginStr[i] != "。" &&
        OriginStr[i] != "、" &&
        OriginStr[i] != "？" &&
        OriginStr[i] != "：" &&
        OriginStr[i] != "“" &&
        OriginStr[i] != "”" &&
        OriginStr[i] != " "
      ) {
        TempStrQ = TempStrQ + converter(OriginStr[i]);
      }
    }
    OriginStr = TempStrQ;
    size = OriginStr.length; //更新长度，防止简繁转换引入的问题

    //先筛选密文中的所有有效字符
    for (let i = 0; i < size; i++) {
      temp = OriginStr[i];
      if (
        temp == this.NULL_STR ||
        temp == " " ||
        temp == "\n" ||
        temp == "\t"
      ) {
        //如果这是空字符
        continue;
      } else if (this.PayloadLetter.indexOf(temp) == -1) {
        continue;
      } else {
        //如果不是
        TempStrz = TempStrz + temp; //加上
        try {
          if (this.callback != null)
            this.callback(new CallbackObj("DEC_PAYLOAD", TempStrz));
        } catch (err) {
          // continue regardless of error
        }
        continue;
      }
    }

    size = TempStrz.length;
    OriginStr = TempStrz;
    //灵活传输介入所需要的暂存
    let FlexibleTransferMarkerDecCounter = -1;
    let FlexibleTransferDecCounter = -1;
    let FlexibleTransferDecCounterTarget = -1;
    let FlexibleMarkerTemp = "";
    let FlexibleTransferDataArray = [];
    //开始轮转逆映射字符，还原Base64字符串，在一切开始前先转动一次转轮
    this.RoundKey();
    for (let i = 0; i < size; ) {
      temp = OriginStr[i];

      findtemp = this.findOriginText(temp); //查找字符的原文
      if (findtemp == this.NULL_STR) {
        /* v8 ignore next 2 */
        throw new Error("Bad Input.");
      }

      //>>>>>>>>>>>>>>>>↓
      //这里是灵活传输的介入，在每一轮转步骤的字符串追加前和追加后都要执行拦截操作

      if (FlexibleTransferMarkerDecCounter >= 8) {
        //这个判断用来拦截灵活传输标头的末尾，灵活传输到这里，是第九次循环。针对标头的判断在追加字符串之后。
        //在此处提前拦截可避免复杂一些的字符串截取操作。
        FlexibleMarkerTemp = TempStr1.slice(-8); //把标头截取下来
        TempStr1 = TempStr1.slice(0, -8); //把标头从主字符串上丢掉

        let RawDataObj = unpackFlexibleTransferConfig(
          Base64.toUint8Array(FlexibleMarkerTemp),
          key
        );
        FlexibleTransferDecCounterTarget = RawDataObj.lengthToBoundary; //确定当前位置到本段边界的距离。
        FlexibleTransferDecCounter = 0; //把Counter设置为0;
        FlexibleTransferMarkerDecCounter = -1; //重置标头计数器
      }

      if (
        FlexibleTransferDecCounter == FlexibleTransferDecCounterTarget &&
        FlexibleTransferDecCounter != -1
      ) {
        //刚好位于本段末尾；
        //TempStr1 就是本段的全部Base64密文数据，可能含有高级加密标头，但是这不由拦截器考虑。

        let FlexibleMarkerData = unpackFlexibleTransferConfig(
          Base64.toUint8Array(FlexibleMarkerTemp),
          key
        ); //把灵活传输标头解开

        //把本段灵活传输的数据给加入到数组里
        FlexibleTransferDataArray.push(
          new FlexibleTransferDataObj(
            FlexibleMarkerData.UseAONT,
            FlexibleMarkerData.messageID,
            TempStr1,
            FlexibleMarkerData.SerialNumber
          )
        );

        //重置所有暂存变量
        FlexibleTransferMarkerDecCounter = -1;
        FlexibleTransferDecCounter = -1;
        FlexibleTransferDecCounterTarget = -1;
        FlexibleMarkerTemp = "";

        this.RoundObufsHelper.RoundReset(); //重置当前转轮。
        TempStr1 = ""; //重置暂存的字符串
        this.RoundKey(); //轮换一次转轮
        continue;
        //开始下一次循环，下一次循环将会再截取新的标头和数据。
      }
      //>>>>>>>>>>>>>>>>↑

      //核心操作，追加字符串
      TempStr1 = TempStr1 + findtemp; //把找到的原文追加到字符串上

      //>>>>>>>>>>>>>>>>↓
      if (
        FlexibleTransferMarkerDecCounter > -1 &&
        FlexibleTransferMarkerDecCounter < 8
      ) {
        FlexibleTransferMarkerDecCounter++; //后续八个高级加密标头字符，在解混淆的时候递增计数器
      }

      if (TempStr1.endsWith(FLEXIBLE_TRANSFER_MAGIC)) {
        //识别到高级加密标头，开始介入
        if (FlexibleTransferMarkerDecCounter > -1) {
          throw new Error("Bad Input."); //连续两次以上检测到高级加密标头，是不可能的情况，直接丢出错误。
        }
        FlexibleTransferMarkerDecCounter++;
        //首次识别到标头，此时只解混淆到 =/，后续有八个字符。
        TempStr1 = TempStr1.slice(0, -2); //把标头丢掉
      }

      if (FlexibleTransferDecCounter > -1) {
        //灵活传输，此时位于标头到段落边界之间的位置
        if (FlexibleTransferDecCounter < FlexibleTransferDecCounterTarget) {
          //如果没解密到本段到末尾，那么继续解密
          FlexibleTransferDecCounter++;
        }
      }

      //>>>>>>>>>>>>>>>>↑
      this.RoundKey(); //轮换密钥
      i++;
      //>>>>>>>>>>>>>>>>↓
      //分段传输在循环到最后的时候，需要执行一次收尾判断。判断体和前面的一样。
      if (i >= size) {
        //边界情况，如果标头碰巧在全部密文的结尾处，则需要补充判断，防止出错。
        if (FlexibleTransferMarkerDecCounter >= 8) {
          //这个判断用来拦截灵活传输标头的末尾，灵活传输到这里，是第九次循环。针对标头的判断在追加字符串之后。
          //在此处提前拦截可避免复杂一些的字符串截取操作。
          FlexibleMarkerTemp = TempStr1.slice(-8); //把标头截取下来
          TempStr1 = TempStr1.slice(0, -8); //把标头从主字符串上丢掉

          let RawDataObj = unpackFlexibleTransferConfig(
            Base64.toUint8Array(FlexibleMarkerTemp),
            key
          );
          FlexibleTransferDecCounterTarget = RawDataObj.lengthToBoundary; //确定当前位置到本段边界的距离。
          FlexibleTransferDecCounter = 0; //把Counter设置为0;
          FlexibleTransferMarkerDecCounter = -1; //重置标头计数器
        }
        if (
          FlexibleTransferDecCounter == FlexibleTransferDecCounterTarget &&
          FlexibleTransferDecCounter != -1
        ) {
          //刚好位于本段末尾；
          //TempStr1 就是本段的全部Base64密文数据，可能含有高级加密标头，但是这不由拦截器考虑。

          let FlexibleMarkerData = unpackFlexibleTransferConfig(
            Base64.toUint8Array(FlexibleMarkerTemp),
            key
          ); //把灵活传输标头解开

          //把本段灵活传输的数据给加入到数组里
          FlexibleTransferDataArray.push(
            new FlexibleTransferDataObj(
              FlexibleMarkerData.UseAONT,
              FlexibleMarkerData.messageID,
              TempStr1,
              FlexibleMarkerData.SerialNumber
            )
          );

          //重置所有暂存变量
          FlexibleTransferMarkerDecCounter = -1;
          FlexibleTransferDecCounter = -1;
          FlexibleTransferDecCounterTarget = -1;
          FlexibleMarkerTemp = "";

          this.RoundObufsHelper.RoundReset(); //重置当前转轮。
          TempStr1 = ""; //重置暂存的字符串
          this.RoundKey(); //轮换一次转轮
          continue;
        }
      }
      //>>>>>>>>>>>>>>>>↑
      try {
        if (this.callback != null)
          this.callback(new CallbackObj("DEC_BASE64", TempStr1));
      } catch (err) {
        // continue regardless of error
      }
    }

    if (FlexibleTransferDataArray.length == 0) {
      return TempStr1;
    } else {
      return FlexibleTransferDataArray;
    }
  }
}

// 过时的加密类，不再更新。
export class OldMapper {
  constructor(key) {
    const Map =
      '{"basic":{"alphabet":{"a":["请","上","中","之","等","人","到","年","个","将"],"b":["得","可","并","发","过","协","曲","闭","斋","峦"],"c":["页","于","而","被","无","挽","裕","斜","绪","镜"],"d":["由","把","好","从","会","帕","莹","盈","敬","粒"],"e":["的","在","了","是","为","有","和","我","一","与"],"f":["站","最","号","及","能","迟","鸭","呈","玻","据"],"g":["着","很","此","但","看","浩","附","侃","汐","绸"],"h":["名","呢","又","图","啊","棉","畅","蒸","玫","添"],"i":["对","地","您","给","这","下","网","也","来","你"],"j":["更","天","去","用","只","矽","萌","镁","芯","夸"],"k":["第","者","所","两","里","氢","羟","纽","夏","春"],"l":["自","做","前","二","他","氦","汀","兰","竹","捷"],"m":["家","点","路","至","十","锂","羧","暑","夕","振"],"n":["区","想","向","主","四","铍","烃","惠","芳","岩"],"o":["就","新","吗","该","不","多","还","要","让","大"],"p":["小","如","成","位","其","硼","酞","褔","苑","笋"],"q":["吧","每","机","几","总","碳","铂","涓","绣","悦"],"r":["起","它","内","高","次","氮","铵","奏","鲤","淳"],"s":["非","元","类","五","使","氧","醇","迷","霁","琅"],"t":["首","进","即","没","市","氖","酯","琳","绫","濑"],"u":["后","三","本","都","时","月","或","说","已","以"],"v":["种","快","那","篇","万","钠","炔","柯","睿","琼"],"w":["长","按","报","比","信","硅","烷","静","欣","束"],"x":["再","带","才","全","呀","磷","烯","柔","雪","冰"],"y":["业","却","版","美","们","硫","桉","寒","冻","玖"],"z":["像","走","文","各","当","氯","缬","妃","琉","璃"],"A":["贴","则","老","生","达","商","行","周","证","经"],"B":["事","场","同","化","找","建","手","道","间","式"],"C":["特","城","型","定","接","局","问","重","叫","通"],"D":["件","少","面","金","近","买","听","学","见","称"],"E":["写","选","片","体","组","先","仅","别","表","现"],"F":["雨","泊","注","织","赴","茶","因","设","环","青"],"G":["数","心","子","处","作","项","谁","分","转","字"],"H":["砂","妥","鹦","课","栗","霞","鹉","翌","蕴","憩"],"I":["畔","珑","咫","瑞","玲","郊","蛟","昱","祉","菁"],"J":["铁","宙","耕","琴","铃","瑰","旬","茉","砺","莅"],"K":["钇","莉","筱","森","曳","苹","踵","晰","砥","舀"],"L":["锆","粟","魄","辉","谜","馅","醋","甄","韶","泪"],"M":["钌","倘","祥","善","泉","惦","铠","骏","韵","泣"],"N":["铑","筑","铿","智","禀","磊","桨","檀","荧","铭"],"O":["钯","骐","烛","蔬","凛","溯","困","炯","酿","瑕"],"P":["银","榻","驿","缎","澟","绒","莺","萤","桅","枕"],"Q":["镉","赞","瑾","程","怡","漱","穗","湍","栀","皆"],"R":["碘","礼","饴","舒","芷","麟","沥","描","锄","墩"],"S":["锡","彰","瞻","雅","贮","喵","翊","闪","翎","婉"],"T":["钨","咨","涌","益","嵩","御","饶","纺","栩","稔"],"U":["铋","骆","橘","未","泰","频","琥","囍","浣","裳"],"V":["钕","飒","浇","哦","途","瓢","珀","涨","仓","棠"],"W":["祁","蓬","灿","部","涧","舫","曙","航","礁","渡"],"X":["旺","嫦","漫","佑","钥","谧","葵","咩","诵","绮"],"Y":["阐","译","锻","茜","坞","砌","靛","猫","芮","绚"],"Z":["拌","皎","笙","沃","悟","拓","遨","揽","昼","蔗"]},"numbersymbol":{"0":["卡","风","水","放","花","钾","宏","谊","探","棋"],"1":["需","头","话","曾","楼","钙","吾","恋","菲","遥"],"2":["连","系","门","力","量","钛","苗","氛","鹤","雀"],"3":["书","亿","跟","深","方","钒","鸳","鸯","纸","鸢"],"4":["若","低","谈","明","百","铬","羯","尧","舜","兆"],"5":["关","客","读","双","回","锰","熙","瀚","渊","灯"],"6":["较","品","嘛","单","价","钴","阑","珊","雁","鹂"],"7":["山","西","动","厂","热","锌","鹃","鸠","昆","仑"],"8":["言","笑","度","易","身","镓","乾","坤","澈","饺"],"9":["份","星","千","仍","办","锗","彗","聪","慧","磋"],"+":["集","费","传","室","拉"],"/":["难","界","指","管","具"],"?":["相","儿","李","早","拿"],"-":["科","白","段","飞","住"],".":["利","红","板","光","约"],"(":["变","款","林","夹","院"],")":["服","句","声","务","游"],"[":["股","南","社","阿","远"],"]":["意","换","些","必","赛"],"<":["届","完","乐","彩","讲"],">":["展","帮","且","物","班"],",":["何","流","密","某","房"],"|":["语","亚","常","除","装"],"=":["极","载","题","刚","气"],"@":["米","影","德","世","坐"],"#":["北","招","短","活","斯"],"!":["值","店","树","哪","余"],"~":["盘","速","座","求","创"],"`":["梦","足","半","视","安"],"$":["空","歌","派","顶","登"],"%":["夜","云","感","啦","欲"],"^":["边","工","眼","街","奖"],"&":["获","占","理","任","实"],"*":["知","掉","色","讯","克"],"_":["直","评","往","层","园"],"{":["留","靠","亦","罗","营"],"}":["合","尚","产","诚","汨"],":":["曱","朩","杉","杸","歩"],";":["毋","氕","気","氘","氙"]}},"special":{"DECRYPT":{"JP":["桜","込","凪","雫","実","沢"],"CN":["玚","俟","玊","欤","瞐","珏"]}}}';
    this.Map_Obj = JSON.parse(Map);

    this.Normal_Characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+=_-/?.>,<|`~!@#$%^&*(){}[];:1234567890"; //表内有映射的所有字符组成的字符串
    this.LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    this.BIG_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.NUMBERS = "1234567890";
    this.SYMBOLS = "+=_-/?.>,<|`~!@#$%^&*(){}[];:";
    this.NUMBERSYMBOL = "1234567890+=_-/?.>,<|`~!@#$%^&*(){}[];:";

    this.NULL_STR = "孎"; //默认忽略的占位字符，一个生僻字。

    this.RoundObufsHelper = new RoundObfusOLD(key);
  }
  RoundKeyMatch(keyIn) {
    return this.RoundObufsHelper.RoundKeyMatch(keyIn);
  }
  DRoundKeyMatch(keyIn) {
    return this.RoundObufsHelper.DRoundKeyMatch(keyIn);
  }
  RoundKey() {
    this.RoundObufsHelper.RoundKey();
    return;
  }
  getCryptText(text) {
    let letter = String(text); //源文本
    let idx, idx2, idx3, idx4;

    idx = this.LETTERS.indexOf(letter); //是否是小写字母
    idx2 = this.BIG_LETTERS.indexOf(letter); //是否是大写字母
    idx3 = this.NUMBERS.indexOf(letter); //是否是数字
    idx4 = this.SYMBOLS.indexOf(letter); //是否是符号
    let RandIndex, RandIndex2;

    //判断给定字符的类型
    if (idx != -1 || idx2 != -1) {
      for (let key in this.Map_Obj["basic"]["alphabet"]) {
        if (this.Map_Obj["basic"]["alphabet"].hasOwnProperty(key)) {
          if (key == letter) {
            RandIndex = GetRandomIndex(
              this.Map_Obj["basic"]["alphabet"][this.RoundKeyMatch(key)].length
            );
            let s2 =
              this.Map_Obj["basic"]["alphabet"][this.RoundKeyMatch(key)][
                RandIndex
              ];
            return s2;
          } else if (key.toUpperCase() == letter) {
            RandIndex = GetRandomIndex(
              this.Map_Obj["basic"]["alphabet"][
                this.RoundKeyMatch(key.toUpperCase())
              ].length
            );
            let s2 = String(
              this.Map_Obj["basic"]["alphabet"][
                this.RoundKeyMatch(key.toUpperCase())
              ][RandIndex]
            );
            return s2;
          }
        }
      }
    } else if (idx3 != -1 || idx4 != -1) {
      for (let key in this.Map_Obj["basic"]["numbersymbol"]) {
        if (this.Map_Obj["basic"]["numbersymbol"].hasOwnProperty(key)) {
          if (key == letter) {
            RandIndex = GetRandomIndex(
              this.Map_Obj["basic"]["numbersymbol"][this.RoundKeyMatch(key)]
                .length
            );
            let s2 =
              this.Map_Obj["basic"]["numbersymbol"][this.RoundKeyMatch(key)][
                RandIndex
              ];
            return s2;
          }
        }
      }
    }
    return this.NULL_STR;
  }

  findOriginText(text) {
    let letter = String(text);
    let res;
    for (let key in this.Map_Obj["basic"]["alphabet"]) {
      this.Map_Obj["basic"]["alphabet"][key].forEach((item) => {
        if (letter == item) {
          res = this.DRoundKeyMatch(key);
        }
      });
    }
    if (res) {
      return res;
    }
    for (let key in this.Map_Obj["basic"]["numbersymbol"]) {
      this.Map_Obj["basic"]["numbersymbol"][key].forEach((item) => {
        if (letter == item) {
          res = this.DRoundKeyMatch(key);
        }
      });
    }
    if (res) {
      return res;
    } else {
      return this.NULL_STR;
    }
  }

  enMap(OriginStr, q) {
    let TempStr1 = "",
      temp = "",
      temp2 = "",
      group = "";

    let size = OriginStr.length;
    this.RoundKey();
    for (let i = 0; i < size; i++) {
      temp = OriginStr[i];
      if (i != size - 1) {
        //一次遍历两个字符，遇到倒数第一个的时候防止越界
        temp2 = OriginStr[i + 1];
      } else {
        temp2 = this.NULL_STR;
      }
      group = temp + temp2;

      TempStr1 = TempStr1 + this.getCryptText(temp); //把加密字符加到结果字符串的后面
      this.RoundKey();
    }

    if (q) {
      //RoundReset();
      return TempStr1;
    }

    //第一个循环结束后，TempStr1应当是完全的密文，但是缺少标志位
    let RandIndex, RandIndex2;
    let Avoid = new Array();
    for (let q = 0; q < 2; q++) {
      //分两次大循环
      let PosToInset = new Array();
      let size = TempStr1.length;
      for (let i = 0; i < size; i++) {
        PosToInset.push(i);
      }
      if (q == 0) {
        //第一次大循环插入JP
        RandIndex = PosToInset[GetRandomIndex(PosToInset.length)];
        RandIndex2 = GetRandomIndex(
          this.Map_Obj["special"]["DECRYPT"]["JP"].length
        );
        let stemp = this.Map_Obj["special"]["DECRYPT"]["JP"][RandIndex2];
        TempStr1 = insertStringAtIndex(TempStr1, stemp, RandIndex);
        for (let z = RandIndex + 1; z < RandIndex + stemp.length; z++) {
          Avoid.push(z);
        }
      } else if (q == 1) {
        //第二次大循环插入CN;
        let AvailPos = new Array();
        AvailPos = difference(PosToInset, Avoid);

        RandIndex = AvailPos[GetRandomIndex(AvailPos.length)];
        RandIndex2 = GetRandomIndex(
          this.Map_Obj["special"]["DECRYPT"]["CN"].length
        );
        TempStr1 = insertStringAtIndex(
          TempStr1,
          this.Map_Obj["special"]["DECRYPT"]["CN"][RandIndex2],
          RandIndex
        );
      }
    }
    //RoundReset();
    return TempStr1;
  }

  deMap(OriginStr) {
    let TempStr1 = "",
      TempStrz = "";
    let temp = "",
      temp2 = "",
      group = "",
      findtemp = "";
    let size = OriginStr.length;
    for (let i = 0; i < size; i++) {
      temp = OriginStr[i];
      if (
        temp == this.NULL_STR ||
        temp == " " ||
        temp == "\n" ||
        temp == "\t"
      ) {
        //如果这是空字符
        continue;
      } else {
        //如果不是
        TempStrz = TempStrz + temp; //加上
        continue;
      }
    }
    size = TempStrz.length;
    OriginStr = TempStrz;
    this.RoundKey();
    for (let i = 0; i < size; ) {
      temp = OriginStr[i];
      if (i != size - 1) {
        //一次遍历两个字符，遇到倒数第一个的时候防止越界
        temp2 = OriginStr[i + 1];
      } else {
        temp2 = this.NULL_STR;
      }
      group = temp + temp2;

      findtemp = this.findOriginText(temp); //查找第一个字符的原文
      if (findtemp == this.NULL_STR) {
        throw new Error("Bad Input. Try force encrypt if intended.");
      }
      TempStr1 = TempStr1 + findtemp; //把找到的原文增加到字符串上
      this.RoundKey(); //轮换密钥
      i++;
    }
    TempStr1 = AddPadding(TempStr1);

    return TempStr1;
  }
}
