import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const {
		data: { user },
		error: userError
	} = await supabase.auth.getUser();
	if (userError || !user) {
		console.error('Error fetching authenticated user or no user found:', userError?.message);
		return { userProfileData: null };
	}

	console.log(user);

	const { data: userRow, error: userRowError } = await supabase
		.from('users')
		.select('*')
		.eq('id', user.id)
		.single();

	if (userRowError) {
		console.error('Error fetching user data:', userRowError.message);
		return { userProfileData: [] };
	}

	console.log(userRow);

	return {
		userProfileData: userRow
	};
};
