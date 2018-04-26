<template>
  <transition name="slide">
    <MusicList :songs="songs" :title="title" :bgImage="bgImage"></MusicList>
  </transition>
</template>

<script>
  import MusicList from 'components/music-list/music-list'
  import {mapGetters, mapMutations} from 'vuex'
  import {getDiscSongList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {createSong, isValidMusic} from 'common/js/song'
  export default {
    data() {
      return {
        songs: []
      }
    },
    computed: {
      title() {
        return this.disc.dissname
      },
      bgImage() {
        return this.disc.imgurl
      },
      ...mapGetters([
        'disc'
      ])
    },
    created() {
      this._getDiscSongList()
    },
    methods: {
      _getDiscSongList() {
        if (!this.disc.dissid) {//如果发现没有dissid， 我们就直接回退到上一个路由，然后直接return，防止他刷新找不到数据
          this.$router.push('/recommend')
          return
        }
        getDiscSongList(this.disc.dissid)
          .then(res => {
            if (res.code === ERR_OK) {
              this.songs = this._normalizeSongs(res.cdlist[0].songlist)
            }
          })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach(musicData => {
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>