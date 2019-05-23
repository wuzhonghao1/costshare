import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
// import './assets/css/index.css';
import App from './components/App';
import { Router, Route, Switch } from 'react-router-dom';
// 组件库样式
import 'antd/dist/antd.less';
import { LocaleProvider } from 'antd';
// 中文
import zhCN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'normalize.css';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
// http请求中间件
import requestMiddleware from './http/reduxhttp/reduxRequestMiddleware';
// 数据路由同步
import {routerMiddleware } from 'react-router-redux';
import { createBrowserHistory } from 'history';
// 引用reducers
import rootReducer from './reducers/index';
// 引用登录验证和网关token获取
import login, { storeLogin, oGetVars } from './http/auth'
import ENV from './config/env'
// 地址重定向获取网关token
const ssoUrl = `${ENV.GETEWAY_BASE}/xin/sso/authorize?client_id=${ENV.SSO.client_id}&scope=all&state=oa&response_type=code&redirect_uri=${ENV.SSO.redirect_url}`;

moment.locale('zh_CN');
let localLang = zhCN;

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;
const history = createBrowserHistory({
    basename:"/"
}); // 浏览器history对象
const middleware = [thunk, routerMiddleware(history), requestMiddleware]; // 中间件
const enhancer = composeEnhancers(applyMiddleware(...middleware));
const store = createStore(
    rootReducer,
    enhancer,
);

function DomRender() {
    ReactDOM.render(
        <LocaleProvider locale={localLang}>
            <Provider store={store}>
                    <Router history={history}>
                        <Switch>
                            <Route path="/" component={App} />
                            <Route component={App} />
                        </Switch>
                    </Router>
            </Provider>
        </LocaleProvider>
        , document.getElementById('root'));
}
// DomRender();

async function bootstrap() {
    // 已登陆
    if (login()) {
        DomRender();
        return;
    }
    if (typeof oGetVars.code !== 'undefined') {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                const ssologin = JSON.parse(xhr.response)
                if (!ssologin.error) {
                    // 登录成功 -> 存储好token数据跳转到主页面
                    storeLogin('SSOLOGIN')(ssologin);
                    let commingUrl = localStorage.commingUrl;
                    localStorage.removeItem('commingUrl');
                    commingUrl = commingUrl && !commingUrl.includes('?code=') ? commingUrl : '';
                    commingUrl = commingUrl.replace(ENV.SSO.redirect_url, '');
                    commingUrl = commingUrl.replace('/webapps/ai-crm-web', ''); //本地开发专用 本地开发重定向地址不含路径
                    history.push({
                        pathname: commingUrl,
                    });
                }
            }
        }
        xhr.open('GET', `${ENV.GETEWAY_BASE}/xin/oauth2/token?client_id=${ENV.SSO.client_id}&client_secret=${ENV.SSO.client_secret}&grant_type=authorization_code&code=${String(oGetVars.code)}`, false);
        xhr.send()
        DomRender();
        return;
    }

    //没有登陆，在跳转到登陆之前记录地址，首页不记录
    if (window.location.href !== ENV.SSO.redirect_url && window.location.href !== `${ENV.SSO.redirect_url}/`) {
        localStorage.commingUrl = window.location.href;
    }

    window.location.href = ssoUrl;
}

export default bootstrap();