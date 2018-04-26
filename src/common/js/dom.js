//dom.js用来封装一些方法，很基础的DOM操作
export function addClass(el,className){
  if(hasClass(el,className)){
    return
  }
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}
export function hasClass(el,className){
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

export function getData(el,name,val){//获取data-index的值
  const prefix = 'data-'
  name = prefix + name
  if(val){
    return el.setAttribute(name,val)
  }else{
    return el.getAttribute(name)
  }
}

let elementStyle = document.createElement('div').style

let vendor =(()=>{//立即执行函数
  let transformNames = {
    webkit : 'webkitTransform',
    Moz : 'MozTransform',
    O : 'OTransform',
    ms : 'msTransform',
    standard : 'standardTransform'//标准
  }

  for (let key in transformNames){
    if(elementStyle[transformNames[key]] !== undefined){
      return key //返回对应的前缀
    }
  }
  return false  //所有都不支持这个浏览器一定是有毛病的
})()


export function prefixStyle(style){//我们把传入的style加入一个前缀prefix
  if(vendor===false){//如果供应商为false的话 就直接return
    return false
  }

  if(vendor === 'standard'){//标准
    return style
  }

  return vendor + style.charAt(0).toUpperCase()+style.substr(1)//拼接+style第一个字符大写，然后再加上剩余部分
}
