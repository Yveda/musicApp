<template>
  <div class="singer" ref="singer">
     <list-view @select="selectSinger" :data="singers"  ref="list"></list-view>
     <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import ListView from 'base/listview/listview'
  import {mapMutations} from 'vuex'
  import {playlistMixin} from 'common/js/mixin' //引入Mixin 

  const HOT_NAME = '热门'//标题
  const HOT_NAME_LEN = 10//热门数据的数量

  export default {
    mixins: [playlistMixin],  
    data(){
      return {
        singers:[]  
      }
    },
    created(){
      this._getSingerList()
    },
    methods:{
     handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },
      selectSinger(singer){
        this.$router.push({
          path:`/singer/${singer.id}`
        })
        this.setSinger(singer)//实现了我们对mutation的提交。
      },
      _getSingerList(){///获取歌手数据
        getSingerList().then((res)=>{
          if(res.code === ERR_OK){
              this.singers = this._normalizeSinger(res.data.list)
          }
        })
      },
      _normalizeSinger(list){//规范我们新的数据
        let map = {
          hot:{
            title: HOT_NAME,
            items:[]
          }
        }
        list.forEach((item,index) => {
          if(index<HOT_NAME_LEN){
            map.hot.items.push(new Singer({
              id:item.Fsinger_mid,
              name:item.Fsinger_name
            }))
          }
          const key = item.Findex
          if(!map[key]){
            map[key] = {
              title:key,
              items:[]
            }
          }
          map[key].items.push(new Singer({
              id:item.Fsinger_mid,
              name:item.Fsinger_name
          }))
        });
        // console.log(map)
        //为了得到有序列表，我们需要处理map
        let hot = []
        let ret = []
        for(let key in map){
          let val = map[key]
          if(val.title.match(/[a-zA-Z]/)){
            ret.push(val)
          }else if(val.title === HOT_NAME){
            hot.push(val)
          }
        }
        //用sort方法对ABCD....的数据进行排序
        ret.sort((a,b)=>{
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)//返回有序数组
      },
      ...mapMutations({//对象映射，mutation修改映射成一个方法名
        setSinger:'SET_SINGER'
      })
    },
    components:{
      ListView
    }
  }
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>

