import React, { useEffect, useState } from 'react';
import { notify } from 'react-notify-toast';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import GoogleContact from 'react-google-contacts';
import { Dropdown, Button } from 'react-bootstrap';
import mixpanel from 'mixpanel-browser';
import * as Sentry from '@sentry/browser';
import ReactGA from 'react-ga';
import PhoneInput from 'react-phone-input-2';

import 'react-phone-input-2/lib/material.css';
import '../Components/Popup/popup.scss';
import '../Campaign/add-campaign.scss';
import '../Campaign/campaign-contacts.scss';

import {
	getSlackUsers,
	getContacts,
	deleteContact,
	googleSaveContact,
	connectToHubSpot,
	saveContact,
	updateContact,
} from '../../Services/Api';
// import addIcon from '../Campaign/images/plus.svg';
import userThumb from '../Campaign/images/User.png';
import SVGIcon from '../Campaign/SVG/SvgIcons';
import deletealert from '../Campaign/images/delete-2.svg';
import closePopup from '../Campaign/images/close.svg';
import googleIcon from '../Campaign/images/google.png';
import hubspotIcon from '../Campaign/images/hubspot.png';
import { RenderLoader } from './Loader/RenderLoader';
import { TemplateMessage } from '../Components/TemplateMessage';
import phoneBookIcon from '../Campaign/images/phoneBook.png';
import { formatPhoneNumber } from '../../Utils/PhoneUtils';

