Twitarr.StreamPost = Ember.Object.extend
  id: null
  author: null
  text: null
  timestamp: null
  photo: null
  likes: []

  init: ->
    @set('timestamp', @get('timestamp') * 1000)

  pretty_timestamp: (->
    moment(@get('timestamp')).fromNow(true)
  ).property('timestamp')

  sm_photo_path: (->
    Twitarr.ApplicationController.sm_photo_path @get('photo')
  ).property('photo')

  user_likes: (->
    @get('likes') && @get('likes')[0] == 'You'
  ).property('likes')

  likes_string: (->
    likes = @get('likes')
    return '' unless likes and likes.length > 0
    if likes.length == 1
      if likes[0] == 'You'
        return 'You like this.'
      if likes[0].indexOf('seamonkeys') > -1
        return "#{likes[0]} like this."
      else
        return "#{likes[0]} likes this."
    last = likes.pop()
    likes.join(', ') + " and #{last} like this."
  ).property('likes')

  like: ->
    $.getJSON("tweet/like/#{@get('id')}").then (data) =>
      if(data.status == 'ok')
        @set('likes', data.likes)
      else
        alert data.status

  unlike: ->
    $.getJSON("tweet/unlike/#{@get('id')}").then (data) =>
      if(data.status == 'ok')
        @set('likes', data.likes)
      else
        alert data.status

  author_small_profile_pic: (->
    "/api/v2/user/photo/#{@get('author')}"
  ).property('author_small_profile_pic')



Twitarr.StreamPost.reopenClass
  page: (page) ->
    $.getJSON("stream/#{page}").then (data) =>
      { posts: Ember.A(@create(post) for post in data.stream_posts), next_page: data.next_page }

  new_post: (text, photo) ->
    $.post('stream', text: text, photo: photo).then (data) =>
      data.stream_post = Twitarr.StreamPost.create(data.stream_post) if data.stream_post?
      data
