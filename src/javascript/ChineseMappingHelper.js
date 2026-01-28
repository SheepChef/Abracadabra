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

import {
  GetRandomIndex,
  insertStringAtIndex,
  difference,
  AddPadding,
  shuffle,
} from "./Misc.js";
import { RoundObfusOLD, RoundObfus } from "./RoundObfusHelper.js";
import { CallbackObj } from "./CoreHandler.js";
import * as OpenCC from "opencc-js";

export class WenyanSimulator {
  constructor(key, callback = null) {
    this.Map =
      '{"Actual":{"N":{"alphabet":{"a":"人","b":"镜","c":"鹏","d":"曲","e":"霞","f":"绸","g":"裳","h":"路","i":"岩","j":"叶","k":"鲤","l":"月","m":"雪","n":"冰","o":"局","p":"恋","q":"福","r":"铃","s":"琴","t":"家","u":"天","v":"韵","w":"书","x":"莺","y":"璃","z":"雨","A":"文","B":"涧","C":"水","D":"花","E":"风","F":"棋","G":"楼","H":"鹤","I":"鸢","J":"灯","K":"雁","L":"星","M":"声","N":"树","O":"茶","P":"竹","Q":"兰","R":"苗","S":"心","T":"语","U":"礼","V":"梦","W":"庭","X":"木","Y":"驿","Z":"火"},"numbersymbol":{"0":"森","1":"夏","2":"光","3":"林","4":"物","5":"云","6":"夜","7":"城","8":"春","9":"空","+":"雀","/":"鹂","=":"鸳"}},"V":{"alphabet":{"a":"关","b":"赴","c":"呈","d":"添","e":"停","f":"成","g":"走","h":"达","i":"行","j":"称","k":"见","l":"学","m":"听","n":"买","o":"作","p":"弹","q":"写","r":"定","s":"谈","t":"动","u":"旅","v":"返","w":"度","x":"开","y":"筑","z":"选","A":"流","B":"指","C":"换","D":"探","E":"放","F":"看","G":"报","H":"事","I":"泊","J":"现","K":"迸","L":"彰","M":"需","N":"飞","O":"游","P":"求","Q":"御","R":"航","S":"歌","T":"读","U":"振","V":"登","W":"任","X":"留","Y":"奏","Z":"连"},"numbersymbol":{"0":"知","1":"至","2":"致","3":"去","4":"画","5":"说","6":"进","7":"信","8":"取","9":"问","+":"笑","/":"视","=":"言"}},"MV":["欲","应","可","能","将","请","想","必","当"],"A":{"alphabet":{"a":"莹","b":"畅","c":"新","d":"高","e":"静","f":"美","g":"绿","h":"佳","i":"善","j":"良","k":"瀚","l":"明","m":"早","n":"宏","o":"青","p":"遥","q":"速","r":"慧","s":"绚","t":"绮","u":"寒","v":"冷","w":"银","x":"灵","y":"绣","z":"北","A":"临","B":"南","C":"俊","D":"捷","E":"骏","F":"益","G":"雅","H":"舒","I":"智","J":"谜","K":"彩","L":"余","M":"短","N":"秋","O":"乐","P":"怡","Q":"瑞","R":"惠","S":"和","T":"纯","U":"悦","V":"迷","W":"长","X":"少","Y":"近","Z":"清"},"numbersymbol":{"0":"远","1":"极","2":"安","3":"聪","4":"秀","5":"旧","6":"浩","7":"盈","8":"快","9":"悠","+":"后","/":"轻","=":"坚"}},"AD":{"alphabet":{"a":"诚","b":"畅","c":"新","d":"高","e":"静","f":"恒","g":"愈","h":"谨","i":"善","j":"良","k":"频","l":"笃","m":"早","n":"湛","o":"昭","p":"遥","q":"速","r":"朗","s":"祗","t":"攸","u":"徐","v":"咸","w":"皆","x":"灵","y":"恭","z":"弥","A":"临","B":"允","C":"公","D":"捷","E":"淳","F":"益","G":"雅","H":"舒","I":"嘉","J":"勤","K":"协","L":"永","M":"短","N":"歆","O":"乐","P":"怡","Q":"已","R":"忻","S":"和","T":"谧","U":"悦","V":"稍","W":"长","X":"少","Y":"近","Z":"尚"},"numbersymbol":{"0":"远","1":"极","2":"安","3":"竟","4":"悉","5":"渐","6":"颇","7":"辄","8":"快","9":"悠","+":"后","/":"轻","=":"曾"}}},"Virtual":{"zhi":["之"],"hu":["乎"],"zhe":["者"],"ye":["也"],"for":["为"],"ba":["把"],"le":["了"],"er":["而"],"this":["此","斯"],"still":["仍"],"with":["与","同"],"also":["亦","也"],"is":["是","乃"],"not":["未","莫"],"or":["或"],"more":["更"],"make":["使","将","让"],"and":["与","同"],"anti":["非","不"],"why":["为何","奈何","何哉"],"but":["但","却","则","而","况","且"],"like":["似","如","若"],"if":["若","倘"],"int":["哉","呼","噫"],"self":["自"],"by":["以","于"]},"Sentences":{"Begin":["1D/非/N/ye","1B/N/曰/R","1B/若夫/N","1C/anti/MV/V/ye/P","2B/A/N/曰/R","2B/N/以/A","2C/N/anti/在/A","2C/N/make/N/zhi","2C/MV/N/zhe/A","2E/有/N/则/A","2E/不/入/于/N/、/则/入/于/N/P","2C/V/zhe/V/zhi","2D/but/MV/A/zhe/A","3C/N/V/by/N","3B/初，/N/V/by/N","3B/夫/N/anti/V/by/N","3B/AD/V/zhi/谓/A","3C/A/N/为/N/兮","3B/V/而/V/zhi/zhi/谓/A","3B/N/，/N/zhi/N/ye/P","3D/A/之/V/者/必/有/N/P","3D/有/所/V/N/，/则/不/得/其/V/P","4D/非/N/不/A/，/V/不/A","4C/A/N/AD/V","4C/V/N/以/V/N","4D/A/者/自/V/也/，/而/N/自/V/也/P","4E/N/不在/A/，/有/N/则/A/P","4E/上/不/V/N/，/下/不/V/N/P","4D/A/N/常有/，/而/A/N/不常有/P","4D/V/N/者/，/N/之/N/也/P","4E/N/有/MV/V/，/N/有/AD/然/P","4D/N/无/N/，/无以/V/N","4D/欲/V/其/N/者/，/先/V/其/N/P","4D/今/夫/N/，/一/N/之/多/，/及/其/A/A/P","4D/有/所/A/，/有/所/V/，/然/而/MV/V/其/N/者/也/P","4D/V/之/不/为/N/，/V/之/不/为/N/P","4D/吾/为/N/之/所/V/，/N/亦/为/吾/所/V/P","5D/V/N/而/V/A/，/V/zhi/道/ye/P","5D/A/N/之/N/，/like/N/like/N/P","5E/N/zhi/V/V/，/实为/A/A/P","5C/本/MV/V/A/，/anti/V/N/N","5C/N/之/无/N/，/N/V/之/N","5D/V/N/而/V/之/者/，/非/其/N/AD/也/P","5B/今/V/N/以/V/A/N","5B/N/乃/V/V/N/zhi/N","5B/N/N/无/V/，/V/而/必/V/P","5B/今/N/乃/A/N/A/N","5C/A/N/V/A/N","5B/夫/N/、/N/不/MV/AD/V/N","5D/不/有/A/N/，/何/V/A/N/Q","5D/以/A/N/为/N/者/，/N/MV/弗/而/V/之/P","6B/以/N/V/，/like/V/N/V/N","6B/A/N/zhi/N/，/V/zhi/以/V/其/N","6B/A/N/V/于/N/而/V/N","6B/A/N/未/V/N/、/N/之/N","6B/V/A/N/若/V/A/N","6C/A/N/为/N/兮/，/A/N/为/N/P","6D/不/V/N/，/不/V/N/，/当/以/AD/V/论/P","6D/A/则为/V/N/，/A/则为/V/N/P","6D/若/居/A/N/之/N/，/则/当/A/N/之/V/P","6D/N/无/N/则/V/，/N/无/N/则/V/P","6D/A/者/V/而/V/之/，/A/者/V/而/V/之/P","6D/N/受/命/于/N/，/固/AD/然/V/于/A/N/P","6D/V/N/而/不/能/V/，/V/而/不/能/V/，/N/也/P","6D/常/有/N/V/A/N/，/请/N/为/N/P","6D/A/而/V/，/A/而/V/者/，/A/N/也/P","7D/夫/A/之/N/V/N/者/，/其/所以/AD/V/者/N/也/P","7C/N/以/A/A/，/AD/V/A/N","7B/V/N/A/，/A/N/V/N","7B/N/V/以/N/V/，/V/不/V/N","7C/N/N/V/N/，/A/于/N/N","7D/MV/AD/V/A/N/，/but/V/V/不/A","7C/或/V/N/V/N/，/V/N/于/N","7E/则有/N/A/N/A/，/N/N/具/V","7D/V/A/N/zhe/，/常/V/其/所/A/，/而/V/其/所/A/P","7D/A/N/之/N/，/常/V/于/其/所/AD/V/而/不/V/之/处/P","7D/A/N/之/N/不在/N/，/在乎/A/N/之/N/也/P","8D/V/A/N/，/V/A/N/，/by/MV/A/zhi/N/P","8D/N/anti/AD/V/zhe/by/AD/V/zhe/V/，/anti/MV/AD/V/P","8D/N/anti/MV/V/N/，/still/继/N/V/，/why/，/and/N/而/anti/V/N/ye/P","8C/V/N/A/A/，/V/N/A/A","8C/N/V/A/N/，/N/V/A/N","8C/N/在/A/N/，/A/N/zhi/A/，/V/于/N/P","8C/A/N/AD/V/，/N/N/AD/V","8C/A/N/V/N/，/N/N/V/N/P","8B/尝/V/A/N/，/AD/V/A/N/zhi/N","8D/予/V/夫/A/N/A/N/，/在/A/N/之/N","8D/N/V/于/A/N/，/而/N/V/于/A/N","8D/N/V/N/为/N/，/N/V/N/为/N/P","8B/N/A/即/N/A/，/N/A/即/N/A/P","8D/虽/无/N/N/zhi/V/，/亦/V/以/AD/V/A/N/P","8D/是/故/A/N/有/A/N/，/必/AD/V/以/得/之/，/AD/V/以/失/之/P","8D/A/N/之/A/N/，/常/为/A/N/之/A/N/P","9D/A/N/V/zhi/而不/V/zhi/、亦/make/A/N/er/复/V/A/N/ye/P","9D/N/MV/V/N/V/V/，/but/N/N/AD/V/P","9B/以/N/，/当/V/A/N/，/非/N/V/N/所/MV/AD/V/P","9C/此/N/有/A/N/A/N/，/A/N/A/N/P","9D/是/N/ye/，/N/A/N/A/，/N/A/N/A/P"],"Main":["1B/非/N/ye","1B/N/曰/R","1C/anti/MV/V/ye","2C/N/make/N/zhi","2C/MV/N/zhe/A","2E/有/N/则/A","2E/不/入/于/N/、/则/入/于/N/P","2C/V/zhe/V/zhi","2C/but/MV/A/zhe/A","3C/N/with/N/V","3B/N/曰，何/A/zhi/V/Q","3D/有/所/V/N/，/则/不/得/其/V/P","4C/A/N/AD/V","4C/V/N/以/V/N","4D/N/无/N/，/无以/V/N/P","4D/此/谓/V/N/在/V/其/N/P","4D/今/夫/N/，/一/N/之/多/，/及/其/A/A/P","4D/有/所/A/，/有/所/V/，/然/而/MV/V/其/N/者/也/P","4D/欲/V/其/N/者/，/先/V/其/N/P","4E/上/不/V/N/，/下/不/V/N/P","4D/A/者/自/V/也/，/而/N/自/V/也/P","4D/V/N/者/，/N/之/N/也/P","4D/以/此/V/N/，/何/N/不/V/Q","4E/N/不在/A/，/有/N/则/A/P","4C/N/有/MV/V/，/N/有/AD/然/P","4D/N/非/V/而/V/之/者/，/孰/MV/无/N/P","4D/A/N/常有/，/而/A/N/不常有/P","4D/吾/为/N/之/所/V/，/N/亦/为/吾/所/V/P","4C/不/以/N/V/，/不/以/N/V/P","4D/有/N/V/者/，/不/得/其/N/则/V/P","4D/V/之/不/为/N/，/V/之/不/为/N/P","5B/今/V/N/以/V/A/N","5B/N/乃/V/V/N/zhi/N","5B/N/N/无/V/，/V/而/必/V/P","5C/本/MV/V/A/，/anti/V/N/N","5D/V/N/而/V/之/者/，/非/其/N/AD/也/P","5D/A/N/之/N/，/like/N/like/N/P","5D/以/A/N/为/N/者/，/N/MV/弗/而/V/之/P","5D/故/夫/A/N/之/N/，/不/可/make/其/V/于/N/也/P","5D/N/不/为/A/，/而/有/时/乎/为/A/，/谓/A/N/者/也/P","5D/于/是/A/N/之/N/AD/然/V/矣/P","5B/今/N/乃/A/N/A/N","5E/每/有/V/N/，/便/AD/然/V/N/P","5D/N/V/而/A/N/V/也","5E/不/有/A/N/，/何/V/A/N/Q","5C/N/之/无/N/，/N/V/之/N","6D/N/A/N/A/，/则/所/V/得/其/A/P","6D/V/AD/而/V/AD/，/anti/MV/V/于/N/也/P","6D/A/而/V/，/A/而/V/者/，/A/N/也/P","6B/以/N/V/，/like/V/N/V/N","6B/V/A/N/若/V/A/N","6C/N/V/，/V/N/V/N","6E/虽/V/V/A/A/，/A/A/不/同/P","6D/而/A/N/zhi/N/，/V/zhi/以/V/其/N/P","6B/A/N/V/于/N/而/V/N","6B/A/N/未/V/N/、/N/之/N","6C/V/A/N/，/V/A/N","6C/A/N/为/N/兮/，/A/N/为/N/P","6D/V/MV/with/其/N/，/而/V/MV/V/以/N/者/，/N/也/P","6D/A/N/必/有/A/N/V/之者/、/予/可/无/N/也/P","6D/将/有/V/，/则/V/A/N/以/V/N/P","6D/不/V/N/，/不/V/N/，/当/以/AD/V/论/P","6D/A/则为/V/N/，/A/则为/V/N/P","6D/N/无/N/则/V/，/N/无/N/则/V/P","6D/A/者/V/而/V/之/，/A/者/V/而/V/之/P","6D/若/居/A/N/之/N/，/则/当/A/N/之/V/P","6D/N/受/命/于/N/，/固/AD/然/V/于/A/N/P","6D/V/N/而/不/能/V/，/V/而/不/能/V/，/N/也/P","6D/常/有/N/V/A/N/，/请/N/为/N/P","7D/夫/A/之/N/V/N/者/，/其/所以/AD/V/者/N/也/P","7B/N/V/以/N/V/，/V/不/V/N","7C/N/N/V/N/，/A/于/N/N","7D/MV/AD/V/A/N/，/but/V/V/不/A","7C/或/V/N/V/N/，/V/N/于/N","7D/V/A/N/zhe/，/常/V/其/所/A/，/而/V/其/所/A/P","7D/A/N/之/不/V/也/AD/矣/，/欲/N/之/无/N/也/AD/矣/P","7D/A/N/之/N/，/常/V/于/其/所/AD/V/而/不/V/之/处/P","7D/A/N/之/N/不在/N/，/在乎/A/N/之/N/也/P","7D/A/N/之/N/，/V/之/N/而/V/之/N/也/P","7D/是故/A/N/不必不如/N/，/N/不必/A/于/A/N/P","7B/有/A/N/、/A/N/、/A/N/之/N/P","8D/N/anti/MV/V/N/，/still/继/N/V/，/why/，/and/N/而/anti/V/N/ye/P","8E/是/故/无/A/无/A/，/无/A/无/A/，/N/之/所/V/、/N/之/所/V/ye/P","8C/V/N/A/A/，/V/N/A/A","8B/N/在/A/N/，/A/N/zhi/A/，/V/于/N/P","8B/like/A/N/V/N/，/不/V/N/V/之/N/P","8C/A/N/AD/V/，/N/N/AD/V","8D/A/N/之/A/N/，/常/为/A/N/之/A/N/P","8C/A/N/V/N/，/N/N/V/N/P","8D/虽/无/N/N/zhi/V/，/亦/V/以/AD/V/A/N/P","8D/予/V/夫/A/N/A/N/，/在/A/N/之/N","8D/故/V/A/N/者/，/当/V/A/N/之/A/N/P","8D/N/V/于/A/N/，/而/N/V/于/A/N","8D/N/V/N/为/N/，/N/V/N/为/N/P","8B/N/A/即/N/A/，/N/A/即/N/A/P","8B/A/N/MV/A/N/之/A/，/V/N/中/之/A","8D/N/V/于/A/N/之上/，/AD/V/于/A/N/之间/P","8D/是/故/A/N/有/A/N/，/必/AD/V/以/得/之/，/AD/V/以/失/之/P","8D/故/其/N/不/可/以/V/N/，/A/N/V/N/而/不/MV/N/P","8B/使/其/A/N/AD/V/，/A/N/AD/V/P","9B/N/MV/V/N/V/V/，/but/N/N/AD/V","9D/A/N/V/zhi/而不/V/zhi/、亦/make/A/N/er/复/V/A/N/ye/P","9D/以/N/，/当/V/A/N/，/非/N/V/N/所/MV/AD/V/P","9C/此/N/有/A/N/A/N/，/A/N/A/N/P","9E/是/N/ye/，/N/A/N/A/，/N/A/N/A","9E/V/A/N/，/N/A/N/A/，/乃/AD/V"],"End":["1B/非/N/ye","1C/anti/MV/V/ye","2C/唯/N/V/zhi","2B/V/by/N","2D/其/also/A/hu/其/V/ye/P","2C/N/make/N/zhi","2C/MV/N/zhe/A","2E/有/N/则/A","2C/V/zhe/V/zhi","2C/but/MV/A/zhe/A","3C/V/在/A/N","3D/今/zhi/V/zhe/，/亦将有/V/于/this/N/P","3D/某也/A/，/某也/A/，/可/不/A/哉","3D/有/所/V/N/，/则/不/得/其/V/P","4B/V/N/zhi/N/by/N","4D/A/者/自/V/也/，/而/N/自/V/也/P","4C/A/N/AD/V","4C/V/N/以/V/N","4D/N/无/N/，/无以/V/N","4D/V/N/者/，/N/之/N/也/P","4D/以/此/V/N/，/何/N/不/V/Q","4D/噫/，/A/N/ye/，/N/谁/与/V/Q","4D/此/谓/V/N/在/V/其/N/P","4D/今/夫/N/，/一/N/之/多/，/及/其/A/A/P","4D/有/所/A/，/有/所/V/，/然/而/MV/V/其/N/者/也/P","4E/上/不/V/N/，/下/不/V/N/P","4D/欲/V/其/N/者/，/先/V/其/N/P","4D/有/N/V/者/，/不/得/其/N/则/V/P","4C/不/以/N/V/，/不/以/N/V/P","4D/V/之/不/为/N/，/V/之/不/为/N/P","4D/然/则/A/N/自/N/V/矣/P","5B/请/V/N/zhi/N/中/，/是/N/zhi/N/P","5D/今/V/N/以/V/A/N","5B/N/乃/V/V/N/zhi/N","5B/N/N/无/V/，/V/而/必/V/P","5C/本/MV/V/A/，/anti/V/N/N","5D/V/N/而/V/之/者/，/非/其/N/AD/也/P","5D/以/A/N/为/N/者/，/N/MV/弗/而/V/之/P","5D/A/N/之/N/，/like/N/like/N/P","5D/N/不/为/A/，/而/有/时/乎/为/A/，/谓/A/N/者/也/P","5D/于/是/A/N/之/N/AD/然/V/矣/P","5D/故/夫/A/N/之/N/，/不/可/make/其/V/于/N/也/P","5B/今/N/乃/A/N/A/N","5D/N/V/而/A/N/V/也","5E/不/有/A/N/，/何/V/A/N/Q","5C/N/之/无/N/，/N/V/之/N","6C/A/N/为/N/兮/，/A/N/为/N/P","6D/以/N/V/，/like/V/N/V/N","6D/A/zhi/V/N/，/亦/like/今/zhi/V/N/，/A/夫/P","6D/A/者/V/而/V/之/，/A/者/V/而/V/之/P","6D/若/居/A/N/之/N/，/则/当/A/N/之/V/P","6D/V/AD/而/V/AD/，/anti/MV/V/于/N/也/P","6D/A/而/V/，/A/而/V/者/，/A/N/也/P","6B/N/V/，/V/N/V/N","6E/V/N/之/N/，/为/N/V/者/，/可以/V/矣/P","6D/V/MV/with/其/N/，/而/V/MV/V/以/N/者/，/N/也/P","6D/A/N/必/有/A/N/V/之者/、/予/可/无/N/也/P","6E/虽/V/V/A/A/，/A/A/不/同/P","6D/将/有/V/，/则/V/A/N/以/V/N/P","6D/不/V/N/，/不/V/N/，/当/以/AD/V/论/P","6D/A/则为/V/N/，/A/则为/V/N/P","6D/N/受/命/于/N/，/固/AD/然/V/于/A/N/P","6D/N/无/N/则/V/，/N/无/N/则/V/P","6D/N/A/N/A/，/则/所/V/得/其/A/P","6D/常/有/N/V/A/N/，/请/N/为/N/P","6D/V/N/而/不/能/V/，/V/而/不/能/V/，/N/也/P","7D/夫/A/之/N/V/N/者/，/其/所以/AD/V/者/N/也/P","7D/N/V/以/N/V/，/V/不/V/N","7C/N/N/V/N/，/A/于/N/N","7D/MV/AD/V/A/N/，/but/V/V/不/A","7E/或/V/N/V/N/，/V/N/于/N","7D/A/N/之/N/不在/N/，/在乎/A/N/之/N/也/P","7D/A/N/之/N/，/V/之/N/而/V/之/N/也/P","7D/是故/A/N/不必不如/N/，/N/不必/A/于/A/N/P","7B/有/A/N/、/A/N/、/A/N/之/N/P","8E/虽/N/A/N/A/，/所/以/V/N/，其/N/A/ye/P","8B/like/A/N/V/N/，/不/V/N/V/之/N/P","8B/N/A/即/N/A/，/N/A/即/N/A/P","8D/何必/V/N/V/N/，/V/N/zhi/N/N/哉/P","8D/N/anti/MV/V/N/，/still/继/N/V/，/why/，/and/N/而/anti/V/N/ye/P","8D/是/故/A/N/有/A/N/，/必/AD/V/以/得/之/，/AD/V/以/失/之/P","8D/故/其/N/不/可/以/V/N/，/A/N/V/N/而/不/MV/N/P","8C/V/N/A/A/，/V/N/A/A","8B/N/在/A/N/，/A/N/zhi/A/，/V/于/N/P","8C/A/N/AD/V/，/N/N/AD/V","8D/虽/无/N/N/zhi/V/，/亦/V/以/AD/V/A/N/P","8D/N/V/N/为/N/，/N/V/N/为/N/P","8D/故/V/A/N/者/，/当/V/A/N/之/A/N/P","8D/N/V/于/A/N/之上/，/AD/V/于/A/N/之间/P","8C/使/其/A/N/AD/V/，/A/N/AD/V/P","9D/A/N/V/zhi/而不/V/zhi/、亦/make/A/N/er/复/V/A/N/ye/P","9B/N/MV/V/N/V/V/，/but/N/N/AD/V","9D/以/N/，/当/V/A/N/，/非/N/V/N/所/MV/AD/V/P","9C/此/N/有/A/N/A/N/，/A/N/A/N/P","9B/是/N/ye/，/N/A/N/A/，/N/A/N/A/P"]}}';

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
      for (let key in this.Map_Obj["Actual"][type]["alphabet"]) {
        if (this.Map_Obj["Actual"][type]["alphabet"].hasOwnProperty(key)) {
          if (key == letter) {
            let s2 =
              this.Map_Obj["Actual"][type]["alphabet"][this.RoundKeyMatch(key)];
            return s2;
          } else if (key.toUpperCase() == letter) {
            let s2 = String(
              this.Map_Obj["Actual"][type]["alphabet"][
                this.RoundKeyMatch(key.toUpperCase())
              ]
            );
            return s2;
          }
        }
      }
    } else if (idx3 != -1 || idx4 != -1) {
      for (let key in this.Map_Obj["Actual"][type]["numbersymbol"]) {
        if (this.Map_Obj["Actual"][type]["numbersymbol"].hasOwnProperty(key)) {
          if (key == letter) {
            let s2 =
              this.Map_Obj["Actual"][type]["numbersymbol"][
                this.RoundKeyMatch(key)
              ];
            return s2;
          }
        }
      }
    }

