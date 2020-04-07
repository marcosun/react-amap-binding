interface IThis {
  props: any;
}

/**
 * Event callback factory.
 * By reading and executing callback function from props every time the event callback is called,
 * changes made to event callbacks will be honoured.
 * However if not implement this way, one may cancel an event listener and attach a new listener
 * if props get updated.
 * Signature:
 * (target, ...event) => void
 * target: AMap target component instance.
 * event: AMap event.
 */
export default function (eventName: string, target: any) {
  return function eventCallback(this: IThis, ...params: any[]) {
    const callback = this.props[eventName];
    if (typeof callback === 'function') {
      /**
       * Target is map instance if event is watched in AMap.
       * Target is circle instance if event is watched in Circle.
       * Map instance should be access via context.
       */
      callback(target, ...params);
    }
  };
}
