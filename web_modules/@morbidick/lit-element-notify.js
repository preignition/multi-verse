import { d as directive } from '../common/directive-651fd9cf.js';

/**
 * Returns the event name for the given property.
 * @param  {string}                       name    property name
 * @param  {PropertyDeclaration} options property declaration
 * @return                                event name to fire
 */
function eventNameForProperty(name, { notify, attribute } = {}) {
    if (notify && typeof notify === 'string') {
        return notify;
    } else if (attribute && typeof attribute === 'string') {
        return `${attribute}-changed`;
    } else {
        return `${name.toLowerCase()}-changed`;
    }
}

// eslint-disable-next-line valid-jsdoc
/**
 * Enables the nofity option for properties to fire change notification events
 *
 * @template TBase
 * @param {Constructor<TBase>} baseElement
 */
const LitNotify = (baseElement) => class NotifyingElement extends baseElement {
    /**
     * check for changed properties with notify option and fire the events
     */
    update(changedProps) {
        super.update(changedProps);

        for (const prop of changedProps.keys()) {
            const declaration = this.constructor._classProperties.get(prop);
            if (!declaration || !declaration.notify) continue;
            const type = eventNameForProperty(prop, declaration);
            const value = this[prop];
            this.dispatchEvent(new CustomEvent(type, { detail: { value } }));
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Mixin that provides a lit-html directive to sync a property to a child property
 *
 * @template TBase
 * @param {Constructor<TBase>} baseElement
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
                    const oldValue = this[property];
                    this[property] = e.detail.value;
                    if (this.__lookupSetter__(property) === undefined) {
                        this.updated(new Map([[property, oldValue]]));
                    }
                });
            }
        });
    }
};

export { LitNotify, LitSync };
