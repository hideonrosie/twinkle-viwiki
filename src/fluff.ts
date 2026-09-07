import { FluffCore } from './core';

// Các bot đáng tin cậy sẽ được bỏ qua.
export class Fluff extends FluffCore {
	trustedBots = ['Kiểm tra tự động'];

	hiddenName = 'thành viên không rõ';
}
