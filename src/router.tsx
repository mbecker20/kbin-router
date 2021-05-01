import React, { Fragment, ReactNode, useEffect } from "react"
import { stringIn, useReRender, genUpdateID } from "kbin-state"
import { getShortName, getFirstPathStar, toRouterName } from "./helpers"
import { Router } from "./types"

function createRouter(title: string) {
  const router: Router = {
    path: '/',
    routes: {}
  }

  window.addEventListener('popstate', () => {
    initialize()
    window.dispatchEvent(new Event('route_update'))
  })

  function addRoute(path: string, component: () => ReactNode) {
    if (router.routes[path]) {
      throw new Error("route already exists");
    } else {
      Object.assign(router.routes, { [path]: component })
    }
  }

  function removeRoute(path: string) {
    delete router.routes[path]
  }

  function addRoutes(routes: { [path: string]: () => ReactNode }) {
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
      addRoute(rootPath + toRouterName(obj[id].name), () => component(id))
    })
  }

  function addObjectSubroutesByName(
    rootPath: string,
    obj: { [id: string]: { name: string } },
    subroute: string,
    component: (id: string) => ReactNode
  ) {
    Object.keys(obj).forEach(id => {
      addRoute(`${rootPath}${toRouterName(obj[id].name)}/${subroute}`, () => component(id))
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
      const addTitle = getShortName(router.path).replaceAll('_', ' ')
      const _title = addTitle.length > 1 ? `${title} - ${addTitle}` : title
      window.history.pushState(
        { id },
        _title,
        router.path
      )
      document.title = _title
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
    const addTitle = getShortName(router.path).replaceAll('_', ' ')
    const _title = addTitle.length > 1 ? `${title} - ${addTitle}` : title
    window.history.replaceState(
      { id },
      _title,
      router.path
    )
    document.title = _title
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
      const addTitle = getShortName(router.path).replaceAll('_', ' ')
      const _title = addTitle.length > 0 ? `${title} - ${addTitle}` : title
      window.history.pushState(
        { id },
        _title,
        router.path
      )
      document.title = _title
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
    const addTitle = getShortName(router.path).replaceAll('_', ' ')
    const _title = addTitle.length > 1 ? `${title} - ${addTitle}` : title
    window.history.replaceState(
      { id },
      _title,
      router.path
    )
    document.title = _title
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
    const last = getShortName(path)
    return (
      <Fragment>
        { 
          routes[path] ? routes[path]() : 
          routes[firstPathStar] ? routes[firstPathStar](last) : null
        }
      </Fragment>
    )
  }

  return {
    addRoute,
    addRoutes,
    addObjectRoutesByName,
    addObjectSubroutesByName,
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

