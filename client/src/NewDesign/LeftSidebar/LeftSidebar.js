import React, { useEffect, useState } from 'react';
import 'bootstrap';
import { NavLink, useHistory } from 'react-router-dom';
import firebase from 'firebase/app';
import gravatar from 'gravatar';

import './leftSidebarStyles.scss';
import productImg from './images/FounderPhonelogo.png';
import openArrows from './images/open-arrow.png';
import SVGIcon from './SVG/SVGIcons';

export const LeftSidebar = () => {
	const [active, setActive] = useState(false);
	const [userEmail, setUserEmail] = useState('');
	const [userImage, setUserImage] = useState('');
	// const [dropfirst, setDropfirst] = useState(true);
	// const [dropsecond, setDropsecond] = useState(false);
	const history = useHistory();

	// const dropFirst = () => {
	// 	setDropfirst(!dropfirst);
	// }

	// const dropSecond = () => {
	// 	setDropsecond(!dropsecond);
	// }

	useEffect(() => {
		setUserEmail(firebase.auth().currentUser.email);
	}, []);

	useEffect(() => {
		if (userEmail) {
			const gravatarImage = gravatar.url(userEmail, {
				protocol: 'https',
				size: '78',
			});

			if (gravatarImage) {
				setUserImage(gravatarImage);
			}
		}
	}, [userEmail]);

	const Logout = () => {
		setActive(!active);
	};

	const signOutUser = () => {
		firebase
			.auth()
			.signOut()
			.then(() => {
				history.push('/login');
			});
	};

	return (
		<div className="left-sidebar ::-webkit-scrollbar">
			{/* add class `active` here for mobile menu*/}
			<button className="left-sidebar-closebtn">
				{' '}
				{/* add class `open` here for mobile menu*/}
				<img className="image" src={openArrows} alt="arrowicon" />
			</button>
			<div className="d-flex flex-column flex-shrink-0 p-3 mobile-hide-show">
				<div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
					<span className="fs-4">
						<img
							src={productImg}
							className="productLogo"
							alt="arrowicon"
						></img>
					</span>
				</div>
				<div className="menu">
					<h5 className="menuItem open">
						General
						{/* <SVGIcon name="arrowIcon" type='button' onClick={dropFirst} width='14' height='11' /> */}
					</h5>
					<ul className="nav nav-pills flex-column">
						<li className="nav-item">
							<NavLink
								exact
								to="/"
								className="nav-link link-dark"
							>
								<SVGIcon name="setupIcon" />
								Setup
							</NavLink>
						</li>
						<li>
							<NavLink
								to="/contact"
								className="nav-link link-dark"
							>
								<SVGIcon name="contactIcon" />
								Contact
							</NavLink>
						</li>
						<li>
							<NavLink
								to="/campaign"
								className="nav-link link-dark"
							>
								<SVGIcon name="campaignIcon" />
								Campaign
							</NavLink>
						</li>
						<li>
							<NavLink
								exact
								to="/inbox"
								className="nav-link link-dark"
							>
								<SVGIcon name="inboxIcon" />
								Inbox
							</NavLink>
						</li>
						<li>
							<NavLink
								exact
								to="/billing"
								className="nav-link link-dark"
							>
								<SVGIcon name="billingIcon" />
								Billing
							</NavLink>
						</li>
					</ul>
					{/* <hr />
					<h5 className={dropsecond ? 'menuItem open' : 'menuItem'}>
						Setting
						<SVGIcon name="arrowIcon" type='button' onClick={dropSecond} width='14' height='11' />
					</h5>
					<ul className="nav nav-pills flex-column mb-auto">
						<li className="nav-item">
							<NavLink exact to='/setting' className='nav-link link-dark' >
								<SVGIcon name='settingIcon' />
								Settings
							</NavLink>
						</li>
					</ul> */}
					<div className="account-area-main">
						<div className="account-area">
							<div className="fp-user">
								<div className="thumb">
									<img src={userImage} alt={userEmail} />
								</div>
								<div className="content">
									<h5 className="truncate">{userEmail}</h5>
									<ul className="tooltipManu open">
										<li>
											<a
												type="button"
												onClick={signOutUser}
											>
												<SVGIcon name="logOutIcon" />
												Log Out
											</a>
										</li>
									</ul>
								</div>
								{/* { <ul className="tooltipManu open">
								<li>
									<a type='button' onClick={signOutUser}>
										<SVGIcon name='logOutIcon' />
										Log Out
									</a>
								</li>
							</ul>	 }
								 */}
								{/* <span className={active ? "open-close-account" : "open-close-account active"} >
									<SVGIcon name='userArrowIcon' height='9' width='14' type='button' onClick={Logout} />
								</span> */}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
