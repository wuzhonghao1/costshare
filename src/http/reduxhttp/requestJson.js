import invokeApi from './index';
import ENV from '../../config/env'
// eslint-disable-next-line import/prefer-default-export
export const requestJson = invokeApi({
    prefixG: `${ENV.APIROOT}/`,
    version: `${ENV.APIVERSION}`,
}, {
        /**
         * 获取token
         * @returns {*}
         */
        getToken() {
            return {
                token: `bearer ${sessionStorage.token}`,
                refreshToken: sessionStorage.getItem('refreshToken'),
            }
        },
        /**
         * 获取token失败后
         * @returns {*}
         */
        authRefused() {
            console.error('错误：授权失败，请重新登陆');
        },
    });
