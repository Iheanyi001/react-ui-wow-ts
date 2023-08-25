/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState, createElement } from 'react';
import { on, off } from './utils/events';
//import './itanimate.css';
import scrollParent from './utils/scrollParent';
import splice from './utils/splice';
import { supportedHTMLElements } from './utils/supportedElements';

const target = {
  element: 'div',
};

let passiveEventSupported = false;

try {
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      passiveEventSupported = true;
      return null;
    },
  });
  //window.addEventListener('test', null, opts);
} catch (e) {
  console.log("");
}

const passiveEvent : boolean | PassiveEventObj = passiveEventSupported
  ? { capture: false, passive: true }
  : false;

const ReactUIWowElement = (tag:string) => {
  const Main = ({
    disabled = false,
    overflow = false,
    offset = 0,
    animation = '',
    animateClass = 'animated',
    className = '',
    scroll = true,
    resize = true,
    children,
    style,
    ...props
  }) => {
    const [key, setKey] = useState(0);
    const component = useRef<HTMLElement>();
    const [isVisible, setIsVisible] = useState(false);
    const [stopped, setStopped] = useState(true);
    const LISTEN_FLAG = 'data-react-wow';
    const defaultBoundingClientRect = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
    };

    const retClassName= isVisible
    ? `${animation} ${!stopped ? animateClass : 'sloeo'} ${className}`.trim()
    : `${animation} ${className}`.trim();

    const checkOverflowVisible = (component:HTMLElement, parent:HTMLElement | ParentNode | Node) => {
      const node = component;

      let parentTop;
      let parentHeight;

      try {
        ({ top: parentTop, height: parentHeight } = parent.getBoundingClientRect());
      } catch (e) {
        ({ top: parentTop, height: parentHeight } = defaultBoundingClientRect);
      }

      const windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;

      const intersectionTop = Math.max(parentTop, 0);
      const intersectionHeight = Math.min(windowInnerHeight, parentTop + parentHeight) - intersectionTop;

      let top;
      let height;

      try {
        ({ top, height } = node.getBoundingClientRect());
      } catch (e) {
        ({ top, height } = defaultBoundingClientRect);
      }

      const offsetTop = top - intersectionTop;

      const offsets = Array.isArray(offset) ? offset : [offset, offset];

      return (offsetTop - offsets[0] <= intersectionHeight) && (offsetTop + height + offsets[1] >= 0);
    };

    const checkNormalVisible = (component:HTMLElement) => {
      const node = component;

      if (!(node.offsetWidth || node.offsetHeight || node.getClientRects().length)) return false;

      let top;
      let elementHeight;

      try {
        ({ top, height: elementHeight } = node.getBoundingClientRect());
      } catch (e) {
        ({ top, height: elementHeight } = defaultBoundingClientRect);
      }

      const windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;

      const offsets = Array.isArray(offset) ? offset : [offset, offset];

      return (top - offsets[0] <= windowInnerHeight) && (top + elementHeight + offsets[1] >= 0);
    };

    // Rest of the functions and logic...
    //const caches = { listeners: [], pending: [] };

    interface CacheType {
        listeners: HTMLElement[],
        pending: HTMLElement[],
    }


    const cachesType : CacheType = {
        listeners : [],
        pending : [],
    }

    const checkVisible = (component) => {
      const node = component;
      if (!node) {
        return;
      }
    
      const parent = scrollParent(node);
      const isOverflow =
        overflow &&
        parent !== node.ownerDocument &&
        parent !== document &&
        parent !== document.documentElement;
    
      const visible = isOverflow
        ? checkOverflowVisible(component, parent)
        : checkNormalVisible(component);
    
      if (visible) {
        if (!isVisible) {
          cachesType.pending.push(component);
          setIsVisible(!isVisible);
          setStopped(!stopped);
          setKey((k) => k + 1);
        }
      }
    };
    
    const purgePending = () => {
      cachesType.pending.forEach((component) => splice(cachesType.listeners, component));
      cachesType.pending = [];
    };
    
    const scrollHandler = () => {
      cachesType.listeners.forEach((component) => checkVisible(component));
    
      // Remove `once` component in listeners
      purgePending();
    };

    
    
    useEffect((): void  => {
      const current = component.current;
    
      const mounted = () => {
        if (disabled) {
          return null;
        }
    
        if (overflow) {
          const parent = scrollParent(component.current);
          if (parent && typeof parent.getAttribute === 'function') {
            const listenerCount = 1 + +parent.getAttribute(LISTEN_FLAG);
            if (listenerCount === 1) {
              on(parent, 'scroll', scrollHandler, passiveEvent);
            }
            parent.setAttribute(LISTEN_FLAG, listenerCount);
          }
        } else if (!cachesType.listeners.length) {
          if (scroll) {
            on(window, 'scroll', scrollHandler, passiveEvent);
          }
    
          if (resize) {
            on(window, 'resize', scrollHandler, passiveEvent);
          }
        }
    
        cachesType.listeners.push(component.current);
        checkVisible(component.current);
      };
      
      mounted();
      
      const cleanUp =  () : void => {
        if (!disabled) {
         
    
        if (overflow) {
          // const parent = scrollParent(component.current);
          if (parent && typeof parent.getAttribute === 'function') {
            const listenerCount = +parent.getAttribute(LISTEN_FLAG) - 1;
            if (listenerCount === 0) {
              off(parent, 'scroll', scrollHandler, passiveEvent);
              parent.removeAttribute(LISTEN_FLAG);
            } else {
              parent.setAttribute(LISTEN_FLAG, listenerCount);
            }
          }
        }
    
        splice(cachesType.listeners, current);
    
        if (!cachesType.listeners.length) {
          off(window, 'scroll', scrollHandler, passiveEvent);
          off(window, 'resize', scrollHandler, passiveEvent);
        }
      }
    }

      return cleanUp();
    }, []);

    //render Component
    if (supportedHTMLElements.includes(tag)) {
      return createElement(
        tag,
        { className: retClassName, style:style, key:key,
           ref:component, disabled:disabled, ...props},
        children
      );
    }
    if (!supportedHTMLElements.includes(tag)) {
      return children ? children : null;
    }

  };

  return Main;
};

const handler = {
  get(target, prop, receiver) {
    return ReactUIWowElement(prop);
  },
};

const ReactUiWow = new Proxy(target, handler);

export default ReactUiWow;
