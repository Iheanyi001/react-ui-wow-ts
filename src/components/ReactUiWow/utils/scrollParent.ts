/**
 * @fileOverview Find scroll parent
 */



export default (node:HTMLElement) : HTMLElement | ParentNode | Node=> {
    if (!node) {
        return document.documentElement
    }
   
    const excludeStaticParent:boolean = node.style.position === 'absolute'
    const overflowRegex : RegExp = /(scroll|auto)/
    let parent:ParentNode = node

    while (parent) {
        
        if (!parent.parentNode) {
            return node.ownerDocument || document.documentElement
        }

        const style : CSSStyleDeclaration = window.getComputedStyle(parent as Element)
        
        const position = style.position
        const overflow = style.overflow
        const overflowX = style['overflow-x']
        const overflowY = style['overflow-y']

        if (position === 'static' && excludeStaticParent) {
            parent = parent.parentNode
            continue
        }

        if (overflowRegex.test(overflow) && overflowRegex.test(overflowX) && overflowRegex.test(overflowY)) {
            return parent
        }
        

        parent = parent.parentNode
    }

    

    return node.ownerDocument || node.documentElement || document.documentElement
}
