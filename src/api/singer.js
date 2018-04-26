import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'

export function getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'

  const data = Object.assign({}, commonParams, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq'
  })

  return jsonp(url, data, options)
}

export function getSingerDetail(singerId) {//根据不同的singerid去抓取不同的数据
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'

  const data = Object.assign({}, commonParams, {
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    order: 'listen',
    begin: 0,
    num: 80,
    songstatus: 1,
    singermid:singerId,
  })

  return jsonp(url, data, options)
}

// export function getSingerDetailvkey(songmid) {
//   const url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg'

//   const data = Object.assign({}, commonParams, {
//     g_tk:1383082549,
//     jsonpCallback:MusicJsonCallback8997424576353383,
//     loginUin:2683161248,
//     hostUin:0,
//     format:json,
//     inCharset:utf8,
//     outCharset:utf-8,
//     notice:0,
//     platform:yqq,
//     needNewCode:0,
//     cid:205361747,
//     callback:MusicJsonCallback8997424576353383,
//     uin:2683161248,
//     songmid:songmid,
//     filename:C40+songmid.m4a,
//     guid:921666440
//   })

//   return jsonp(url, data, options)
// }
