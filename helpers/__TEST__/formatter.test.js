const { getMedia, formatMedia, g, getNextPage } = require('../formatter')
const userHome = require('./user_home.json')
const userPaging = require('./user_paging.json')
const userNoPaging = require('./user_no_paging.json')
const homePaging = require('./home_paging.json')
const rawHome = require('./home.json')

describe('formatter', () => {
  test('user home', () => {
    const newFormat = getMedia(userHome)
    // console.log(JSON.stringify(newFormat))
  })

  test('user paging', () => {
    const newFormat = getMedia(userPaging)
    console.log(JSON.stringify(newFormat))
  })

  test('home paging', () => {
    const newFormat = getMedia(homePaging)
    // console.log(JSON.stringify(newFormat))
  })

  test('next page', () => {
    console.log(getNextPage(userHome))
    console.log(getNextPage(userPaging))
    console.log(getNextPage(homePaging))
    console.log(getNextPage(rawHome))
    console.log(getNextPage(userNoPaging))
  })

  test('g 1', () => {
    const a = {
      name: 'dagdun'
    }
    expect(g(a, 'name')).toBe('dagdun')
  })

  test('g 2', () => {
    const a = {
      name: 'dagdun'
    }
    expect(g(a, 'name1', 'name2', 'name')).toBe('dagdun')
  })
})
