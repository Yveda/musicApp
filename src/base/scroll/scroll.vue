<template>
  <div ref="warpper">
      <slot></slot>
  </div>
</template>

<script>
    import  BScroll from 'better-scroll'
    export default {
        props:{
            probeType:{//监听滚动
                type:Number,
                default:1
            },
            click:{//scroll是否能点击
                type:Boolean,
                default:true
            },
            data:{
                type:Array,
                default:null
            },
            listenScroll:{//让scroll是否监听滚动事件 
                type:Boolean,
                default:false
            },
            pullup:{//是否上拉刷新，默认否
                type:Boolean,
                default:false
            }
        },
        mounted(){//确保他的DOM渲染，在这个时候执行方法
            setTimeout(() => {
                this._initScroll()
            }, 20);
        },
        methods:{//初始化的方法
            _initScroll(){
                if(!this.$refs.warpper){//假如这个方法被调用而且是undefined，没有值的时候就return，这里作一个判断保证他不会出错误
                    return
                }
                this.scroll = new BScroll(this.$refs.warpper,{//初始化scroll，外部控制probeType是什么样，这里就是什么样，还有click
                    probeType:this.probeType,
                    click:this.click
                })
                if(this.listenScroll){//如果监听了这个scroll
                    let me = this
                    this.scroll.on('scroll',(pos)=>{//监听这个scroll的滚动事件，然后再回调，pos就是位置
                        me.$emit('scroll',pos)//vue实例调用emit方法 ，去派发一个scroll事件，这样我们在外面就可以监听到scroll事件，拿到位置pos
                    })
                }
                if(this.pullup){//如果上拉
                    this.scroll.on('scrollEnd',()=>{//监听滚动到顶部事件，scrollEnd表示地址
                        if(this.scroll.y <= this.scroll.amxScrollY + 50){//判断高度
                            this.$emit('scrollToEnd')//scrollEnd表示滚动到底部
                        }
                    })
                }
            },
            enable(){//方法代理，如果这个scroll有的话 就调用enable这个方法
                this.scroll &&　this.scroll.enable()
            },
            disable(){//方法代理，如果这个scroll有的话 就调用disable这个方法
                this.scroll && this.scroll.disable()
            },
            refresh(){//刷新这个scroll,重新计算高度
                this.scroll && this.scroll.refresh()
            },
            scrollTo(){//调用apply是因为scrollTo他会调用一些参数
                this.scroll && this.scroll.scrollTo.apply(this.scroll,arguments)
            },
            scrollToElement(){
                this.scroll &&　this.scroll.scrollToElement.apply(this.scroll,arguments)
            }
        },
        watch:{//监视data，如果data发生变化，就去刷新这个refresh（）
            data(){
                setTimeout(()=>{
                    this.refresh()
                },20)
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>    

