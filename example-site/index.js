'use strict'
const helper = require('html-in-js')

const fs = require('fs')
const path = require('path')

/*    outcome/
 * Create an index page and the content pages from 'src/'
 */
function generateSite() {
  let src = loadSrc()
  generateIndex(src)
  generatePages(src)
}

function loadSrc() {
  let loc = path.join(__dirname, 'src')
  let mds = fs.readdirSync(loc).filter(f => f.endsWith('md'))
  return mds.map(f => {
    let data = helper.read(path.join(loc, f))
    return {
      name: path.basename(f).substring(0, f.length-3),
      html: helper.md(data),
      info: meta_1(data),
    }
  })

  function meta_1(data) {
    let lines = helper.lines(data)
    let title = lines[0].replace('# ','')
    let author = lines[lines.length-1].replace(/..(.*)./, '$1')
    return { title, author }
  }
}

function generateIndex(src) {
  let html = helper.htmlboilerplate('.')
  html = setTitle(html, 'Example site for HTML-in-JS')
  html = setContent(html, index_content_1)
  helper.save(html, 'index.html')

  function index_content_1() {
    let body = helper.md(helper.read('main.md'))
    let list = `<h2>Nice Poems</h2>
    <ul>
    ${src.map(f => `<li><a href="${f.name}.html">${f.info.title}</a></li>`).join('')}
    </ul>`
    return `${body}${list}`
  }
}

function generatePages(src) {
  src.forEach(generate_page_1)

  function generate_page_1(src) {
    let html = helper.htmlboilerplate('.')
    html = setTitle(html, src.info.title)
    html = setContent(html, () => `<div id=poem>${src.html}</div>`)
    helper.save(html, src.name + '.html')
  }
}

/*    outcome/
 * We use the 'edit' helper function to find and change
 * the title in the HTML boilerplate
 */
function setTitle(html, title) {
  return helper.edit(html, l => {
    if(l.match(/<title>/)) return `<title>${title}</title>`
  })
}

/*    outcome/
 * We use the 'edit' helper function to find and replace
 * the content of the HTML template.
 */
function setContent(html, cb) {
  return helper.edit(html, l => {
    if(l.match(/Hello world/)) {
      return `<div id=content>
        ${cb()}
      </div>`
    }
  })
}

generateSite()
