//辅助函数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

//洗牌函数
export function shuffle(arr) {//他接收一个arr，他的思路就是遍历arr
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]//临时变量t
    _arr[i] = _arr[j]//两个调换
    _arr[j] = t//两个调换
  }
  return _arr
}

export function debounce(func, delay) {//截流函数，对一个函数截流他返回一个新的函数
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}