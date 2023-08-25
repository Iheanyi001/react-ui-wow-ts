export const on = (el:Element, eventName:string, callback:EventListener, opts:  boolean | PassiveEventObj
) => {
    opts = false
    if (el.addEventListener) {
        el.addEventListener(eventName, callback, opts)
    } else if (el.attachEvent) {
        el.attachEvent(`on${eventName}`, (e:Event) => {
            callback.call(el, e || window.event)
        })
    }
}

export const off = (el:Element, eventName:string, callback:EventListener, opts: boolean | PassiveEventObj) => {
    opts = false
    if (el.removeEventListener) {
        el.removeEventListener(eventName, callback, opts)
    } else if (el.detachEvent) {
        el.detachEvent(`on${eventName}`, callback)
    }
}
