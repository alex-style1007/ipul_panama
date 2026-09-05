/**
 * Renders the upcoming events carousel and calendar downloads.
 */
(function () {
    'use strict';

    class CalendarInvitationBuilder {
        /**
         * Builds RFC 5545 calendar invitations for website events.
         *
         * @param {string} locale - Browser locale used for invitation content.
         */
        constructor(locale) {
            this.locale = locale;
        }

        /**
         * Creates and downloads an ICS invitation for an event.
         *
         * @param {Object} event - Event data to export.
         * @returns {void}
         */
        download(event) {
            const content = this.build(event);
            const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `${event.id}.ics`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        }

        /**
         * Builds the textual ICS content for an event.
         *
         * @param {Object} event - Event data to export.
         * @returns {string} RFC 5545 content.
         */
        build(event) {
            const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
            const details = [event.title, event.location || '', event.allDay ? event.reserveAllDay : event.time].filter(Boolean).join(' — ');
            const dateLines = event.allDay ? this.buildAllDayDates(event) : this.buildTimedDates(event);

            return [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//IPUL Panama//Upcoming Events//EN',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH',
                'BEGIN:VEVENT',
                `UID:${event.id}@ipulpanama.com`,
                `DTSTAMP:${timestamp}`,
                ...dateLines,
                `SUMMARY:${this.escape(event.title)}`,
                `DESCRIPTION:${this.escape(details)}`,
                event.location ? `LOCATION:${this.escape(event.location)}` : '',
                'END:VEVENT',
                'END:VCALENDAR'
            ].filter(Boolean).join('\r\n');
        }

        /**
         * Builds all-day event date lines using an exclusive ending date.
         *
         * @param {Object} event - All-day event data.
         * @returns {string[]} Calendar date lines.
         */
        buildAllDayDates(event) {
            const start = event.start.replaceAll('-', '');
            const endingDate = new Date(`${event.end || event.start}T12:00:00`);
            endingDate.setDate(endingDate.getDate() + 1);
            const end = this.formatDate(endingDate);

            return [`DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`];
        }

        /**
         * Builds timed event date lines in the Panama time zone.
         *
         * @param {Object} event - Timed event data.
         * @returns {string[]} Calendar date lines.
         */
        buildTimedDates(event) {
            const date = event.start.replaceAll('-', '');
            const startTime = event.startTime.replace(':', '') + '00';
            const endTime = event.endTime.replace(':', '') + '00';

            return [
                `DTSTART;TZID=America/Panama:${date}T${startTime}`,
                `DTEND;TZID=America/Panama:${date}T${endTime}`
            ];
        }

        /**
         * Formats a date for ICS all-day values.
         *
         * @param {Date} value - Date to format.
         * @returns {string} Date in YYYYMMDD format.
         */
        formatDate(value) {
            return [
                value.getFullYear(),
                String(value.getMonth() + 1).padStart(2, '0'),
                String(value.getDate()).padStart(2, '0')
            ].join('');
        }

        /**
         * Escapes text for RFC 5545 properties.
         *
         * @param {string} value - Text to escape.
         * @returns {string} Escaped text.
         */
        escape(value) {
            return String(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
        }
    }

    class UpcomingEventsCarousel {
        /**
         * Coordinates localized event rendering and interaction.
         *
         * @param {HTMLElement} container - Element that receives the carousel.
         */
        constructor(container) {
            this.container = container;
            this.isEnglish = document.documentElement.lang === 'en';
            this.locale = this.isEnglish ? 'en-US' : 'es-PA';
            this.calendar = new CalendarInvitationBuilder(this.locale);
            this.copy = this.getCopy();
        }

        /**
         * Initializes the carousel with future events.
         *
         * @returns {void}
         */
        initialize() {
            const events = this.getEvents().filter((event) => this.isUpcoming(event));

            if (events.length === 0) {
                this.container.innerHTML = `<p class="events-empty">${this.copy.empty}</p>`;
                return;
            }

            this.container.innerHTML = this.render(events);
            this.bindInteractions();
        }

        /**
         * Returns the localized interface copy.
         *
         * @returns {Object} Localized labels.
         */
        getCopy() {
            return this.isEnglish ? {
                allDay: 'Save the date — all day',
                calendar: 'Add to calendar',
                contact: 'More information',
                dateLabel: 'Event date',
                empty: 'New events will be announced soon.',
                next: 'Show next events',
                previous: 'Show previous events'
            } : {
                allDay: 'Reserva todo el día',
                calendar: 'Agregar al calendario',
                contact: 'Más información',
                dateLabel: 'Fecha del evento',
                empty: 'Pronto anunciaremos nuevos eventos.',
                next: 'Ver siguientes eventos',
                previous: 'Ver eventos anteriores'
            };
        }

        /**
         * Returns localized second-semester events supplied by IPUL Panamá.
         *
         * @returns {Object[]} Event records.
         */
        getEvents() {
            const generalPhone = '50767967816';
            const central = 'IPUL Central Panamá';
            const allDay = this.copy.allDay;

            return this.isEnglish ? [
                { id: 'women-mission-congress-2026', start: '2026-09-12', title: "Women's Mission Congress", category: 'National schedule', allDay: true, reserveAllDay: allDay },
                { id: 'crece-d3-virtual-2026', start: '2026-09-19', title: 'CRECE District 3 Virtual', category: 'National schedule', allDay: true, reserveAllDay: allDay },
                { id: 'crece-d1-2026', start: '2026-09-20', title: 'CRECE District 1', category: 'National schedule', allDay: true, reserveAllDay: allDay },
                { id: 'esfolic-september-2026', start: '2026-09-27', title: 'ESFOLIC', category: 'National schedule', allDay: false, startTime: '14:00', endTime: '19:00', time: '2:00 PM – 7:00 PM', location: central },
                { id: 'ministerial-d1-october-2026', start: '2026-10-06', end: '2026-10-07', title: 'District 1 Ministerial Meeting', category: 'National schedule', allDay: true, reserveAllDay: allDay, location: central },
                { id: 'ministerial-d2-october-2026', start: '2026-10-08', end: '2026-10-09', title: 'District 2 Ministerial Meeting', category: 'National schedule', allDay: true, reserveAllDay: allDay },
                { id: 'ministerial-d3-october-2026', start: '2026-10-14', end: '2026-10-15', title: 'District 3 Ministerial Meeting', category: 'National schedule', allDay: true, reserveAllDay: allDay },
                { id: 'esfolic-october-2026', start: '2026-10-25', title: 'ESFOLIC', category: 'National schedule', allDay: false, startTime: '14:00', endTime: '19:00', time: '2:00 PM – 7:00 PM', location: central },
                { id: 'ministerial-d1-november-2026', start: '2026-11-06', end: '2026-11-07', title: 'District 1 Ministerial Meeting', category: 'National schedule', allDay: true, reserveAllDay: allDay, location: central },
                { id: 'ministerial-d2-november-2026', start: '2026-11-10', end: '2026-11-11', title: 'District 2 Ministerial Meeting', category: 'National schedule', allDay: true, reserveAllDay: allDay },
                { id: 'ministerial-d3-november-2026', start: '2026-11-12', end: '2026-11-13', title: 'District 3 Ministerial Meeting', category: 'National schedule', allDay: true, reserveAllDay: allDay },
                { id: 'committee-evaluation-2026', start: '2026-11-17', end: '2026-11-19', title: 'Committee Evaluation', category: 'National schedule', allDay: true, reserveAllDay: allDay },
                { id: 'esfolic-november-2026', start: '2026-11-29', title: 'ESFOLIC', category: 'National schedule', allDay: false, startTime: '14:00', endTime: '19:00', time: '2:00 PM – 7:00 PM', location: central },
                { id: 'national-camp-2026', start: '2026-12-04', end: '2026-12-06', title: 'National Camp', category: 'National schedule', allDay: true, reserveAllDay: allDay, contactPhone: '50762040999' },
                { id: 'pastoral-integration-2026', start: '2026-12-07', title: 'Pastoral Integration', category: 'National schedule', allDay: true, reserveAllDay: allDay },
                { id: 'esfolic-graduation-2026', start: '2026-12-13', title: 'ESFOLIC Graduation', category: 'National schedule', allDay: true, reserveAllDay: allDay },
                { id: 'local-ebv-2026', start: '2026-12-15', end: '2026-12-19', title: 'Local VBS', category: 'National schedule', allDay: true, reserveAllDay: allDay },
                { id: 'local-ebv-december-2026', start: '2026-12-21', title: 'Local VBS', category: 'National schedule', allDay: true, reserveAllDay: allDay }
            ].map((event) => ({ ...event, contactPhone: event.contactPhone || generalPhone })) : [
                { id: 'congreso-mision-femenil-2026', start: '2026-09-12', title: 'Congreso Misión Femenil', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay },
                { id: 'crece-d3-virtual-2026', start: '2026-09-19', title: 'CRECE Distrito 3 Virtual', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay },
                { id: 'crece-d1-2026', start: '2026-09-20', title: 'CRECE Distrito 1', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay },
                { id: 'esfolic-septiembre-2026', start: '2026-09-27', title: 'ESFOLIC', category: 'Agenda nacional', allDay: false, startTime: '14:00', endTime: '19:00', time: '2:00 PM – 7:00 PM', location: central },
                { id: 'encuentro-d1-octubre-2026', start: '2026-10-06', end: '2026-10-07', title: 'Encuentro Ministerial Distrito 1', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay, location: central },
                { id: 'encuentro-d2-octubre-2026', start: '2026-10-08', end: '2026-10-09', title: 'Encuentro Ministerial Distrito 2', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay },
                { id: 'encuentro-d3-octubre-2026', start: '2026-10-14', end: '2026-10-15', title: 'Encuentro Ministerial Distrito 3', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay },
                { id: 'esfolic-octubre-2026', start: '2026-10-25', title: 'ESFOLIC', category: 'Agenda nacional', allDay: false, startTime: '14:00', endTime: '19:00', time: '2:00 PM – 7:00 PM', location: central },
                { id: 'encuentro-d1-noviembre-2026', start: '2026-11-06', end: '2026-11-07', title: 'Encuentro Ministerial Distrito 1', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay, location: central },
                { id: 'encuentro-d2-noviembre-2026', start: '2026-11-10', end: '2026-11-11', title: 'Encuentro Ministerial Distrito 2', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay },
                { id: 'encuentro-d3-noviembre-2026', start: '2026-11-12', end: '2026-11-13', title: 'Encuentro Ministerial Distrito 3', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay },
                { id: 'evaluacion-comites-2026', start: '2026-11-17', end: '2026-11-19', title: 'Evaluación de Comités', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay },
                { id: 'esfolic-noviembre-2026', start: '2026-11-29', title: 'ESFOLIC', category: 'Agenda nacional', allDay: false, startTime: '14:00', endTime: '19:00', time: '2:00 PM – 7:00 PM', location: central },
                { id: 'campamento-nacional-2026', start: '2026-12-04', end: '2026-12-06', title: 'Campamento Nacional', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay, contactPhone: '50762040999' },
                { id: 'integracion-pastoral-2026', start: '2026-12-07', title: 'Integración Pastoral', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay },
                { id: 'graduacion-esfolic-2026', start: '2026-12-13', title: 'Graduación ESFOLIC', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay },
                { id: 'ebv-local-2026', start: '2026-12-15', end: '2026-12-19', title: 'EBV Local', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay },
                { id: 'ebv-local-diciembre-2026', start: '2026-12-21', title: 'EBV Local', category: 'Agenda nacional', allDay: true, reserveAllDay: allDay }
            ].map((event) => ({ ...event, contactPhone: event.contactPhone || generalPhone }));
        }

        /**
         * Checks whether an event has not ended in the visitor's local date.
         *
         * @param {Object} event - Event data.
         * @returns {boolean} Whether the event is current or future.
         */
        isUpcoming(event) {
            const today = new Date();
            const localDate = [
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, '0'),
                String(today.getDate()).padStart(2, '0')
            ].join('-');

            return (event.end || event.start) >= localDate;
        }

        /**
         * Renders accessible cards and carousel controls.
         *
         * @param {Object[]} events - Future events to show.
         * @returns {string} Carousel HTML.
         */
        render(events) {
            return `
                <div class="events-carousel-shell">
                    <div class="events-carousel-controls" aria-label="${this.isEnglish ? 'Event carousel controls' : 'Controles del carrusel de eventos'}">
                        <button class="events-control" type="button" data-events-previous aria-label="${this.copy.previous}">
                            <i class="ph-bold ph-arrow-left" aria-hidden="true"></i>
                        </button>
                        <button class="events-control" type="button" data-events-next aria-label="${this.copy.next}">
                            <i class="ph-bold ph-arrow-right" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="events-carousel-track" data-events-track tabindex="0" role="region" aria-label="${this.isEnglish ? 'Upcoming events' : 'Próximos eventos'}">
                        ${events.map((event) => this.renderCard(event)).join('')}
                    </div>
                </div>`;
        }

        /**
         * Renders one event card.
         *
         * @param {Object} event - Event data.
         * @returns {string} Event card HTML.
         */
        renderCard(event) {
            const date = this.formatDate(event);
            const contact = this.contactUrl(event);
            const schedule = event.allDay ? event.reserveAllDay : event.time;
            const location = event.location ? `<p class="event-location"><i class="ph-fill ph-map-pin" aria-hidden="true"></i>${this.escapeHtml(event.location)}</p>` : '';

            return `
                <article class="event-card">
                    <div class="event-date" aria-label="${this.copy.dateLabel}: ${date.long}">
                        <span class="event-date-month">${date.month}</span>
                        <strong>${date.day}</strong>
                        ${date.endDay ? `<span class="event-date-range">– ${date.endDay}</span>` : ''}
                    </div>
                    <p class="event-category">${this.escapeHtml(event.category)}</p>
                    <h3>${this.escapeHtml(event.title)}</h3>
                    <p class="event-schedule"><i class="ph-fill ph-clock" aria-hidden="true"></i>${this.escapeHtml(schedule)}</p>
                    ${location}
                    <div class="event-actions">
                        <button class="event-calendar-button" type="button" data-event-id="${event.id}">
                            <i class="ph-bold ph-calendar-plus" aria-hidden="true"></i>${this.copy.calendar}
                        </button>
                        <a class="event-contact-link" href="${contact}" target="_blank" rel="noopener noreferrer">
                            <i class="ph-fill ph-whatsapp-logo" aria-hidden="true"></i>${this.copy.contact}: ${this.formatPhone(event.contactPhone)}
                        </a>
                    </div>
                </article>`;
        }

        /**
         * Binds scroll and calendar-download interactions.
         *
         * @returns {void}
         */
        bindInteractions() {
            const track = this.container.querySelector('[data-events-track]');
            const events = this.getEvents().filter((event) => this.isUpcoming(event));
            const previous = this.container.querySelector('[data-events-previous]');
            const next = this.container.querySelector('[data-events-next]');

            previous.addEventListener('click', () => this.scroll(track, -1));
            next.addEventListener('click', () => this.scroll(track, 1));
            this.container.querySelectorAll('[data-event-id]').forEach((button) => {
                button.addEventListener('click', () => {
                    const event = events.find((item) => item.id === button.dataset.eventId);
                    if (event) {
                        this.calendar.download(event);
                    }
                });
            });
        }

        /**
         * Scrolls one card-width in the selected direction.
         *
         * @param {HTMLElement} track - Carousel scrolling region.
         * @param {number} direction - Negative for back, positive for forward.
         * @returns {void}
         */
        scroll(track, direction) {
            const card = track.querySelector('.event-card');
            const distance = card ? card.getBoundingClientRect().width + 20 : 320;
            track.scrollBy({ left: distance * direction, behavior: 'smooth' });
        }

        /**
         * Formats a single date or inclusive event range.
         *
         * @param {Object} event - Event data.
         * @returns {Object} Date display values.
         */
        formatDate(event) {
            const start = new Date(`${event.start}T12:00:00`);
            const end = event.end ? new Date(`${event.end}T12:00:00`) : null;
            const month = new Intl.DateTimeFormat(this.locale, { month: 'short' }).format(start).replace('.', '').toUpperCase();
            const longOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            const long = end
                ? `${new Intl.DateTimeFormat(this.locale, longOptions).format(start)} – ${new Intl.DateTimeFormat(this.locale, longOptions).format(end)}`
                : new Intl.DateTimeFormat(this.locale, longOptions).format(start);

            return { month, day: start.getDate(), endDay: end ? end.getDate() : '', long };
        }

        /**
         * Builds a WhatsApp URL with a localized event enquiry.
         *
         * @param {Object} event - Event data.
         * @returns {string} WhatsApp URL.
         */
        contactUrl(event) {
            const message = this.isEnglish
                ? `Hello, I would like more information about ${event.title}.`
                : `Hola, quisiera más información sobre ${event.title}.`;

            return `https://wa.me/${event.contactPhone}?text=${encodeURIComponent(message)}`;
        }

        /**
         * Formats a Panama phone number for display.
         *
         * @param {string} phone - International phone number.
         * @returns {string} Display phone number.
         */
        formatPhone(phone) {
            return `${phone.slice(3, 7)}-${phone.slice(7)}`;
        }

        /**
         * Escapes text before injecting it into HTML.
         *
         * @param {string} value - Text to escape.
         * @returns {string} Safe HTML text.
         */
        escapeHtml(value) {
            return String(value).replace(/[&<>'"]/g, (character) => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[character]));
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('upcoming-events-carousel');
        if (container) {
            new UpcomingEventsCarousel(container).initialize();
        }
    });
}());
