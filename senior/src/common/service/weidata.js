'use strict';
import request from 'request';
import crypto from 'crypto';

export default class extends think.service.base {
  init(...args){
    super.init(...args);
  }
  async getJsSdk (self) {
    const URL = 'http://hongyan.cqupt.edu.cn/MagicLoop/index.php?s=/addon/Api/Api/apiJsTicket';
    const DATA = getData();
    let RES_INF;
    try {
      if (global.jsTicketCache && global.jsTicketCache.expire < +new Date()) {
        RES_INF = global.jsTicketCache.data;
      } else {
        RES_INF = await requestPost(URL, DATA);
        global.jsTicketCache = {
          data: RES_INF,
          expire: parseInt(RES_INF['expire']) * 1000 + (+new Date())
        }
      }
      RES_INF.timeStamp = DATA.timestamp;
      RES_INF.str = DATA.string;
      RES_INF.appid = 'wx81a4a4b77ec98ff4';
      RES_INF.signature = hash(`jsapi_ticket=${RES_INF.data}&noncestr=${RES_INF.str}&timestamp=${RES_INF.timeStamp}&url=${'http://' + 'hongyan.cqupt.edu.cn' + self.http.req.url}`, 'sha1');
      return RES_INF;
    } catch (e) { 
      return false;
    }
  }
  async getOpenid (self) {
    let redirect_uri = 'http://hongyan.cqupt.edu.cn/' + self.http.req.url;
    redirect_uri = UrlEncode(redirect_uri);
    const APPID = 'wx81a4a4b77ec98ff4';
    const URL = 'http://hongyan.cqupt.edu.cn/MagicLoop/index.php?s=/addon/Api/Api/webOauth';
    const LOCATION = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APPID}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_userinfo&state=sfasdfasdfefvee#wechat_redirect`;
    let code = self.get('code');
    if (code) {
      const DATA = getData(null, code);
      try {
        const RES_INF = await requestPost(URL, DATA);
        return RES_INF;
      } catch (e) {
        return false;
      }
    } else {
      self.http.res.writeHead('307', {'Location': LOCATION});
      self.http.res.end();
    }
  }
   /**
   * 该方法通过openid查询该人是否绑定了学号
   */
  async getBindVerify (openid) {
    const URL = 'http://hongyan.cqupt.edu.cn/MagicLoop/index.php?s=/addon/Api/Api/bindVerify';
    const DATA = getData(openid); 
    try {
      const RES_INF = await requestPost(URL, DATA);
      return RES_INF;
    } catch (e) {
      return false;
    }
  }
  /**
   * 该方法通过openid查询该人是否关注
   */
  async getOpenidVerify (openid) {
    const URL = 'http://hongyan.cqupt.edu.cn/MagicLoop/index.php?s=/addon/Api/Api/openidVerify';
    const DATA = getData(openid); 
    try {
      const RES_INF = await requestPost(URL, DATA);
      return RES_INF;
    } catch (e) {

    }
  }
   /**
   * 该方法通过openid查询该人信息
   */
  async getUserInf (openid) {
    const URL = 'http://hongyan.cqupt.edu.cn/MagicLoop/index.php?s=/addon/Api/Api/userinfo';
    const DATA = getData(openid); 
    try {
      const RES_INF = await requestPost(URL, DATA);
      return RES_INF;
    } catch (e) {
      return false;
    }
  }
}
function makeStr () {
  let sStr = 'abcdefghijklmnopqistuvwxyz0123456789ABCDEFGHIGKLMNOPQISTUVWXYZ';
  let rStr = '';
  for (let i = 0; i < 16; i++) {
    rStr += sStr[selectFrom(0,61)];
  }
  return rStr;
}
function selectFrom (lower, upper) {
  let choices = upper - lower + 1;
  return Math.floor(Math.random() * choices + lower);
}
function hash (str, type) {
  let hashObj = crypto.createHash(type);
  hashObj.update(str);
  return hashObj.digest('hex');
}
function requestPost (url,data) {
  return new Promise(function (resolve, reject) {
    request.post(url, {form: data}, function (err, res, body) {
      if (err) {
        reject(err);
      } else {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e)
        }
      }
    })
  })
}
function getData (openid, code) {
  const token = 'gh_68f0a1ffc303';
  const timeStamp = Math.floor(new Date().getTime()).toString();
  const str = makeStr();
  const secret = hash(hash(timeStamp, 'sha1') + hash(str, 'md5') + 'redrock', 'sha1');
  const data = {
      "timestamp": timeStamp,
      "string": str,
      "secret": secret,
      "token": token,
  };
  if (code) {
    data.code = code;
  } else if (openid) {
    data.openid = openid;
  }
  return data;
}
function str2asc(str){
  return str.charCodeAt(0).toString(16);
}
function asc2str(str){
  return String.fromCharCode(str);
}
function UrlEncode(str){ 
  var ret = ""; 
  var strSpecial="!\"#$%&'()*+,/:;<=>?[]^`{|}~%"; 
  var tt = ""; 
  for (var i = 0, len = str.length; i < len; i++) { 
    var chr = str.charAt(i); 
    var c = str2asc(chr); 
    tt += chr + ":" + c + "n"; 
  if (parseInt("0x" + c) > 0x7f) { 
    ret += "%" + c.slice(0,2) + "%" + c.slice(-2); 
  } else { 
    if (chr == " ") 
      ret += "+"; 
    else if (strSpecial.indexOf(chr) != -1) 
      ret += "%" + c.toString(16); 
    else 
      ret += chr; 
    } 
  } 
  return ret; 
} 