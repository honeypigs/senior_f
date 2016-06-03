'use strict';
/**
 * logic
 * @param  {} []
 * @return {}     []
 */
export default class extends think.logic.base {
  /**
   * index action logic
   * @return {} []
   */
  async indexAction () {
    await this.initUserData();
  }
  async initUserData () {
    let service = think.service('weidata');
    let weidata = new service();
    
    let openid = await this.session('openid'),
        // stuNum = await this.session('stuNum'),
        care = await this.session('care'),
        inf = await this.session('inf');
    let jsSdk = await weidata.getJsSdk(this);
    jsSdk && this.assign('jssdk', jsSdk);
    if (!openid) {
      openid = await weidata.getOpenid(this);
      if (openid && openid.data) {
        openid = openid.data['openid'];
        await this.session('openid', openid);
      }  
    }
    if (openid) {
      // if (!stuNum) {
      //   stuNum = await weidata.getBindVerify();
      //   if (stuNum && stuNum.status === 200) {
      //     await this.session('stuNum', stuNum.stuId);
      //   }
      // }
      if (!care) {
        care = await weidata.getOpenidVerify(openid);
        if (care && care.status === 200) {
          await this.session('care', 1);
        }
      }
      if (!inf) {
        inf = await weidata.getUserInf(openid);
        console.log(inf.data);
        if (inf && inf.status === 200) {
          await this.session('inf', inf.data.headimgurl);
          inf && this.assign('userInfo', inf);
        }
      }
    }
  }
}