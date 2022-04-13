import React from 'react';
import './Buttons.scss';

export const Button = ({
	children,
	onClick,
	className = '',
	type = 'primary',
}) => {
	return (
		<button className={`btn--${type} ${className}`} onClick={onClick}>
			{children}
		</button>
	);
};
