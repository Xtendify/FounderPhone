import React from 'react';
import { Loader } from './Loader';

export const RenderLoader = (props) => {
	const { loading } = props;

	if (loading) {
		return <Loader />;
	}
	return null;
};
