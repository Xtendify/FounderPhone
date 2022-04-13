import React, { useEffect } from 'react';
import queryString from 'query-string';
import { createHubSpotAccessToken } from '../../Services/Api';

export const HubspotCallback = (props) => {
	useEffect(() => {
		const params = queryString.parse(props.location.search);
		const code = params.code;
		createHubSpotAccessToken(code, (res) => {
			if (res.status === 200) {
				props.history.push({
					pathname: '/',
				});
			}
		});
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div>
			<h4>
				Please wait we pull contacts from HubSpot. You will be
				automatically redirected
			</h4>
		</div>
	);
};
