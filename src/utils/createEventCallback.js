/**
 * Event callback factory.
 * By reading and executing callback function from props every time the event callback is called,
 * changes made to event callbacks will be honoured.
 * However if not implement this way, one may cancel an event listener and attach a new listener
 * if props get updated.
 * @param {string} callbackName - Function name on props.
 * @param {Object} target - Target component instance.
 * @return {Function} - Function to be called as event callback on AMap.
 * Signature:
 * (target, ...event) => void
 * target: AMap target component instance.
 * event: AMap event.
 */
export default function(callbackName, target) {
  return function eventCallback(...params) {
    const callback = this.props[callbackName];
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
