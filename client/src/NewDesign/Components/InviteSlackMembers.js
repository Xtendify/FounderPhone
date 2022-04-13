import React, { useState, useEffect } from 'react';
import {
	addDefaultRespondents,
	getDefaultRespondents,
	getSlackUsers,
} from '../../Services/Api';
import { notify } from 'react-notify-toast';
import { planTypes } from '../../Utils/Types';
import { InputGroup, Form } from 'react-bootstrap';
import { Button } from './Buttons/Buttons';
import { Typeahead } from 'react-bootstrap-typeahead';

export const InviteSlackMembers = (props) => {
	const NOTIFICATION_LENGTH = 6000;

	const [defaultRespondents, setDefaultRespondents] = useState([]);
	const [slackUsers, setSlackUsers] = useState([]);
	const [currentPlan, setCurrentPlan] = useState(planTypes.NOT_PAID);
	const [teamName, setTeamName] = useState('');

	useEffect(() => {
		getDefaultRespondents((res) => {
			if (res.status === 200) {
				if (res.data.teamName) {
					getSlackUsers().then((response) => {
						const users = response.data.users.filter(
							(u) => !u.deleted && !!u.profile.email
						);
						setSlackUsers(users);
						setDefaultRespondents(
							users.filter((u) =>
								res.data.defaultRespondents.find(
									(dr) => dr === u.profile.email
								)
							)
						);
					});
				}

				setCurrentPlan(res.data.currentPlan);
				setTeamName(res.data.teamName);
			}
		});
	}, []);

	const addDefaultRespondentsFn = () => {
		const newUsers = slackUsers.filter((u) =>
			defaultRespondents.find(
				(dr) => dr.profile.email === u.profile.email
			)
		);
		if (newUsers.length > 0) {
			addDefaultRespondents(
				newUsers.map((u) => u.profile.email),
				(res) => {
					if (res.status === 200) {
						setDefaultRespondents(newUsers);
						props.setHasRespondent && props.setHasRespondent(true);
						notify.show(
							'Great! The emails you added will be invited to channels from new numbers',
							'success',
							NOTIFICATION_LENGTH
						);
					}

					if (res.status === 400) {
						notify.show(
							"Doesn't look like the emails you used belong to this Slack workspace. Double check which emails they're using in Slack from the Slack admin panel",
							'error',
							NOTIFICATION_LENGTH
						);
					}
				}
			);
		}
	};

	return (
		<div>
			{(currentPlan === planTypes.PAID ||
				currentPlan === planTypes.TRIAL) &&
			teamName ? (
				<div>
					<h5>Default Respondents</h5>
					<p>
						Connected to FounderPhone These Users Will be invited to
						every new channel by default
					</p>
					<div className="row">
						<div className="col-md-8 col-sm-8">
							<Form.Group>
								<InputGroup className="form form-input">
									<Typeahead
										// className='phoneNumber'
										placeholder="richard@piedpiper.com"
										id="outlined-dense"
										labelKey="name"
										multiple
										onChange={(e, values) => {
											setDefaultRespondents(values);
										}}
										options={slackUsers}
										selected={defaultRespondents}
									/>
								</InputGroup>
							</Form.Group>
						</div>
						<div className="col-md-1 col-sm-1 card-webhook">
							<Button
								className="btn--primaryBlue less_radius_set marT0"
								onClick={addDefaultRespondentsFn}
							>
								Add
							</Button>
						</div>
						<div className="card-checkbox">
							<p>
								We will make a post request to the URL webhook
								will be disabled if call fails
							</p>
						</div>
					</div>
				</div>
			) : (
				<div></div>
			)}
		</div>
	);
};
