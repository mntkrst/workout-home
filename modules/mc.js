
/**
 * @typedef MCParams
 * @type {object}
 * @property {string} html - an HTML.
 * @property {string} name - an Component Name.
 * @property {string} afterCreate - after create event.
 */


class MCFactory {
    /**
     * @param {MCParams} params
     */
    constructor(params) {
        this.html = params.html;
        this.name = params.name;
        this.afterCreate = params.afterCreate || (() => { });
    }

    create(data, listeners) {
        this.listeners = listeners;
        const id = `c_${this.name}_${Math.round(Math.random() * 100000)}_${Date.now()}`;
        const element = MCFactory.createElementFromHTML(this.html);

        Array.from(element.querySelectorAll('[data-for]')).forEach((templateEl) => {
            const param = templateEl.getAttribute('data-for');
            data[param].forEach(value => {
                const el = MCFactory.createElementFromHTML(templateEl.outerHTML);
                this.binding(el, value);
                this.eventListeners(el, value, listeners);
                templateEl.insertAdjacentElement('beforebegin', el);
            });
            templateEl.parentNode.removeChild(templateEl);
        });

        this.binding(element, data);
        this.eventListeners(element, data, listeners);

        this.afterCreate(data, this, element);

        return element;
    }

    binding(el, context) {
        const innerBind = el.getAttribute('data-bind');
        Array.from(el.querySelectorAll('[data-bind]:not([data-processed]), [data-bind-attr]:not([data-processed])'))
            .forEach(_el => this.binding(_el, context));

        if (innerBind) {
            el.innerHTML = MCFactory.paramFromContext(context, innerBind);
        }

        const attrBind = el.getAttribute('data-bind-attr');
        if (attrBind) {
            attrBind.split('||').map(a => a.split('|')).forEach((bind) => {
                const attrName = bind[0];
                const attrValue = MCFactory.paramFromContext(context, bind[1])
                el.setAttribute(attrName, attrValue);
            })
        }

        el.setAttribute('data-processed', '');
    }

    eventListeners(el, context, listeners) {
        Array.from(el.querySelectorAll('[data-on-click]:not([data-processed-events]'))
            .forEach(_el => this.eventListeners(_el, context, listeners));

        if (!el.getAttribute('data-on-click')) { return; }
        const dataOnClickParams = el.getAttribute('data-on-click').split('|');
        const listenerName = dataOnClickParams.splice(0, 1);
        const values = dataOnClickParams.map(p => MCFactory.paramFromContext(context, p));
        if (listeners[listenerName]) {
            el.addEventListener('click', (e) => listeners[listenerName](e, ...values));
        }
        el.setAttribute('data-processed-events', '');
    }

    static paramFromContext(context, param) {
        if (param === 'context') {
            return context;
        } else {
            if (!context[param]) {
                return '\\NO PARAM';
            }
            return context[param];
        }
    }

    static createElementFromHTML(html) {
        const container = document.createElement('div');
        container.innerHTML = html;
        return container.children[0];
    }
}