import { derived, get, writable } from 'svelte/store';
import type { HeaderArray, User, UserFilter, UserSortCriteria } from './regionTypes';

export const userDefaultHeaders = writable<HeaderArray>([
	// 'Region Name', - do not remove
	// 'Role', - do not remove
	// 'Total Ongoing Tasks', - do not remove
	'Inspector Name',
	'Mobile Number',
	'OL',
	'Mon',
	'Tue',
	'Wed',
	'Thu',
	'Fri',
	'Sat',
	'Sun',
	'Total Dispatch Tasks',
	'Total Completed Tasks',
	'Total Tasks'
]);

export const userOptionalHeaders = writable<HeaderArray>([
	'Region Name',
	'ID',
	'Local ID',
	'Email',
	'Mobile Number'
]);

export const userActiveHeaders = writable<HeaderArray>([]);
export const userSelectedHeaders = writable<HeaderArray>([]);

export const userAllHeaders = derived<
	[typeof userDefaultHeaders, typeof userOptionalHeaders],
	HeaderArray
>([userDefaultHeaders, userOptionalHeaders], ([$userDefaultHeaders, $userOptionalHeaders]) => [
	...$userDefaultHeaders,
	...$userOptionalHeaders
]);

userDefaultHeaders.subscribe(($userDefaultHeaders) => {
	userActiveHeaders.set([...$userDefaultHeaders]);
	userSelectedHeaders.set([...$userDefaultHeaders]);
});

export const showUserColumnModal = writable(false);
export const showUserFilter = writable(false);

export const userFilters = writable<UserFilter[]>([]);
export const userFilteredData = writable<User[]>([]);
export const originalUserData = writable<User[]>([]);

export const addUserFilter = () => {
	userFilters.update((f) => [...f, { selectedHeader: 'ID', selectedOperator: '==', value: '' }]);
};

export const removeUserFilter = (index: number) => {
	userFilters.update((f) => f.filter((_, i) => i !== index));
	applyUserFilters();
};

export const clearUserFilters = () => {
	userFilters.set([]);
	userFilteredData.set(get(originalUserData));
};

export const applyUserFilters = () => {
	const currentFilters = get(userFilters);
	const originalData = get(originalUserData);

	if (currentFilters.length === 0) {
		userFilteredData.set(originalData);
		return;
	}

	const newFilteredData = originalData.filter((item: User) => {
		return currentFilters.every((filter: UserFilter) => {
			const itemValue = item[filter.selectedHeader];
			if (itemValue === null || itemValue === undefined) return false;

			const filterValue = filter.value.toLowerCase();
			const itemValueString = String(itemValue).toLowerCase();

			switch (filter.selectedOperator) {
				case '==':
					return itemValueString === filterValue;
				case '!=':
					return itemValueString !== filterValue;
				case '>':
					return Number(itemValue) > Number(filterValue);
				case '<':
					return Number(itemValue) < Number(filterValue);
				case '>=':
					return Number(itemValue) >= Number(filterValue);
				case '<=':
					return Number(itemValue) <= Number(filterValue);
				case 'contains':
					return itemValueString.includes(filterValue);
				default:
					return true;
			}
		});
	});

	userFilteredData.set(newFilteredData);
};

export const userOperators = [
	{ value: '==', name: 'Equals' },
	{ value: '!=', name: 'Not Equals' },
	{ value: '>', name: 'Greater Than' },
	{ value: '<', name: 'Less Than' },
	{ value: '>=', name: 'Greater Than or Equal' },
	{ value: '<=', name: 'Less Than or Equal' },
	{ value: 'contains', name: 'Contains' }
];

export const showUserSorting = writable(false);
export const userSortCriteria = writable<UserSortCriteria[]>([]);

export const addUserSortCriteria = () => {
	userSortCriteria.update((sc) => [...sc, { column: 'ID', ascending: true }]);
};

export const removeUserSortCriteria = (index: number) => {
	userSortCriteria.update((sc) => sc.filter((_, i) => i !== index));
};

export const clearUserSort = () => {
	userSortCriteria.set([]);
};

export const applyUserSorting = () => {
	const currentSortCriteria = get(userSortCriteria);
	const currentData = get(userFilteredData);

	const sortedData = [...currentData].sort((a, b) => {
		for (const criteria of currentSortCriteria) {
			const aValue = a[criteria.column];
			const bValue = b[criteria.column];

			if (aValue == null && bValue == null) continue;
			if (aValue == null) return criteria.ascending ? -1 : 1;
			if (bValue == null) return criteria.ascending ? 1 : -1;

			if (typeof aValue === 'string' && typeof bValue === 'string') {
				const compareResult = aValue.localeCompare(bValue);
				if (compareResult !== 0) {
					return criteria.ascending ? compareResult : -compareResult;
				}
			} else {
				if (aValue < bValue) return criteria.ascending ? -1 : 1;
				if (aValue > bValue) return criteria.ascending ? 1 : -1;
			}
		}
		return 0;
	});

	userFilteredData.set(sortedData);
};

export const initializeUserFilteredData = (initialData: User[]) => {
	originalUserData.set(initialData);
	userFilteredData.set(initialData);
};

export const currentUserPage = writable(1);
export const userPageSize = writable(10);

export const paginatedUsers = derived(
	[userFilteredData, currentUserPage, userPageSize],
	([$userFilteredData, $currentUserPage, $userPageSize]) => {
		const start = ($currentUserPage - 1) * $userPageSize;
		const end = start + $userPageSize;
		return $userFilteredData.slice(start, end);
	}
);

export const totalUserPages = derived(
	[userFilteredData, userPageSize],
	([$userFilteredData, $userPageSize]) => {
		return Math.ceil($userFilteredData.length / $userPageSize);
	}
);
