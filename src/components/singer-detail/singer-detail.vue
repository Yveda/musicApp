<template>
  <transition name="slide">
      <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import {getSingerDetail,getSingerDetailvkey} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import MusicList from 'components/music-list/music-list'

  export default{
      data(){
          return {
              songs:[]
          }
      },
      computed:{//拿到这个singer
        title(){
            return this.singer.name
        },
        bgImage(){
            return this.singer.avatar
        },
          ...mapGetters([//里面可以有多个属性
          'singer'
        ])
      },
      created(){
          this._getDetail()
          console.log(this.singer)
      },
      methods:{
          _getDetail(){
              if(!this.singer.id){
                  this.$router.push('/singer')
                  return 
              }
              getSingerDetail(this.singer.id).then((res)=>{
                  if(res.code === ERR_OK){
                    //   console.log(res.data.list)
                      this.songs = this._normalizeSongs(res.data.list)
                      console.log(this.songs)
                  }
              })
          },
          _normalizeSongs(list){//list就是那一坨 数据，但是我们只需要每部分的musicData
              let ret =[] //返回值
              list.forEach((item)=>{
                  let {musicData} = item //把对象解构赋值,这样就拿到了data
                  if(musicData.songid && musicData.albummid){//这两个事必须要有的
                      ret.push(createSong(musicData))//调用createSong方法去创建实例
                  }
              })
              return ret
          }
      },
      components:{
          MusicList
      }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

    @import "~common/stylus/variable"
    // .singer-detail
    //     position:fixed
    //     z-index :100
    //     top:0
    //     left:0
    //     right:0
    //     bottom:0
    //     background:$color-background 
    .slide-enter-active, .slide-leave-active
        transition: all 0.3s

    .slide-enter, .slide-leave-to
        transform: translate3d(100%, 0, 0)
</style>