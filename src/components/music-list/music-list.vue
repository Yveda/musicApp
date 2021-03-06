<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div ref="playBtn" class="play" v-show="songs.length>0" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="scroll" :data="songs" class="list" ref="list" :probe-type="probeType" :listen-scroll="listenScroll">
        <div class="song-list-wrapper">
            <song-list :rank="rank" @select="selectItem" :songs="songs"></song-list>
        </div>
        <div class="loading-container" v-show="!songs.length">
            <loading></loading>
        </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
   import Scroll from 'base/scroll/scroll' 
   import SongList from 'base/song-list/song-list'
   import {prefixStyle} from 'common/js/dom'
   import Loading from 'base/loading/loading'
   import {mapActions} from 'vuex'
    import {playlistMixin} from 'common/js/mixin' //引入Mixin 

    const RESERVED_HEIGHT = 40
    const transform = prefixStyle('transform')
    const backdrop = prefixStyle('backdrop-filter')

  export default{
       mixins: [playlistMixin],  
      props:{//接收传入的数据
          bgImage:{
              type:String,
              default:''//默认为空
          },
          songs:{
              type:Array,
              default:''
          },
          title:{
              type:String,
              default:''
          },
            rank: {
                type: Boolean,
                default: false
            }
      },
      data(){
          return {
              scrollY:0
          }
      },
      computed:{
          bgStyle(){
              return `background-image:url(${this.bgImage})`
          }
      },
      created(){
          this.probeType = 3
          this.listenScroll = true
      },
      mounted(){
          this.imageHeight = this.$refs.bgImage.clientHeight//最大滚动高度
          this.minTranslateY = -this.imageHeight+RESERVED_HEIGHT//最小滚动高度
          this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
      },
      methods:{
          handlePlaylist(playlist) {
                 console.log(this.playList)  
            const bottom = playlist.length > 0 ? '60px' : ''
            this.$refs.list.$el.style.bottom = bottom
            this.$refs.list.refresh()
         },
          scroll(pos){
              this.scrollY = pos.y
          },
          back(){//点击 back返回上一级
            this.$router.back()
          },
          selectItem(item,index){
              this.selectPlay({
                  list:this.songs,
                  index
              })
          },
          random(){//这样就实现了随机播放   
          console.log(this.songs)
              this.randomPlay({
                  list:this.songs
              })
          },
          ...mapActions([//记得加引号
              'selectPlay',
              'randomPlay'
          ])
      },
      watch:{
          scrollY(newY){
              let translateY = Math.max(this.minTranslateY,newY)
              let zIndex = 0
              let scale = 1 //缩放 默认为1
              let blur = 0//模糊效果
              this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
              const percent = Math.abs(newY / this.imageHeight)
              if(newY>0){//往下拉的时候，计算他的scale是多少。
                scale = 1+percent
                zIndex = 10
              }else{
                  blur = Math.min(20*percent,20)//Math.min返回参数中最小的数，最大20模糊
              }
              this.$refs.filter.style[backdrop] = `blur(${blur}px)`
              if(newY < this.minTranslateY){//滚动到顶部的时候
                  zIndex = 10
                  this.$refs.bgImage.style.paddingTop = 0
                  this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
                  this.$refs.playBtn.style.display = 'none'
              }else{//还没滚动到那个位置的时候或者说往下滚的时候把它重置回去，下面就是一开始默认的样式
                  this.$refs.bgImage.style.paddingTop = '70%'
                  this.$refs.bgImage.style.height = 0
              }
              this.$refs.bgImage.style.zIndex = zIndex
              this.$refs.bgImage.style[transform] = `scale(${scale})`
          }
      },
      components:{
          Scroll,
          SongList,
          Loading
      }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
     
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>