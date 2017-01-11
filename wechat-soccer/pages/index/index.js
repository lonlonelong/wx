//index.js
//获取应用实例
var api = require("../../utils/api");

function getNews(self, type, data = {}) {
    var param = {};
    var array = [];
    var string = type;

    api.getNews(type).bindParams(data).execute(function(res) {
        if (data.direc) {
            array = self.data[type].concat(res.data.result.data);
        } else {
            array = res.data.result.data;
        }
        param[string] = array;
        self.setData(param);
        self.setData({
            loadingTop: false,
            loadingBottom: false
        });
    });
};

const tabs = [{
  index: 0,
  en: "fifa",
  name: "国际",
},{
  index: 1,
  en: "csl",
  name: "国内"
}]

Page({
    data: {
        tabIndex: 0,
        csl_scrollTop: 0,
        fifa_scrollTop: 0,
        scrollHeight: 0,
        tabs: tabs,
        leagues: "fifa",
        csl: [],
        fifa: [],
        nid: 0,
        loadingTop: true,
        loadingBottom: true
    },

    // 链接跳转
    linkTo: function(event){
        wx.navigateTo({
          url: "../article/article?nid=" + event.currentTarget.dataset.nid + "&leagues=" + this.data.leagues
        })
    },

    // tab切换
    tabToggle: function(event) {
        var self = this;
        var param = {};
        var tabIndex = parseInt(event.target.dataset.tab);
        var leagues = tabs[tabIndex].en;
        var string = leagues + "_scrollTop";

        this.setData({
            tabIndex: tabIndex,
            leagues: leagues
        });

        getNews(self, leagues);

        param[string] = event.detail.scrollTop;
        this.setData(param);
    },

    onLoad: function() {
        var self = this;

        getNews(self, this.data.leagues);

        wx.getSystemInfo({
            success: function(res) {
                self.setData({
                    scrollHeight: res.windowHeight - 49
                });
            }
        });
    },

    loadMore: function() {
        var self = this;

        this.setData({
            loadingBottom: true
        });

        var current = this.data[this.data.leagues]
        var lastnid = current[current.length - 1].nid

        getNews(self, this.data.leagues, {
            "direc": "next",
            "nid": lastnid
        });

    },

    scroll: function(event) {
        var self = this;
        var param = {};
        var string = this.data.leagues + "_scrollTop";

        param[string] = event.detail.scrollTop;
        this.setData(param);
    },

    refresh: function(event) {
        var self = this;

        this.setData({
            loadingTop: true
        });

        var current = this.data[this.data.leagues]
        var lastnid = current[current.length - 1].nid

        getNews(self, this.data.leagues, {
            "direc": "prev",
            "nid": lastnid
        });
    }
})
