Twitarr.ForumMeta = Ember.Object.extend
  id: null
  subject: null
  posts: null
  timestamp: null

Twitarr.ForumMeta.reopenClass
  list: ->
    $.getJSON('forums').then (data) =>
      Ember.A(@create(meta)) for meta in data.forum_meta

  page: (page) ->
    $.getJSON("forums/#{page}").then (data) =>
      { forums: Ember.A(@create(meta)) for meta in data.forum_meta, next_page: data.next_page, prev_page: data.prev_page }

Twitarr.Forum = Ember.Object.extend
  id: null
  subject: null
  posts: []
  timestamp: null

  objectize: (->
    @set('posts', Ember.A(Twitarr.ForumPost.create(post)) for post in @get('posts'))
  ).on('init')

Twitarr.Forum.reopenClass
  get: (id, page = 0) ->
    $.getJSON("forums/thread/#{id}/#{page}").then (data) =>
      { forum: @create(data.forum), next_page: data.forum.next_page, prev_page: data.forum.prev_page }

  new_post: (forum_id, text, photos) ->
    $.post('forums/new_post', { forum_id: forum_id, text: text, photos: photos }).then (data) =>
      data.forum_post = Twitarr.ForumPost.create(data.forum_post) if data.forum_post?
      data

  new_forum: (subject, text, photos) ->
    $.post('forums', { subject: subject, text: text, photos: photos }).then (data) =>
      data.forum_meta = Twitarr.ForumMeta.create(data.forum_meta) if data.forum_meta?
      data

Twitarr.ForumPost = Ember.Object.extend
  photos: []

  objectize: (->
    @set('photos', Ember.A(Twitarr.Photo.create(photo) for photo in @get('photos')))
  ).on('init')
