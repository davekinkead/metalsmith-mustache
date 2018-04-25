const Mustache = require('mustache')
const path = require('path')
const fs = require('fs')
const glob = require('glob-fs')()


const templates = {}

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin to hide drafts from the output.
 *
 * @return {Function}
 */

function plugin(options){

  const defaults = {
    templates: './templates/',
    pattern: '*.html',
    default: 'default.html'
  }

  const settings = Object.assign({}, defaults, options)
  const dir =  path.join(__dirname, settings.templates)

  return function(files, metalsmith, done){

    //  fetch the templates
    const names = glob.readdirSync(settings.templates + settings.pattern)

    names.forEach((name) => {
      var key = path.parse(name).name
      templates[key] = fs.readFileSync(name, 'utf8')
    })

    //  render the files
    for (const name in files) {
      if (name.match(/\.txt$|\.md$|\.html$/)) {
        const file = files[name]
        const stash = Mustache.render(
          getTemplate(file, settings), 
          Object.assign({}, {site: metalsmith.metadata()}, {page: file}), 
          templates
        )
        file.contents = Buffer.from(stash)        
      }
    }

    done()  
  }
}

function getTemplate(file, settings) {
  return templates[path.parse(file.layout || settings.default).name]
}