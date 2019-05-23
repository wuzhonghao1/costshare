function env() {
    if (process.env.REACT_APP_ENV === 'local') {
        // 本地在dev获取token信息
        return {
            ENV: 'local',
            GETEWAY_BASE: 'https://xin-sandbox.asiainfo.com:16020', // 无API API version 请求
            APIROOT: 'https://xin-sandbox.asiainfo.com:16020/api', // 新版本网关
            APIVERSION: 'v1.0.0', // API version
            SSO: {
                redirect_url: 'http://localhost:3000',
                out_web_url: 'https://xin-sandbox.asiainfo.com:14603/webapps/ai-crm-web',
                client_id: 'localhost',
                client_secret: 'localhost'
            }
        }
    } else if (process.env.REACT_APP_ENV === 'uat') {
        // 本地开发环境（准生产,uat）
        return {
            ENV: 'uat',
            GETEWAY_BASE: 'https://gateway-uat.asiainfo.com:9443', // 无API API version 请求
            APIROOT: 'https://gateway-uat.asiainfo.com:9443/api', // 新版本网关
            APIVERSION: 'v1.0.0', // API version
            SSO: {
                redirect_url: 'https://xin-uat.asiainfo.com/webapps/ai-crm-customer-web',
                out_web_url: 'https://xin-uat.asiainfo.com/webapps/ai-crm-web',
                client_id: 'a4821666eae8ab76ee9103691a8c5f3b',
                client_secret: 'e31dfbe7a745854ec8c7e68c118e0f90'
            }
        }
    } else if (process.env.REACT_APP_ENV === 'dev') {
        // 测试（沙箱，dev ）
        return {
            ENV: 'dev',
            GETEWAY_BASE: 'https://xin-sandbox.asiainfo.com:16020', // 无API API version 请求
            APIROOT: 'https://xin-sandbox.asiainfo.com:16020/api', // 新版本网关
            APIVERSION: 'v1.0.0', // API version
            SSO: {
                redirect_url: 'https://xin-dev.asiainfo.com/webapps/ai-crm-customer-web/',
                out_web_url: 'https://xin-sandbox.asiainfo.com:14603/webapps/ai-crm-web',
                client_id: 'a4821666eae8ab76ee9103691a8c5f3b',
                client_secret: 'e31dfbe7a745854ec8c7e68c118e0f90'
            }
        }
    } else {
        // 生产 process.env.REACT_APP_ENV === 'production'
        return {
            ENV: 'production',
            GETEWAY_BASE: 'https://karagw-inner.asiainfo.com', // 无API API version 请求
            APIROOT: 'https://karagw-inner.asiainfo.com/api',
            APIVERSION: 'v1.0.0', // API version
            SSO: {
                redirect_url: 'https://crm.asiainfo.com/webapps/ai-crm-customer-web',
                out_web_url: 'https://crm.asiainfo.com/webapps/ai-crm-web',
                client_id: 'a4821666eae8ab76ee9103691a8c5f3b',
                client_secret: 'e31dfbe7a745854ec8c7e68c118e0f90'
            }
        }
    }
}

export default env()