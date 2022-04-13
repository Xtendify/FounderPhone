import React from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// import searchIcon from '../Inbox/images/search.svg';
import userImage from '../Inbox/images/User.png';
import '../Inbox/Inbox.scss';

export const ContactsForLogs = (props) => {
	const { contacts, searchQuery } = props;

	return (
		<div>
			<div>
				<div className="col-md-6">
					<h4 className="main-title">Chats</h4>
					{/* <span className="recent-chat-menu">Recent Chats <a href="" className="recent-chat-toggle"><img src={arrowToggle} alt="" /></a></span>	 */}
				</div>
				<div className="col-md-12">
					<div className="recent-chat-area marT30 fullwidth">
						<div className="input-group search-group">
							<input
								value={searchQuery}
								type="search"
								className="form-control fullwidth"
								placeholder="Search"
								onChange={(event) =>
									props.handleSearchInput(
										event.currentTarget.value
									)
								}
								onRequestSearch={props.search}
								onCancelSearch={props.cancelSearch}
								aria-label="Search"
								aria-describedby="basic-addon2"
							/>
							{/* <div className="searchIcon"><img src={searchIcon} alt="" /></div> */}
							{/* <div className="input-group-search" id="basic-addon2">
							 <ul className="search-filter-list">
													<li values="1" className="option">Message</li>
													<li values="2" className="option">MessageX</li>
													<li values="3" className="option">MessageY</li>
												</ul>
						</div> */}
						</div>

						<div>
							{contacts.map((contact, index) => {
								return (
									<div
										className="recent-chat-list"
										onClick={() => props.getLogs(index)}
										type="button"
									>
										<div className="recent-chat-list-item">
											<div className="user-details">
												<div className="user-thumb">
													<img
														src={userImage}
														alt=""
													/>
												</div>
												<div className="user-top-row">
													<div className="row">
														<div className="col-md-6">
															<h6 className="user-name">
																{contact.contact
																	? contact
																			.contact
																			.firstName +
																	  ' ' +
																	  contact
																			.contact
																			.lastName
																	: contact.contactName}
															</h6>
														</div>
														{/* <div className="col-md-6 text-end">
													<span className="last-message-time">
														Sent: 1 min ago
													</span>
												</div> */}
														<div className="col-md-12">
															<div className="user-activity">
																{parsePhoneNumberFromString(
																	contact.contact
																		? contact
																				.contact
																				.phoneNumber
																		: contact.contactName
																).formatInternational()}
															</div>
														</div>
													</div>
												</div>
											</div>
											{/* <div className="user-message-area">
										Most of its text is made up from sections 1.10.32–3 of Cicero's De finibus bonorum et malorum
										<span className="user-message-number">2</span>
									</div> */}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
