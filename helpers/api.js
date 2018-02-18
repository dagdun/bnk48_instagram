var request = require('request-promise');
var _ = require('lodash');
var cookie_header = require('../config/cookie.json');
var query_id = require('../config/const.json');

module.exports = function() {

  const _get = async url => {
    console.log('***** url', url)
    const data = await request.get({
      url: url,
      httpVersion: "HTTP/1.1",
      headers: cookie_header,
      gzip: true,
    });
    return JSON.parse(data)
  }

  const _post = async (url, data) => {
    var h = _.cloneDeep(cookie_header);

    if (data.header !== undefined) {
      _.each(data.header, function(value, key) {
        h[key] = value;
      })
    }

    const body = await request.post({
      url: url,
      headers: h,
      gzip: true,
      body: data.data,
    });
    return JSON.parse(body)
  }
  
  const getUserInfo = (username) => {
    return _get("https://www.instagram.com/" + username + "?__a=1");
  }

  const getUserFeed = (user_id, next_page) => {
    return _get(`https://www.instagram.com/graphql/query/?query_id=${query_id.user_paging}&id=${user_id}&first=500&after=${next_page}`);
  }

  this.getHome = function(next_page, callback) {
    if (next_page) {
      var url = "https://www.instagram.com/graphql/query/?query_id="+query_id.home_paging+"&fetch_media_item_count=100&fetch_media_item_cursor="+next_page+"&fetch_comment_count=0&fetch_like=0";
      return _get(url);
    } else {
      var url = "https://www.instagram.com/?__a=1";
      return _get(url);
    }
  }

  this.getOne = function(id, callback) {
    var url = "https://www.instagram.com/p/" + id + "?__a=1";
    _get(url, function(json) {
      callback(json);
    });
  }

  this.getUserMedia = (username, next_page) => {
    if (next_page) {
      return getUserFeed(username, next_page)
    } else {
      return getUserInfo(username)
    }
  }

  this.search = function(keyword, callback) {

    var url = "https://www.instagram.com/web/search/topsearch/?context=blended&rank_token=0.9390493603218828&query="+encodeURIComponent(keyword);
    _get(url, function(json) {
      callback(json);
    })
  }

  this.searchHashtag = function(hashtag, paging, callback) {
    if (paging) {
      var url = "https://www.instagram.com/query/";
      var post = "q=ig_hashtag("+hashtag+"){media.after("+paging+",100){count,nodes{__typename,caption,code,comments{count},comments_disabled,date,dimensions{height,width},display_src,id,is_video,likes{count},owner{id},thumbnail_src,video_views},page_info}}";
      var header = {
        "Referer": "https://www.instagram.com/explore/tags/"+hashtag+"/",
        "content-type" : "application/x-www-form-urlencoded",
      }
      _post(url, {data: post, header: header}, function(json) {
        callback(json);
      });
    } else {
      var url = "https://www.instagram.com/explore/tags/"+hashtag+"/?__a=1";
      _get(url, function(json) {
        callback(json);
      })
    }
  }

  
}
