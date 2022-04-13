import React from 'react';
import './notification-top.scss';

import notMail from './images/not-mail.svg';
import notBell from './images/not-bell.svg';

export const NotificationTop = () => {
	return (
		<div className="top-notification-main">
			<div className="top-notification">
				<button className="notification-btn">
					<img
						src={notMail}
						alt="Send Campaign"
						className="mail-icon"
					/>
				</button>
				<button className="notification-btn">
					<img
						src={notBell}
						alt="Send Campaign"
						className="bell-icon"
					/>
					<span className="alert-notification"></span>
				</button>
			</div>
		</div>
	);
};
