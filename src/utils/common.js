
export function setLocal(name,obj){
  window.localStorage.setItem(name,JSON.stringify(obj))
}

export function getLocal(name){
  return window.localStorage.getItem(name)
}

export function clearLocal(name){
  window.localStorage.clear()
}

export function removeLocal(name){
  window.localStorage.removeItem (name)
}