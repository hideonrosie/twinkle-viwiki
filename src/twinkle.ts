import { Twinkle, init, SiteConfig } from './core';
import messages from './messages.json';
import mwMessageList from './mw-messages';

// Tải các mô đun
import { Fluff } from './fluff';
import { DiffCore as Diff } from './core';
import { Unlink } from './unlink';
import { BatchDelete } from './batchdelete';
import { BatchUndelete } from './batchundelete';
import { Tag } from './tag';
import { Xfd } from './xfd';
import { Speedy } from './speedy';
import { Warn } from './warn';
import { Protect } from './protect';
import { Block } from './block';
import { Prod } from './prod';
// import { Deprod } from './deprod';
import { Welcome } from './welcome';
import { Talkback } from './talkback';
import { Arv } from './arv';
import { ImageModule } from './image';

// register some globals for debugging, as per twinkle v2
import './globals';

// Check if account is experienced enough to use Twinkle
if (!Morebits.userIsInGroup('autoconfirmed') && !Morebits.userIsInGroup('confirmed')) {
	throw new Error('Twinkle: bị cấm sử dụng!');
}

Twinkle.userAgent = `Twinkle (${mw.config.get('wgWikiID')})`;

Twinkle.summaryAd = ' ([[Wikipedia:Twinkle/Twinkle2026|Twinkle2026]])';

Twinkle.changeTags = 'twinkle';

Twinkle.messageOverrides = messages;

Twinkle.extraMwMessages = mwMessageList;

// List of module classes enabled
Twinkle.registeredModules = [
	Xfd,
	Tag,
	Speedy,
	Diff,
	Warn,
	Fluff,
	BatchDelete,
	Protect,
	Block,
	Prod,
	// Deprod,
	Arv,
	Welcome,
	Talkback,
	Unlink,
	BatchUndelete,
	ImageModule,
];

/**
 * Adjust the following configurations if necessary
 * Check the documentation for each property here:
 * https://twinkle.toolforge.org/core-docs/modules/siteconfig.html
 */

SiteConfig.permalinkSpecialPageName = 'Đặc biệt:Liên kết thường trực';

SiteConfig.botUsernameRegex = /bot\b/i;

SiteConfig.flaggedRevsNamespaces = [];

SiteConfig.redirectTagAliases = ['#ĐỔI', '#REDIRECT'];

// Patch Morebits.date month headers
{
	const MB = (window as any).Morebits;
	if (MB && MB.date) {
		MB.date.localeData.months = [
			'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
			'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
		];
		MB.date.localeData.monthsShort = MB.date.localeData.months;

		MB.date.prototype.monthHeaderRegex = function () {
			return new RegExp('^(==+)\\s*(?:' + this.getUTCMonthName() + '|' + this.getUTCMonthNameAbbrev() +
				')\\s+năm\\s+' + this.getUTCFullYear() + '\\s*\\1', 'mg');
		};
		MB.date.prototype.monthHeader = function (level: any) {
			level = parseInt(level, 10);
			level = isNaN(level) ? 2 : level;
			var header = Array(level + 1).join('=');
			var text = this.getUTCMonthName() + ' năm ' + this.getUTCFullYear();
			if (header.length) {
				return header + ' ' + text + ' ' + header;
			}
			return text;
		};
	}
}

// Go!
init();
