import { checkIsTimeRecord } from './helpers';
import { RecordType, type AppliesRequiredData } from './types';

export function checkPuzzleNewRecord(data: AppliesRequiredData) {
	return checkRecordFirstTotal(data) || checkRecordTimeRecord(data);
}

const checkRecordFirstTotal = ({ count }: { count: number }) => {
	if (count !== 1) return false as const;
	return {
		type: RecordType.FIRST_TOTAL as const,
		getMessage: () => "First puzzle solved!"
	}
}
const checkRecordTimeRecord = (data: AppliesRequiredData) => {
	if (!checkIsTimeRecord({ ...data, time: data.currentTimeElapsed })) {
		return false as const;
	}
	return {
		type: RecordType.TIME_RECORD as const,
		getMessage: () => "New time record!"
	}
}