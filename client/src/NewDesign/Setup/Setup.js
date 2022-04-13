import React, { useEffect, useState } from 'react';
import { Card, InputGroup, FormControl, Modal } from 'react-bootstrap';
import mixpanel from 'mixpanel-browser';
import * as Sentry from '@sentry/browser';
import queryString from 'query-string';
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js';
import { notify } from 'react-notify-toast';
import ReactGA from 'react-ga';
import 'firebase/auth';
import 'react-drop-zone/dist/styles.css';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { NavLink } from 'react-router-dom';

import wavinghandImg from './images/wavinghand.png';
// import group1Img from './images/Group1.png';
import slacklogoImg from './images/slacklogo.png';
import cooliconImg from './images/coolicon.png';
import phoneImg from './images/phone.png';
import phone1Img from './images/phone1.png';
import microphoneImg from './images/microphone.png';
import microphone1Img from './images/microphone1.png';
import sync1Img from './images/sync1.png';
import syncImg from './images/sync.png';
import copyIcon from './images/copyIcon.png';
import hubspotIcon from './images/hubspotIcon.png';
import coldfaceIcon from './images/coldface.png';
// import graphImg from './images/graph.png';
// import dropImg from './images/drop.png';
// import openArrow from './images/open-arrow.png';
// import circleprogressImg from './images/circleprogress.png';
import { planTypes, slackMessageFormat } from '../../Utils/Types';
import { formatPhoneNumber, cleanPhoneNumber } from '../../Utils/PhoneUtils';
import { Button } from '../Components/Buttons/Buttons';
import './SetupStyle.scss';
import {
	addCallRedirection,
	connectToHubSpot,
	connectToSlack,
	getClientAccount,
	createPrivateChannelInSlack,
	saveChannelId,
	getSlackChannels,
	fetchWebhookUrl,
	updateWebhook,
} from '../../Services/Api';
import { InviteSlackMembers } from '../Components/InviteSlackMembers';
import userQueIcon from './images/userQueIcon.png';
import notPaidIcone from './images/notPaid.png';
import { Loader } from '../Components/Loader/Loader';

