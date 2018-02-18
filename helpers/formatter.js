const _ = require('lodash')

const g = (obj, param1 = 'param1', param2 = 'param2', param3 = 'param3', param4 = 'param4') => {
  return _.get(obj, param1, _.get(obj, param2, _.get(obj, param3, _.get(obj, param4))))
}

const getNextPage = raw => {
  if (g(raw, 'data.user.edge_owner_to_timeline_media.page_info.has_next_page', 'graphql.user.edge_owner_to_timeline_media.page_info.has_next_page', 'data.user.edge_web_feed_timeline.page_info.has_next_page', 'graphql.user.edge_web_feed_timeline.page_info.has_next_page') === false) {
    return null
  }

  return g(raw, 'data.user.edge_owner_to_timeline_media.page_info.end_cursor', 'graphql.user.edge_owner_to_timeline_media.page_info.end_cursor', 'data.user.edge_web_feed_timeline.page_info.end_cursor', 'graphql.user.edge_web_feed_timeline.page_info.end_cursor')
}

const getMedia = raw => {
  const _data = []
  var nodes = g(raw, 'graphql.user.edge_owner_to_timeline_media.edges', 'data.user.edge_web_feed_timeline.edges', 'data.user.edge_owner_to_timeline_media.edges');
  var owner = formatOwner(raw)
  _.each(nodes, node => {
    _data.push({
      owner,
      id: g(node, 'node.id'),
      shortcode: g(node, 'node.shortcode'),
      comment: g(node, 'node.edge_media_to_comment.count'),
      like: g(node, 'node.edge_liked_by.count', 'node.edge_media_preview_like.count'),
      caption: g(node, 'node.edge_media_to_caption.edges.0.node.text'),
      timestamp: g(node, 'node.taken_at_timestamp'),
      media: formatMedia(node)
    })
  })
  return _data
}

const formatMedia = raw => {
  const media = []
  if (g(raw, 'node.edge_sidecar_to_children.edges')) {
    _.each(raw.node.edge_sidecar_to_children.edges, node => {
      media.push(formatMedia(node)[0] || {})
    })
  } else {
    media.push({
      owner: g(raw, 'node.owner.id'),
      thumbnail: g(raw, 'node.thumbnail_src'),
      image: g(raw, 'node.display_url'),
      is_video: g(raw, 'node.is_video'),
      video_url: g(raw, 'node.video_url') || null,
      video_count: g(raw, 'node.video_view_count') || null
    })
  }
  return media
}

const formatOwner = raw => {
  const rawOwner = g(raw, 'user')
  return owner = {
    id: g(raw, 'user.id', 'data.user.edge_owner_to_timeline_media.edges.0.node.owner.id'),
    follows: g(raw, 'user.follows.count'),
    followed_by: g(raw, 'user.followed_by.count'),
    full_name: g(raw, 'user.full_name'),
    thumbnail: g(raw, 'user.profile_pic_url'),
    profile: g(raw, 'user.profile_pic_url_hd'),
    username: g(raw, 'user.username')
  }
}

module.exports = { getMedia, formatOwner, formatMedia, g, getNextPage }
