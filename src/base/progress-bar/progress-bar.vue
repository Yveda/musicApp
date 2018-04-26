<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
          @touchstart.prevent="progressTouchStart"
          @touchmove.prevent="progressTouchMove"
          @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'//因为要使用transform，所以要添加前缀

  const progressBtnWidth = 16 //按钮的宽度
  const transform = prefixStyle('transform')
  
  export default {
    props:{//父组件传进来的数据
      percent:{
        type:Number,
        default:0
      }
    },
    created(){
      this.touch = {}//在这不同的回调函数里面，我们需要去共享一些数据的时候，我们把共享数据挂载在这个对象上面
    },
    methods:{
      progressTouchStart(e){
        this.touch.initiated = true//表示他已经初始化了
        this.touch.startX = e.touches[0].pageX//记录touch的点击位置，当前点击的位置
        this.touch.left = this.$refs.progress.clientWidth//已经滚动的进度条的宽度
      },
      progressTouchMove(e){
        if(!this.touch.initiated){//如股没有经历progressTouchStart，直接返回
          return
        }
        const deltaX = e.touches[0].pageX - this.touch.startX//纵向偏移量
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth,Math.max(0,this.touch.left+deltaX))//我们移动了多少距离
        this._offset(offsetWidth)
      },
      progressTouchEnd(e){//将initiated重置成false
        this.touch.initiated = false
        this._triggerPercent()
      },
      progressClick(e){
        const rect = this.$refs.progressBar.getBoundingClientRect()//滚动条左边距离边上的距离
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        //这里当我们点击progressBtn,e.offsetX获取不对
        //this._offset(e.offsetX)
        this._triggerPercent()
      },
      _triggerPercent(){
        const barWidth = this.$refs.progressBar.clientWidth-progressBtnWidth 
        const percent = this.$refs.progress.clientWidth / barWidth
        this.$emit('percentChange',percent)
      },
      _offset(offsetWidth){
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`//小球的偏移量
      }
    },
    watch:{
      percent(newPercent){//监听percent的变化，参数意思是歌曲播放比例
        if(newPercent>=0 && !this.touch.initiated){
          const barWidth = this.$refs.progressBar.clientWidth-progressBtnWidth //滚动条的总长度=滚动条可视区总长度-按钮的长度
          const offsetWidth = newPercent * barWidth//偏移宽度
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>