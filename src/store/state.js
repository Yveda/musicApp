import {playMode} from 'common/js/config'

const state = {
    singer:{},
    playing:false,//播放状态，暂停或者播放，默认暂停
    fullScreen:false,//播放器展开和收起,默认false
    playlist:[],//播放列表
    sequenceList:[],//顺序列表
    mode:playMode.sequence,//默认顺序播放
    currentIndex:-1,//当前播放索引
    disc:{},
    topList:{}
}
export default state