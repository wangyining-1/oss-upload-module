import request from '@/router/axios'
let OSS = require('ali-oss');
let client;

function getInOutByPersonId() {

    return request({
        url: '/iwopbase/auth/getAuth',
        method: 'get',
    })
}


// oss分片上传
export const put = async (ObjName, fileUrl, progressFun, moduleName) => {
    var result = null;
    let year = new Date().getFullYear();
    let month = new Date().getMonth()+1;
    let day = new Date().getDate();
    //这个接口是用来获取临时授权配置信息的接口   如需配置永久授权注释此接口即可
   await getInOutByPersonId().then( async res => {
        let configInfo = res.data.data;
        client = new OSS({
            region: `oss-${configInfo.regionId}`,
            //云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
            accessKeyId: configInfo.accessKeyId,
            accessKeySecret: configInfo.accessKeySecret,
            bucket: configInfo.bucketName,
            stsToken:configInfo.securityToken
        })

        result = await client.multipartUpload(`ossFile/${moduleName}/${year}/${month}/${day}/${ObjName}`, fileUrl, progressFun)
    })
    return result



}

// 暂停上传
export function cancelApi() {
    return client.cancel()
}
