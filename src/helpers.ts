export function getFirstPathStar(path: string) {
  if (path.length > 1) {
    for (let i = 2; i < path.length; i++) {
      if (path[i] === '/') {
        return path.slice(0, i + 1) + '*'
      }
    }
    return path + '/*'
  } else {
    return '/*'
  }
}

export function removeTheStar(path: string) {
  return path.slice(0, path.length - 2)
}

export function getShortName(path: string) {
  if (path.length > 0 && path !== '/') {
    if (path[path.length - 1] === '/') {
      return getShortNameRec(path.slice(0, path.length - 1), path.length - 2)
    } else {
      return getShortNameRec(path, path.length - 1)
    }
  } else {
    return '/'
  }
}

function getShortNameRec(path: string, index: number): string {
  if (path[index] === '/') {
    return path.slice(index + 1, path.length)
  } else {
    return getShortNameRec(path, index - 1)
  }
}