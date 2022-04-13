import React, { useEffect, useState, useRef } from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Picker from 'emoji-picker-react';
import { notify } from 'react-notify-toast';
import { NavLink } from 'react-router-dom';

import './Inbox.scss';
// import { Button } from '../Components/Buttons/Buttons';
import wavinghandImg from '../Setup/images/wavinghand.png';
// import arrowToggle from './images/down-arrow.svg';
// import addIcon from './images/plus.svg';
// import searchIcon from './images/search.svg';
import userImage from './images/User.png';
import sendIcon from './images/send.svg';
import emojiCon from './images/emoji.svg';
// import addFiles from './images/plus.svg';
// import addVideo from './images/video.svg';
// import addAudio from './images/audio.svg';
// import addImage from './images/image.svg';
// import addOtherFile from './images/add-file.svg';
// import attachmentPin from './images/attach-pin.svg';
// import moreInfo from './images/more-info.svg';
import {
	getContactsForLogs,
	getLogs,
	replyToMessage,
} from '../../Services/Api';
import { ContactsForLogs } from '../Components/ContactsForLog';
import { formatForDisplayDateTime } from '../../Utils/TimeUtils';
import messageIcon from './images/message.png';
import chatIcon from './images/chat.png';
import { RenderLoader } from '../Components/Loader/RenderLoader';

