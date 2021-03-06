import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

function findIndex(list,song){
    return list.findIndex((item)=>{
        return item.id === song.id//这样就找到了这首歌在randomList的索引
    })
}

export const selectPlay = function ({commit,state},{list,index}){//这个方法传两个对象值
    commit(types.SET_SEQUENCE_LIST,list)//选择顺序播放
    if(state.mode === playMode.random){//如果当前播放模式为random，则进行洗牌
        let randomList = shuffle(list)
        commit(types.SET_PLAYLIST,randomList)//提交随机播放列表
        index = findIndex(randomList,list[index])
    }else{
        commit(types.SET_PLAYLIST,list)//提交顺序播放列表
    }
    commit(types.SET_CURRENT_INDEX,index)//播放的索引，就是我们点的第几首歌
    commit(types.SET_FULL_SCREEN,true)//打开播放器
    commit(types.SET_PLAYING_STATE,true)//播放状态
}

export const randomPlay = function ({commit}, {list}) {
    commit(types.SET_PLAY_MODE, playMode.random)//播放模式为random
    commit(types.SET_SEQUENCE_LIST, list)//选择顺序播放
    let randomList = shuffle(list)//将list进行洗牌成rondom
    commit(types.SET_PLAYLIST, randomList)//这边是randomList不是list
    commit(types.SET_CURRENT_INDEX, 0)//从randomList第一个开始播放
    commit(types.SET_FULL_SCREEN, true)//打开播放器
    commit(types.SET_PLAYING_STATE, true)//播放状态
  }

  export const insertSong = function ({commit, state}, song) {
    let playlist = state.playlist.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
    // 记录当前歌曲
    let currentSong = playlist[currentIndex]
    // 查找当前列表中是否有待插入的歌曲并返回其索引
    let fpIndex = findIndex(playlist, song)
    // 因为是插入歌曲，所以索引+1
    currentIndex++
    // 插入这首歌到当前索引位置
    playlist.splice(currentIndex, 0, song)
    // 如果已经包含了这首歌
    if (fpIndex > -1) {
      // 如果当前插入的序号大于列表中的序号
      if (currentIndex > fpIndex) {
        playlist.splice(fpIndex, 1)
        currentIndex--
      } else {
        playlist.splice(fpIndex + 1, 1)
      }
    }
  
    let currentSIndex = findIndex(sequenceList, currentSong) + 1
  
    let fsIndex = findIndex(sequenceList, song)
  
    sequenceList.splice(currentSIndex, 0, song)
  
    if (fsIndex > -1) {
      if (currentSIndex > fsIndex) {
        sequenceList.splice(fsIndex, 1)
      } else {
        sequenceList.splice(fsIndex + 1, 1)
      }
    }
  
    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
  }