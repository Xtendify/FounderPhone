import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { notify } from 'react-notify-toast';

import './Campaign.scss';
import wavinghandImg from '../Setup/images/wavinghand.png';
import { getCampaignList, getCampaignStats } from '../../Services/Api';
import { RenderLoader } from '../Components/Loader/RenderLoader';
import campaignIcon from './images/campaign.png';
import SVGIcon from './SVG/SvgIcons';
import closePopup from './images/close.svg';

export const CampaignList = () => {
	const NOTIFICATION_LENGTH = 6000;

	const [list, setList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [noData, setNoData] = useState(true);
	const [showStatsPopUpForCampaign, setShowStatsPopUpForCampaign] = useState(
		''
	);
	const [campaignData, setCampaignData] = useState(null);

	useEffect(() => {
		setLoading(true);
		getCampaignList().then((res) => {
			setLoading(false);
			if (res.status === 200) {
				if (res.data.length === 0) {
					setNoData(false);
				} else {
					setNoData(true);
					setList(res.data);
				}
			}
			if (res.status === 400 || res.status === 404) {
				notify.show(
					"Couldn't search contacts :-(",
					'error',
					NOTIFICATION_LENGTH
				);
			}
		});
	}, []);

	useEffect(() => {
		if (showStatsPopUpForCampaign) {
			getCampaignStatsfn(showStatsPopUpForCampaign);
		}
	}, [showStatsPopUpForCampaign]);

	const getCampaignStatsfn = (campaignId) => {
		getCampaignStats(campaignId).then((res) => {
			if (res.status === 200) {
				setCampaignData(res.data);
			} else {
				notify.show(
					"Couldn't get campaign data :-(",
					'error',
					NOTIFICATION_LENGTH
				);
			}
		});
	};

	const toggleStatsPopUpfn = (campaignId) => {
		if (!campaignId) {
			setCampaignData(null);
		}
		setShowStatsPopUpForCampaign(campaignId);
	};

	const showcontent = noData && !loading;

	return (
		<div className="campaign">
			<div className="row">
				<div className="col-12">
					<div className="campaignUser">
						<img
							src={wavinghandImg}
							alt="hello"
							className="setupUser-handIcon"
						/>
						<text className="campaignUser-name">Hey</text>
					</div>
				</div>
				<RenderLoader loading={loading} />
				{showcontent && (
					<div className="col-12">
						<div className="table-main">
							<div className="table-top">
								<div className="row">
									<div className="col-xl-8 col-lg-7 col-md-7 col-sm-6">
										<h4>List of campaigns</h4>
									</div>
									<div className="col-xl-4 col-lg-5 col-md-5 col-sm-6 text-md-end text-sm-end">
										<NavLink
											exact
											to="/contact"
											className="btn--primaryGreen less-radius"
										>
											New Campaign
										</NavLink>
									</div>
								</div>
							</div>
							<div className="table-responsive-xl">
								<table className="table">
									<thead>
										<tr>
											<th scope="col">Title</th>
											<th scope="col">Date</th>
											<th scope="col">Status</th>
											<th scope="col"></th>
											{/* <th scope="col"></th> */}
										</tr>
									</thead>

									<tbody>
										{list.map((lists, index) => {
											return (
												<tr key={index}>
													<td>{lists.title}</td>
													<td>
														<p>
															{moment(
																lists.updatedAt
															).format(
																'MMMM Do, YYYY'
															)}
														</p>
														<span>
															{moment(
																lists.updatedAt
															).format('LTS')}
														</span>
													</td>
													<td>
														<div className="status complete">
															{lists.status}
														</div>
													</td>
													<td type="button">
														<SVGIcon
															onClick={() =>
																toggleStatsPopUpfn(
																	lists._id
																)
															}
															name="statsIcon"
															height="20"
															width="20"
														/>
													</td>
													{/* <td>
												<a href="">
													<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
														<g clipPath="url(#clip0)">
															<path d="M14.25 9C13.8353 9 13.5 9.336 13.5 9.75V15.75C13.5 16.1633 13.164 16.5 12.75 16.5H2.25C1.836 16.5 1.5 16.1633 1.5 15.75V5.25C1.5 4.83675 1.836 4.5 2.25 4.5H8.25C8.66475 4.5 9 4.164 9 3.75C9 3.336 8.66475 3 8.25 3H2.25C1.0095 3 0 4.0095 0 5.25V15.75C0 16.9905 1.0095 18 2.25 18H12.75C13.9905 18 15 16.9905 15 15.75V9.75C15 9.33525 14.6648 9 14.25 9Z" fill="#797979"/>
															<path d="M7.03161 8.31681C6.97911 8.36931 6.94386 8.43606 6.92886 8.50806L6.39861 11.1601C6.37386 11.2831 6.41286 11.4098 6.50136 11.4991C6.57261 11.5703 6.66861 11.6086 6.76686 11.6086C6.79086 11.6086 6.81561 11.6063 6.84036 11.6011L9.49161 11.0708C9.56511 11.0558 9.63186 11.0206 9.68361 10.9681L15.6176 5.03406L12.9664 2.38281L7.03161 8.31681Z" fill="#797979"/>
															<path d="M17.4512 0.548926C16.72 -0.182324 15.5305 -0.182324 14.8 0.548926L13.762 1.58693L16.4132 4.23818L17.4512 3.20018C17.8052 2.84693 18.0002 2.37593 18.0002 1.87493C18.0002 1.37393 17.8052 0.902926 17.4512 0.548926Z" fill="#797979"/>
														</g>
														<defs>
															<clipPath id="clip0">
																<rect width="18" height="18" fill="white"/>
															</clipPath>
														</defs>
													</svg>
												</a>
												<a href="">
													<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
														<path d="M8.33411 1.20728H11.6767V1.76971H12.8838V1.12854C12.884 0.506287 12.378 0 11.756 0H8.25476C7.63281 0 7.12683 0.506287 7.12683 1.12854V1.76971H8.33411V1.20728Z" fill="#797979"/>
														<path d="M15.6723 6.55273H4.33987C4.02935 6.55273 3.78491 6.81763 3.80993 7.12723L4.75735 18.8423C4.81014 19.4963 5.35565 20 6.01101 20H14.001C14.6563 20 15.2018 19.4963 15.2546 18.8422L16.2021 7.12723C16.2272 6.81763 15.9828 6.55273 15.6723 6.55273ZM7.08386 18.7505C7.07119 18.7512 7.05853 18.7517 7.04601 18.7517C6.72955 18.7517 6.46389 18.5052 6.44421 18.1851L5.85049 8.56766C5.83004 8.23486 6.08318 7.94846 6.41583 7.92801C6.7474 7.90787 7.03503 8.1604 7.05547 8.49335L7.64904 18.1108C7.66964 18.4436 7.4165 18.7299 7.08386 18.7505ZM10.6164 18.148C10.6164 18.4813 10.3462 18.7515 10.0128 18.7515C9.67938 18.7515 9.40914 18.4813 9.40914 18.148V8.53043C9.40914 8.19702 9.67938 7.92679 10.0128 7.92679C10.346 7.92679 10.6164 8.19702 10.6164 8.53043V18.148ZM14.1616 8.56598L13.5948 18.1834C13.576 18.5042 13.3099 18.7515 12.9928 18.7515C12.9809 18.7515 12.9689 18.7512 12.9568 18.7506C12.624 18.7309 12.3701 18.4453 12.3898 18.1125L12.9565 8.49487C12.976 8.16208 13.2608 7.90817 13.5945 7.92786C13.9273 7.94739 14.1812 8.23318 14.1616 8.56598Z" fill="#797979"/>
														<path d="M17.7602 4.69L17.3638 3.50165C17.2593 3.18839 16.966 2.97705 16.6357 2.97705H3.37745C3.04725 2.97705 2.75382 3.18839 2.64945 3.50165L2.25303 4.69C2.17658 4.91919 2.27607 5.15295 2.46177 5.26953C2.53746 5.31699 2.62702 5.34552 2.72544 5.34552H17.2878C17.3862 5.34552 17.476 5.31699 17.5515 5.26938C17.7372 5.1528 17.8367 4.91904 17.7602 4.69Z" fill="#797979"/>
													</svg>
												</a>
											</td> */}
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}
			</div>
			{!noData && (
				<div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
					<div className="how-it-works">
						<div className="row">
							<div className="col-xl-9 col-lg-12 col-md-12 col-sm-12">
								<div>
									<h4 className="title">
										<img
											src={campaignIcon}
											className="title-img"
											alt="campaignIcon"
										/>
										Start your first campaign to chat with
										your Customers!
									</h4>
									<p>
										Please make the payment, after that you
										can enjoy all the features and benefits
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="table-main-no">
						<div className="table-top">
							<div className="row">
								<div className="col-xl-8 col-lg-7 col-md-7 col-sm-6">
									<h4 className="title-no">
										Start your first campaign now !
									</h4>
								</div>
								<div className="col-xl-4 col-lg-5 col-md-5 col-sm-6 text-md-end ">
									<NavLink
										exact
										to="/contact"
										className="btn--primaryGreen less-radius-no"
									>
										Start
									</NavLink>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
			<div
				className={
					!!showStatsPopUpForCampaign
						? 'popup-mask open'
						: 'popup-mask'
				}
			>
				<div className="popup-content">
					<div
						className="close-popup"
						onClick={() => toggleStatsPopUpfn('')}
						type="button"
					>
						<img src={closePopup} alt="" />
					</div>
					<div className="delete-campaign-popup open">
						<div className="popup-box">
							<div className="form">
								<div className="row">
									<div className="col-12">
										<h5 className="alert-title">
											Campaign Stats
										</h5>
										{/* <span className="alert-message">You want to delete this contact from list</span> */}
									</div>
								</div>
								{/* <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
									<div className="row">
										<div className="col-md-4 col-sm-4">
											<h5 className="alert-title">Total SMS</h5>
											<span className="alert-message">15</span>
										</div>
										<div className="col-md-4 col-sm-4">
											<h5 className="alert-title">Delivered SMS</h5>
											<span className="alert-message">15</span>
										</div>
										<div className="col-md-4 col-sm-4">
											<h5 className="alert-title">Failed SMS</h5>
											<span className="alert-message">15</span>
										</div>
									</div>
								</div> */}
								<table className="table">
									<thead>
										<tr>
											<th scope="col">Total SMS</th>
											<th scope="col">Delivered SMS</th>
											<th scope="col">Failed SMS</th>
										</tr>
									</thead>

									<tbody>
										<tr>
											<td>
												{campaignData &&
													campaignData.messages
														.length}
											</td>
											<td>
												{campaignData &&
													campaignData.messages.filter(
														(m) =>
															[
																'init',
																'sent',
																'delivered',
																'received',
																'read',
															].includes(m.status)
													).length}
											</td>
											<td>
												{campaignData &&
													campaignData.messages.filter(
														(m) =>
															[
																'failed',
																'undelivered',
															].includes(m.status)
													).length}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