export const Setup = () => {
	const NOTIFICATION_LENGTH = 6000;

	const [currentPlan, setCurrentPlan] = useState(planTypes.NOT_PAID);
	const [phoneNumber, setPhoneNumber] = useState('');
	const [teamName, setTeamName] = useState('');
	const [slackConnectedDialog, setSlackConnectedDialog] = useState(false);
	const [callRedirectNumber, setCallRedirectNumber] = useState('');
	const [forwardText, setForwardText] = useState(false);
	const [forwardToSlackFirst, setForwardToSlackFirst] = useState(false);
	const [contactsSynced, setContactsSynced] = useState(0);
	const [createPrivateChannel, setCreatePrivateChannel] = useState(false);
	const [isOpen, setOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);
	const [defaultChannelId, setDefaultChannelId] = useState('');
	const [channels, setChannels] = useState([]);
	const [isChannelsFormat, setIsChannelsFormat] = useState(true);
	const [webhookLoading, setWebhookLoading] = useState(false);
	const [webHookURL, setWebHookURL] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		ReactGA.pageview('Setup');
		Sentry.captureMessage('Setup');
		mixpanel.track('Setup');

		load();
		fetchWebhookUrl().then((res) => {
			setWebHookURL(res.data);
		});
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const connectToSlackFn = () => {
		ReactGA.event({
			category: 'User',
			action: 'Connect to Slack',
		});
		Sentry.captureMessage('Connect to Slack');
		mixpanel.track('Connect to Slack');

		connectToSlack();
	};

	const load = () => {
		const params = queryString.parse(window.location.search);
		getClientAccount((res) => {
			setLoading(true);
			if (res.status === 200) {
				setCurrentPlan(res.data.currentPlan);
				setPhoneNumber(res.data.phoneNumber);
				setTeamName(res.data.teamName);
				setSlackConnectedDialog(params.showdialog === 'true');
				setCallRedirectNumber(
					new AsYouType('US').input(res.data.callRedirectNumber)
				);
				setForwardText(res.data.forwardText);
				setForwardToSlackFirst(res.data.forwardToSlackFirst);
				setContactsSynced(res.data.contactsSynced);
				setCreatePrivateChannel(res.data.createPrivateChannel);
				setDefaultChannelId(res.data.defaultChannelId);
				setIsChannelsFormat(
					res.data.messageFormat === slackMessageFormat.CHANNEL
				);

				if (res.data.teamName) {
					getSlackChannelsFn();
				}
			} else {
				notify.show(
					"We couldn't retrieve your account details. Try again later or contact support@founderphone.com",
					'error',
					NOTIFICATION_LENGTH
				);
			}
		});
	};

	const getSlackChannelsFn = () => {
		getSlackChannels((res) => {
			if (res.status === 200) {
				setChannels(res.data);
			}
		});
	};

	const handleCallRedirectChange = (event) => {
		let asYouType = new AsYouType('US');

		setCallRedirectNumber(asYouType.input(event.target.value));
	};

	const saveCallRedirect = () => {
		var parsedCallRedirectNumber = parsePhoneNumberFromString(
			formatPhoneNumber(cleanPhoneNumber(callRedirectNumber))
		);

		if (!parsedCallRedirectNumber || !parsedCallRedirectNumber.isValid()) {
			notify.show(
				'Please enter your number in this format with country code: +1 202 555 0160',
				'error',
				NOTIFICATION_LENGTH
			);
			return;
		}

		addCallRedirection(
			parsedCallRedirectNumber.number,
			forwardText,
			forwardToSlackFirst,
			(res) => {
				setCallRedirectNumber(
					parsedCallRedirectNumber.formatInternational()
				);
				if (res.status === 200) {
					notify.show(
						`Great, we will forward calls from ${parsePhoneNumberFromString(
							phoneNumber
						).formatInternational()} to ${parsedCallRedirectNumber.formatInternational()}`,
						'success',
						NOTIFICATION_LENGTH
					);
				} else {
					notify.show(
						"Oops. We couldn't save your call redirect number. Please contact support@founderphone.com",
						'error',
						NOTIFICATION_LENGTH
					);
				}
			}
		);
	};

	const connectToHubSpotFn = () => {
		ReactGA.event({
			category: 'User',
			action: 'Connect to HubSpot',
		});
		Sentry.captureMessage('Connect to Hubspot Contacts');
		mixpanel.track('Connect to Hubspot Contacts');

		connectToHubSpot();
	};

	const handleCreatePrivateChannel = () => {
		createPrivateChannelInSlack(!createPrivateChannel, (res) => {
			if (res.status === 200) {
				setCreatePrivateChannel(res.data.createPrivateChannel);
				{
					let message = createPrivateChannel
						? 'All new channels will be private moving forward'
						: 'All new channels will be public moving forward';
					notify.show(message, 'success', NOTIFICATION_LENGTH);
				}
			} else {
				notify.show(
					"Hmmm... we couldn't update your settings. Please try again later",
					'error',
					NOTIFICATION_LENGTH
				);
			}
		});
	};

	const onCopy = () => {
		notify.show('Copied phone number', 'success', NOTIFICATION_LENGTH);
	};

	const handleItemClick = (id) => {
		selectedItem === id ? setSelectedItem(null) : setSelectedItem(id);
		toggleDropdown();
	};

	const toggleDropdown = () => setOpen(!isOpen);

	const handleSelectChange = (event) => {
		setChannels(event.target.value);
		saveChannelIdFn();
	};

	const saveChannelIdFn = () => {
		if (defaultChannelId === '') {
			notify.show(
				'Please select a channel before saving',
				'error',
				NOTIFICATION_LENGTH
			);
			return;
		}

		saveChannelId(defaultChannelId, (res) => {
			if (res.status === 200) {
				notify.show(
					'Saved your new default channel',
					'success',
					NOTIFICATION_LENGTH
				);
			}
		});
	};

	const handleForwardCallToSlackChange = (prevState) => {
		setForwardToSlackFirst(!prevState.forwardToSlackFirst);
		saveCallRedirect();
	};

	const saveWebHook = () => {
		setWebhookLoading(true);

		updateWebhook(webHookURL)
			.then(() => {
				notify.show('Webhook updated', 'success', NOTIFICATION_LENGTH);
			})
			.catch(() => {
				notify.show(
					'Webhook failed to update',
					'error',
					NOTIFICATION_LENGTH
				);
			})
			.finally(() => {
				setWebhookLoading(false);
			});
	};

	let formattedPhoneNumber;

	if (phoneNumber) {
		formattedPhoneNumber = parsePhoneNumberFromString(
			phoneNumber
		).formatNational();
	}
	return (
		<div className="setup">
			<div className="row">
				<div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
					<div className="setupUser">
						<img
							src={wavinghandImg}
							alt="hello"
							className="setupUser-handIcon"
						/>
						<text className="setupUser-name">Hey</text>
					</div>
				</div>
				{loading ? (
					<div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
						<div className="how-it-works">
							<div className="row">
								<div className="col-xl-8 col-lg-12 col-md-12 col-sm-12">
									{(currentPlan === planTypes.PAID ||
										currentPlan === planTypes.TRIAL) &&
									phoneNumber ? (
										<div>
											<h4 className="title">
												<img
													className="title-img"
													src={userQueIcon}
													alt="usericon"
												/>
												How does this work?
											</h4>
											<p>
												{!teamName &&
													'Click Add to Slack below. '}
												Click Add to Slack below. Your
												phone number is{' '}
												<div className="atractive-items">
													{formattedPhoneNumber}
												</div>
											</p>
											<p>
												Upload your contacts below and
												click on Campaign in the nav
												menu on the left to send a
												personalized text to your
												customers with your new number!
												You can always visit{' '}
												<a
													className="atractive-items"
													href="https://help.founderphone.com"
												>
													help.founderphone.com
												</a>{' '}
												for instructions.
											</p>
										</div>
									) : (
										<div>
											<h4 className="title">
												<img
													className="title-img"
													src={notPaidIcone}
													alt="notpaidicon"
												/>
												<a className="atractive-items">
													Bummer
												</a>
												, Your account has been frozen
												<img
													className="coldfaceicon"
													alt="coldfaceicon"
													src={coldfaceIcon}
												/>
											</h4>
											<p className="setup-notpaid">
												Your trial has expired - but do
												not worry your data are safe!
												You just need to add your credit
												card details after selecting a
												plan and you are ready to go.
											</p>
											<NavLink
												exact
												to="/billing"
												className="btn--primaryBlue less_radius_set"
											>
												Be A Founder Now
											</NavLink>
										</div>
									)}
								</div>
								<div className="col-xl-4 col-lg-12 col-md-12 col-sm-12"></div>
							</div>
						</div>
					</div>
				) : (
					<Loader />
				)}
				<div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
					<div className="row">
						{(currentPlan === planTypes.PAID ||
							currentPlan === planTypes.TRIAL) &&
							phoneNumber && (
								<div className="col-md-6 col-sm-6">
									<div className="setupCard">
										<div className="card-icon">
											<Card.Img
												src={slacklogoImg}
											></Card.Img>
										</div>
										<div className="card-content">
											<h5>How does this work? </h5>
											<p>
												{currentPlan ===
												planTypes.NOT_PAID
													? 'Open up Billing in the left nav and subscribe to a plan to connect to Slack'
													: teamName
													? 'Connected to ' +
													  teamName +
													  '. All your messages will be forwarded there'
													: 'Connect your Slack to send and receive messages from the above phone number'}
											</p>
											<div>
												<Button
													className="btn--primaryBlue less_radius_set"
													onClick={connectToSlackFn}
												>
													{teamName
														? 'Change Slack'
														: 'Add to Slack'}
												</Button>
												<div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 card-checkbox">
													<div>
														{isChannelsFormat ? (
															<div className="row">
																<div className="col-md-1 col-sm-1">
																	<label className="checkbox-wrap">
																		<input
																			type="checkbox"
																			onClick={
																				createPrivateChannel
																			}
																			className="checkbox"
																			onChange={
																				handleCreatePrivateChannel
																			}
																			value="Create private slack channel"
																		/>
																		<span className="checkmark"></span>
																	</label>
																</div>
																<div className="col-md-11 col-sm-11">
																	<p>
																		Create
																		private
																		channels
																		for
																		incoming
																		texts
																	</p>
																</div>
															</div>
														) : (
															<div>
																<label
																	for="user-manager-name"
																	className="form-label label"
																>
																	Select
																	channel
																	<div
																		className="form-control user-form-text"
																		type="select"
																		onClick={
																			toggleDropdown
																		}
																		onChange={
																			handleSelectChange
																		}
																		value={
																			defaultChannelId
																		}
																	>
																		{selectedItem
																			? channels.find(
																					(
																						channel
																					) =>
																						channel
																							.id
																							.name ===
																						selectedItem
																			  )
																					.name
																			: 'Select channel'}
																	</div>
																	{isOpen && (
																		<div>
																			{channels.map(
																				(
																					channel
																				) => {
																					return (
																						<div
																							className="dropdown-item"
																							onClick={() =>
																								handleItemClick(
																									channel
																										.id
																										.name
																								)
																							}
																							value={
																								channel.id
																							}
																							key={
																								channel.id
																							}
																						>
																							<span
																								className={
																									channel
																										.id
																										.name ===
																									selectedItem
																								}
																							></span>
																							{
																								channel.name
																							}
																						</div>
																					);
																				}
																			)}
																		</div>
																	)}
																</label>
															</div>
														)}
													</div>
												</div>
											</div>
										</div>
										<div className="card-bg">
											<Card.Img
												src={cooliconImg}
											></Card.Img>
										</div>
									</div>
								</div>
							)}
						{(currentPlan === planTypes.PAID ||
							currentPlan === planTypes.TRIAL) &&
							phoneNumber && (
								<div className="col-md-6 col-sm-6">
									<div className="setupCard">
										<div className="card-icon">
											<Card.Img
												src={phone1Img}
											></Card.Img>
										</div>
										<div className="card-content">
											<h5>Your phone number</h5>
											<p>
												Any texts sent to this number
												will be forwarded to your Slack.
												Share it with your customers
											</p>
											{(currentPlan === planTypes.PAID ||
												currentPlan ===
													planTypes.TRIAL) &&
												phoneNumber && (
													<div
														type="button"
														className="card-link"
													>
														{formattedPhoneNumber}
														<CopyToClipboard
															onCopy={onCopy}
															text={
																formattedPhoneNumber
															}
														>
															<img
																className="card-copy"
																src={copyIcon}
																type="button"
																alt="copyIcon"
															/>
														</CopyToClipboard>
													</div>
												)}
										</div>
										<div className="card-bg">
											<Card.Img src={phoneImg}></Card.Img>
										</div>
									</div>
								</div>
							)}
						{(currentPlan === planTypes.PAID ||
							currentPlan === planTypes.TRIAL) &&
							phoneNumber && (
								<div className="col-md-6 col-sm-6">
									<div className="setupCard">
										<div className="card-icon">
											<Card.Img
												src={microphone1Img}
											></Card.Img>
										</div>
										<div className="card-content">
											<h5>Forward voice calls </h5>
											<p>
												{(currentPlan ===
													planTypes.PAID ||
													currentPlan ===
														planTypes.TRIAL) &&
												phoneNumber
													? "We'll forward any calls to the above number to your actual phone number" +
													  (forwardToSlackFirst
															? ". We'll share calls in Slack first for your team to answer before forwarding it to you"
															: '')
													: 'Add your card and hit subscribe to add call redirection to your phone number'}
											</p>
											{(currentPlan === planTypes.PAID ||
												currentPlan ===
													planTypes.TRIAL) &&
												phoneNumber && (
													<div>
														<InputGroup className="form">
															<FormControl
																className="phoneNumber"
																value={
																	callRedirectNumber
																}
																onChange={
																	handleCallRedirectChange
																}
																id="outlined-dense"
																placeholder="+12025550160"
															/>
														</InputGroup>
														<Button
															className="btn--primaryBlue less_radius_set"
															onClick={
																saveCallRedirect
															}
														>
															Save
														</Button>
														<div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 card-checkbox">
															<div className="row">
																<div className="col-md-1 col-sm-1">
																	<label className="checkbox-wrap">
																		<input
																			type="checkbox"
																			onClick={
																				forwardToSlackFirst
																			}
																			className="checkbox"
																			onChange={
																				handleForwardCallToSlackChange
																			}
																		/>
																		<span className="checkmark"></span>
																	</label>
																</div>
																<div className="col-md-11 col-sm-11">
																	<p>
																		Send
																		calls to
																		slack
																		for my
																		team to
																		answer
																		before
																		defaulting
																		to this
																		number
																	</p>
																</div>
															</div>
														</div>
													</div>
												)}
										</div>
										<div className="card-bg">
											<Card.Img
												src={microphoneImg}
											></Card.Img>
										</div>
									</div>
								</div>
							)}

						{(currentPlan === planTypes.PAID ||
							currentPlan === planTypes.TRIAL) && (
							<div className="col-md-6 col-sm-6">
								<div className="setupCard">
									<div className="card-icon">
										<Card.Img src={sync1Img}></Card.Img>
									</div>
									<div className="card-content">
										<h5>Sync your contacts</h5>
										<p>
											Share your contacts or HubSpot with
											us and we'll automatically name your
											Slack channels instead of using a
											phone number
										</p>
										<p>
											{contactsSynced} contact(s) synced
										</p>
										<Button
											className="btn--primaryOrange less_radius_set"
											onClick={connectToHubSpotFn}
										>
											<img
												src={hubspotIcon}
												alt="hubspoticon"
											/>{' '}
											Sync with Hubspot
										</Button>
									</div>
									<div className="card-bg">
										<Card.Img src={syncImg}></Card.Img>
									</div>
								</div>
							</div>
						)}
						{(currentPlan === planTypes.PAID ||
							currentPlan === planTypes.TRIAL) && (
							<div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
								<div className="setupCard">
									<div className="row">
										<div className="col-md-10 col-sm-10">
											<div className="card-content padL0">
												<h5>Webhook </h5>
												<p>
													You can subscribe to be
													notified in events to
													FounderPhone (For example
													when a new message is sent
													or recieved) at a URL of
													your choice
												</p>
												<div className="row">
													<div className="col-md-8 col-sm-8">
														<InputGroup className="form form-input">
															<FormControl
																className="phoneNumber"
																value={
																	webHookURL
																}
																onChange={(
																	e
																) => {
																	setWebHookURL(
																		e.target
																			.value
																	);
																}}
																id="outlined-dense"
															/>
														</InputGroup>
													</div>
													<div className="col-md-2 col-sm-2 card-webhook">
														<Button
															className="btn--primaryBlue less_radius_set marT0"
															onClick={
																saveWebHook
															}
															disabled={
																webhookLoading
															}
														>
															Save
														</Button>
													</div>
													<div className="card-checkbox">
														<p>
															We will make a post
															request to the URL
															webhook will be
															disabled if call
															fails
														</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
						{(currentPlan === planTypes.PAID ||
							currentPlan === planTypes.TRIAL) &&
						teamName ? (
							<div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
								<div className="setupCard">
									<div className="row">
										<div className="col-md-10 col-sm-10">
											<div className="card-content padL0">
												<InviteSlackMembers
													message={
														'Connected to ' +
														teamName +
														'. These users will be invited to every new channel by default'
													}
													header={
														'Default respondents'
													}
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						) : null}
					</div>
				</div>
				{/* <div className="col-3 col-md-3 col-lg-4 col-xl-3">
					<button className="right-sidebar-closebtn"> add class `open` for mobile
						<img className='image' src={openArrow} />
					</button>
					<div className="common-right-sidebar position-fixed-right">
						add class `active` for mobile
						<div className="common-right-sidebar-inner">
							<div className="common-right-sidebar-top">
								<div className="tabs">
									<div className="tab-item"> add/remove class `active` for tab change
										stats
									</div>
								</div>
								<div className="tabs tabs-right">
									<div className="tab-item active">  add/remove class `active` for tab change
										Messages
									</div>
								</div>
							</div>
							<div className="common-right-sidebar-bottom">
								<div className="tab-content">	 add/remove class `active` for tab content change
									Test Content
								</div>
								<div className="tab-content active">
									add/remove class `active` for tab content change
									<div className="sidebar-widget white-box">
										<div className="billing-widget">
											<div className="row">
												<div className="col-4">
													<img src={circleprogressImg} alt="bar" className="bar_picture" />
												</div>
												<div className="col-8">
													<h5 className="title-head-sidebar">Total number of transation</h5>
													<span className="trans-percent">28.8%
													</span>
													<span className="drop-percent-icon">
														<img src={dropImg} alt="drop" className="drop_icon" />
													</span>
													<span className="graph-percent">
														<img src={graphImg} alt="graph" className="bar_picture" />
													</span>
												</div>
											</div>
										</div>
									</div>
									<div className="sidebar-widget white-box">
										<div className="billing-widget">
											<div className="row">
												<div className="col-4">
													<img src={circleprogressImg} alt="bar" className="bar_picture" />
												</div>
												<div className="col-8">
													<h5 className="title-head-sidebar">Total number of transation</h5>
													<span className="trans-percent">28.8%
													</span>
													<span className="drop-percent-icon">
														<img src={dropImg} alt="drop" className="drop_icon" />
													</span>
													<span className="graph-percent">
														<img src={graphImg} alt="graph" className="bar_picture" />
													</span>
												</div>
											</div>
										</div>
									</div>
									<div className="sidebar-widget white-box">
										<div className="billing-widget">
											<div className="row">
												<div className="col-4">
													<img src={circleprogressImg} alt="bar" className="bar_picture" />
												</div>
												<div className="col-8">
													<h5 className="title-head-sidebar">Total number of transation</h5>
													<span className="trans-percent">28.8%
													</span>
													<span className="drop-percent-icon">
														<img src={dropImg} alt="drop" className="drop_icon" />
													</span>
													<span className="graph-percent">
														<img src={graphImg} alt="graph" className="bar_picture" />
													</span>
												</div>
											</div>
										</div>
									</div>
									<div className="sidebar-widget white-box">
										<div className="billing-widget">
											<div className="row">
												<div className="col-4">
													<img src={circleprogressImg} alt="bar" className="bar_picture" />
												</div>
												<div className="col-8">
													<h5 className="title-head-sidebar">Total number of transation</h5>
													<span className="trans-percent">28.8%
													</span>
													<span className="drop-percent-icon">
														<img src={dropImg} alt="drop" className="drop_icon" />
													</span>
													<span className="graph-percent">
														<img src={graphImg} alt="graph" className="bar_picture" />
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div> */}
			</div>
			<Modal
				show={slackConnectedDialog}
				onHide={() => {
					setSlackConnectedDialog(!slackConnectedDialog);
				}}
			>
				<Modal.Header>
					<Modal.Title>
						You should have text forwarding to Slack working now!
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h6>
						Text {formattedPhoneNumber} and head to your Slack to
						see if a new channel was created with the forwarded SMS
					</h6>
				</Modal.Body>
				<Modal.Footer>
					<button
						onClick={() => {
							setSlackConnectedDialog(!slackConnectedDialog);
						}}
						autoFocus
						className="btn--primaryGreen"
					>
						Ok
					</button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};
