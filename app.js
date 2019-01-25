/**
 * MWeb使用腾讯云存储COS作为图床
 * 利用COS API，用nodejs作为server上传图片，添加至MWeb的配置中即可
 * 2019-01-25
 * author: ludis
 * github: https://github.com/flute/Mweb_tencet_cos
 * COS Doc: https://cloud.tencent.com/document/product/436/8629
 */

const express = require('express');
// form表单需要的中间件。
const mutipart = require('connect-multiparty');
//  Tecent COS
const COS = require('cos-nodejs-sdk-v5');

const config = {
  // 本地文件临时路径
  temporaryUploadDir: './temporary',
  // node服务启动端口
  defaultPort: 3000,
  // 到 控制台密钥管理 获取您的项目 SecretId 和 SecretKey。
  // https://console.cloud.tencent.com/capi
  secretId: 'AKIDsipmK32L..XXXXX..OuOtbSDFpair',
  secretKey: 'VzSwGaimpHj..XXXXX..IoQAn1FMMSVcUz',
  // 到 COS 对象存储控制台 创建存储桶，得到 Bucket（存储桶名称） 和 Region（地域名称）。
  // https://console.cloud.tencent.com/cos4
  bucket: 'ludis-1252396698',
  region: 'ap-beijing',
  // 文件上传后的路径前缀，如上传 test.png 后存储的目录为 ghost/flutter/test.png
  preUrl: 'ghost/images/flutter',
  // 文件上传后的域名
  // 上传成功默认域名： ludis-1252396698.cos.ap-beijing.myqcloud.com
  // 实用万象优图，处理图片
  // 默认图片处理域名： ludis-1252396698.picbj.myqcloud.com
  // 使用cdn加速域名：  ludis-1252396698.image.myqcloud.com
  domain: 'ludis-1252396698.image.myqcloud.com',
  // 图片处理规则，没有可为空
  rule: '!ghost'
}

// 使用永久密钥创建实例
const cos = new COS({
  SecretId: config.secretId,
  SecretKey: config.secretKey
});

const mutipartMiddeware = mutipart();
const app = express();

app.use(mutipart({
  uploadDir: config.temporaryUploadDir
}));
app.set('port', process.env.PORT || config.defaultPort);
app.listen(app.get('port'), function () {
  console.log(`Express started on http://localhost: ${app.get('port')} ; press Ctrl-C to terminate.`);
});

app.post('/upload', mutipartMiddeware, (req, res) => {
  // 获取文件名、路劲（临时路劲）
  const {
    name,
    path
  } = req.files.file
  // 上传
  upload(name, path, url => {
    if (url) res.json({
      url: url
    })
    else res.send('upload failed!')
  })
});

const upload = (name, path, callback) => {
  // 分片上传
  cos.sliceUploadFile({
    Bucket: config.bucket,
    Region: config.region,
    Key: `${config.preUrl}/${name}`,
    FilePath: path
  }, function (err, data) {
    console.log(err, data);
    if (err) {
      callback(null)
    } else {
      callback(`https://${config.domain}/${data.Key}${config.rule}`)
    }
  });
}
