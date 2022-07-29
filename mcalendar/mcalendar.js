(() => {
    const DIV = 'div';

    const A_DAY = 'data-day';
    const A_DATE = 'data-date';
    const A_MONTH = 'data-month';
    const A_YEAR = 'data-year';
    const A_CODE = 'data-date-code';
    const A_GRID_EL_DATA = 'data-data';

    const PREFIX = 'mcalendar';
    const MONTH_CLASSNAME = `${PREFIX}-month`;
    const DATE_CLASSNAME = `${PREFIX}-date`;
    const DATE_FROM_THIS_MONTH = `${PREFIX}-date_tm`;
    const DATE_NOT_FROM_THIS_MONTH_CLASSNAME = `${PREFIX}-date_ntm`;
    const DAY_CLASSNAME = `${PREFIX}-day`;

    const DAY_ACTIVE_CLASSNAME = `${PREFIX}-day_active`;

    const GRID_CLASSNAME = `${PREFIX}-grid`;

    const GRID_ELEMENT_CLASSNAME = `${PREFIX}-grid-element`;

    const CALENDAR_HEADER_CLASSNAME = `${PREFIX}-header`;
    const ARR_L_CLASSNAME = `${PREFIX}-arr-l`;
    const ARR_R_CLASSNAME = `${PREFIX}-arr-r`;
    const HEADER_BUTTON_CLASSNAME = `${PREFIX}-header-button`;


    const CALENDAR_CLASSNAME = `${PREFIX}-calendar`;

    const WEEK_DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const VIEW_DAYS = 0;
    const VIEW_YEARS = 1;
    const VIEW_MONTHES = 2;

    function createElement(tagName, data) {
        const el = document.createElement(tagName);

        (data.classNames || []).forEach(className => {
            el.classList.add(className);
        });

        Object.entries(data.attrs || {}).forEach((entrie) => {
            el.setAttribute(entrie[0], entrie[1]);
        });

        Object.entries(data.listeners || {}).forEach((entrie) => {
            el.addEventListener(entrie[0], entrie[1]);
        });

        Object.entries(data.style || {}).forEach((entrie) => {
            el.style[entrie[0]] = entrie[1];
        });

        if (data.innerHTML) {
            el.innerHTML = data.innerHTML;
        }

        return el;
    }

    class MCalendar {
        constructor(weekStarFrom, hilightFn, onclick) {
            this.onclick = onclick;
            this.hilightFn = hilightFn;
            this.weekStarFrom = weekStarFrom || 1;
            const date = new Date();
            this.activeDateCode = this.getCodeByDate(date);

            this.activeYear = date.getFullYear();
            this.activeMonth = date.getMonth();
        }

        createCalendarHTMLEl() {
            const date = new Date();

            const calendarEl = createElement(DIV, {
                classNames: [CALENDAR_CLASSNAME]
            });

            const headerEl = createElement(DIV, {
                classNames: [CALENDAR_HEADER_CLASSNAME]
            });

            const arrLEl = createElement(DIV, {
                classNames: [ARR_L_CLASSNAME],
                listeners: {
                    click: () => {
                        if (this.currentView === VIEW_YEARS) {
                            if (this.activeYear < 2000) { return; }
                            this.activeYear -= 12;
                            this.renderYearsView();
                        }

                        if (this.currentView === VIEW_DAYS) {
                            this.activeMonth--;
                            if (this.activeMonth < 0) {
                                this.activeMonth = 1;
                                this.activeYear--;
                            }
                            this.contentEl.innerHTML = '';
                            this.contentEl.appendChild(this.createMonthHTMLEl(this.activeYear, this.activeMonth));
                            this.updateHeader();
                        }
                    }
                }
            });

            const arrREl = createElement(DIV, {
                classNames: [ARR_R_CLASSNAME],
                listeners: {
                    click: () => {
                        if (this.currentView === VIEW_YEARS) {
                            if (this.activeYear > 2400) { return; }
                            this.activeYear += 12;
                            this.renderYearsView();
                        }

                        if (this.currentView === VIEW_DAYS) {
                            this.activeMonth++;
                            if (this.activeMonth > 11) {
                                this.activeMonth = 0;
                                this.activeYear++;
                            }
                            this.contentEl.innerHTML = '';
                            this.contentEl.appendChild(this.createMonthHTMLEl(this.activeYear, this.activeMonth));
                            this.updateHeader();
                        }
                    }
                }
            });

            const monthEl = createElement(DIV, {
                className: [HEADER_BUTTON_CLASSNAME],
                innerHTML: MONTH_NAMES[date.getMonth()],
                listeners: {
                    click: (e) => { this.renderMonthesView(e) }
                }
            });

            const yearEl = createElement(DIV, {
                className: [HEADER_BUTTON_CLASSNAME],
                innerHTML: date.getFullYear(),
                listeners: {
                    click: () => { this.renderYearsView() }
                }
            });

            headerEl.appendChild(arrLEl);
            headerEl.appendChild(monthEl);
            headerEl.appendChild(yearEl);
            headerEl.appendChild(arrREl);

            this.contentEl = createElement(DIV, {});

            calendarEl.appendChild(headerEl);
            calendarEl.appendChild(this.contentEl);

            this.yearEl = yearEl;
            this.monthEl = monthEl;

            this.contentEl.appendChild(this.createMonthHTMLEl(date.getFullYear(), date.getMonth()));
            this.currentView = VIEW_DAYS;

            return calendarEl;
        }

        updateHeader() {
            this.yearEl.innerHTML = this.activeYear;
            this.monthEl.innerHTML = MONTH_NAMES[this.activeMonth];
        }

        renderMonthesView() {
            this.updateHeader();
            this.contentEl.innerHTML = '';
            this.contentEl.appendChild(this.createSelectMonthHTMLEl(this.activeYear));
            this.currentView = VIEW_MONTHES;
        }

        renderYearsView() {
            this.updateHeader();
            const yearGroup = Math.floor(this.activeYear / 12);
            const years = new Array(12).fill(0).map((e, i) => yearGroup * 12 + i);
            this.contentEl.innerHTML = '';
            this.currentView = VIEW_YEARS;
            this.contentEl.appendChild(this.createGridSelectEl(4, 3, years, years, {
                click: (e) => {
                    const target = e.target;
                    const year = +target.getAttribute(A_GRID_EL_DATA);
                    this.activeYear = year;
                    this.renderMonthesView();
                }
            },
                (code, el) => {
                    if (code === this.activeYear) {
                        el.classList.add('active');
                    }
                }
            ));
        }

        getCodeByDate(date) {
            return `${date.getDate()}${date.getMonth()}${date.getFullYear()}`;
        }

        createMonthHTMLEl(year, month) {
            const monthEl = createElement(DIV, {
                classNames: [MONTH_CLASSNAME],
            });

            (function addWeekNames() {
                for (let i = this.weekStarFrom; i < this.weekStarFrom + 7; i++) {
                    monthEl.appendChild(createElement(DIV, {
                        classNames: [DAY_CLASSNAME],
                        innerHTML: WEEK_DAY_NAMES[(i - 1) % 7]
                    }));
                }
            }).apply(this);

            const date = new Date(year, month, 1);
            const day = date.getDay();
            const dayInCurrentWeekSystem = (((7 - this.weekStarFrom) + day)) % 7 + 1;

            (function addDaysFromPrevMonth() {
                const prevMonth = new Date(date);
                prevMonth.setDate(prevMonth.getDate() - dayInCurrentWeekSystem + 1);

                for (let i = 1; i < dayInCurrentWeekSystem; i++) {
                    monthEl.appendChild(createElement(DIV, {
                        classNames: [DATE_CLASSNAME, DATE_NOT_FROM_THIS_MONTH_CLASSNAME, ...this.getDateAdditionalClasses(date)],
                        innerHTML: prevMonth.getDate(),
                        attrs: {
                            [A_DAY]: prevMonth.getDay(),
                            [A_DATE]: prevMonth.getDate(),
                            [A_MONTH]: prevMonth.getMonth(),
                            [A_YEAR]: prevMonth.getFullYear(),
                            [A_CODE]: this.getCodeByDate(prevMonth)
                        },
                        listeners: {
                            click: this.onDayClick.bind(this)
                        }
                    }));
                    prevMonth.setDate(prevMonth.getDate() + 1)
                }
            }).apply(this);

            (function addDaysFromThisMonth() {
                while (date.getMonth() === month) {
                    monthEl.appendChild(createElement(DIV, {
                        classNames: [DATE_CLASSNAME, DATE_FROM_THIS_MONTH, ...this.getDateAdditionalClasses(date)],
                        innerHTML: date.getDate(),
                        attrs: {
                            [A_DAY]: date.getDay(),
                            [A_DATE]: date.getDate(),
                            [A_MONTH]: date.getMonth(),
                            [A_YEAR]: date.getFullYear(),
                            [A_CODE]: this.getCodeByDate(date)
                        },
                        listeners: {
                            click: this.onDayClick.bind(this)
                        }
                    }));

                    date.setDate(date.getDate() + 1);
                }
            }).apply(this);

            (function addDaysFromNextMonth() {
                while (monthEl.children.length % 7 !== 0) {
                    monthEl.appendChild(createElement(DIV, {
                        classNames: [DATE_CLASSNAME, DATE_NOT_FROM_THIS_MONTH_CLASSNAME, ...this.getDateAdditionalClasses(date)],
                        innerHTML: date.getDate(),
                        attrs: {
                            [A_DAY]: date.getDay(),
                            [A_DATE]: date.getDate(),
                            [A_MONTH]: date.getMonth(),
                            [A_YEAR]: date.getFullYear(),
                            [A_CODE]: this.getCodeByDate(date)
                        },
                        listeners: {
                            click: this.onDayClick.bind(this)
                        }
                    }));

                    date.setDate(date.getDate() + 1);
                }
            }).apply(this);

            return monthEl;
        }

        getDateAdditionalClasses(date) {
            const code = this.getCodeByDate(date);
            const classNames = [];
            if (code === this.activeDateCode) {
                classNames.push(DAY_ACTIVE_CLASSNAME)
            }

            classNames.push(...(this.hilightFn(code) || []))

            return classNames;
        }

        onDayClick(e) {
            const target = e.target;
            const day = +target.getAttribute(A_DAY);
            const date = +target.getAttribute(A_DATE);
            const month = +target.getAttribute(A_MONTH);
            const year = +target.getAttribute(A_YEAR);

            const code = +target.getAttribute(A_CODE);
            try {
                document.querySelector('.mcalendar-day_active').classList.remove('mcalendar-day_active');
            } catch (e) { }
            target.classList.add('mcalendar-day_active');
            this.activeDateCode = code;
            this.onclick(code, year, month, date);
        }

        createSelectMonthHTMLEl(year) {
            return this.createGridSelectEl(4, 3, MONTH_NAMES, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], {
                click: (e) => {
                    const target = e.target;
                    const month = +target.getAttribute(A_GRID_EL_DATA);
                    this.contentEl.innerHTML = '';
                    this.contentEl.appendChild(this.createMonthHTMLEl(year, month));
                    this.currentView = VIEW_DAYS;
                    this.updateHeader();
                }
            }, (code, el) => {
                if (code === this.activeMonth) {
                    el.classList.add('active');
                }
            })
        }

        createGridSelectEl(sizeX, sizeY, elements, data, listeners, postfn) {
            const gridEl = createElement(DIV, {
                classNames: [GRID_CLASSNAME],
                style: {
                    'grid-template-columns': `repeat(${sizeX}, 1fr)`
                }
            });

            for (let i = 0; i < sizeY; i++) {
                for (let j = 0; j < sizeX; j++) {
                    const el = createElement(DIV, {
                        classNames: [GRID_ELEMENT_CLASSNAME],
                        innerHTML: elements[i * (sizeY + 1) + j],
                        attrs: {
                            [A_GRID_EL_DATA]: data[i * (sizeY + 1) + j]
                        },
                        listeners
                    });
                    gridEl.appendChild(el);
                    postfn(data[i * (sizeY + 1) + j], el);
                }
            }

            return gridEl;
        }

    }


    if (window) {
        window.MCalendar = MCalendar;
    }
})()

