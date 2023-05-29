import cloneDeep from 'clone-deep'
import flat from 'array.prototype.flat'
import { __inst, __vue } from '@/store'

export function isArray(value) {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(value)
  } else {
    return Object.prototype.toString.call(value) === '[object Array]'
  }
}

export function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function isNumber(value) {
  return !isNaN(Number(value))
}

export function isFunction(value) {
  return typeof value === 'function'
}

export function isString(value) {
  return typeof value === 'string'
}

export function isNull(value) {
  return !value && value !== 0
}

export function isBoolean(value) {
  return typeof value === 'boolean'
}

export function isEmpty(value) {
  if (isArray(value)) {
    return value.length === 0
  }

  if (isObject(value)) {
    return Object.keys(value).length === 0
  }

  return value === '' || value === undefined || value === null
}

export function clone(obj) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))
}

export function getParent(name) {
  let parent = this.$parent

  while (parent) {
    if (parent.$options.componentName !== name) {
      parent = parent.$parent
    } else {
      return parent
    }
  }

  return null
}

export function dataset(obj, key, value, isMerge) {
  const isGet = value === undefined
  let d = obj

  const arr = flat(
    key.split('.').map((e) => {
      if (e.includes('[')) {
        return e.split('[').map((e) => e.replace(/"/g, ''))
      } else {
        return e
      }
    })
  )

  try {
    for (let i = 0; i < arr.length; i++) {
      const e = arr[i]
      let n = null

      if (e.includes(']')) {
        const [k, v] = e.replace(']', '').split(':')

        if (v) {
          n = d.findIndex((x) => x[k] === v)
        } else {
          n = Number(n)
        }
      } else {
        n = e
      }

      if (i !== arr.length - 1) {
        d = d[n]
      } else {
        if (isGet) {
          return d[n]
        } else {
          if (isMerge) {
            // 如果有就合并属性,如果没有就设置属性
            if (d[n]) {
              deepMerge(d[n], value)
            } else {
              __inst.$set(d, n, value)
            }
          } else {
            __inst.$set(d, n, value)
          }
        }
      }
    }

    return obj
  } catch (e) {
    console.error('格式错误', `${key}`)
    return {}
  }
}

export function deepMerge(obj1, obj2) {
  for (const key in obj2) {
    obj1[key] = obj1[key] && obj1[key].toString() === '[object Object]' ? deepMerge(obj1[key], obj2[key]) : obj1[key] = obj2[key]
  }
  return obj1
}

// export function deepMerge(a, b) {
//   let k
//   for (k in b) {
//     a[k] =
// a[k] && a[k].toString() === '[object Object]' ? deepMerge(a[k], b[k]) : (a[k] = b[k])
//   }
//   return a
// }

export function contains(parent, node) {
  if (document.documentElement.contains) {
    return parent !== node && parent.contains(node)
  } else {
    while (node && (node = node.parentNode)) if (node === parent) return true
    return false
  }
}

export function getInstance(component) {
  const ComponentConstructor = __vue.extend(component)
  return new ComponentConstructor({
    el: document.createElement('div')
  })
}

export { cloneDeep, flat }
