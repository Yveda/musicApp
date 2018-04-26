import {mapGetters} from 'vuex'  
  
export const playlistMixin = {  
  computed: {  
    playList() {
      return this.$store.getters.playlist
    }
  },  
  mounted() {  
    this.handlePlaylist(this.playList)
 
  },  
  activated() {  
    this.handlePlaylist(this.playList)  
  },  
  watch: {  
    playList(newVal) {  
      this.handlePlaylist(newVal)  
    }  
  },  
  methods: {  
    handlePlaylist() {  
      throw new Error('component must implement handlePlaylist method')  
    }  
  }  
  
}  