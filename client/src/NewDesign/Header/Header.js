import { React } from 'react';

import mailImg from './images/mail.png';
import bellImg from './images/bell.png';
import notificationImg from './images/rednotification.png';
import './HeaderStyle.scss';

export const Header = () => {
	return (
		<div className="header">
			<div className="mailBox">
				<img className="mailIcon" src={mailImg} />
			</div>
			<div className="bellBox">
				<img className="bellIcon" src={bellImg} />
				<img className="notificationIcon" src={notificationImg} />
			</div>
		</div>
	);
};
