/* eslint-disable */
// FIXME
/**
 * 登录认证确认
 *
 * 1）未登录 -> 单点登录附带ticket -> 由API获取token并进行存储；
 *
 * 2）未登录 -> 未附带ticket -> 从登录 TYPE 'SSOLOGIN' -> 跳转至单点登录页面；
 *
 * 3）未登录 -> 从自己登录页面登录 TYPE -> 'LOGIN'：跳转至登录页面；
 *
 * 4）已登录 -> 获取websocketURL -> 渲染页面；
 *
 * @module util/auth
 */

// 登录之后记录登录相关信息
export const storeLogin = style => (tokenInfo) => {
    sessionStorage.setItem('token', tokenInfo.access_token);
    sessionStorage.setItem('tokenType', tokenInfo.token_type);
    sessionStorage.setItem('activeTime', Date.now());
    sessionStorage.setItem('expires_in', tokenInfo.expires_in);
    if (style) {
        sessionStorage.setItem('loginType', style);
    } else {
        sessionStorage.removeItem('loginType');
    }
    localStorage.setItem('refreshToken', tokenInfo.refresh_token);
};

// 清楚登录相关信息
export const clearLogin = () => {
    sessionStorage.clear();
    localStorage.removeItem('refreshToken');
};

// 获取location上？后带的参数
export const oGetVars = new (function getUrlQueryParams(sSearch) {
    const rNull = /^\s*$/;
    const rBool = /^(true|false)$/i;
    const buildValue = (sValue) => {
        if (rNull.test(sValue)) { return null; }
        if (rBool.test(sValue)) { return sValue.toLowerCase() === 'true'; }
        if (isFinite(sValue)) { return parseFloat(sValue); }
        if (isFinite(Date.parse(sValue))) { return new Date(sValue); }
        return sValue;
    };
    if (sSearch.length > 1) {
        for (let aItKey, nKeyId = 0, aCouples = sSearch.substr(1).split('&'); nKeyId < aCouples.length; nKeyId += 1) {
            aItKey = aCouples[nKeyId].split('=');
            this[unescape(aItKey[0])] = aItKey.length > 1 ? buildValue(unescape(aItKey[1])) : null;
        }
    }
})(window.location.search);

// 如果用户活跃时间超过2个小时就退出
const verifyTime = () => {
    if (Date.now() - sessionStorage.activeTime >= sessionStorage.expires_in * 1000) {
        clearLogin();
    }
};

const loggedIn = () => {
    if (typeof sessionStorage.activeTime !== 'undefined') {
        // 验证登录是否超时
        verifyTime();
        return typeof sessionStorage.token !== 'undefined';
    }
    return false;
};

export default loggedIn;
