(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d0c9adc"],{"59bd":function(t,i,e){"use strict";e.r(i),e.d(i,"VuetifyAudio",(function(){return r}));var a=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("v-card",{staticStyle:{"text-align":"center"},attrs:{flat:void 0!=t.flat&&0!=t.flat}},[e("v-card-text",[e("v-btn",{staticClass:"ma-2",attrs:{outlined:"",icon:"",color:t.color,disabled:!t.loaded},nativeOn:{click:function(i){t.playing?t.pause():t.play()}}},[!t.playing||t.paused?e("v-icon",[t._v("mdi-play")]):e("v-icon",[t._v("mdi-pause")])],1),e("v-btn",{staticClass:"ma-2",attrs:{outlined:"",icon:"",color:t.color,disabled:!t.loaded},nativeOn:{click:function(i){return t.stop()}}},[e("v-icon",[t._v("mdi-stop")])],1),e("v-btn",{staticClass:"ma-2",attrs:{outlined:"",icon:"",color:t.color,disabled:!t.loaded},nativeOn:{click:function(i){return t.mute()}}},[t.isMuted?e("v-icon",[t._v("mdi-volume-mute")]):e("v-icon",[t._v("mdi-volume-high")])],1),t.loaded?t._e():e("v-btn",{staticClass:"ma-2",attrs:{outlined:"",icon:"",color:t.color},nativeOn:{click:function(i){t.loaded?t.download():t.reload()}}},[e("v-icon",[t._v("mdi-refresh")])],1),t.loaded&&t.downloadable?e("v-btn",{staticClass:"ma-2",attrs:{outlined:"",icon:"",color:t.color},nativeOn:{click:function(i){t.loaded?t.download():t.reload()}}},[e("v-icon",[t._v("mdi-download")])],1):t._e(),e("v-progress-linear",{staticStyle:{"margin-top":"15px","margin-bottom":"15px"},attrs:{height:"5",disabled:!t.loaded},nativeOn:{click:function(i){return t.setPosition()}},model:{value:t.percentage,callback:function(i){t.percentage=i},expression:"percentage"}}),e("p",[t._v(t._s(t.currentTime)+" / "+t._s(t.duration))])],1),e("audio",{ref:"player",attrs:{id:"player",src:t.file},on:{ended:t.ended,canplay:t.canPlay}})],1)},n=[],o=(e("d9e2"),function(t){return new Date(1e3*t).toISOString().substr(11,8)}),d={name:"vuetify-audio",props:{flat:{type:Boolean,default:!1},file:{type:String,default:null},autoPlay:{type:Boolean,default:!1},ended:{type:Function,default:function(){}},canPlay:{type:Function,default:function(){}},color:{type:String,default:null},downloadable:{type:Boolean,default:!1}},computed:{duration:function(){return this.audio?o(this.totalDuration):""}},data:function(){return{firstPlay:!0,isMuted:!1,loaded:!1,playing:!1,paused:!1,percentage:0,currentTime:"00:00:00",audio:void 0,totalDuration:0}},methods:{setPosition:function(){this.audio.currentTime=parseInt(this.audio.duration/100*this.percentage)},stop:function(){this.audio.pause(),this.paused=!0,this.playing=!1,this.audio.currentTime=0},play:function(){var t=this;this.playing||(this.audio.play().then((function(i){return t.playing=!0})),this.paused=!1)},pause:function(){this.paused=!this.paused,this.paused?this.audio.pause():this.audio.play()},download:function(){this.audio.pause(),window.open(this.file,"download")},mute:function(){this.isMuted=!this.isMuted,this.audio.muted=this.isMuted,this.volumeValue=this.isMuted?0:75},reload:function(){this.audio.load()},_handleLoaded:function(){var t=this;if(!(this.audio.readyState>=2))throw new Error("Failed to load sound file");this.audio.duration===1/0?(this.audio.currentTime=1e101,this.audio.ontimeupdate=function(){t.audio.ontimeupdate=function(){},t.audio.currentTime=0,t.totalDuration=parseInt(t.audio.duration),t.loaded=!0}):(this.totalDuration=parseInt(this.audio.duration),this.loaded=!0),this.autoPlay&&this.audio.play()},_handlePlayingUI:function(t){this.percentage=this.audio.currentTime/this.audio.duration*100,this.currentTime=o(this.audio.currentTime),this.playing=!0},_handlePlayPause:function(t){"play"===t.type&&this.firstPlay&&(this.audio.currentTime=0,this.firstPlay&&(this.firstPlay=!1)),"pause"===t.type&&!1===this.paused&&!1===this.playing&&(this.currentTime="00:00:00")},_handleEnded:function(){this.paused=this.playing=!1},init:function(){this.audio.addEventListener("timeupdate",this._handlePlayingUI),this.audio.addEventListener("loadeddata",this._handleLoaded),this.audio.addEventListener("pause",this._handlePlayPause),this.audio.addEventListener("play",this._handlePlayPause),this.audio.addEventListener("ended",this._handleEnded)}},mounted:function(){this.audio=this.$refs.player,this.init()},beforeDestroy:function(){this.audio.removeEventListener("timeupdate",this._handlePlayingUI),this.audio.removeEventListener("loadeddata",this._handleLoaded),this.audio.removeEventListener("pause",this._handlePlayPause),this.audio.removeEventListener("play",this._handlePlayPause),this.audio.removeEventListener("ended",this._handleEnded)}},s=d,u=e("2877"),l=Object(u["a"])(s,a,n,!1,null,null,null),r=l.exports;i["default"]=r}}]);
//# sourceMappingURL=chunk-2d0c9adc.082a96be.js.map