const elasticsearch = require('elasticsearch')

const second = 120 * 1000

const esClient = new elasticsearch.Client({
  host: 'http://127.0.0.1:9200',
  requestTimeout: second
})

module.exports = esClient