export const ContactsList = () => {
	let GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

	const NOTIFICATION_LENGTH = 6000;

	// const [filterPopUp, setFilterPopUp] = useState(true);
	const [selectedContacts, setSelectedContacts] = useState([]);
	const [sendCampaignContact, setSendCampaignContact] = useState([]);
	// const [introMessage, setIntroMessage] = useState('');

	// const filterfn = () => {
	// 	filterPopUp ? setFilterPopUp(false) : setFilterPopUp(true);
	// };
	const [searchQuery, setSearchQuery] = useState('');
	const [contacts, setContacts] = useState([]);
	const [selectedMoreIcon, setSelectedMoreIcon] = useState(1);
	const [deletePopUp, setDeletePopUp] = useState(true);
	const [loading, setLoading] = useState(false);
	const [noData, setNoData] = useState(true);
	const [sendCampaign, setSendCampaign] = useState(true);
	const [openAddContactDialog, setOpenAddContactDialog] = useState(true);
	const [openUpdateContactDialog, setOpenUpdateContactDialog] = useState(
		true
	);
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('+1');
	const [email, setEmail] = useState('');
	const [company, setCompany] = useState('');
	const [accountManager, setAccountManager] = useState('');
	const [slackUsers, setSlackUsers] = useState([]);
	const [id, setId] = useState('');

	const deletePopUpfn = () => {
		setDeletePopUp(!deletePopUp);
	};

	useEffect(() => {
		getContactsFn();

		updateContacts();

		getSlackUsers().then((res) => {
			const users = res.data.users.filter(
				(u) => !u.deleted && !!u.profile.email
			);
			setSlackUsers(users);
		});
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const openAddContactDialogfn = () => {
		setOpenAddContactDialog(!openAddContactDialog);
	};

	const handleChange = (event) => {
		setFirstName(event.target.value);
	};

	const handleChangeLastName = (event) => {
		setLastName(event.target.value);
	};

	const handlePhoneNumberChange = (value) => {
		setPhoneNumber(value);
	};

	const handleChangeEmail = (event) => {
		setEmail(event.target.value);
	};

	const handleChangeCompany = (event) => {
		setCompany(event.target.value);
	};

	const handleChangeAcManager = (event) => {
		setAccountManager(event.target.value);
	};

	const selectContact = (id, number) => {
		let selectedContactsCopy = selectedContacts;
		selectedContactsCopy.push(id);
		let sendCampaignContactCopy = sendCampaignContact;
		sendCampaignContactCopy.push(number);
		setSelectedContacts(selectedContactsCopy);
		setSendCampaignContact(sendCampaignContactCopy);
	};

	const unselectContact = (id) => {
		let selectedContactsCopy = selectedContacts;
		const index = selectedContactsCopy.indexOf(id);
		if (index > -1) {
			selectedContactsCopy.splice(index, 1);
		}
		setSelectedContacts(selectedContactsCopy);
	};

	const openUpdateContactDialogfn = (contact) => {
		if (contact) {
			setId(contact._id);
			setFirstName(contact.firstName);
			setLastName(contact.lastName);
			setEmail(contact.email);
			setPhoneNumber(contact.phoneNumber);
			setCompany(contact.company);
			setAccountManager(contact.accountManager);
		}
		setOpenUpdateContactDialog(!openUpdateContactDialog);
	};

	const sendCampaignfn = () => {
		setSendCampaign(!sendCampaign);
	};

	const getContactsFn = () => {
		setLoading(true);
		getContacts(searchQuery, (res) => {
			setLoading(false);
			if (res.status === 200) {
				if (res.data.length === 0) {
					setNoData(false);
				} else {
					setNoData(true);
					setContacts(res.data);
				}
			} else {
				notify.show(
					"Couldn't search contacts :-(",
					'error',
					NOTIFICATION_LENGTH
				);
			}
		});
	};

	const updateContacts = () => {
		getContacts(searchQuery, (res) => {
			if (res.status === 200) {
				setContacts(res.data);
			} else {
				notify.show(
					"Couldn't search contacts :-(",
					'error',
					NOTIFICATION_LENGTH
				);
			}
		});
	};

	const toggleContact = (event, index) => {
		if (event.target.checked) {
			selectContact(contacts[index]._id, contacts[index].phoneNumber);
		} else {
			unselectContact(contacts[index]._id);
		}
	};

	const deleteContactFn = () => {
		deleteContact(contacts[selectedMoreIcon]._id, (res) => {
			if (res.status === 200) {
				notify.show('Deleted successfully', 'success', 3000);
				let contactsCopy = contacts;
				contactsCopy.splice(selectedMoreIcon, 1);
				setSelectedMoreIcon(-1);
				setContacts(contactsCopy);
			}
			deletePopUpfn();
		});
	};

	const responseCallback = (response) => {
		saveAllContact(response);
	};

	const saveAllContact = (gContact) => {
		let numbers = [];

		gContact.forEach((element) => {
			if (element.phoneNumber) {
				let data = {
					email: element.email,
					firstName: element.familyName,
					lastName: element.givenName,
					phoneNumber: element.phoneNumber,
				};
				numbers.push(data);
			}
		});

		const body = {
			contacts: numbers,
		};

		googleSaveContact(body, (res) => {
			if (res.status === 200) {
				notify.show('Contacts saved successfully', 'success', 3000);
				getContactsFn();
			} else {
				notify.show('Something went wrong', 'error', 3000);
			}
		});
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

	const afterSendCallback = () => {
		setSelectedContacts([]);
		setSendCampaign(true);
		getContactsFn();
	};

	const saveContactFn = () => {
		if (!firstName) {
			notify.show('Please enter first name', 'error', 3000);
			return;
		}
		if (!phoneNumber.length > 2) {
			notify.show('Please enter phone number', 'error', 3000);
			return;
		}

		let parsedPhoneNumber = parsePhoneNumberFromString(
			formatPhoneNumber(phoneNumber)
		);
		if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
			notify.show('Please enter valid phone number', 'error', 3000);
			return;
		}
		saveContact(
			firstName,
			lastName,
			parsedPhoneNumber.number,
			email,
			company,
			accountManager,
			(res) => {
				if (res.status === 200) {
					notify.show('Contact saved successfully', 'success', 3000);
					updateContacts();
				} else {
					notify.show('Contact already exists', 'error', 3000);
				}
				setFirstName('');
				setLastName('');
				setEmail('');
				setPhoneNumber('');
				setCompany('');
				setAccountManager('');
			},
			openAddContactDialogfn()
		);
	};

	const updateContactFn = () => {
		if (!firstName) {
			notify.show('Please enter first name', 'error', 3000);
			return;
		}
		if (!phoneNumber.length > 2) {
			notify.show('Please enter phone number', 'error', 3000);
			return;
		}

		let parsedPhoneNumber = parsePhoneNumberFromString(
			formatPhoneNumber(phoneNumber)
		);
		if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
			notify.show('Please enter valid phone number', 'error', 3000);
			return;
		}

		updateContact(
			id,
			firstName,
			lastName,
			parsedPhoneNumber.number,
			email,
			company,
			accountManager,
			(res) => {
				if (res.status === 200) {
					notify.show('Contact update successfully', 'success', 3000);
					updateContacts();
				} else {
					notify.show('Something went wrong', 'error', 3000);
				}
				setId('');
				setFirstName('');
				setLastName('');
				setEmail('');
				setPhoneNumber('');
				setCompany('');
				setAccountManager('');
			},
			openUpdateContactDialogfn()
		);
	};
	const showcontent = noData && !loading;

	return (
		<div className="col-12">
			<RenderLoader loading={loading} />
			{showcontent && (
				<div>
					<div>
						<div className="col-12 text-md-end">
							<button
								className="btn--primaryGreen less-radius campaign-button"
								onClick={sendCampaignfn}
							>
								Send Campaign
							</button>
							{/* <button className='btn--primaryGreen less-radius campaign-button' onClick={filterfn}>
						<img src={filterIcon} alt="Send Campaign" className='left-icon' /> Filters
						</button> */}
						</div>
						<div className="table-main marT30">
							<div className="table-top">
								<div className="row">
									<div className="col-xl-9 col-lg-8 col-md-8">
										<h4 className="main-title">
											All Contacts
										</h4>
									</div>
									<div className="col-xl-3 col-lg-3 col-md-3 text-md-end ">
										<Dropdown className="dropdown-campaign">
											<Button
												className="dropdown-button"
												variant="success"
												onClick={openAddContactDialogfn}
											>
												Add Contact
											</Button>

											<Dropdown.Toggle className="dropdown-button" />

											<Dropdown.Menu className="dropdown-menu">
												<Dropdown.Item className="dropdown-item">
													<GoogleContact
														clientId={
															GOOGLE_CLIENT_ID
														}
														render={(
															renderProps
														) => (
															<div
																onClick={
																	renderProps.onClick
																}
															>
																<img
																	src={
																		googleIcon
																	}
																	alt="Add Contact"
																	className="dropdown-icon"
																/>{' '}
																Google
															</div>
														)}
														buttonText="Import"
														onSuccess={
															responseCallback
														}
													></GoogleContact>
												</Dropdown.Item>
												<hr className="underline" />
												<Dropdown.Item
													className="dropdown-item"
													onClick={connectToHubSpotFn}
												>
													<img
														src={hubspotIcon}
														alt="Add Contact"
														className="dropdown-icon"
													/>{' '}
													HubSpot
												</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</div>
								</div>
							</div>
							<div className="table-responsive-xl">
								<table className="table">
									<thead className="table-head">
										<tr className="table-row table-head-row">
											<th
												className="table-col table-head-col"
												scope="col"
											>
												#{' '}
											</th>
											<th
												className="table-col table-head-col"
												scope="col"
											>
												Phone Number
											</th>
											<th
												className="table-col table-head-col"
												scope="col"
											>
												Name
											</th>
											{/* <th className="table-col table-head-col" scope="col">Date</th> */}
											{/* <th className="table-col table-head-col" scope="col">Slack Channel</th> */}
											<th
												className="table-col table-head-col"
												scope="col"
											></th>
											{/* <th className="table-col table-head-col" scope="col"></th> */}
										</tr>
									</thead>

									<tbody className="table-body">
										{contacts.map((contact, index) => {
											return (
												<tr
													className="table-row table-body-row"
													key={index}
												>
													<td className="table-col table-body-col">
														<label className="checkbox-wrap">
															<input
																type="checkbox"
																onClick={
																	selectedContacts.indexOf(
																		contact._id
																	) > -1
																}
																className="checkbox"
																onChange={(
																	event
																) =>
																	toggleContact(
																		event,
																		index
																	)
																}
															/>
															<span className="checkmark"></span>
														</label>
													</td>
													<td className="table-col table-body-col">
														<div className="user-thumb">
															<img
																src={userThumb}
																alt=""
															/>
														</div>
														{parsePhoneNumberFromString(
															contact.phoneNumber
														).formatInternational()}
													</td>
													<td className="table-col table-body-col">
														<p className="midium-text">
															{contact.firstName}{' '}
															{contact.lastName}
														</p>
														{/* <span className="small-text">on 24.05.2019</span> */}
													</td>
													{/* <td className="table-col table-body-col" scope="col">
                                            <p className="midium-text">May 26, 2019</p>
                                            <span className="small-text">6:30 PM</span>
                                        </td>
                                        <td className="table-col table-body-col" scope="col">
                                            <p className="midium-text">#fp-95656578</p>
                                        </td> */}
													<td className="table-col table-body-col">
														<div type="button">
															<SVGIcon
																onClick={() => {
																	openUpdateContactDialogfn(
																		contact
																	);
																}}
																name="editIcon"
																height="18"
																width="18"
															/>
														</div>
													</td>
													<td className="table-col table-body-col">
														<div type="button">
															<SVGIcon
																onClick={
																	deletePopUpfn
																}
																name="deleteIcon"
																height="20"
																width="20"
															/>
														</div>
													</td>
													{/* <td className="table-col table-body-col" scope="col">
                                            <a className="view-profile">View Profile</a>
                                        </td> */}
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			)}
			{!noData && (
				<div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
					<div className="how-it-works">
						<div className="row">
							<div className="col-xl-9 col-lg-12 col-md-12 col-sm-12">
								<div>
									<h4 className="title">
										<img
											src={phoneBookIcon}
											className="title-img"
											alt="phoneBook"
										/>
										Your Contacts
									</h4>
									<p>
										Add your contacts or import your
										existing ones!{' '}
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
							<div className="table-main-no">
								<div className="table-top">
									<div className="row">
										<div className="col-xl-9 col-lg-8 col-md-8 col-sm-8">
											<h4 className="title-no">
												Add Contacts
											</h4>
										</div>
										<div className="col-xl-3 col-lg-3 col-md-3 text-md-end ">
											<Dropdown className="dropdown-campaign">
												<Button
													className="dropdown-button"
													variant="success"
													onClick={
														openAddContactDialogfn
													}
												>
													Add Contact
												</Button>

												<Dropdown.Toggle className="dropdown-button " />

												<Dropdown.Menu className="dropdown-menu">
													<Dropdown.Item className="dropdown-item">
														<GoogleContact
															clientId={
																GOOGLE_CLIENT_ID
															}
															render={(
																renderProps
															) => (
																<div
																	onClick={
																		renderProps.onClick
																	}
																>
																	<img
																		src={
																			googleIcon
																		}
																		alt="Add Contact"
																		className="dropdown-icon"
																	/>{' '}
																	Google
																</div>
															)}
															buttonText="Import"
															onSuccess={
																responseCallback
															}
														></GoogleContact>
													</Dropdown.Item>
													<hr className="underline" />
													<Dropdown.Item
														className="dropdown-item"
														onClick={
															connectToHubSpotFn
														}
													>
														<img
															src={hubspotIcon}
															alt="Add Contact"
															className="dropdown-icon"
														/>{' '}
														HubSpot
													</Dropdown.Item>
												</Dropdown.Menu>
											</Dropdown>
										</div>
									</div>
								</div>
							</div>
						</div>
						{/* <div className="col-xl-6 col-lg-12 col-md-12 col-sm-12">
                            <div className="table-main-no">
                                <div className="table-top">
                                    <div className="row">
                                        <div className="col-xl-7 col-lg-12 col-md-12 col-sm-12">
                                            <h4 className='title-no'>Import Existing Contacts</h4>
                                        </div>
                                        <div className="col-xl-5 col-lg-12 col-md-12 col-sm-12 dropdown-campaign">
                                            <Dropdown className=' '>
                                                <Dropdown.Toggle className='btn--primaryGreen dropdown-button less-radius-no less-width'>
                                                    Import
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item className='dropdown-item' >
                                                        <GoogleContact
                                                            clientId={GOOGLE_CLIENT_ID}
                                                            render={(renderProps) => (
                                                                <div onClick={renderProps.onClick}><img src={googleIcon} alt="Add Contact" className='dropdown-icon' />   Google</div>
                                                            )}
                                                            buttonText="Import"
                                                            onSuccess={responseCallback}
                                                        ></GoogleContact>
                                                    </Dropdown.Item>
                                                    <hr className='underline' />
                                                    <Dropdown.Item className='dropdown-item' onClick={connectToHubSpotFn}><img src={hubspotIcon} alt="Add Contact" className='dropdown-icon' />   HubSpot</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> */}
					</div>
				</div>
			)}

			<div
				className={
					openAddContactDialog ? 'popup-mask' : 'popup-mask open'
				}
			>
				{/* add/remove open class here for popup => main mask */}
				<div className="popup-content">
					<div
						className="close-popup"
						onClick={openAddContactDialogfn}
					>
						<img src={closePopup} alt="" />
					</div>
					<div className="user-profile-popup open">
						{/* add/remove open class here for popup user-profile-popup */}
						<div className="popup-box">
							<div className="popup-user-profile">
								<div className="popup-user-details">
									{/* <div className="pop-user-thumbnail">
										<img src={userIcon} alt="Campaign User" className="user-img" />
									</div>
									<div className="col-12 text-md-center">
										<div className="user-tab-panel">
											<button className='user-tab-btn less-radius active'>
												add/remove active class here for tab
												<SVGIcon name="userIcon" />
												Add Contact
											</button>
											add/remove active class here for tab
											<button className='user-tab-btn less-radius'>
												<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path d="M7 0C3.15521 0 0 3.15521 0 7C0 10.8448 3.15521 14 7 14C8.22491 14 9.43092 13.6764 10.4871 13.0639L10.0753 12.3541C9.14413 12.8941 8.08061 13.1797 7 13.1797C3.60745 13.1797 0.820312 10.3925 0.820312 7C0.820312 3.60745 3.60745 0.820312 7 0.820312C10.3925 0.820312 13.1797 3.60745 13.1797 7C13.1797 8.09108 12.8942 9.15652 12.3594 10.0822V9.07812H11.5391V11.5391H14V10.7188H12.933C13.6219 9.61603 14 8.30641 14 7C14 3.15521 10.8448 0 7 0Z" fill="#797979"/>
													<path d="M7 2.46094C4.51225 2.46094 2.46094 4.51225 2.46094 7C2.46094 9.48775 4.51225 11.5391 7 11.5391C9.48775 11.5391 11.5391 9.48775 11.5391 7C11.5391 4.51225 9.48775 2.46094 7 2.46094ZM9.87109 7.41016H6.58984V4.10156H7.41016V6.58984H9.87109V7.41016Z" fill="#797979"/>
												</svg>
												History
											</button>
										</div>
									</div> */}
									<div className="popups-user-info open">
										{/* add/remove open class here for tab content */}
										<div className="user-info-form">
											<div className="row">
												<div className="col-md-6">
													<label
														for="user-f-name"
														className="form-label label"
													>
														First Name
														<input
															type="text"
															className="form-control user-form-text"
															id="user-f-name"
															required
															value={firstName}
															name="firstName"
															// id="first name"
															label="First Name"
															variant="outlined"
															onChange={
																handleChange
															}
														/>
														{/* <span className="error-output">Enter First Name</span> */}
													</label>
												</div>
												<div className="col-md-6">
													<label
														for="user-l-name"
														className="form-label label"
													>
														Last Name
														<input
															type="text"
															className="form-control user-form-text"
															// id="user-l-name"
															value={lastName}
															name="lastName"
															id="last name"
															label="Last Name"
															variant="outlined"
															onChange={
																handleChangeLastName
															}
														/>
														{/* <span className="error-output">Enter Last Name</span> */}
													</label>
												</div>
												<div className="col-md-6">
													<label
														for="user-phone"
														className="form-label label user-phone"
													>
														Phone number
														<PhoneInput
															type="text"
															value={phoneNumber}
															name="phoneNumber"
															id="Phone Number"
															label="Phone Number"
															onChange={
																handlePhoneNumberChange
															}
															variant="outlined"
															enableSearch
															country={'india'}
														/>
														{/* <span className="error-output">Enter a valid Phone number</span> */}
													</label>
												</div>
												{/* <div className="col-md-6">
													<label for="user-gender" className="form-label label user-gender">
														Gender (Optional)
														<select className="form-control user-form-text" name="gender" id="user-gender">
															<option value="male" selected>Male</option>
															<option value="female">Female</option>
														</select>
														<img src={selectdrop} alt="user gender down angle" className='user-select-drop-icon' />
													</label>
												</div> */}
												<div className="col-md-6">
													<label
														for="user-list"
														className="form-label label"
													>
														Email
														<input
															type="text"
															className="form-control user-form-text"
															// id="user-list"
															value={email}
															name="email"
															id="Email"
															label="Email"
															variant="outlined"
															onChange={
																handleChangeEmail
															}
														/>
														{/* <span className="error-output">Enter</span> */}
													</label>
												</div>
												<div className="col-md-12">
													<label
														for="user-tag"
														className="form-label label"
													>
														Company
														<input
															type="text"
															className="form-control user-form-text"
															// id="user-tag"
															value={company}
															name="company"
															id="Company"
															label="Company"
															variant="outlined"
															onChange={
																handleChangeCompany
															}
														/>
														{/* <span className="error-output">Enter</span> */}
													</label>
												</div>

												{/* <div className="col-md-12">
                                                    <label for="user-manager-name" className="form-label label">Account Manager
                                                        <div className="form-control user-form-text" type='select' onClick={toggleDropdown} onChange={handleChangeAcManager}>
                                                            {selectedItem ? slackUsers.find(user => user.profile.real_name === selectedItem).real_name : "Select Account Manager"}
                                                        </div>
                                                        {isOpen && (
                                                            <div className="form-control user-form-text">
                                                                {slackUsers.map(user => (
                                                                    <div className="dropdown-item" onClick={() => handleItemClick(user.profile.real_name)} key={user.profile.email}
                                                                        value={user.profile.email}>
                                                                        <span className={user.profile.real_name === selectedItem}></span>
                                                                        {user.profile.real_name}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </label>
                                                </div> */}

												<div className="col-md-12">
													<label
														for="user-manager-name"
														className="form-label label"
													>
														Account Manager
														<select
															className="form-control user-form-text"
															onChange={
																handleChangeAcManager
															}
															value={
																accountManager
															}
														>
															{slackUsers.map(
																(user) => (
																	<option
																		className="form-control user-form-text"
																		key={
																			user
																				.profile
																				.email
																		}
																		value={
																			user
																				.profile
																				.email
																		}
																	>
																		{
																			user
																				.profile
																				.real_name
																		}{' '}
																		(
																		{
																			user
																				.profile
																				.email
																		}
																		)
																	</option>
																)
															)}
														</select>
													</label>
												</div>

												<div className="col-md-12">
													{/* <FormControl
														variant="outlined" className="form-label label"
													>
														<InputLabel id="demo-simple-select-outlined-label">
															Account Manager
														</InputLabel>
														<Select
															labelId="demo-simple-select-outlined-label"
															id="demo-simple-select-outlined"
															value={accountManager}
															onChange={handleChangeAcManager}
															style={{ width: "100%" }}
															name="accountManager"
															labelWidth={140}
														>
															{slackUsers.map((user) => (
																<MenuItem
																	key={user.profile.email}
																	value={user.profile.email}
																>
																	{user.profile.real_name}
																</MenuItem>
															))}
														</Select>
													</FormControl> */}
												</div>
												<div className="col-md-12 text-md-end">
													<button
														className="btn--primaryGreen"
														onClick={saveContactFn}
													>
														Save
													</button>
												</div>
											</div>
										</div>
									</div>
									{/* <div className="popups-user-history"> */}
									{/* add/remove open class here for tab content */}
									{/* <div className="popups-user-history-details">
											<a href="#" className="history-details-close">Clear All <span className="history-close"><img src={closeHistory} alt="" /></span></a>
											<h6 className="popup-title bolder-title"> History</h6>
											<div className="history-list">
												<div className="row">
													<div className="col-md-9">
														<a className="history-title">#ADS001245</a>
														<p className="history-content">Lorem Ipsum is simply dummy text.</p>
														<p className="history-date">on 24.05.2019</p>
													</div>
													<div className="col-md-3">
														<div className="status open ">
															Opened
															<div className="tool-tip ">Launch Campaign</div>
														</div>
													</div>
												</div>
												<div className="row">
													<div className="col-md-9">
														<a className="history-title">#ADS001245</a>
														<p className="history-content">Lorem Ipsum is simply dummy text.</p>
														<p className="history-date">on 24.05.2019</p>
													</div>
													<div className="col-md-3">
														<div className="status pending ">
															Pending
															<div className="tool-tip">Launch Campaign</div>
														</div>
													</div>
												</div>
												<div className="row">
													<div className="col-md-9">
														<a className="history-title">#ADS001245</a>
														<p className="history-content">Lorem Ipsum is simply dummy text.</p>
														<p className="history-date">on 24.05.2019</p>
													</div>
													<div className="col-md-3">
														<div className="status open ">
															Opened
															<div className="tool-tip ">Launch Campaign</div>
														</div>
													</div>
												</div>
												<div className="row">
													<div className="col-md-9">
														<a className="history-title">#ADS001245</a>
														<p className="history-content">Lorem Ipsum is simply dummy text.</p>
														<p className="history-date">on 24.05.2019</p>
													</div>
													<div className="col-md-3">
														<div className="status send ">
															Send
															<div className="tool-tip ">Launch Campaign</div>
														</div>
													</div>
												</div>
												<div className="row">
													<div className="col-md-9">
														<a className="history-title">#ADS001245</a>
														<p className="history-content">Lorem Ipsum is simply dummy text.</p>
														<p className="history-date">on 24.05.2019</p>
													</div>
													<div className="col-md-3">
														<div className="status open ">
															Opened
															<div className="tool-tip ">Launch Campaign</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div> */}
								</div>
							</div>
						</div>
					</div>

					{/* <div className="add-new-tag-popup"> */}
					{/* add/remove open class here for popup => add-new-tag-popup */}
					{/* <div className="popup-box">
							<form className="form user-list-form">
								<div className="row">
									<div className="col-md-12">
										<div className="form-check list-add">
											<label className="form-check-label popup-title bolder-title list-title" for="flexRadioDefault1 ">
											Add to List</label>
											<input className="radio-position" type="radio" name="flexRadioDefault" id="flexRadioDefault1"/>
										</div>
									</div>
							<form className="user-list-tag-create">
							<div className="row">
							<div className="col-md-12">
							<label for="card-name-tag" className="form-label label popup-tag-btn">
							<input type="text" className="form-control  popup-title bolder-title popup-tag-btn-text" id="card-name-tag" placeholder="Add New Tag"/>
							<img src={addTag} alt="user Campaign update" className='right-icon popup-plus-icon' />
							</label>
							</div>
							<div className="col-md-12">
							<label for="card-name-text" className="form-label label popup-tag-mini-text">
							Assign Account Manager
							<input type="text" className="form-control" id="card-name-text"/>
							</label>
							</div>
							</div>
							</form>
							<div className="col-md-6 text-center">
							<button className="btn--primaryRed fullwidth marT30">Cancel</button>
							</div>
							<div className="col-md-6 text-center">
							<button className="btn--primaryGreen fullwidth marT30">Apply</button>
							</div>
							</div>
							</form>
						</div>
					</div> */}
				</div>
			</div>

			{/*             updateContact                */}

			<div
				className={
					openUpdateContactDialog ? 'popup-mask' : 'popup-mask open'
				}
			>
				{/* add/remove open class here for popup => main mask */}
				<div className="popup-content">
					<div
						className="close-popup"
						onClick={openUpdateContactDialogfn}
					>
						<img src={closePopup} alt="" />
					</div>
					<div className="user-profile-popup open">
						{/* add/remove open class here for popup user-profile-popup */}
						<div className="popup-box">
							<div className="popup-user-profile">
								<div className="popup-user-details">
									<div className="popups-user-info open">
										{/* add/remove open class here for tab content */}
										<div className="user-info-form">
											<div className="row">
												<div className="col-md-6">
													<label
														for="user-f-name"
														className="form-label label"
													>
														First Name
														<input
															type="text"
															className="form-control user-form-text"
															id="user-f-name"
															required
															value={firstName}
															name="firstName"
															// id="first name"
															label="First Name"
															variant="outlined"
															onChange={(e) => {
																setFirstName(
																	e.target
																		.value
																);
															}}
														/>
														{/* <span className="error-output">Enter First Name</span> */}
													</label>
												</div>
												<div className="col-md-6">
													<label
														for="user-l-name"
														className="form-label label"
													>
														Last Name
														<input
															type="text"
															className="form-control user-form-text"
															// id="user-l-name"
															value={lastName}
															name="lastName"
															id="last name"
															label="Last Name"
															variant="outlined"
															onChange={
																handleChangeLastName
															}
														/>
														{/* <span className="error-output">Enter Last Name</span> */}
													</label>
												</div>
												<div className="col-md-6">
													<label
														for="user-phone"
														className="form-label label user-phone"
													>
														Phone number
														<PhoneInput
															type="text"
															value={phoneNumber}
															name="phoneNumber"
															id="Phone Number"
															label="Phone Number"
															onChange={
																handlePhoneNumberChange
															}
															variant="outlined"
															enableSearch
															country={'india'}
														/>
														{/* <span className="error-output">Enter a valid Phone number</span> */}
													</label>
												</div>

												<div className="col-md-6">
													<label
														for="user-list"
														className="form-label label"
													>
														Email
														<input
															type="text"
															className="form-control user-form-text"
															// id="user-list"
															value={email}
															name="email"
															id="Email"
															label="Email"
															variant="outlined"
															onChange={
																handleChangeEmail
															}
														/>
														{/* <span className="error-output">Enter</span> */}
													</label>
												</div>
												<div className="col-md-12">
													<label
														for="user-tag"
														className="form-label label"
													>
														Company
														<input
															type="text"
															className="form-control user-form-text"
															// id="user-tag"
															value={company}
															name="company"
															id="Company"
															label="Company"
															variant="outlined"
															onChange={
																handleChangeCompany
															}
														/>
														{/* <span className="error-output">Enter</span> */}
													</label>
												</div>

												<div className="col-md-12">
													<label
														for="user-manager-name"
														className="form-label label"
													>
														Account Manager
														<select
															className="form-control user-form-text"
															onChange={
																handleChangeAcManager
															}
															value={
																accountManager
															}
														>
															{slackUsers.map(
																(user) => (
																	<option
																		key={
																			user
																				.profile
																				.email
																		}
																		value={
																			user
																				.profile
																				.email
																		}
																	>
																		{
																			user
																				.profile
																				.real_name
																		}{' '}
																		(
																		{
																			user
																				.profile
																				.email
																		}
																		)
																	</option>
																)
															)}
														</select>
													</label>
												</div>
												<div className="col-md-12"></div>
												<div className="col-md-12 text-md-end">
													<button
														className="btn--primaryGreen"
														onClick={
															updateContactFn
														}
													>
														Update Contact
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className={deletePopUp ? 'popup-mask ' : 'popup-mask open'}>
				<div className="popup-content">
					<div
						className="close-popup"
						onClick={deletePopUpfn}
						type="button"
					>
						<img src={closePopup} alt="" />
					</div>
					<div className="delete-campaign-popup open">
						{/* add/remove open class here for popup => delete-campaign-popup */}
						<div className="popup-box">
							<div className="form">
								<div className="row">
									<div className="col-12 text-center">
										<span className="alert-icon">
											<img
												src={deletealert}
												alt="Campaign alert"
												className="user-img"
											/>
										</span>
										<h5 className="alert-title">
											Are You Sure
										</h5>
										<span className="alert-message">
											You want to delete this contact from
											list
										</span>
									</div>
									<div className="col-md-6 text-center">
										<button
											className="btn--primaryBlue fullwidth marT30"
											onClick={deletePopUpfn}
										>
											Cancel
										</button>
									</div>
									<div className="col-md-6 text-center">
										<button
											className="btn--primaryGreen fullwidth marT30"
											onClick={deleteContactFn}
										>
											Yes
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div
				className={
					sendCampaign
						? 'sidebar-popup-mask'
						: 'sidebar-popup-mask open'
				}
			>
				<div className="sidebar-popup-content">
					<div
						className="close-popup"
						type="button"
						onClick={sendCampaignfn}
					>
						<img src={closePopup} alt="" />
					</div>
					<div className="col-12">
						<div className="add-campaign-main text-start">
							<TemplateMessage
								afterSendCallback={afterSendCallback}
								selectedContacts={selectedContacts}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
