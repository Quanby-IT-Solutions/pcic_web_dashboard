import { getDashboardData } from '$lib/utils/dashboardData';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return getDashboardData();
};
