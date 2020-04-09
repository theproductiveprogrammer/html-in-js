/*      understand/
 * When generating HTML - from - JS there are a few operations that
 * are commonly required - reading from disk, saving a file, parsing
 * markdown, using a HTML template, and so on.
 *
 * This file contains some helper functions that support these common
 * cases (or just as a starting point for anyone who is creating their
 * own).
 */
'use strict'
const fs = require('fs')
const path = require('path')
const os = require('os')

const markdownit = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
})

/*      outcome/
 * Read in file data and return it as a string
 */
function read(file_) {
    return fs.readFileSync(file_, 'utf8')
}

/*      outcome/
 * Split data into lines by newline or carriage-return (or
 * combination).
 */
function lines(data) {
    let rx = /\n\r|\r\n|\n|\r/g
    return data.split(rx)
}

/*      outcome/
 * Save data to the location by ensuring that the location
 * exists then creating the file there. In order to keep the write as
 * atomic as possible we first write to a temporary (WIP) file and then
 * rename it to the actual file we want to write/overwrite.
 */
function save(what, where) {
    let dir = path.dirname(where)
    ensureExists(dir)
    let name = path.basename(where)
    let tmp = path.join(os.tmpdir(), name + '~wip')
    fs.writeFileSync(tmp, what)
    fs.renameSync(tmp, where)
}

/*      outcome/
 * Create the folders in the path by creating each path in turn
 */
function ensureExists(dir, cb) {
    dir = path.normalize(dir)
    if(isDir(dir)) return /* nothing to do */

    let p = dir.split(path.sep)
    if(p[0] == '.') p.shift() // Don't create current directory
    else if(p[0] == '') { // Absolute path
        p.shift()
        p[0] = path.sep + p[0]
    }

    for(let i = 1;i <= p.length;i++) {
        let curr = path.join.apply(path, p.slice(0,i))
        try {
            fs.mkdirSync(curr, '0777')
        } catch(e) {
            if(e.code != 'EEXIST') throw(e)
        }
    }
}

/*      outcome/
 * Normalize the destination by realising that if the destination is a
 * directory, the destination is actually a file with the same name in
 * the directory. Then, if the file is not already copied, ensure the
 * destination directory exists and copy the source file to the
 * destination.
 */
function copy(src,dst) {
    dst = normalize_1(dst, src)
    if(already_copied_1(src, dst)) return
    let dir = path.dirname(dst)
    ensureExists(dir)
    fs.copyFileSync(src,dst)

    function normalize_1(dst, src) {
        if(!isDir(dst)) return dst
        else return path.join(dst, path.basename(src))
    }

    /*      outcome/
     * Check that the destination exists and the sizes are equal and
     * it's creation/modification time is later than the source
     * creation/modification time.
     */
    function already_copied_1(src, dst) {
        try {
            let dst_si = fs.lstatSync(dst)
            let src_si = fs.lstatSync(src)

            if(dst_si.size != src_si.size) return false

            let dst_t = Math.max(dst_si.mtimeMs, dst_si.ctimeMs)
            let src_t = Math.max(src_si.mtimeMs, src_si.ctimeMs)
            return dst_t >= src_t

        } catch(e) {
            /* ignore errors */
            return false
        }
    }
}

/*      outcome/
 * Checks if the given path is a directory (returns false on any error).
 */
function isDir(dst) {
    if(dst.endsWith("/")) return true
    try {
        let si = fs.lstatSync(dst)
        return si.isDirectory()
    } catch(e) {
        /* ignore errors */
        return false
    }
}

/*      outcome/
 * Render markdown from text
 */
function md(txt) {
    return markdownit.render(txt)
}

/*      understand/
 * The HTML5 boilerplate is a good good starting point for projects if
 * you don't have a strong preference for something else.
 *      https://html5boilerplate.com/
 *
 * (You will need to add your own 'site.webmanifest' & 'favicon.ico')
 *
 *      outcome/
 * Return HTML5 boiler plate and save all referenced files (like jquery,
 * normalize.css, etc) in the provided location.
 */