    /* v8 ignore next 2 */
    return this.NULL_STR;
  }

  findOriginText(text) {
    //反向查表函数
    let letter = String(text);
    let res;
    for (let key in this.DecodeTable) {
      this.DecodeTable[key].forEach((item) => {
        if (letter == item) {
          res = this.DRoundKeyMatch(key);
        }
      });
    }
    if (res) {
      return res;
    } else {
      /* v8 ignore next 2 */
      return this.NULL_STR;
    }
  }

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
  }

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

  distributePayload(n) {
    // 如果载荷量太大，那么自动把载荷分为等大小的部分(段落)，然后分别处理
    if (n === 0) return [0];
    const k = Math.ceil(n / 100);
    const base = Math.floor(n / k);
    const remainder = n % k;
    const parts = [];
    for (let i = 0; i < remainder; i++) {
      parts.push(base + 1);
    }
    for (let i = remainder; i < k; i++) {
      parts.push(base);
    }
    return parts;
  }

  selectSentence(PayloadLength, RandomIndex = 0, p, l) {
    //句式选择函数。
    //P 强制对仗骈文
    //L 强制多用逻辑句式
    //句式选择算法
    //RandomIndex 随机指数，越大，给出的句式越随机，最大100。
    /* v8 ignore next 7 */
    if (RandomIndex > 100 || RandomIndex < 0) {
      //错误的输入。
      throw "Incorrect Random Index";
    }
    if (p && l) {
      throw "Contradictory Mode Setting";
    }

    if (PayloadLength > 100) {
      //如果密文太长了，那么自动分段
      let distributedPayload = this.distributePayload(PayloadLength);
      let Result = [];
      distributedPayload.forEach((Payload) => {
        Result = Result.concat(this.selectSentence(Payload, RandomIndex, p, l));
        Result[Result.length - 1].push("Z");
        try {
          if (this.callback != null)
            this.callback(new CallbackObj("ENC_SENTENCES", Result));
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
        let TargetPayload;
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
            TargetPayload = PossiblePayload.pop(); //目标Payload，参照这个去库里寻句式。
          }
        } else if (selectRand > 100 && selectRand <= 200) {
          //随机选择一个，不一定是最优解
          TargetPayload =
            PossiblePayload[GetRandomIndex(PossiblePayload.length)];
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

        let TargetPayload = SegmentedPayload[i][a]; //目标负载
        for (let c = 0; c < this.Map_Obj["Sentences"][Lib].length; c++) {
          //开始选择句式
          let Sentence = this.Map_Obj["Sentences"][Lib][c].split("/"); //Sentence是列表，按照/分割的句式
          if (parseInt(Sentence[0]) == TargetPayload) {
            PossibleSentences.push(Sentence.slice(1));
            if (Sentence[0][1] == "C" || Sentence[0][1] == "E") {
              PossiblePianSentences.push(Sentence.slice(1));
            }
            if (Sentence[0][1] == "D" || Sentence[0][1] == "E") {
              PossibleLogicSentences.push(Sentence.slice(1));
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
            this.callback(new CallbackObj("ENC_SENTENCES", ElementResult));
        } catch (err) {
          // continue regardless of error
        }
      }
    }

    return ElementResult;
  }

  enMap(OriginStr, q, r, p, l, t) {
    let TempStr1 = "",
      temp = "";

    let size = OriginStr.length;

    //从这里开始做文章，开始文言文仿真，以及三重轮转对表。

    let Sentence = this.selectSentence(OriginStr.length, r, p, l); //选择句式
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
            //进入此分支，意味着不会再次添加逗号
            LastQuote = 0; //如果两个连续冒号句子，那么会在下一个句子关闭引号，而非本句
            TempStr1 = TempStr1 + "，"; //加上逗号
            NoAutoSymbol = true;
            CommaCounter++;
          }
          //上个块是冒号句，这句话就不增加冒号(禁止连续两个冒号)
        } else if (Sentence[j][k] == "Z") {
          //插入段落分隔。
          if (!hasSpecialEndSymbol) {
            hasSpecialEndSymbol = true;
            TempStr1 = TempStr1 + "。";
            if (i != size) {
              //最后一句话后面不插入分隔
              TempStr1 = TempStr1 + "\n\n";
            }
          } else {
            if (i != size) {
              TempStr1 = TempStr1 + "\n\n";
            }
          }
        } else if (Sentence[j][k] == "Q") {
          //插入问号
          //倒数第二个句式禁止出现句号和问号
          if (j == Sentence.length - 2) {
            continue;
          }
          hasSpecialEndSymbol = true;
          TempStr1 = TempStr1 + "？";
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
          TempStr1[i] != " "
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

  deMap(OriginStr) {
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
    this.RoundKey(); //开始轮转逆映射字符，还原Base64字符串
    for (let i = 0; i < size; ) {
      temp = OriginStr[i];

      findtemp = this.findOriginText(temp); //查找第一个字符的原文
      if (findtemp == this.NULL_STR) {
        /* v8 ignore next 2 */
        throw "Bad Input. Try force encrypt if intended.";
      }
      TempStr1 = TempStr1 + findtemp; //把找到的原文增加到字符串上
      this.RoundKey(); //轮换密钥
      i++;
      try {
        if (this.callback != null)
          this.callback(new CallbackObj("DEC_BASE64", TempStr1));
      } catch (err) {
        // continue regardless of error
      }
    }
    TempStr1 = AddPadding(TempStr1); //轮转完成之后，为Base64字符串添加Padding
    return TempStr1;
  }
}

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
        throw "Bad Input. Try force encrypt if intended.";
      }
      TempStr1 = TempStr1 + findtemp; //把找到的原文增加到字符串上
      this.RoundKey(); //轮换密钥
      i++;
    }
    TempStr1 = AddPadding(TempStr1);

    return TempStr1;
  }
}
