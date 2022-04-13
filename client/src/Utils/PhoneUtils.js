export function formatPhoneNumber(number) {
	// Already has the + return as it is
	if (number.startsWith('+')) {
		return number;
	}

	if (!number.startsWith('+') && number.length === 10) {
		return '+1' + number;
	}

	if (number.startsWith('1') && number.length === 11) {
		return '+' + number;
	}

	return '+' + number;
}

export function cleanPhoneNumber(number) {
	// eslint-disable-next-line
	return number.replace(/[^\w\+]/gi, '');
}
