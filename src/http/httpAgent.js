import superagentPromise from 'superagent-promise';
import _superagent from 'superagent';
import promise from 'promise'
import { storeLogin, clearLogin } from './auth';
import ENV from '../config/env'
import { tost } from '@/ui'
const Promise = promise;
const superagent = superagentPromise(_superagent, Promise);

const handleErrors = async (err, apiRoot, apiVersion, nextParams) => {
    if (err && err.response && err.response.status === 401) {
        // 如果401 登录过期，重新刷新token 并再次请求接口
        if (window.refreshing === '1') {
            // 多个接口并发时 token 失效，并同时刷新tokn的情况
            async function waitToken() {
                return new Promise((resolve) => {
                    const tryNewToken = setInterval(() => {
                        if (Date.now() - sessionStorage.activeTime < 5000) {
                            // activeTime 获取token的时间 在5秒内 证明有最新的token
                            clearInterval(tryNewToken)
                            resolve('ok')
                        }
                    }, 300)
                });
            }

            return waitToken().then(
                (res) => {
                    if (nextParams.type === 'get') {
                        return superagent
                            .get(nextParams.url)
                            .use((req) => {
                                tokenPlugin(req, nextParams.header)
                            })
                            .then(res => responseBody(res, nextParams.backParams))
                    } else if (nextParams.type === 'post') {
                        return superagent
                            .post(nextParams.url, nextParams.body)
                            .use((req) => {
                                tokenPlugin(req, nextParams.header)
                            })
                            .then(res => responseBody(res, nextParams.backParams))
                    }
                }
            )
        }
        window.refreshing = '1' // 开始 刷新token
        return superagent
            .get(getUrl(apiRoot, `/auth/refreshtoken?client_id=${ENV.SSO.client_id}&client_secret=${ENV.SSO.client_secret}&refreshToken=${localStorage.refreshToken}`, apiVersion))
            .use((req) => {
                req.set('Content-Type', 'application/json');
            })
            .end(err2 => {
                window.refreshing = '0' // 刷新结束
                if (err2) {
                    // 刷新token接口错误 重新登录
                    clearLogin()
                    tost({ type: 'error', msg: '登录过期', link: { text: '请重新登录', href: '/webapps/ai-crm-customer-web' }, time: 60 * 30 })
                }
            })
            .then(res => {
                window.refreshing = '0' // 刷新结束
                const result = responseBody(res)
                if (result && result.resultCode === '000000') {
                    // 登录成功
                    storeLogin('REFRESH_LOGIN')(result.tokenInfo);
                    if (nextParams.type === 'get') {
                        return superagent
                            .get(nextParams.url)
                            .use((req) => {
                                tokenPlugin(req, nextParams.header)
                            })
                            .then(res => responseBody(res, nextParams.backParams))
                    } else if (nextParams.type === 'post') {
                        return superagent
                            .post(nextParams.url, nextParams.body)
                            .use((req) => {
                                tokenPlugin(req, nextParams.header)
                            })
                            .then(res => responseBody(res, nextParams.backParams))
                    }
                } else {
                    // 刷新token失败 重新登录
                    clearLogin()
                    tost({ type: 'error', msg: '登录过期', link: { text: '请重新登录', href: '/webapps/ai-crm-customer-web' }, time: 60 * 30 })
                }
            })
    } else {
        // 接口其它错误
        // 其它错误 返回错误信息
        return err.response && err.response.body ? err.response.body : err;
    }
    //return err;
};

const responseBody = (res, backParams) => {
    if (backParams) {
        return { ...res.body, backParams } || { ...JSON.parse(res.text), backParams }
    } else {
        return res.body || JSON.parse(res.text)
    }
};

const tokenPlugin = (req, header) => {
    req.set('Authorization', `bearer ${sessionStorage.token}`);
    req.set('i18n_language', `zh_CN`);
    req.set('Content-Type', `application/json`);
    if (header) {
        for (const key in header) {
            req.set(key, header[key]);
        }
    }
};

const getUrl = (apiRoot, url, apiVersion, version) => {
    if (/^http/.test(url)) {
        return url
    }
    return `${apiRoot}/${version ? version : apiVersion}${url}`
}

const requests = (apiRoot, apiVersion) => {
    return {
        get: (url, backParams, version, header) =>
            superagent
                .get(getUrl(apiRoot, url, apiVersion, version))
                .use((req) => {
                    tokenPlugin(req, header)
                })
                .then(
                    res => {
                        return responseBody(res, backParams)
                    },
                    err => {
                        const nextUrl = getUrl(apiRoot, url, apiVersion, version)
                        const nextParams = {
                            type: 'get',
                            url: nextUrl,
                            header,
                            backParams
                        }
                        return handleErrors(err, apiRoot, apiVersion, nextParams).then(
                            suc => suc,
                            err => err
                        )
                    } // err
                ),//then
        post: (url, body, backParams, version, header) =>
            superagent
                .post(getUrl(apiRoot, url, apiVersion, version), body)
                .use((req) => {
                    tokenPlugin(req, header)
                })
                .then(
                    res => responseBody(res, backParams),
                    err => {
                        const nextUrl = getUrl(apiRoot, url, apiVersion, version)
                        const nextParams = {
                            type: 'post',
                            url: nextUrl,
                            header,
                            body,
                            backParams
                        }
                        return handleErrors(err, apiRoot, apiVersion, nextParams).then(
                            suc => suc,
                            err => err
                        )
                    } // err
                ),//then
    }
};

export default requests
