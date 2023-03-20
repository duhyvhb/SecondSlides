const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)


const slides = new Reveal( document.querySelector( '.reveal' ), {
  controls: true,
  progress: true,
  center: (localStorage.getItem('layout') || 'center') === 'center' ? true : false,
  hash: true,
  transition: localStorage.getItem('transition') || 'slide',
  plugins: [ RevealZoom, RevealNotes, RevealSearch, RevealMarkdown, RevealHighlight ]
});



function dealWithItem(item) {
  return item.split(/\s(?=\n)/).filter(el => el!='')
}

function convert(raw) {
  function addSection() {
    if(queue.length) {
      while(queue.length) {
        htmlStr += queue.shift()
      }
      if(count) {
        htmlStr += `</section>\n`
        count = 0
      }
    }
  }
  function updateQueue(item) {
    queue.push(`<section data-markdown>\n<textarea data-template>\n`)
    dealWithItem(item).forEach(element => {
      queue.push(element)
      queue.push(element.indexOf('#') === -1 ? `\n` : `\t`)
    })
    queue.push(`</textarea>\n</section>\n`)
  }

  const arr = raw.split(/\n(?=\s*#)/).filter((item) => item != "").map((item) => item.trim())
  let htmlStr = ""
  let queue = []
  let count = 0

  for(let i of arr) {
    if(i.match(/^#{1}(?!#+)/)) {
      htmlStr += `<section data-markdown>\n<textarea data-template>\n`
      dealWithItem(i).forEach(element => {
        htmlStr += element
        htmlStr += element.indexOf('#') === -1 ? `\n` : `\t`
      })
      htmlStr +=`</textarea>\n</section>\n`
    }
    else if(i.match(/^#{2}(?!#+)/)) {
      addSection()
      updateQueue(i)
    }
    else if(i.match(/^#{3}(?!#+)/)) {
      if(count === 0) queue.unshift(`<section>\n`)
      updateQueue(i)
      count++
    }
  }
  addSection()
  return htmlStr
} 

function loadMarkdown(markdown) {
  localStorage.setItem("markdown", markdown)
  location.reload()
}


const App = {
  init() {
    this.$$contents = $$('.content')
    this.$container = $('.set-container');
    [...arguments].forEach(Modules => Modules.init())
  },
  switchContent(i) {
    if(i === -1) {
      this.$$contents[Menu.tabIndex].classList.add('leave')
      setTimeout(() => {
        this.$$contents[Menu.tabIndex].classList.remove('active')
        this.$$contents[Menu.tabIndex].classList.remove('leave')
        Menu.tabIndex = 0
      }, 450)
    } else if(i !== Menu.tabIndex) {
      this.$$contents[Menu.tabIndex].classList.add('leave')
      setTimeout(() => {
        this.$$contents[Menu.tabIndex].classList.remove('active')
        this.$$contents[i].classList.add('active')
        this.$$contents[Menu.tabIndex].classList.remove('leave')
        Menu.tabIndex = i
      }, 450)
    }
  }
}

const Menu = {
  init() {
    console.log('menu init')
    this.$menu = $('.menu')
    this.$control = $('.control')
    this.$settingIcon = $('.icon-set')
    this.$cancelIcon = $('.icon-close')
    this.$$options = $$('.menu-btn')
    this.tabIndex = 0;
    this.bind()
  },
  bind() {
    this.$settingIcon.onclick = () => {
      this.$menu.classList.add('active')
      this.$control.classList.remove('active')
      App.$container.classList.add('active')
      App.$$contents[this.tabIndex].classList.add('active')
    }
    this.$cancelIcon.onclick = () => {
      this.cancelFunc()
    }
    for(let i = 0; i < this.$$options.length; i++) {
      this.$$options[i].onclick = () => {
        App.switchContent(i)
        if(i !== this.tabIndex) this.showMenu()
      }
    }
  },
  showMenu() {
    this.$menu.classList.add('leave')
    setTimeout(() => {
      this.$menu.classList.add('active')
      this.$menu.classList.remove('leave')
    }, 450)
  },
  cancelFunc() {
    this.$menu.classList.add('leave')
    this.$control.classList.add('active')
    App.switchContent(-1)
    setTimeout(() => {
      this.$menu.classList.remove('active')
      this.$menu.classList.remove('leave')
      App.$container.classList.remove('active')
    }, 450)
  }
}

const Editor = {
  init() {
    console.log('editor init')
    this.$submitBtn = $('.submit-btn')
    this.markdown = localStorage.getItem("markdown") || `# SecondSlide(左上角点击设置开始使用)`
    this.$textarea = $('.content textarea')
    this.$textarea.value = this.markdown
    this.bind()
    this.start()
  },
  bind() {
    this.$submitBtn.onclick = () => {
      const raw = $('#raw').value
      Menu.cancelFunc()
      setTimeout(() => {
         loadMarkdown(raw)
         start()
      },500)
    }
  },
  start() {
    document.querySelector(".slides").innerHTML = convert(this.markdown)
    slides.initialize()
  }
}

const Theme = {
  init() {
    console.log('theme init')
    this.themeList = [
      'beige', 'black', 'blood', 'league', 'moon', 'night', 'serif', 'simple', 'sky', 'solarized', 'white'
    ]
    this.themeIndex = 0
    this.align = localStorage.getItem('layout') || 'center'
    $('#layout').value = this.align
    this.$$figures = $$('.theme-list .item')
    this.$layoutBtn = $('.layout-btn')
    this.bind()
    this.loadTheme()
    this.loadLayout()
  },
  bind() {
    this.$$figures.forEach((item, index) => {
      item.onclick = () => {
        this.themeIndex = index
        this.setTheme()
      }
    })
    this.$layoutBtn.onclick = () => {
      this.align = $('#layout').value
      $('.slides').classList.remove(localStorage.getItem('layout') || '')
      localStorage.setItem('layout', this.align)
      location.reload()
      
    }
  },
  setTheme() {
    localStorage.setItem('theme', this.themeList[this.themeIndex])
    location.reload()
  },
  loadTheme() {
    const theme = localStorage.getItem('theme') || 'moon'
    const linkNode = document.createElement('link')
    linkNode.rel = 'stylesheet'
    linkNode.href = `dist/theme/${theme}.css`
    $('head').appendChild(linkNode)
  },
  loadLayout() {
    $('.slides').classList.add(localStorage.getItem('layout') || '')
  }
}

const Transition = {
  init() {
    console.log('Transition init')
    this.$submitBtn = $('.trans-btn')
    this.$select = $('#transition')
    this.$select.value = localStorage.getItem('transition') || 'slide'
    this.bind()
  },
  bind() {
    this.$submitBtn.onclick = () => {
      localStorage.setItem('transition', $('#transition').value)
      location.reload()
    }
  }
}

const Print = {
  init() {
    console.log('Print init')
    this.$link = $('.download')
    this.$link.href = location.href + '?print-pdf'
    const linkNode = document.createElement('link')
    linkNode.rel = 'stylesheet'
    if(location.search.match(/print-pdf/gi)) {
      linkNode.href = '../css/print/pdf.scss'
      setTimeout(() => {
        print()
        close()
      }, 1000)
    } else {
      linkNode.href = '../css/print/paper.scss'
    }
    $('head').appendChild(linkNode)
  }
}

const imgUploader = {
  init() {
    console.log('imgUploader init')
    this.$uploader = $('#img-uploader')
    AV.init({
      appId: "qAFbjCj2PausTqLNRECnA1zZ-gzGzoHsz",
      appKey: "flGul1NWZRZbRpzZvyPZuTjw",
      serverURL: "https://qafbjcj2.lc-cn-n1-shared.com"
    });
    this.bind()
  },
  bind() {
    this.$uploader.onchange = (e) => {
      if(e.target.files.length) {
        const file = e.target.files[0]
        if(file.size > 2097152) {
          alert('文件大小不可以超过2MB')
          return
        }
        const AVfile = new AV.File(encodeURI(file.name), file)
        AVfile.save({
          keepFileName: true, 
          onprogress: (progress) => {
            this.insertText(`文件上传中...进度: ${progress.percent}%`)

          }
        }).then(file => {
          console.log('文件上传成功')
          this.insertText(`![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/600)`)
        })
        
      }
    }
  },
  insertText(str) {
    const start = Editor.$textarea.selectionStart
    const end = Editor.$textarea.selectionEnd
    const oldContent = Editor.$textarea.value
    Editor.$textarea.value = oldContent.replace(
      oldContent.substring(start, end), str
    )
    Editor.$textarea.focus()
    Editor.$textarea.setSelectionRange(start, start + str.length)
  }
}



App.init(Menu, Editor, Theme, Transition, Print, imgUploader)