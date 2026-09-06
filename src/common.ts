/**
 * Ghi công: https://github.com/wikimedia-gadgets/twinkle-enwiki/blob/master/src/common.ts
 * Mục tiêu: Hàm xử lý chung cho các mô đun Twinkle.
 */

// Various hatnote templates, used when tagging (csd/xfd/tag/prod/protect) to
// ensure MOS:ORDER
export const hatnoteRegex =
	'short description|mô tả ngắn|hatnote|chính 2|main|correct title|dablink|distinguish|for|đối với|further|selfref|year dab|similar names|highway detail hatnote|broader|để|về|about(?:-distinguish| other people)?|other\\s?(?:hurricane(?: use)?s|people|persons|places|ships|uses(?: of)?)|redirect(?:-(?:distinguish|synonym|multi))?|see\\s?(?:wiktionary|also(?: if exists)?)';

let findSources: string;

// Used in XFD and PROD
export function makeFindSourcesDiv(divID: string) {
	if (!$(divID).length) {
		return;
	}
	if (!findSources) {
		var parser = new Morebits.wiki.preview($(divID)[0]);
		parser.beginRender('({{Tìm nguồn|' + Morebits.pageNameNorm + '}})', 'WP:BQXB').then(function () {
			// Save for second-time around
			findSources = parser.previewbox.innerHTML;
			$(divID).removeClass('morebits-previewbox');
		});
	} else {
		$(divID).html(findSources);
	}
}

export const optoutTemplates = ['Template:Retired', 'Template:Deceased Wikipedian'];