export const Inbox = () => {
	const [message, setMessage] = useState('');
	const [contacts, setContacts] = useState([]);
	const [logs, setLogs] = useState([]);
	const [selectedId, setSelectedId] = useState('');
	const [selectedContactName, setSelectedContactName] = useState('');
	const [selectedContactNumber, setSelectedContactNumber] = useState('');
	const [selectedUserIcon, setSelectedUserIcon] = useState('');
	const [selectedContactIndex, setSelectedContactIndex] = useState(0);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [noData, setNoData] = useState(true);

	let ref = useRef(null);

	useEffect(() => {
		hideOtherChatWidgets();
		getContacts();
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getContacts = () => {
		setLoading(true);
		getContactsForLogs(searchQuery, (res) => {
			setLoading(false);
			if (res.status === 200) {
				if (res.data.length === 0) {
					setNoData(false);
				} else {
					setNoData(true);
				}
				setContacts(res.data, () => {
					if (res.data.length > 0) getLogsFn(0);
				});
			}
		});
	};

	const hideOtherChatWidgets = () => {};

	const handleEmojiClick = (event, emojiObject) => {
		let newMessage = message + emojiObject.emoji;
		setMessage(newMessage);
	};

	const getLogsFn = (index) => {
		getLogs(contacts[index].phoneMappingId, (res) => {
			if (res.status === 200) {
				setLogs(res.data.reverse());
				setSelectedId(contacts[index].phoneMappingId);
				setSelectedContactName(
					contacts[index].contact
						? contacts[index].contact.firstName
						: contacts[index].contactName
				);
				setSelectedContactNumber(contacts[index].contact.phoneNumber);
				setSelectedUserIcon(<img src={userImage} alt="" />);
				setSelectedContactIndex(index);
				setMessage('');
			}
		});
	};

	const handleSearchInput = (value) => {
		setSearchQuery(value);
	};

	const search = () => {
		getContacts();
	};

	const cancelSearch = () => {
		setSearchQuery('', () => {
			getContacts();
		});
	};
	const setEmptyMessage = () => {
		setMessage('');
	};

	const handleChange = (event) => {
		setMessage(event.target.value);
	};

	const sendMessage = () => {
		if (!message) {
			notify.show('Unable to send empty message', 'error', 3000);
			return;
		}
		replyToMessage(selectedId, message, (res) => {
			if (res.status === 200) {
				notify.show('Message sent successfully', 'success', 3000);
				getLogsFn(selectedContactIndex);
			} else {
				notify.show(
					'Failed to send. Please try replying from Slack',
					'error',
					3000
				);
			}
			setMessage('');
		});
	};

	const showcontent = noData && !loading;

	return (
		<div className="inbox">
			<div className="row">
				<div className="col-12">
					<div className="inboxUser">
						<img
							src={wavinghandImg}
							alt="hello"
							className="inboxUser-handIcon"
						/>
						<text className="inboxUser-name">Hey </text>
					</div>
				</div>
			</div>
			<RenderLoader loading={loading} />
			{showcontent && (
				<div className="row">
					<div className="col-xl-6 col-lg-12 col-md-12 col-sm-12 col-12">
						<div className="inbox-list-main">
							{/* <Button className='btn--primaryGreen add-new-chat'><img src={addIcon} alt="Create new Chat" /> Create new Chat</Button> */}
							<div className="row">
								<ContactsForLogs
									contacts={contacts}
									getLogs={getLogsFn}
									selectedContactIndex={selectedContactIndex}
									handleSearchInput={handleSearchInput}
									search={search}
									cancelSearch={cancelSearch}
									searchQuery={searchQuery}
									setEmptyMessage={setEmptyMessage}
								/>
							</div>
						</div>
					</div>
					<div className="col-xl-6 col-lg-12 col-md-12 col-sm-12 col-12">
						<div className="inbox-chat-main">
							{selectedId ? (
								<div className="inbox-chat-item">
									<div className="active-user-details">
										<div className="active-user-thumb">
											{selectedUserIcon}
										</div>
										<div className="active-user-top-row">
											<div className="row">
												<div className="col-xl-6 col-lg-6 col-md-6">
													<h6 className="active-user-name">
														{selectedContactName}
													</h6>
													<div className="active-user-activity">
														<div className="user-activity">
															{
																selectedContactNumber
															}
														</div>
													</div>
												</div>
												<div className="col-xl-6 col-lg-6 col-md-6 text-end">
													{/* <div className="top-buttons">
													<button  className="add-attachments">
													<img src={attachmentPin} alt="" />
													</button>
													<button  className="more-info">
													<img src={moreInfo} alt="" />
													</button>
												</div> */}
												</div>
											</div>
										</div>
									</div>
									<div className="chat-messages">
										{logs.map((message, index) => {
											return (
												<div
													className="chat-box-holder"
													key={index}
												>
													{(() => {
														if (
															message.isClientReply ===
															true
														) {
															return (
																<div className="chat-message-box chat-message-partner">
																	<div className="chat-user-thumb">
																		{
																			selectedUserIcon
																		}
																	</div>
																	<div className="chat-user-message">
																		{message.isCall
																			? 'Had a call on ' +
																			  formatForDisplayDateTime(
																					message.createdOn
																			  )
																			: message.message}
																		{/* <div className="more-detail">
																	<a>...</a>
																</div> */}
																		<div className="last-chat-time">
																			{formatForDisplayDateTime(
																				message.createdOn
																			)}
																		</div>
																	</div>
																</div>
															);
														} else if (
															message.isClientReply ===
															false
														) {
															return (
																<div className="chat-box-holder">
																	<div className="chat-message-box">
																		<div className="chat-user-thumb">
																			<img
																				src={
																					userImage
																				}
																				alt=""
																			/>
																		</div>
																		<div className="chat-user-message read">
																			<div className="chat-text ">
																				{message.isCall
																					? 'Had a call on ' +
																					  formatForDisplayDateTime(
																							message.createdOn
																					  )
																					: message.message}
																			</div>
																			{/* <div className="more-detail">
																			<a>...</a>
																		</div> */}
																			<div className="last-chat-time">
																				{formatForDisplayDateTime(
																					message.createdOn
																				)}
																			</div>
																		</div>
																	</div>
																</div>
															);
														}
													})()}
												</div>
											);
										})}
									</div>
									<div className="chat-box-form-wrapper">
										<div className="chat-box-form">
											{/* <ul className="add-file-list active">
										<li className="add-file-item"><a href="" className="icon-inner"><img src={addVideo} alt="" /></a></li>
										<li className="add-file-item"><a href="" className="icon-inner"><img src={addAudio} alt="" /></a></li>
										<li className="add-file-item"><a href="" className="icon-inner"><img src={addImage} alt="" /></a></li>
										<li className="add-file-item"><a href="" className="icon-inner"><img src={addOtherFile} alt="" /></a></li>
									</ul> */}
											{/* <button className="add-file">
										<img className="chat-emoji-icon" src={addFiles} alt="" />
									</button> */}
											<div className="chat-box-input">
												<textarea
													className="chat-box-text"
													placeholder="Type a message here"
													rows="1"
													id="filled-adornment-password"
													value={message}
													name="message"
													onChange={handleChange}
													onKeyUp={(event) => {
														if (
															event.key ===
															'Enter'
														) {
															sendMessage();
														}
													}}
												/>

												<div>
													<OverlayTrigger
														ref={(r) => (ref = r)}
														container={ref.current}
														placement="auto"
														trigger="click"
														rootClose
														overlay={
															<Popover>
																<Picker
																	onEmojiClick={
																		handleEmojiClick
																	}
																/>
															</Popover>
														}
													>
														<button
															className="emojicons"
															useRef="emojis"
														>
															<img
																className="chat-emoji-icon"
																src={emojiCon}
																alt="emoji"
															/>
														</button>
													</OverlayTrigger>

													<button
														className="send-message"
														onClick={sendMessage}
														edge="end"
													>
														<img
															className="chat-emoji-send"
															src={sendIcon}
															alt=""
														/>
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							) : (
								<div>
									<div className="row">
										<div className="chat-nodata">
											<img
												className="chat-img"
												src={chatIcon}
												alt="inbox"
											/>
											<h4 className="chat-title">
												It’s nice to chat someone
											</h4>
											<p className="chat-p">
												Pick a person from left and
												Start a conversation
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{!noData && (
				<div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
					<div className="inbox-list-main less">
						<img
							className="chat-message-icon"
							src={messageIcon}
							alt="inbox"
						/>
						<h4 className="main-title less-title">
							No Messages Yet
						</h4>
						<p className="recent-chat-menu less-p">
							You current have no messages, start a new campaign
							to see messages here
						</p>
						<div className="inbox-button">
							<NavLink
								exact
								to="/campaign"
								className="btn--primaryGreen "
							>
								Start New Campaign
							</NavLink>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
