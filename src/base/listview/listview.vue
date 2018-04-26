<template>
    <scroll class="listview" 
            :data="data" 
            ref="listview"
            :listenScroll="listenScroll"
            :probeType="probeType"
            @scroll="scroll"
    >
        <ul>
            <li v-for="(group, index) in data" class="list-group" :key="index" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item" :key="item.id">
                        <img v-lazy="item.avatar" alt="" class="avatar">
                        <span class="name">{{item.name}}</span>
                    </li>
                </ul>
            </li>          
        </ul>
        <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
                <li v-for="(item,index) in shortcutList" 
                class="item" 
                :key="item.id" 
                :data-index="index"
                :class="{'current':currentIndex===index}"
                >
                    {{item}}
                </li>
            </ul>
        </div>
        <div class="list-fixed" ref="fixed" v-show="fixedTitle">
            <div class="fixed-title">{{fixedTitle}}</div>
        </div>
        <div v-show="!data.length" class="loading-container">
            <loading></loading>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
    import Scroll from 'base/scroll/scroll'
    import Loading from 'base/loading/loading'
    import {getData} from 'common/js/dom'
    const ANCHOR_HEIGHT = 18  //每个标题的高度，从样式里面获取到的，字体高度加上padding值
    const TITLE_HEIGHT = 30
    export default {
        created(){
            this.touch = {}//为了让两个函数之间能互相访问到这个数据
            this.listenScroll = true
            this.listHeight = []
            this.probeType = 3
        },
        data(){
            return {
                scrollY:-1,//观测一个实时滚动的位置，通过scroll事件得到
                currentIndex:0, //当前应该显示第几个
                diff:-1//是这个区块的上限和当前滚动位置的滚动差
            }
        },
        props:{
            data:{
                type:Array,
                default:[]
            }
        },
     
        // created(){
        //     console.log(this.data)
        // }//判断他有没有数据
        computed:{
            shortcutList(){//title的集合数组
                return this.data.map((group)=>{//data是props传过来的data，使用数组的map方法，去map每个元素的title
                    return group.title.substr(0,1)
                })
            },
            fixedTitle(){
                if(this.scrollY>0){//在最上面  往下面拉时候取消标题的显示
                    return ''
                }
                return this.data[this.currentIndex]?this.data[this.currentIndex].title:""
            }
        },
        methods:{
            selectItem(item){//将点击的元素派发出去
                this.$emit('select',item)
            },
            onShortcutTouchStart(e){//点击事件，点击列表显示当前区块group
                let anchorIndex = getData(e.target,'index')
                let firstTouch = e.touches[0]//第一个手指的位置
                this.touch.y1 = firstTouch.pageY
                this.touch.anchorIndex = anchorIndex//给touch初始化记录当前的 anchorIndex，就是一开始点击的是第几个索引先记录下来
                this._scrollTo(anchorIndex)
            },
            onShortcutTouchMove(e){//滑动事件，原理是始末位置的差，按着它滚动
                let firstTouch = e.touches[0]
                this.touch.y2 = firstTouch.pageY
                let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0 //这样子就知道了偏移了几个锚点
                let anchorIndex = parseInt(this.touch.anchorIndex) + delta
                // console.log(anchorIndex)
                this._scrollTo(anchorIndex)
            },
            refresh(){//调用这个scroll的refresh，所以给list暴露一个list的接口
                this.$refs.listview.refresh()
            },
            scroll(pos){
                this.scrollY = pos.y//实时滚动的Y轴的距离
            },
            _scrollTo(index){
                console.log(index)     
                if(!index && index !== 0){
                    return
                }
                if(index <0){
                    index = 0
                }else if(index>this.listHeight.length - 2){
                    index = this.listHeight.length - 2
                }
                 this.scrollY = -this.listHeight[index]
                 this.$refs.listview.scrollToElement(this.$refs.listGroup[index],0)//第二个参数要不要给他一个缓冲滚动时间
            },
            _calculateHeight(){//计算落在的每个group的高度，这是私有方法
                this.listHeight = []
                const list = this.$refs.listGroup//引用每listGroup
                let height = 0
                this.listHeight.push(height)
                for(let i =0;i<list.length;i++){//循环遍历这个list
                    let item = list[i]//得到每个group的元素
                    height += item.clientHeight//因为他是个DOM，所以可以直接获取他的高度
                    this.listHeight.push(height)
                }
            }
            
        },
        watch:{
            data() {
                    setTimeout(() => {
                    this._calculateHeight()
                    }, 20)
                },
            scrollY(newY){//判断scrollY落在哪个区间，遍历每个listHeight跟上限下限对比
                const listHeight = this.listHeight//先对 listHeight做引用，因为下面会多次使用
                 setTimeout(()=>{
                    this._calculateHeight()
                },20)

                //当滚动到顶部，newY>0
                if(newY>0){
                    this.currentIndex = 0
                    return
                }
                //在中间部分滚动
                for(let i = 0;i<listHeight.length-1;i++){//怎么判断这个scrollY落在哪个区间，肯定是要遍历这个listHeight来跟他上限下限对比
                    let height1 = listHeight[i]//下限  当前的
                    let height2 = listHeight[i+1]//上限
                    if(-newY >= height1 && -newY < height2){//往上滚动的时候newY为负值，！height2意为滚动到最后一个
                        this.currentIndex = i
                        this.diff = height2 + newY
                        return
                    }
                }
               //当滚动到底部，且newY大于最后一个元素的上限
                this.currentIndex = listHeight.length - 2
            },
            diff(newVal) {
                let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
                if (this.fixedTop === fixedTop) {
                    return
                }
                this.fixedTop = fixedTop
                this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
            }
        },
        components:{
            Scroll,
            Loading
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
