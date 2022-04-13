import React, { useState, useEffect } from 'react';
import { notify } from 'react-notify-toast';
import { Spinner } from 'react-bootstrap';

import '../Components/Popup/popup.scss';
import '../Campaign/add-campaign.scss';
import '../Campaign/campaign-contacts.scss';

import selecttemplate from '../Campaign/images/select.svg';
// import edittemplate from '../Campaign/images/edit.svg';
import deletetemplate from '../Campaign/images/delete.svg';
// import saveCompaign from '../Campaign/images/save.svg';
import closePopup from '../Campaign/images/close.svg';
import addTemplateIcon from '../Campaign/images/plus-red.svg';
import deleteConfirm from '../Campaign/images/delete-2.svg';
import { Parser } from 'html-to-react';
import {
	sendIntroMessage,
	saveCampaignTemplate,
	getAllSavedTemplates,
	deleteSavedTemplate,
} from '../../Services/Api';
import moment from 'moment';

export const TemplateMessage = (props) => {
	const NOTIFICATION_LENGTH = 6000;
	const INTRO_MESSAGE_MAX_LENGTH = 300;
	const PREVIEW_FIRST_NAME = 'John';
	const PREVIEW_LAST_NAME = 'Doe';
	const PREVIEW_COMPANY = 'Hooli';
	let htmlToReactParser = new Parser();

	const [scheduledOn, setScheduledOn] = useState('');
	const [scheduledPopUp, setscheduledPopUp] = useState(true);

	const [createTemplatePopUp, setCreateTemplatePopUp] = useState(true);
	const [deleteTemplatePopUp, setDeleteTemplatePopUp] = useState(true);
	const [introMessage, setIntroMessage] = useState('');
	const [previewText, setPreviewText] = useState('');
	// const [sendCampaignContact, setSendCampaignContact] = useState([]);
	const [showTemplateNameError, setShowTemplateNameError] = useState(false);
	const [templateName, setTemplateName] = useState('');
	const [loadingTemplates, setLoadingTemplates] = useState(true);
	const [savedTemplates, setSavedTemplates] = useState([]);
	const [deleteSavedTemplateEntity, setDeleteSavedTemplateEntity] = useState(
		null
	);

	useEffect(() => {
		loadSavedTemplates();
	}, []);

	const loadSavedTemplates = () => {
		getAllSavedTemplates((res) => {
			if (res.status === 200) {
				setLoadingTemplates(false);
				setSavedTemplates(res.data);
			}
		});
	};

	const createTemplatefn = () => {
		setCreateTemplatePopUp(!createTemplatePopUp);
	};

	const scheduledPopUpFn = () => {
		setscheduledPopUp(!scheduledPopUp);
	};
	// const editTemplatefn = () => {
	//     editTemplatePopUp ? setEditTemplatePopUp(false) : setEditTemplatePopUp(true);
	// };

	const deleteTemplatefn = () => {
		setDeleteTemplatePopUp(!deleteTemplatePopUp);
	};

	const sendIntroMessageToSelectedContacts = () => {
		if (introMessage.trim().length === 0) {
			notify.show('You need to enter a message to send!', 'error', 3000);
			return;
		}
		if (props.selectedContacts.length === 0) {
			notify.show(
				'Select at least one contact',
				'error',
				NOTIFICATION_LENGTH
			);
			return;
		}

		const scheduledOnFormatted = scheduledOn
			? moment(scheduledOn).format()
			: null;

		if (scheduledOnFormatted && scheduledOnFormatted < moment().format()) {
			notify.show(
				'Scheduled date should be in future',
				'error',
				NOTIFICATION_LENGTH
			);
			return;
		}

		sendIntroMessage(
			introMessage,
			props.selectedContacts,
			scheduledOnFormatted,
			(res) => {
				if (res.status === 200) {
					notify.show(
						res.data.message,
						'success',
						NOTIFICATION_LENGTH
					);
					setscheduledPopUp(true);
					setScheduledOn('');
					props.afterSendCallback();
				}
			}
		);
	};

	const handleIntroMessageChange = (event) => {
		if (event.target.value.length <= INTRO_MESSAGE_MAX_LENGTH) {
			let enteredText = event.target.value;
			enteredText = enteredText.replace(
				/{firstname}/g,
				`<span style="color: #e57373">${PREVIEW_FIRST_NAME}</span>`
			);
			enteredText = enteredText.replace(
				/{lastname}/g,
				`<span style="color: #e57373">${PREVIEW_LAST_NAME}</span>`
			);
			enteredText = enteredText.replace(
				/{company}/g,
				`<span style="color: #e57373">${PREVIEW_COMPANY}</span>`
			);
			enteredText = enteredText.replace(/\n/g, '<br />');
			setIntroMessage(event.target.value);
			setPreviewText(enteredText);
		}
	};

	const saveMessageTemplate = () => {
		saveCampaignTemplate(templateName, introMessage, (res) => {
			if (res.status === 200) {
				notify.show('Template saved', 'success', 3000);
				setTemplateName('');
				loadSavedTemplates();
			} else if (res.status === 400) {
				notify.show(res.data, 'error', 3000);
			} else {
				notify.show(
					'Unable to save your template at the moment. Please try again later'
				);
			}
			if (!templateName.trim()) {
				setShowTemplateNameError(true);
				return;
			}
			saveMessageTemplate();
		});
	};

	const handleTemplateName = () => {
		if (!templateName.trim()) {
			setShowTemplateNameError();
			if (introMessage.trim().length === 0) {
				notify.show(
					'You need to enter a message to save it as template!',
					'error',
					3000
				);
			}
			return;
		}
		createTemplatefn();
		saveMessageTemplate();
	};

	const saveMessageTemplateClicked = () => {
		createTemplatefn(true);
	};

	const scheduledPopUpOpen = () => {
		scheduledPopUpFn(true);
	};

	const handleTextChange = (event) => {
		let enteredText = event.target.value;

		if (enteredText.length === 1) {
			enteredText = enteredText.toUpperCase();
		}
		setTemplateName(enteredText);
	};

	const handleTemplateDelete = (event, templateIndex) => {
		event.stopPropagation();
		let selected = savedTemplates[templateIndex];

		deleteTemplatefn();
		setDeleteSavedTemplateEntity(selected);
	};

	const deleteSelectedMessageTemplate = () => {
		deleteSavedTemplate(
			deleteSavedTemplateEntity._id,
			(res) => {
				if (res.status === 400) {
					notify.show(
						`Template - ${deleteSavedTemplateEntity.templateName} deleted`,
						'success',
						3000
					);
					setDeleteSavedTemplateEntity(null);
					loadSavedTemplates();
				} else {
					notify.show(
						'Unable to delete the template. Please try again later'
					);
				}
			},
			deleteTemplatefn()
		);
	};

	const toggleErrorDeleteDialog = () => {
		deleteTemplatefn(deleteTemplatefn);
		setDeleteSavedTemplateEntity(null);
	};

	const handleTemplateSelection = (templateIndex) => {
		let selected = savedTemplates[templateIndex];
		if (selected) {
			setIntroMessage(selected.templateMessage);
		}
	};

	return (
		<div>
			<div className="add-campaign-box open">
				<div className="add-campaign-inner">
					<h5 className="main-title">Add Your Message</h5>
					<div className="widgets with-border">
						<span className="message-note">
							Well only create a channel in your Slack once they
							respond. Use firstname and lastname in your message
							and we'll replace them with your contact's actual
							names where available
						</span>
						<form className="form">
							<div className="row">
								<div className="col-12">
									<textarea
										className="form-textarea"
										placeholder="Your Message"
										multiline
										rows="5"
										name="introMessage"
										fullWidth
										variant="outlined"
										value={introMessage}
										onChange={handleIntroMessageChange}
									></textarea>
									<span className="message-note length">
										{introMessage.length}/
										{INTRO_MESSAGE_MAX_LENGTH}
									</span>
								</div>
							</div>
						</form>
						<h5 className="main-title">Preview</h5>
						<span className="message-note">
							{previewText.length > 0
								? htmlToReactParser.parse(previewText)
								: "Enter a message to see a preview. Use {firstname} and {lastname} to use your contact's names or {company} for their company. You'll see John Doe from Hooli in the preview"}
						</span>
					</div>
					<h5 className="main-title extra-bottom-space">
						Or Select Template
					</h5>
					{loadingTemplates === false &&
						savedTemplates.length === 0 && (
							<span>You have no saved templates</span>
						)}

					{loadingTemplates === true && (
						<Spinner animation="border" role="status"></Spinner>
					)}

					{savedTemplates.map((savedTemplate, index) => {
						return (
							<div
								className="widgets white-boxed marginB50 no-border"
								key={savedTemplate._id}
							>
								<h6 className="inner-title">
									{' '}
									{savedTemplate.templateName}
								</h6>
								<ul className="tempate-action">
									<li className="action-item">
										<div
											onClick={() =>
												handleTemplateSelection(index)
											}
											type="button"
										>
											<img src={selecttemplate} alt="" />
										</div>
									</li>
									{/* <li className="action-item"><a type='button' onClick={editTemplatefn}><img src={edittemplate} alt="" /></a></li> */}
									<li className="action-item">
										<div
											type="button"
											onClick={(event) =>
												handleTemplateDelete(
													event,
													index
												)
											}
										>
											<img src={deletetemplate} alt="" />
										</div>
									</li>
								</ul>
							</div>
						);
					})}
					<div className="widgets marginB50">
						<div className="col-12">
							<div className="row">
								<div className="col-md-6">
									<button
										className="btn--primaryBlue marT30 fullwidth"
										onClick={() => {
											sendIntroMessageToSelectedContacts();
										}}
									>
										Send Now
									</button>
								</div>
								<div className="col-md-6">
									<button
										className="btn--primaryGreen marT30 fullwidth"
										onClick={scheduledPopUpOpen}
									>
										Schedule{' '}
									</button>
								</div>
								<div className="col-md-6">
									<div
										className="save-campaign"
										type="button"
										onClick={saveMessageTemplateClicked}
									>
										<img
											src={addTemplateIcon}
											alt="templateIcon"
										/>{' '}
										Create Template
									</div>
								</div>
								{/* <div className="col-md-6">
                                    <a className="save-campaign"><img src={saveCompaign} /> Save Campaign</a>
                                </div> */}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className={scheduledPopUp ? 'popup-mask' : 'popup-mask open'}>
				<div className="popup-content">
					<div className="close-popup" onClick={scheduledPopUpFn}>
						<img src={closePopup} alt="close" />
					</div>
					<div
						className={
							scheduledPopUp
								? 'add-campaign-popup'
								: 'add-campaign-popup open'
						}
					>
						<div className="popup-box">
							<h6 className="popup-title">Schedule</h6>
							<input
								type="datetime-local"
								className="aria-label datetime"
								value={scheduledOn}
								onChange={(event) => {
									setScheduledOn(event.target.value);
								}}
								min={moment()
									.add(1, 'hour')
									.format('YYYY-MM-DDTHH:mm')}
							/>
							<button
								className="btn--primaryGreen marT30"
								onClick={() => {
									sendIntroMessageToSelectedContacts();
								}}
							>
								Send
							</button>
						</div>
					</div>
				</div>
			</div>

			<div
				className={
					createTemplatePopUp ? 'popup-mask' : 'popup-mask open'
				}
			>
				<div className="popup-content">
					<div className="close-popup" onClick={createTemplatefn}>
						<img src={closePopup} alt="" />
					</div>
					<div
						className={
							createTemplatePopUp
								? 'add-campaign-popup'
								: 'add-campaign-popup open'
						}
					>
						<div className="popup-box">
							<h6 className="popup-title">Create Template</h6>
							<div className="form">
								<div className="row">
									<div className="col-12">
										<label
											className="label"
											forName="fp-subject"
										>
											Title
											<input
												type="text"
												className="form-control"
												id="fp-subject"
												name="fp-subject"
												placeholder="You're an important customer to us. "
												onChange={handleTextChange}
												value={templateName}
											/>
											{showTemplateNameError && (
												<span>
													{' '}
													Please enter template name
												</span>
											)}
										</label>
									</div>
									<div className="col-12">
										<label
											className="label"
											forName="fp-message"
										>
											Message
											<textarea
												id="fp-message"
												className="form-textarea form-control"
												placeholder="Hi This is Rohit from FounderPhone. Youre an important customer to us. Heres my number. Text me when you need anything and Ill handle it personally or assign it to the right member of my team"
												multiline
												rows="5"
												name="introMessage"
												fullWidth
												variant="outlined"
												value={introMessage}
												onChange={
													handleIntroMessageChange
												}
											></textarea>
											<div>
												{introMessage.length}/
												{INTRO_MESSAGE_MAX_LENGTH}
											</div>
										</label>
									</div>
									{/* <div className="col-12">
                                        <label className="label" forName="fp-tags">Tags</label>
                                        <ul className="fp-tags">
                                            <li className="tags-item"><a href="">#market</a></li>
                                            <li className="tags-item"><a href="">#sale</a></li>
                                            <li className="tags-item"><a href="">#ads</a></li>
                                        </ul>
                                    </div> */}
									<div className="col-12">
										<button
											className="btn--primaryGreen marT30"
											onClick={() => {
												handleTemplateName();
											}}
										>
											Create
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* <div className={editTemplatePopUp ? "popup-mask" : "popup-mask open"} >
                <div className="popup-content">
                    <a href="#" className="close-popup" onClick={editTemplatefn}><img src={closePopup} alt="" /></a>
                    <div className={editTemplatePopUp ? "edit-campaign-popup" : "edit-campaign-popup open"}>
                        <div className="popup-box">
                            <h6 className="popup-title">Edit Template</h6>
                            <form className="form">
                                <div className="row">
                                    <div className="col-12">
                                        <label className="label" forName="fp-message">Message
                                            <textarea id="fp-message" className="form-textarea form-control" placeholder="Hi This is Rohit from FounderPhone. Youre an important customer to us. Heres my number. Text me when you need anything and Ill handle it personally or assign it to the right member of my team">Hi This is Rohit from FounderPhone. Youre an important customer to us. Heres my number. Text me when you need anything and Ill handle it personally or assign it to the right member of my team
                                            </textarea>
                                        </label>
                                    </div>
                                    <div className="col-12">
                                        <button className="btn--primaryGreen marT30">Save</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div> */}
			<div
				className={
					deleteTemplatePopUp ? 'popup-mask' : 'popup-mask open'
				}
			>
				<div className="popup-content">
					<div className="close-popup" onClick={deleteTemplatefn}>
						<img src={closePopup} alt="" />
					</div>
					<div
						className={
							deleteTemplatePopUp
								? 'delete-campaign-popup'
								: 'delete-campaign-popup open'
						}
					>
						<div className="popup-box">
							<div className="form">
								<div className="row">
									<div className="col-12 text-center">
										<span className="alert-icon">
											<img src={deleteConfirm} alt="" />
										</span>
										<h5 className="alert-title">
											Are You Sure
										</h5>
										<span className="alert-message">
											You want to delete this Template
										</span>
									</div>
									<div className="col-md-6 text-center">
										<button
											onClick={() => {
												toggleErrorDeleteDialog();
											}}
											className="btn--primaryBlue fullwidth marT30"
										>
											Cancel
										</button>
									</div>
									<div className="col-md-6 text-center">
										<button
											className="btn--primaryGreen fullwidth marT30"
											onClick={() => {
												deleteSelectedMessageTemplate();
											}}
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
		</div>
	);
};
