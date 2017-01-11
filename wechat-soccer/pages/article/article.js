var api = require("../../utils/api.js");
var _ = require("../../utils/underscore.js");
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
      nid: "",
      leaguesEn: "",
      headerimg: "",
      title:"",
      addtime: "",
      origin:"",
      load_ncid:"",
      create_time:"",
      lights: [],
      replys: [],
      hasNext: false,
      scrollHeight: 0,
      replyLoading: false
  },
  onLoad: function (option) {
    var self = this;
    this.setData({
      nid: option.nid,
      leaguesEn: option.leagues
    })

    api.getNewsArticle()
       .bindParams({nid: option.nid, leaguesEn: option.leagues})
       .execute(function(res){
           var result = res.data;
           var newsBase = {
             title: result.news.title,
             addtime: result.news.addtime,
           }

           if(result.news.origin){
             newsBase.origin = result.news.origin
           }
           if(result.news.img_m){
             newsBase.headerimg = result.news.img_m
           }

           self.setData(newsBase)

           var content = result.news.content
           WxParse.wxParse('content', 'html', content, self, 5);

           self.getLight()
           self.getReply()
       }, function(err){
          console.log("接口报错")
       });

     wx.getSystemInfo({
         success: function(res) {
             self.setData({
                 scrollHeight: res.windowHeight
             });
         }
     });

  },
  getLight: function(){
    var self = this
    var nid = this.data.nid;

    api.getNewsLight()
       .bindParams({nid})
       .execute(({data}) => {
          self.setData({
            lights: data.light_comments
          })
        });
  },
  getReply: function(){
    var self = this
    var nid = this.data.nid;

    this.setData({
      replyLoading: true
    })
    api.getNewsReply()
       .bindParams({nid})
       .execute(({data}) => {
          var replys =  self.data.replys.concat(data.data)

          self.setData({
            hasNext: !!data.hasNextPage,
            replys: replys,
            replyLoading: false,
            load_ncid: data.data[data.data.length - 1].ncid,
            create_time: data.data[data.data.length - 1].create_time
          })
        })
  },
  loadMoreReply: function(){
    if(this.data.hasNext && !this.data.replyLoading){
          var self = this;
          var params = {
              nid: this.data.nid,
              ncid: this.data.load_ncid,
              create_time: this.data.create_time
          };
          this.setData({
             replyLoading: true
          });

          api.getNewsReply()
             .bindParams(params)
             .execute(({data}) => {

              self.setData({
                hasNext: !!data.hasNextPage,
                replys: self.data.replys.concat(data.data || []),
                replyLoading: false,
                load_ncid: data.data[data.data.length - 1].ncid,
                create_time: data.data[data.data.length - 1].create_time
              })

          })
    }
  }
})
