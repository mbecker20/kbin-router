import React, { Fragment, ReactNode, useEffect } from "react"
import { stringIn, useReRender, genUpdateID } from "kbin-state"
import { getShortName, getFirstPathStar } from "./helpers"
import { Router } from "./types"

const TITLE = 'monitor'

function createRouter() {
  const router: Router = {
    path: '/',
    routes: {}
  }

  window.addEventListener('popstate', () => {
    initialize()
    window.dispatchEvent(new Event('route_update'))
  })

  function addRoute(path: string, component: ReactNode) {
    if (router.routes[path]) {
      throw new Error("route already exists");
    } else {
      Object.assign(router.routes, { [path]: component })
    }
  }

  function removeRoute(path: string) {
    delete router.routes[path]
  }

  function addRoutes(routes: { [path: string]: ReactNode }) {
    Object.keys(routes).forEach(path => {
      addRoute(path, routes[path])
    })
  }

  function addObjectRoutesByName(
    rootPath: string,
    obj: { [id: string]: { name: string } },
    component: (id: string) => ReactNode
  ) {
    Object.keys(obj).forEach(id => {
      addRoute(rootPath + obj[id].name, component(id))
    })
  }

  function navigate(path: string) {
    if (router.path !== path) {
      if (router.routes[path]) {
        router.path = path
      } else if (router.routes[getFirstPathStar(path)]) {
        router.path = getFirstPathStar(path)
        const end = router.path.length > 2 ? router.path.length - 2 : router.path.length - 1
        router.path = router.path.slice(0, end)
      } else {
        router.path = '/'
      }
      window.dispatchEvent(new Event('route_update'))
      const id = genUpdateID(0)
      const addTitle = getShortName(router.path)
      const title = addTitle.length > 1 ? `${TITLE} - ${addTitle}` : TITLE
      window.history.pushState(
        { id },
        title,
        router.path
      )
      document.title = title
    }
  }

  function replaceNavigate(path: string) {
    if (router.routes[path]) {
      router.path = path
    } else if (router.routes[getFirstPathStar(path)]) {
      router.path = getFirstPathStar(path)
      router.path = router.path.slice(0, router.path.length - 2)
    } else {
      router.path = '/'
    }
    window.dispatchEvent(new Event('route_update'))
    const id = genUpdateID(0)
    const addTitle = getShortName(router.path)
    const title = addTitle.length > 1 ? `${TITLE} - ${addTitle}` : TITLE
    window.history.replaceState(
      { id },
      title,
      router.path
    )
    document.title = title
  }

  function softNavigate(path: string) {
    if (router.path !== path) {
      if (router.routes[path]) {
        router.path = path
      } else if (router.routes[getFirstPathStar(path)]) {
        router.path = getFirstPathStar(path)
        router.path = router.path.slice(0, router.path.length - 2)
      } else {
        router.path = '/'
      }
      const id = genUpdateID(0)
      const addTitle = getShortName(router.path)
      const title = addTitle.length > 0 ? `${TITLE} - ${addTitle}` : TITLE
      window.history.pushState(
        { id },
        title,
        router.path
      )
      document.title = title
    }
  }

  function softReplaceNavigate(path: string) {
    if (router.routes[path]) {
      router.path = path
    } else if (router.routes[getFirstPathStar(path)]) {
      router.path = getFirstPathStar(path)
      router.path = router.path.slice(0, router.path.length - 2)
    } else {
      router.path = '/'
    }
    window.dispatchEvent(new Event('route_update'))
    const id = genUpdateID(0)
    const addTitle = getShortName(router.path)
    const title = addTitle.length > 1 ? `${TITLE} - ${addTitle}` : TITLE
    window.history.replaceState(
      { id },
      title,
      router.path
    )
    document.title = title
  }

  function matchToRoutes(path: string) {
    const routes = Object.keys(router.routes)
    if (stringIn(path, routes) || stringIn(getFirstPathStar(path), routes)) {
      return path
    } else {
      return '/'
    }
  }

  function initialize() {
    router.path = matchToRoutes(window.location.pathname)
    softReplaceNavigate(router.path)
  }

  function removeAllRoutes() {
    Object.keys(router.routes).forEach(path => {
      removeRoute(path)
    })
  }

  function getPath() {
    return router.path
  }

  function useRouter() {
    const reRender = useReRender()
    useEffect(() => {
      window.addEventListener('route_update', reRender)
      return () => {
        window.removeEventListener('route_update', reRender)
      }
    }, [])
  }

  function Router() {
    useRouter()
    const { routes, path } = router
    const firstPathStar = getFirstPathStar(path)
    return (
      <Fragment>
        { 
          routes[path] ? routes[path] : 
          routes[firstPathStar] ? routes[firstPathStar] : null
        }
      </Fragment>
    )
  }

  return {
    addRoute,
    addRoutes,
    addObjectRoutesByName,
    removeRoute,
    removeAllRoutes,
    navigate,
    replaceNavigate,
    softNavigate,
    softReplaceNavigate,
    getPath,
    initialize,
    useRouter,
    Router
  }
}

export default createRouter

