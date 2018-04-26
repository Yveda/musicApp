<template>
  <div class="player" v-show="playlist.length>0">
   <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
   >
        <div class="normal-player" v-show="fullScreen">
            <div class="background">
                <img width="100%" height="100%" :src="currentSong.image">
            </div>
            <div class="top">
                <div class="back" @click="back">
                    <i class="icon-back"></i>
                </div>
                <!-- 歌曲名称 -->
                <h1 class="title" v-html="currentSong.name"></h1>
                <!-- 歌手名称 -->
                <h2 class="subtitle" v-html="currentSong.singer"></h2>
            </div>
            <!-- 唱片 -->
            <div class="middle"
                @touchstart.prevent="middleTouchStart"
                @touchmove.prevent="middleTouchMove"
                @touchend="middleTouchEnd"
            >
                <div class="middle-l" ref="middleL">
                    <div class="cd-wrapper" ref="cdWrapper">
                        <div class="cd" :class="cdCls">
                            <img :src="currentSong.image" class="image">
                        </div>
                    </div>
                    <div class="playing-lyric-wrapper">
                        <div class="playing-lyric">{{playingLyric}}</div>
                    </div>
                </div>
                <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                    <div class="lyric-wrapper">
                        <div v-if="currentLyric">
                            <p  class="text" 
                                ref="lyricLine" 
                                :class="{'current':currentLineNum === index}"
                                v-for="(line,index) in currentLyric.lines" 
                                :key="index">
                                {{line.txt}}
                            </p>
                        </div>
                    </div>
                </scroll>
            </div>
            <!-- 操作区 -->
            <div class="bottom">
                <!-- 两个小点 -->
                <div class="dot-wrapper">
                    <span class="dot" :class="{'active':currentShow === 'cd'}"></span>  
                    <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>  
                </div>
                <div class="progress-wrapper">
                    <span class="time time-l">{{format(currentTime)}}</span>
                    <div class="progress-bar-wrapper">
                        <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
                    </div>
                    <span class="time time-r">{{format(currentSong.duration)}}</span>
                </div>
                <div class="operators">
                    <div class="icon i-left" @click="changeMode">
                    <i :class="iconMode"></i>
                    </div>
                    <div class="icon i-left" :class="disableCls">
                    <i @click="prev" class="icon-prev"></i>
                    </div>
                    <div class="icon i-center" :class="disableCls">
                    <i @click="togglePlaying" :class="playIcon"></i>
                    </div>
                    <div class="icon i-right" :class="disableCls">
                    <i @click="next" class="icon-next"></i>
                    </div>
                    <div class="icon i-right">
                    <i class="icon-not-favorite"></i>
                    </div>
                </div>
            </div>
        </div> 
   </transition>
    <transition name="mini">
        <div class="mini-player" v-show="!fullScreen" @click="open">
            <!-- 转动的小型唱片图片 -->
            <div class="icon">
                <img :class="cdCls" width="40" height="40" :src="currentSong.image">
            </div>
            <div class="text">
                <h2 class="name" v-html="currentSong.name"></h2>
                <p class="desc" v-html="currentSong.singer"></p>
            </div>
            <div class="control">
                <progress-circle :radius="radius" :percent="percent">
                    <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
                </progress-circle>
            </div>
            <div class="control">
                <i class="icon-playlist"></i>
            </div>
        </div>
    </transition>
    <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
    import {mapGetters,mapMutations} from 'vuex'
    import animations from 'create-keyframe-animation'
    import {prefixStyle} from 'common/js/dom'
    import ProgressBar from 'base/progress-bar/progress-bar'
    import ProgressCircle from 'base/progress-circle/progress-circle'
    import {playMode} from 'common/js/config'
    import {shuffle} from 'common/js/util'
    import Lyric from 'lyric-parser'
    import Scroll from 'base/scroll/scroll'

    const transform = prefixStyle('transform')//下面就可以用transform
    const transitionDuration = prefixStyle('transitionDuration')//滑动添加动画

    export default {
        data(){//注意这里是函数 不是对象，返回一些数据
            return {
                songReady:false,//歌曲准备
                currentTime:0,//当前播放时间
                radius:32,
                currentLyric:null,// 当前歌词
                currentLineNum:0,//当前歌词所在的行
                currentShow:'cd',//两个点当前高亮
                playingLyric:''
            }
        },
        computed:{
            cdCls(){
                return this.playing?'play':'play pause'
            },
            playIcon(){
                return this.playing?'icon-pause':'icon-play'
            },
            iconMode(){//改变播放顺序按钮
                return this.mode === playMode.sequence?'icon-sequence':this.mode === playMode.loop?'icon-loop':'icon-random'
            },
            miniIcon(){
                return this.playing?'icon-pause-mini':'icon-play-mini'
            },
            disableCls(){
                return this.playing?'':'disable'
            },
            percent(){//计算出百分比=当前播放时间/总的时长），然后传入子组件
                return this.currentTime/this.currentSong.duration
            },
            ...mapGetters([//注意是写在计算属性里面的
                'playlist',
                'fullScreen',
                'currentSong',
                'playing',
                'currentIndex',
                'mode',
                'sequenceList'
            ])
        },
        created(){
            this.touch = {}//用来关联touchStart和touchMove
        },
        methods:{
            back(){
                this.setFullScreen(false)//关闭全屏，显示迷你播放界面
            },
            open(){
                this.setFullScreen(true)//关闭迷你播放界面，显示全屏
            },
            enter(el,done){
                const {x,y,scale} = this._getPosAndScale()
                let animation = {
                    0:{
                        transform:`translate3d(${x}px,${y}px,0) scale(${scale})`
                    },
                    60:{
                        transform:`translate3d(0,0,0) scale(1.1)`
                    },
                    100:{//再设置为正常的状态
                        transform:`translate3d(0,0,0) scale(1)`
                    }
                }
                animations.registerAnimation({
                    name:'move',//动画名称
                    animation,//动画
                    presets:{//预设字段
                        duration:400,//设置动画间隔
                        easing:'linear'//缓动
                    }
                })
                animations.runAnimation(this.$refs.cdWrapper,'move',done)//使用这个动画
            },
            afterEnter(){
                animations.unregisterAnimation('move')
                this.$refs.cdWrapper.style.animation = ''
            },
            leave(el,done){
                this.$refs.cdWrapper.style.transition = 'all 0.4s'
                const {x,y,scale} = this._getPosAndScale()
                this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
                this.$refs.cdWrapper.addEventListener('transitionend',done)
            },
            afterLeave(){
                this.$refs.cdWrapper.style.transition = ''
                this.$refs.cdWrapper.style[transform] = ''
            },
            togglePlaying(){
                if(!this.songReady){//如果歌曲没有准备好则返回
                    return
                }
                this.setPlayingState(!this.playing)
                if(this.currentLyric){//使得点击暂停 歌词也暂停
                    this.currentLyric.togglePlay()
                }
            },
            end(){
               if(this.mode === playMode.loop){//如果播放模式为单曲循环
                   this.loop()//执行单曲循环
               }else{
                    this.next()//否则执行播放下一首
               }
            },
            loop(){
                this.$refs.audio.currentTime = 0
                this.$refs.audio.play()
                if(this.currentLyric){//歌曲播放结束的时候，再重新播放，可以看到歌词重新开始了。
                    this.currentLyric.seek(0)
                }
            },
            next(){//点击播放下一首
                if(!this.songReady){//如果歌曲没有准备好则返回
                    return
                }
                if(this.playlist.length ===1){//如果他只有一条歌曲，我们让他调用loop就行
                    this.loop()
                }else{
                    let index = this.currentIndex + 1
                    if(index === this.playlist.length){//考虑到循环播放，当索引为最后一条的时候，变成0
                        index = 0
                    }
                    this.setCurrentIndex(index)//这样index就被修改了，currentSong就发生变化了
                    if(!this.playing){//判断播放状态跟按钮效果保持一致
                        this.togglePlaying()
                    }
                }
                this.songReady = false
            },
            prev(){//点击播放前一首
                if(!this.songReady){//如果歌曲没有准备好则返回
                    return
                }
                if(this.playlist.length ===1){//如果他只有一条歌曲，我们让他调用loop就行
                    this.loop()
                }else{
                    let index = this.currentIndex - 1
                    if(index === -1){//当为最前面一条往后退的时候，索引变为最后一条
                        index = this.playlist.length - 1
                    }
                    this.setCurrentIndex(index)//把这个值提交一个mutation，去修改state
                    if(!this.playing){//判断播放状态跟按钮效果保持一致
                        this.togglePlaying()
                    }
                }
                this.songReady = false
            },
            ready(){
                this.songReady = true
            },
            error(){//网络中断的时候也把songReady设置为true
                this.songReady = true
            },
            updateTime(e){//获取当前播放时间，这个个时间戳
                this.currentTime = e.target.currentTime//target就是audio标签，audio有个currentTime属性，所以就将他赋值给data里面的currentTime
            },
            format(interval){//将时间转化为分和秒的形式。
                interval = interval | 0
                const minute = interval / 60 | 0 //分钟 向下取整
                const second = this._pad(interval % 60) //秒 取余
                return `${minute}:${second}`
            },
            onProgressBarChange(percent){//设置当前播放时间
                const currentTime = this.currentSong.duration * percent
                this.$refs.audio.currentTime = currentTime
                if(!this.playing){
                    this.togglePlaying()
                }
                if(this.currentLyric){
                    this.currentLyric.seek(currentTime*1000)
                }

            },
            changeMode(){//改变播放模式
                const mode = (this.mode + 1) % 3
                this.setPlayMode(mode)//类似于函数调用的去改变他的mode
                let list = null //定义一个列表
                if(mode === playMode.random){//如果当前播放模式为随机播放
                    list = shuffle(this.sequenceList)
                }else{//顺序播放，循环播放
                    list = this.sequenceList
                }
                this.resetCurrentIndex(list)
                this.setPlayList(list)//修改playList
            },
            resetCurrentIndex(list){//重新去设置currentIndex。
                let index = list.findIndex((item)=>{
                    return item.id === this.currentSong.id
                })
                this.setCurrentIndex(index)//设置index
            },
            getLyric(){//获取歌词
                this.currentSong.getLyric().then((lyric)=>{
                    this.currentLyric = new Lyric(lyric,this.handleLyric)
                    if(this.playing){
                        this.currentLyric.play()
                    }
                }).catch(()=>{//当getLytric获取不到歌词的时候 我们要catch做一些清理操作
                    this.currentLyric = null
                    this.playingLyric = ''
                    this.currentLineNum = 0
                })
            },
            handleLyric({lineNum,txt}){//歌词每一行发生改变的时候，他就回调一下,得到当前正在播放的歌词
                this.currentLineNum = lineNum
                if(lineNum>5){//行数大于5的话
                    let lineEl = this.$refs.lyricLine[lineNum - 5]//lineEl是滚动的p元素，lyricLine是个数组
                    this.$refs.lyricList.scrollToElement(lineEl,1000)//获取到这个DOM，滚动到这个p标签，1秒的动画时间
                }else{//如果在行之内，直接滚动到顶部就行
                    this.$refs.lyricList.scrollTo(0,0,1000)
                }
                this.playingLyric = txt//显示当前播放的歌词
            },
            middleTouchStart(e){
                this.touch.initiated= true//设置标志位表示他已经初始化过了
                const touch = e.touches[0]//一个手指
                this.touch.startX = touch.pageX//记录X坐标
                this.touch.startY = touch.pageY//记录Y坐标
            },
            middleTouchMove(e){
                if(!this.touch.initiated){
                    return 
                }
                const touch = e.touches[0]//一个手指,然后就可以拿到他的delta
                const deltaX = touch.pageX - this.touch.startX//横轴坐标
                const delatY = touch.pageY - this.touch.startY//纵轴坐标
                if(Math.abs(delatY>Math.abs(deltaX))){//纵轴滚动的偏差的绝对值大于横轴滚动偏差的绝对值，我们就认为他是个纵向滚动，什么都别做，因为我们只支持横向滚动
                    return 
                }
                const left = this.currentShow === 'cd'? 0 :-window.innerWidth
                const offsetWidth = Math.min(0,Math.max(-window.innerWidth,left+deltaX))
                this.touch.percent = Math.abs(offsetWidth/window.innerWidth)//百分比
                this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
                this.$refs.lyricList.$el.style[transitionDuration] = 0
                this.$refs.middleL.style.opacity = 1-this.touch.percent//percent越大透明度越小
                this.$refs.middleL.style[transitionDuration] = 0
            },
            middleTouchEnd(){
                let offsetWidth
                let opacity
                if(this.currentShow === 'cd'){//意思是从右向左滑的过程，那我只要滑百分之10就可以
                    if(this.touch.percent>0.1){//滑动百分之10的话
                        offsetWidth = -window.innerWidth//最终停留的位置
                        opacity = 0
                        this.currentShow = 'lyric'//整个滑动过来
                    }else{
                       offsetWidth = 0
                       opacity = 1
                    }
                }else{
                    if(this.touch.percent<0.9){//如果滑动超过10%他就要偏移回去
                        offsetWidth = 0
                        this.currentShow = 'cd'
                        opacity = 1
                    }else{//大于0.9也就是没有滑动
                        offsetWidth = -window.innerWidth
                        opacity = 0
                    }
                }
                 const time = 300
                 this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`//设置他的最终位置
                 this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
                this.$refs.middleL.style.opacity = opacity
                this.$refs.middleL.style[transitionDuration] = `${time}ms`
            },
            _pad(num,n = 2){//补零
                let len = num.toString().length//获取传入的字符串长度
                while(len<2){
                    num = '0' + num
                    len ++
                }
                return num
            },
            _getPosAndScale(){
                const targetWidth = 40 //代表小圆圈的宽度
                const paddingLeft = 40 //左边偏移的40像素
                const paddingBottom = 30 //距离底部30像素
                const paddingTop = 80 //大圆圈距离顶部80像素
                const width = window.innerWidth * 0.8 //大圆圈的宽度是屏幕宽度的0.8
                const scale = targetWidth / width //初始缩放比例
                const x = -(window.innerHeight/2-paddingLeft) //初始x坐标
                const y = window.innerHeight - paddingTop - width/2 - paddingBottom
                return {
                    x,
                    y,
                    scale
                }
            },
            //注意里面是一个对象 不是数组。
            ...mapMutations({//注意是写在methods里面
                setFullScreen:'SET_FULL_SCREEN',//映射
                setPlayingState:'SET_PLAYING_STATE',//映射到mutation-types里面的SET_PLAYING_STATE
                setCurrentIndex:'SET_CURRENT_INDEX',
                setPlayMode:'SET_PLAY_MODE',
                setPlayList:'SET_PLAYLIST'
            })
        },
        watch:{
            currentSong(newSong,oldSong){
                if(newSong.id === oldSong.id){//如股新旧两首歌曲id一样则不执行，
                    return
                }
                if(this.currentLyric){//如果有当前歌曲播放则把它停止掉
                    this.currentLyric.stop
                }
               setTimeout(()=>{
                    this.$refs.audio.play()
                    this.getLyric()
               },1000)
            },
            playing(newPlaying){
                const audio = this.$refs.audio
                this.$nextTick(()=>{
                    newPlaying?audio.play():audio.pause()
                })
            }
        },
        components:{//一般注册写在最后面
            ProgressBar,
            ProgressCircle,
            Scroll
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>