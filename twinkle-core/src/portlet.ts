import { setDefaultConfig } from './Config';

/**
 * Set portlet configurations, which are skin-specific.
 * Kept for API compatibility; actual portlet creation is handled in addPortlet().
 */
export function setPortletConfig() {
	// Some skin dependent config.
	switch (mw.config.get('skin')) {
		case 'vector':
		case 'vector-2022':
			setDefaultConfig([
				{ name: 'portletArea', value: 'right-navigation' },
				{ name: 'portletId', value: 'p-twinkle' },
				{ name: 'portletName', value: 'TW' },
				{ name: 'portletType', value: 'menu' },
				{ name: 'portletNext', value: 'p-search' },
			]);
			break;
		case 'timeless':
			setDefaultConfig([
				{ name: 'portletArea', value: '#page-tools .sidebar-inner' },
				{ name: 'portletId', value: 'p-twinkle' },
				{ name: 'portletName', value: 'Twinkle' },
				{ name: 'portletType', value: null },
				{ name: 'portletNext', value: 'p-userpagetools' },
			]);
			break;
		default:
			setDefaultConfig([
				{ name: 'portletArea', value: null },
				{ name: 'portletId', value: 'p-cactions' },
				{ name: 'portletName', value: null },
				{ name: 'portletType', value: null },
				{ name: 'portletNext', value: null },
			]);
	}
}

/**
 * Builds a portlet menu if it doesn't exist yet, and add the portlet link.
 * @param task - Either a URL for the portlet link or a function to execute.
 * @param text
 * @param id
 * @param tooltip
 */
export function addPortletLink(task: string | (() => void), text: string, id: string, tooltip: string): HTMLLIElement {
	const portletId = addPortlet();
	let link = mw.util.addPortletLink(portletId, typeof task === 'string' ? task : '#', text, id, tooltip);
	$('.client-js .skin-vector #p-cactions').css('margin-right', 'initial');
	if (typeof task === 'function') {
		$(link).click(function (ev) {
			task();
			ev.preventDefault();
		});
	}
	if ($.collapsibleTabs) {
		$.collapsibleTabs.handleResize();
	}
	return link;
}

/**
 * Adds a portlet menu to one of the navigation areas on the page.
 * Uses mw.util.addPortlet() (MediaWiki 1.39+) for correct rendering on all skins,
 * ported from enwiki (wikimedia-gadgets/twinkle) to fix the TW menu being placed
 * inside "Thêm/More" on Vector 2022.
 *
 * @returns portletId string
 */
function addPortlet(): string {
	const skin = mw.config.get('skin');
	let navigation: string;
	let id: string;
	let text: string;
	let nextnodeid: string;

	switch (skin) {
		case 'vector':
		case 'vector-2022':
			navigation = '#right-navigation';
			id = 'p-twinkle';
			text = 'TW';
			// mw.util.addPortlet only creates a dropdown when nextnodeid is p-cactions
			nextnodeid = 'p-cactions';
			break;
		case 'timeless':
			navigation = '#page-tools .sidebar-inner';
			id = 'p-twinkle';
			text = 'Twinkle';
			nextnodeid = 'p-userpagetools';
			break;
		default:
			// Monobook, Modern, etc. → use p-cactions directly
			return 'p-cactions';
	}

	// Check that the navigation area exists on the page
	const root = document.querySelector(navigation);
	if (!root) {
		return id;
	}

	// Portlet already created → return early
	if (document.getElementById(id)) {
		return id;
	}

	// Create portlet using mw.util.addPortlet (MW 1.39+)
	// nextnodeid must be p-cactions to generate a dropdown on Vector skins
	mw.util.addPortlet(id, text, '#' + nextnodeid);

	// mw.util.addPortlet inserts the portlet to the LEFT of p-cactions,
	// but we want it to the RIGHT → reposition manually
	if (skin === 'vector') {
		// Vector 2010: insert after p-cactions
		$('#p-twinkle').insertAfter('#p-cactions');
	} else if (skin === 'vector-2022') {
		// Vector 2022: insert before the "More" tools landmark
		// mw.util.addPortlet creates a wrapper with id = portletId + '-dropdown'
		const $landmark = $('#right-navigation > .vector-page-tools-landmark');
		$('#p-twinkle-dropdown').insertBefore($landmark);

		// .vector-page-tools-landmark is an internal class and may change
		if (!$landmark.length) {
			mw.log.warn('[Twinkle] .vector-page-tools-landmark not found — TW portlet may be misplaced.');
		}
	}

	return id;
}
