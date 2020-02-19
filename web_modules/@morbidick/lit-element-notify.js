import { d as directive } from '../common/directive-9885f5ff.js';

/**
 * Returns the event name for the given property.
 */
function eventNameForProperty(name, options = {}) {
    if (options.notify && typeof options.notify === 'string') {
        return options.notify;
    }

    if (options.attribute && typeof options.attribute === 'string') {
        return `${options.attribute}-changed`;
    }

    return `${name.toLowerCase()}-changed`;
}

/**
 * Enables the nofity option for properties to fire change notification events
 *
 * @param {LitElement} baseElement - the LitElement to extend
 */
const LitNotify = (baseElement) => class extends baseElement {
    /**
     * Extend the LitElement `createProperty` method to map properties to events
     */
    static createProperty(name, options) {
        super.createProperty(name, options);

        if (!this.hasOwnProperty('_propertyEventMap')) {
            this._propertyEventMap = new Map();
        }

        if (options.notify) {
            this._propertyEventMap.set(name, eventNameForProperty(name, options));
        }
    }

    /**
     * check for changed properties with notify option and fire the events
     */
    update(changedProps) {
        super.update(changedProps);

        if (!this.constructor._propertyEventMap) {
            return;
        }

        for (const [eventProp, eventName] of this.constructor._propertyEventMap.entries()) {
            if (changedProps.has(eventProp)) {
                this.dispatchEvent(new CustomEvent(eventName, {
                    detail: {
                        value: this[eventProp],
                    },
                    bubbles: false,
                    composed: true,
                }));
            }
        }
    }
};

/**
 * Mixin that provides a lit-html directive to sync a property to a child property
 *
 * @param {LitElement} baseElement - the LitElement to extend
 */
const LitSync = (baseElement) => class extends baseElement {
    constructor() {
        super();

        /**
         * lit-html directive to sync a property to a child property
         *
         * @param {string} property - The property name
         * @param {string} [eventName] - Optional event name to sync on, defaults to propertyname-changed
         */
        this.sync = directive((property, eventName) => (part) => {
            part.setValue(this[property]);

            // mark the part so the listener is only attached once
            if (!part.syncInitialized) {
                part.syncInitialized = true;

                const notifyingElement = part.committer.element;
                const notifyingProperty = part.committer.name;
                const notifyingEvent = eventName || eventNameForProperty(notifyingProperty);

                notifyingElement.addEventListener(notifyingEvent, (e) => {
                    this[property] = e.detail.value;
                });
            }
        });
    }
};

export { LitNotify, LitSync };
