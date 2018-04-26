<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item,index) in dots" :class="{active:currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'
import {addClass} from 'common/js/dom'
export default {
  data(){
    return{
      dots:[],
      currentPageIndex:0 //默认当前是第0页，也就是第一个
    }
  },
  props:{//是否轮播
    loop:{
      type:Boolean,
      default:true
    },
    autoPlay:{//是否自动播放
      type:Boolean,
      default:true
    },
    interval:{//时间间隔
      type:Number,
      default:4000
    }
  },
  mounted(){
    setTimeout(()=>{
      this._setSliderWidth()
      this._initDots()
      this._initSlider()

      if(this.autoPlay){
        this._play()
      }
    },20)

    window.addEventListener('resize',()=>{
      if(!this.slider){
        return
      }
      this._setSliderWidth(true)
      this.slider.refresh()
    })
  },
  methods:{
    _setSliderWidth(isResize){
      this.children = this.$refs.sliderGroup.children
      console.log(this.children.length)
      let width = 0
      let sliderWidth = this.$refs.slider.clientWidth
      for(let i = 0;i<this.children.length;i++){
          let child = this.children[i]
          addClass(child,'slider-item')
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
      }
      if(this.loop && !isResize){
        width += 2*sliderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _initDots(){
      this.dots = new Array(this.children.length)
    },
    _initSlider(){
      this.slider = new BScroll(this.$refs.slider,{//初始化
        scrollX:true,
        scrollY:false,
        monentum:false,
        snap:true,
        snapLoop:this.loop,
        snapThreshold:0.3,
        snapSpeed:400,
        click:true
      })
      this.slider.on("scrollEnd",()=>{
        let pageIndex = this.slider.getCurrentPage().pageX
        if(this.loop){
          pageIndex -= 1  //循环模式下会会往第一个添加拷贝，所以他的index和实际的index要减去1个
        } 
        this.currentPageIndex = pageIndex

        if(this.autoPlay){//每次自动轮播前clear一次定时器
          clearTimeout(this.timer)
          this._play()
        }
      })
    },
    _play(){
      let pageIndex = this.currentPageIndex + 1 
      if(this.loop){
        pageIndex += 1
      }
      this.timer = setTimeout(()=>{
        this.slider.goToPage(pageIndex,0,400)
      },this.interval)
    }
  },
  destoryed(){
    clearTimeout(this.timer)
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>