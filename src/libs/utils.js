export function debounce (fn, times) {
  let timer = null
  return function () {
    let context = this
    let args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, times)
  }
}

export function blobToFile (data) {
  const { contexttype } = data
  var reader = new FileReader()
  var b = new Blob([data.context])
  reader.onload = function (event) {
    data.context = reader.result// 内容就在这里
  }
  switch (contexttype) {
    case 'text':
      reader.readAsText(b)
      break
    case 'audio':
      reader.readAsDataURL(b)
      break
    case 'pic':
      reader.readAsDataURL(b)
      break
    case 'video':
      reader.readAsText(b)
      break
  }
}

/**
 * 时间格式化函数, 按照指定格式化字符串格式化传入时间
 *
 * @param {Date} time 需要格式化的时间
 * @param {String} fmStr 定义时间的格式
 * yyyy: 代表四位数年份
 * yy: 代表两位数年份
 * mm: 代表月份(小于10时补0)
 * dd: 代表日期(小于10时补0)
 *hh: 代表小时(小于10时补0)
 *MM: 代表分钟(小于10时补0)
 *ss: 代表秒数(小于10时补0)
 *SSS: 代表毫秒数
 *w: 代表周几(数字)
 *W: 代表周几(中文)
 *ww: 代表周几(英文)
 * @returns {String} 返回格式化的时间
 */
export function timeFormat (date, fmStr) {
  const weekCN = '一二三四五六日'
  const weekEN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  var time = new Date(Number(date))
  let year = time.getFullYear()
  let month = time.getMonth() + 1
  let day = time.getDate()
  let hours = time.getHours()
  let minutes = time.getMinutes()
  let seconds = time.getSeconds()
  let milliSeconds = time.getMilliseconds()
  let week = time.getDay()

  month = month >= 10 ? month : ('0' + month)
  day = day >= 10 ? day : ('0' + day)
  hours = hours >= 10 ? hours : ('0' + hours)
  minutes = minutes >= 10 ? minutes : ('0' + minutes)
  seconds = seconds >= 10 ? seconds : ('0' + seconds)

  if (fmStr.indexOf('yyyy') !== -1) {
    fmStr = fmStr.replace('yyyy', year)
  } else {
    fmStr = fmStr.replace('yy', (year + '').slice(2))
  }
  fmStr = fmStr.replace('mm', month)
  fmStr = fmStr.replace('dd', day)
  fmStr = fmStr.replace('hh', hours)
  fmStr = fmStr.replace('MM', minutes)
  fmStr = fmStr.replace('ss', seconds)
  fmStr = fmStr.replace('SSS', milliSeconds)
  fmStr = fmStr.replace('W', weekCN[week - 1])
  fmStr = fmStr.replace('ww', weekEN[week - 1])
  fmStr = fmStr.replace('w', week)

  return fmStr
}

export function getVideoCover (data) {
  return new Promise((resolve, reject) => {
    var dataURL
    let video = document.createElement('video')
    video.setAttribute('crossOrigin', 'anonymous') // 处理跨域
    video.setAttribute('src', data)
    video.setAttribute('width', 400)
    video.setAttribute('height', 240)
    video.currentTime = 1
    video.addEventListener('loadeddata', function () {
      var canvas = document.createElement('canvas')
      canvas.width = video.width
      canvas.height = video.height
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.width)
      dataURL = canvas.toDataURL('image/jpeg')
      resolve(dataURL)
    })
  })
}