function htmlboilerplate(root) {
    const module = 'node_modules/html5-boilerplate/dist/'
    const loc = find_loc_1(module)
    if(!loc) throw 'Failed to find html5-boilerplate module'
    let html = read(path.join(loc, 'index.html'))
    if(root) copy_referenced_files_1(html, loc, root)
    return html


    /*      outcome/
     * Look for the requested module up the directory tree
     */
    function find_loc_1(m) {
        let curr = __dirname
        let prev
        while(prev != curr) {
            let loc = path.join(curr, m)
            prev = curr
            curr = path.join(curr, '..')
            try {
                let si = fs.lstatSync(loc)
                if(si.isDirectory()) return loc
            } catch(e) {
                /* ignore */
            }
        }
    }


    function copy_referenced_files_1(html, src, dst) {
        let refs = find_refs_1(html)
        for(let i = 0;i < refs.length;i++) {
            let curr = refs[i].split('/')
            let name = curr.pop()
            let src_ = path.join(src, curr.join(path.sep), name)
            let dst_ = path.join(dst, curr.join(path.sep), name)
            if(fs.existsSync(dst_)) continue
            else copy(src_, dst_)
        }
    }

    /*      outcome/
     * Find references that match 'href' or 'src' in the html
     */
    function find_refs_1(html) {
        return refs_1('href').concat(refs_1('src'))

        function refs_1(t) {
            let rx = new RegExp(`${t}="(.*)"`,'g')
            return Array.from(html.matchAll(rx), m => m[1]).filter(match => !match.startsWith('http'))
        }
    }
}



/*      outcome/
 * Clean/delete a given directory or file
 */
function clean(loc) {
    try {
        let si = fs.lstatSync(loc)
        if(si.isDirectory()) rmdir_1(loc)
        else fs.unlinkSync(loc)
    } catch (e) {
        /* already deleted? ignore */
        if(e.code != 'ENOENT') throw e
    }

    function rmdir_1(loc) {
        let files = fs.readdirSync(loc, { withFileTypes: true })
        for(let i = 0;i < files.length;i++) {
            let file = files[i]
            let name = path.join(loc, file.name)
            if(file.isDirectory()) {
                rmdir_1(name)
            } else {
                fs.unlinkSync(name)
            }
        }
        fs.rmdirSync(loc)
    }
}

/*      understand/
 * This object is used as a DELETE signal
 */
const DELETE = { signal: 'delete' }
/*      outcome/
 * Apply the user filter line-by-line to the input. If user erturns
 * DELETE then we delete the line, otherwise we use what is returned or
 * just pass through.
 */
function edit(data, fn) {
    let l = lines(data)
    let r = []
    for(let i = 0;i < l.length;i++) {
        let upd = fn(l[i])
        if(upd === DELETE) {
            /* signal to delete line */
        } else if(Array.isArray(upd)) {
            for(let j = 0;j < upd.length;j++) {
                r.push(upd[j])
            }
        } else if(upd) {
            r.push(upd)
        } else {
            r.push(l[i])
        }
    }
    return r.join('\n')
}


/*    outcome/
 * Find all files in the given directory, optionally matching the passed
 * in extension.
 */
function findAll(loc, ext) {
  let files = []
  if(ext && ext[0] != '.') ext = `.${ext}`
  let entries = fs.readdirSync(loc, { withFileTypes: true })
  for(let i = 0;i < entries.length;i++) {
    let curr = entries[i]
    let name = path.join(loc, curr.name)
    if(loc.startsWith('./')) name = './' + name
    if(curr.isFile()) {
      if(!ext || name.substr(-ext.length) == ext) {
        files.push(name)
      }
    }
    if(curr.isDirectory()) files = files.concat(findAll(name, ext))
  }
  return files
}


/*    exports/    */
module.exports = {
    read,
    lines,
    save,
    copy,

    md,
    htmlboilerplate,
    html5boilerplate: htmlboilerplate,

    clean,
    edit,
    DELETE,

    findAll,
}

