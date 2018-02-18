const _api = require('./helpers/api')
const es = require('./config/elastic')
const Agenda = require('agenda')
const { getMedia, getNextPage, formatOwner, g } = require('./helpers/formatter')
const moment = require('moment')

const mongoConnectionString = 'mongodb://127.0.0.1/agenda';
const agenda = new Agenda({db: {address: mongoConnectionString}});

const api = new _api()

const main = (user) => {

  const getAllPost = async (username, paging) => {
    const data = await api.getUserMedia(username, paging)
    const media = getMedia(data)
    const userInfo = formatOwner(data)
    const esBody = []
    const statsIndex = moment().format('YYYYMMDDHH')
    media.forEach(async m => {
      esBody.push({
        update: {
          _index: 'bnk48_media',
          _type: 'instagram_media',
          _id: m.id
        }
      })
      esBody.push({doc: m, upsert: m})

      const m_stats = await calcState(m)
      esBody.push({
        index: {
          _index: 'bnk48_stats',
          _type: 'instagram_media',
          _id: `${m.id}_${statsIndex}`
        }
      })
      esBody.push(m_stats)
    })
    const setting = await es.indices.putSettings({index: 'bnk48_media', body: {index: {blocks: {read_only_allow_delete: false}}}})
    const result = await es.bulk({body: esBody})
    const nextPage = getNextPage(data)
    if (nextPage) {
      getAllPost(userInfo.id, nextPage)
    }
  }

  const calcState = async (m) => {
    const _id = `${m.id}_${moment().subtract(1, 'day').format('YYYYMMDDHH')}`
    const result = await es.search({
      index: 'bnk48_stats',
      type: 'messages',
      body: {query: {term: {_id}}},
      ignore_unavailable: true // ignore error if index not available
    })
    if (g(result, 'hits.hits.0')) {
      m.comment = result.hits.hits[0].comment
      m.like = result.hits.hits[0].like
    } else {
      m.comment = 0
      m.like = 0
    }
    return m
  }

  getAllPost(user)
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // Stack Trace
  console.log(reason.stack);
});

const userList = [
  'cherprang.bnk48official',
  'rinaizuta.bnk48official',
  'satchan.bnk48official',
  'music.bnk48official',
  'kate.bnk48official',
  'mind.bnk48official',
  'namsai.bnk48official',
  'namneung.bnk48official',
  'nink.bnk48official',
  'can.bnk48official',
  'korn.bnk48official',
  'pun.bnk48official',
  'piam.bnk48office',
  'kaimook.bnk48official',
  'jane.bnk48official',
  'jennis.bnk48official',
  'pupe.bnk48official',
  'namhom.bnk48official',
  'miori.bnk48official',
  'jaa.bnk48official',
  'mobile.bnk48official',
  'jib.bnk48office',
  'kaew.bnk48official',
  'noey.bnk48office',
  'tarwaan.bnk48office',
  'maysa.bnk48official',
  'jan.bnk48official',
  'orn.bnk48official'
]

agenda.define('get-data', function(job, done) {
  let i = 0
  let interval = setInterval(() => {
    if (i === userList.length) {
      clearInterval(interval)
      done()
      return
    }
    main(userList[i++])
  }, 2000)
});

agenda.on('ready', function() {
  agenda.every('3 minutes', 'get-data');
  agenda.start();
});
