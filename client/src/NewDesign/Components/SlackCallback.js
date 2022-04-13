import React, { useEffect, useState, Fragment } from 'react';
import { Container } from 'react-bootstrap';
import queryString from 'query-string';
import { createSlackAccessToken } from '../../Services/Api';
import { Modal } from 'react-bootstrap';
import { InviteSlackMembers } from './InviteSlackMembers';

export const SlackCallback = (props) => {
	const SLACK_REMOVE_APP_HELP_URL =
		'https://slack.com/help/articles/360003125231-Remove-apps-and-custom-integrations-from-your-workspace';

	const [slackConnected, setSlackConnected] = useState(false);
	const [
		slackConnectedErrorMessage,
		setSlackConnectedErrorMessage,
	] = useState('Loading...');
	const [showInviteMembersDialog, setShowInviteMembersDialog] = useState(
		false
	);
	const [teamName, setTeamName] = useState('');
	const [hasRespondent, setHasRespondent] = useState(false);

	useEffect(() => {
		const params = queryString.parse(props.location.search);
		const code = params.code;
		const clientId = params.state;
		createSlackAccessToken(code, clientId, (res) => {
			if (res.status === 200) {
				if (res.data.slackAlreadyAssociated) {
					setSlackConnected(false);
					setSlackConnectedErrorMessage(
						'Already connected to this Slack under ' +
							res.data.clientEmail +
							'. You have to uninstall it first to connect it to this account'
					);
				} else {
					setSlackConnected(true);
					setShowInviteMembersDialog(true);
					setTeamName(res.data.teamName);
				}
			}
		});
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const setHasRespondentfn = (value) => {
		setHasRespondent(value);
	};

	const handleClose = () => {
		setShowInviteMembersDialog(!showInviteMembersDialog);
		props.history.push({
			pathname: '/',
			search: '?showdialog=true',
		});
	};

	const helpUrl = () => {
		window.open(SLACK_REMOVE_APP_HELP_URL, '_blank');
	};

	const goHome = () => {
		props.history.push({ pathname: '/' });
	};
	if (!slackConnected) {
		return (
			<div>
				<Container maxWidth="lg">
					<div>
						<h4>{slackConnectedErrorMessage}</h4>

						{slackConnectedErrorMessage !== 'Loading...' && (
							<Fragment>
								<div>
									<button
										className="btn--primaryGreen"
										onClick={helpUrl}
									>
										Remove previous installation
									</button>
								</div>
								<div>
									<button
										className="btn--primaryGreen"
										onClick={goHome}
									>
										Go back
									</button>
								</div>
							</Fragment>
						)}
					</div>
				</Container>
			</div>
		);
	}

	return (
		<div>
			<Modal show={showInviteMembersDialog}>
				<Modal.Body>
					<h6>
						<InviteSlackMembers
							message={
								'Enter the Slack emails for team members who should see texts to FounderPhone. These users will be invited to every channel by default. Just type in the email and hit add'
							}
							header={
								'Connected to the ' + teamName + ' Slack team!'
							}
							setHasRespondent={setHasRespondentfn}
						/>
					</h6>
				</Modal.Body>
				<Modal.Footer>
					<button
						onClick={handleClose}
						autoFocus
						className="btn--primaryGreen"
						onHide={!hasRespondent}
					>
						I'M DONE
					</button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};
