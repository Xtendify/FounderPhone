import React, { useEffect } from 'react';
import queryString from 'query-string';
import { createGoogleAccessToken } from '../../Services/Api';

export const GoogleCallback = (props) => {
	useEffect(() => {
		const params = queryString.parse(props.location.search);
		const code = params.code;
		createGoogleAccessToken(code, (res) => {
			if (res.status === 200) {
				props.history.push({
					pathname: '/',
					search: '?googleconnected=true',
				});
			}
		});
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div>
			<h4>
				Please wait we pull contacts from Google. You will be
				automatically redirected
			</h4>
		</div>
	);
};
