import React from 'react';
import { Spinner } from 'react-bootstrap';
import './Loader.scss';

export const Loader = () => {
	return (
		<div className="loader">
			Loading...
			<Spinner animation="border" role="status" className="spinner" />
		</div>
	);
};
