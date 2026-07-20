const TRANSLATIONS = {
  "青制服": "Blue Uni",
  "黒制服": "Black Uni",
  "派手な服": "Loud Outfit",
  "体操服": "Gym Wear",
  "Tシャツ": "T-Shirt",
  "キャンセル": "Cancel",

  "スクール水着": "School Swimsuit",
  "グリーンブラ": "Green Bra",
  "ピンクブラ": "Pink Bra",
  "マイクロビキニ": "Micro Bikini",
  "ばんそうこう": "Band-Aid",

  "黒制服スカート": "Black Uniform Skirt",
  "制服スカート": "Uniform Skirt",
  "黒のスカート": "Black Skirt",
  "ブルマ": "Bloomers",
  "デニム": "Denim",

  "スパッツ": "Leggings",
  "ローライズショーツ": "Low-Rise Shorts",

  "目隠し": "Blindfold",
  "首輪": "Collar",
  "ねこみみ": "Cat Ears",
  "長髪ウィッグ": "Long Hair Wig",
  "さるぐつわ": "Gag",
  "黒タイツ": "Black Tights",

  "ボイス": "Voice",
  "全体音量": "Total Volume",
  "終了": "Exit",

  "スタート": "Start",
  "コンティニュー": "Continue",

  "深刻なエネルギー不足により": "Due to a severe energy shortage",
  "世界は滅亡寸前の状況に陥っていた。": "the world was on the brink of collapse.",
  "あらゆる対策が実を結ばずに終わった時": "When every countermeasure failed to bear fruit",
  "人類の中に未知の突然変異を遂げた個体が現れた。": "an unknown mutation emerged within humanity.",
  "その特徴とは、感情の昂ぶりに伴い電気を発生させるという性質。": "Its defining trait: generating electricity when emotions surge.",
  "そして、何をしても息絶えることのない不死身の肉体。": "And a body that can never die, no matter what.",
  "それらの特徴が確認された後、その条件に当てはまる個体＝変異体は": "Those who met these criteria — the mutants —",
  "速やかに人権を奪われ、極秘施設に収容された。": "were swiftly stripped of rights, confined to a secret facility.",
  "滅びかけた世界をよみがえらせるためには、唯一の発電機でもある": "To save this dying world, one must rely on the sole power source",
  "変異体たちからエネルギーを得なければならない。": "and draw energy from the mutants themselves.",
  "たとえ、どんな手段を用いようとも…": "Even if it means resorting to any means...",
};

const fae1=new TextEncoder();
function fae2(fae3){return fae1.encode(fae3);}
function fae4(fae5){
  const fae6=[];
  for(let [fae7,fae8] of Object.entries(fae5)){
    let fae9=fae2(fae7),fae10=fae2(fae8);
    if(fae10.length>fae9.length){
      let fae11=fae8;
      while(fae2(fae11).length>fae9.length)fae11=fae11.slice(0,-1);
      fae8=fae11;fae10=fae2(fae8);
    }
    const fae12=new Uint8Array(fae9.length);
    fae12.set(fae10);
    fae6.push({jp:fae7,en:fae8,jpBytes:fae9,target:fae12});
  }
  fae6.sort((fae13,fae14)=>fae14.jpBytes.length-fae13.jpBytes.length);
  return fae6;
}
let fae15=fae4(TRANSLATIONS);
let fae16=new Map();
function fae17(){
  fae16=new Map();
  for(const fae18 of fae15){
    const fae19=fae18.jpBytes.length>=2?(fae18.jpBytes[0]|(fae18.jpBytes[1]<<8)):fae18.jpBytes[0];
    if(!fae16.has(fae19))fae16.set(fae19,[]);
    fae16.get(fae19).push(fae18);
  }
}
fae17();
let fae20=false,fae21=0,fae22=performance.now(),fae23=0;
const fae24=2*1024*1024;
let fae45=null;

function fae25(fae26,fae27,fae28){
  let fae29=fae27;
  for(;fae29<fae28-1;fae29++){
    const fae30=fae26[fae29]|(fae26[fae29+1]<<8);
    const fae31=fae16.get(fae30);
    if(!fae31)continue;
    for(const fae32 of fae31){
      const fae33=fae32.jpBytes.length;
      if(fae29+fae33>fae26.length)continue;
      let fae34=true;
      for(let fae35=2;fae35<fae33;fae35++){
        if(fae26[fae29+fae35]!==fae32.jpBytes[fae35]){fae34=false;break;}
      }
      if(fae34){fae26.set(fae32.target,fae29);fae23++;break;}
    }
  }
  return fae29;
}
function fae36(fae37){
  if(typeof Module==="undefined"||!Module.HEAPU8){fae39();return;}
  const fae38=Module.HEAPU8;
  if(fae38.length===0){fae39();return;}
  
  if(fae38.buffer!==fae45){
    fae45=fae38.buffer;
    fae21=0;
    fae22=performance.now();
    fae23=0;
  }

  if(fae21>=fae38.length){fae21=0;fae22=performance.now();fae23=0;}
  const fae40=Math.min(fae21+fae24,fae38.length);
  fae21=fae25(fae38,fae21,fae40);
  fae39();
}
function fae39(){
  if("requestIdleCallback" in window){requestIdleCallback(fae36,{timeout:200});}
  else{setTimeout(()=>fae36(null),50);}
}
function fae41(){
  if(fae20)return;
  fae20=true;
  fae39();
}
window.addTranslation=function(fae42,fae43){
  TRANSLATIONS[fae42]=fae43;
  fae15=fae4(TRANSLATIONS);
  fae17();
};
window.startTranslationPatch=fae41;
const fae44=setInterval(()=>{
  if(typeof Module!=="undefined"&&Module.HEAPU8){clearInterval(fae44);fae41();}
},250);
