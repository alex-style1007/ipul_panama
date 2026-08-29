/**
 * Provides client-side filtering and rendering for the IPUL Panama chorus library.
 */
class ChorusLibrary {
    /**
     * Create a searchable chorus library.
     *
     * Args:
     *     configuration: Localized page configuration and chorus records.
     */
    constructor(configuration) {
        this.configuration = configuration;
        this.activeCategory = configuration.allCategory;
        this.searchTerm = "";
        this.container = document.getElementById(configuration.containerId);
        this.resultCount = document.getElementById(configuration.resultCountId);
        this.emptyState = document.getElementById(configuration.emptyStateId);
        this.searchInput = document.getElementById(configuration.searchInputId);
        this.categoryContainer = document.getElementById(configuration.categoryContainerId);
    }

    /**
     * Initialize the search controls and render the first result set.
     */
    initialize() {
        if (!this.container || !this.searchInput || !this.categoryContainer) {
            return;
        }

        this.searchInput.addEventListener("input", (event) => {
            this.searchTerm = event.target.value.trim().toLocaleLowerCase();
            this.render();
        });

        this.categoryContainer.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-category]");
            if (!button) {
                return;
            }

            this.activeCategory = button.dataset.category;
            this.updateCategoryButtons();
            this.render();
        });

        this.render();
    }

    /**
     * Return chorus records that match the selected category and search term.
     *
     * Returns:
     *     A filtered list of chorus records.
     */
    getFilteredItems() {
        return this.configuration.items.filter((item) => {
            const belongsToCategory = this.activeCategory === this.configuration.allCategory
                || item.category === this.activeCategory;
            const searchableText = [
                item.title,
                item.category,
                item.reference,
                item.author,
                item.rights,
                item.lyrics.join(" "),
            ].join(" ").toLocaleLowerCase();

            return belongsToCategory && searchableText.includes(this.searchTerm);
        });
    }

    /**
     * Render matching chorus cards and their result count.
     */
    render() {
        const filteredItems = this.getFilteredItems();
        this.container.innerHTML = filteredItems.map((item) => this.createCard(item)).join("");
        this.resultCount.textContent = this.configuration.resultMessage(filteredItems.length);
        this.emptyState.classList.toggle("hidden", filteredItems.length !== 0);
    }

    /**
     * Build one accessible chorus card.
     *
     * Args:
     *     item: A chorus record.
     *
     * Returns:
     *     The HTML string for one chorus card.
     */
    createCard(item) {
        const lyricLines = item.lyrics.map((line) => `<p>${this.escapeHtml(line)}</p>`).join("");
        const sourceLink = item.sourceUrl
            ? `<a href="${this.escapeAttribute(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="text-ipul-blue underline hover:text-ipul-gold">${this.escapeHtml(item.sourceLabel)}</a>`
            : this.escapeHtml(item.sourceLabel);

        return `
            <article class="chorus-card bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col" data-pagefind-body>
                <div class="flex flex-wrap items-center gap-2 mb-4">
                    <span class="text-xs font-bold uppercase tracking-wider text-ipul-blue bg-blue-50 px-3 py-1 rounded-full">${this.escapeHtml(item.category)}</span>
                    <span class="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full">${this.escapeHtml(item.reference)}</span>
                </div>
                <h2 class="font-heading font-bold text-xl text-ipul-blue">${this.escapeHtml(item.title)}</h2>
                <p class="mt-3 text-sm text-slate-500"><strong class="text-slate-700">${this.escapeHtml(this.configuration.authorLabel)}:</strong> ${this.escapeHtml(item.author)}</p>
                <details class="mt-5 group">
                    <summary class="cursor-pointer font-bold text-ipul-blue hover:text-ipul-gold transition-colors">${this.escapeHtml(this.configuration.lyricsLabel)}</summary>
                    <div class="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4 text-slate-700 leading-relaxed space-y-1">
                        ${lyricLines}
                    </div>
                </details>
                <div class="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed space-y-2">
                    <p><strong class="text-slate-700">${this.escapeHtml(this.configuration.rightsLabel)}:</strong> ${this.escapeHtml(item.rights)}</p>
                    <p><strong class="text-slate-700">${this.escapeHtml(this.configuration.sourceLabel)}:</strong> ${sourceLink}</p>
                </div>
            </article>`;
    }

    /**
     * Synchronize visual state for category filters.
     */
    updateCategoryButtons() {
        this.categoryContainer.querySelectorAll("button[data-category]").forEach((button) => {
            const isActive = button.dataset.category === this.activeCategory;
            button.classList.toggle("bg-ipul-blue", isActive);
            button.classList.toggle("text-white", isActive);
            button.classList.toggle("border-ipul-blue", isActive);
            button.classList.toggle("bg-white", !isActive);
            button.classList.toggle("text-slate-600", !isActive);
            button.classList.toggle("border-slate-200", !isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    /**
     * Escape text before interpolation into HTML.
     *
     * Args:
     *     value: Untrusted text value.
     *
     * Returns:
     *     Escaped text safe for HTML content.
     */
    escapeHtml(value) {
        const element = document.createElement("span");
        element.textContent = value;
        return element.innerHTML;
    }

    /**
     * Validate and escape an outbound source URL.
     *
     * Args:
     *     value: Source URL.
     *
     * Returns:
     *     A safe URL for an href attribute.
     */
    escapeAttribute(value) {
        try {
            const url = new URL(value, window.location.origin);
            return url.protocol === "https:" ? url.href : "#";
        } catch (_error) {
            return "#";
        }
    }
}

window.ChorusLibrary = ChorusLibrary;
