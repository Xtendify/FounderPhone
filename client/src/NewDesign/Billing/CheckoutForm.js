import React, { useState } from 'react';
import ReactGA from 'react-ga';
import { CardElement, injectStripe } from 'react-stripe-elements';
import * as Sentry from '@sentry/browser';
import mixpanel from 'mixpanel-browser';

import { saveCard, subscribetoplan } from '../../Services/Api';

const CheckoutFormComponent = (props) => {
	const [errorMessage, setErrorMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const { stripe, updateCallback } = props;

	const handleChange = ({ error }) => {
		if (error) {
			setErrorMessage(error.message);
		}
	};

	const save = async (ev) => {
		ev.preventDefault();
		setLoading(true);
		ReactGA.event({
			category: 'User',
			action: 'Save card',
		});

		Sentry.captureMessage('Save card');
		mixpanel.track('Save card');

		let { token } = await stripe.createToken();
		if (token) {
			saveCard(token.id).then(() => {
				subscribetoplan().then((res) => {
					setLoading(false);
					updateCallback(res.data.message);
				});
			});
		}
	};

	return (
		<form className="payment-form" onSubmit={save}>
			<h6 className="popup-title bolder-title">Payment Details</h6>
			<div className="row">
				<CardElement
					onChange={handleChange}
					options={{
						style: {
							base: {
								fontSize: '20px',
								color: '#424770',
								fontFamily: 'Poppins',
								// letterSpacing: "0.025em",
								// "::placeholder": {
								//     color: "#aab7c4",
								// },
							},
							invalid: {
								color: '#c23d4b',
							},
						},
					}}
				/>
				{!!errorMessage && (
					<div className="error-output" role="alert">
						{errorMessage}
					</div>
				)}
				<div className="col-md-12 marT30">
					<button
						className="btn--primaryGreen"
						type="submit"
						disabled={!stripe}
					>
						{loading ? 'Saving...' : 'Save'}
					</button>
				</div>
			</div>
		</form>
	);
};

export const CheckoutForm = injectStripe(CheckoutFormComponent);
