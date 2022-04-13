import { React, useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import * as Sentry from '@sentry/browser';
import mixpanel from 'mixpanel-browser';
import { notify } from 'react-notify-toast';
import { Elements, StripeProvider } from 'react-stripe-elements';

import { planTypes } from '../../Utils/Types';
import {
	getClientAccount,
	subscribetoplan,
	unsubscribetoplan,
} from '../../Services/Api';

import '../Components/common-sidebar/common-sidebar.scss';
import './Billing.scss';

import wavinghandImg from '../Setup/images/wavinghand.png';
// import billingMain from './images/billing-main.png';
// import openArrow from './images/open-arrow.png';
// import UserIcon from './images/user.svg';
import closePopup from './images/close.svg';
import paymentDone from './images/done.svg';
import paymentFailed from './images/failed.svg';
import { formatForDisplayDate } from '../../Utils/TimeUtils';
import { CheckoutForm } from './CheckoutForm';
import billingIcon from './images/billingIcon.png';

const NOTIFICATION_LENGTH = 6000;
// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_API_KEY);

export const Billing = () => {
	const [haveCardOnFile, setHaveCardOnFile] = useState(false);
	const [currentPlan, setCurrentPlan] = useState(planTypes.NOT_PAID);
	const [requestForDowngrade, setRequestForDowngrade] = useState(false);
	const [expirationDate, setExpirationDate] = useState(null);
	// const [nextPlan, setNextPlan] = useState("");
	const [hideCheckoutForm, setHideCheckoutForm] = useState(false);
	// const [promo, setPromo] = useState("");
	const [phoneNumber, setPhoneNumber] = useState('');
	// const [payments, setPayments] = useState([]);
	const [popupStage, setPopupStage] = useState('INIT');
	const STRIPE_API_KEY = process.env.REACT_APP_STRIPE_API_KEY;

	useEffect(() => {
		ReactGA.pageview('Billing');
		Sentry.captureMessage('Billing');
		mixpanel.track('Billing');

		loadData();
	}, []);

	const updateCallback = (message) => {
		notify.show(message, 'success', NOTIFICATION_LENGTH);
		loadData();
	};

	const loadData = () => {
		getClientAccount((res) => {
			console.log(res);
			if (res.status === 200) {
				setHaveCardOnFile(res.data.haveCardOnFile);
				setHideCheckoutForm(res.data.haveCardOnFile);
				// setPayments(res.data.payments);
				setCurrentPlan(res.data.currentPlan);
				// setNextPlan(res.data.nextPlan);
				setExpirationDate(res.data.expirationDate);
				setRequestForDowngrade(res.data.requestForDowngrade);
				setPhoneNumber(res.data.phoneNumber);
			} else {
				notify.show(
					"We couldn't retrieve your account details. Try again later",
					'error',
					NOTIFICATION_LENGTH
				);
			}
		});
	};

	const unsubscribe = () => {
		ReactGA.event({
			category: 'User',
			action: 'Unsubscribed',
		});
		Sentry.captureMessage('Unsubscribed');
		mixpanel.track('Unsubscribed');

		unsubscribetoplan().then(() => {
			updateCallback('Cancelled your subscription');
		});
	};

	const subscribe = () => {
		ReactGA.event({
			category: 'User',
			action: 'Subscribed',
		});
		Sentry.captureMessage('Subscribed');
		mixpanel.track('Subscribed');

		subscribetoplan().then((res) => {
			updateCallback(res.data.message);
		});
	};

	const renderSubButton = () => {
		if (haveCardOnFile && hideCheckoutForm) {
			if (
				currentPlan === planTypes.PAID &&
				!!phoneNumber &&
				!requestForDowngrade
			) {
				return (
					<button
						className="btn--primaryRed less-radius marT30"
						onClick={unsubscribe}
					>
						Cancel Subscription
					</button>
				);
			}
			return (
				<button
					className="btn--primaryBlue less-radius marT30"
					onClick={subscribe}
				>
					Subscribe
				</button>
			);
		}
		return null;
	};

	return (
		<div className="billing">
			<div className="row">
				<div className="col-md-12">
					<div className="billingUser">
						<img
							src={wavinghandImg}
							alt="hello"
							className="billingUser-handIcon"
						/>
						<text className="billingUser-name">Hey</text>
					</div>
				</div>
				<div className="col-md-12 col-lg-12 col-xl-12">
					<div className="update-detail-summary">
						<div className="row">
							<div className="col-xl-6 col-lg-12 col-md-12 col-sm-12">
								<h4 className="title">
									<img
										className="title-img"
										src={billingIcon}
										alt="billingIcon"
									/>
									Payment Information
								</h4>
								<p>
									$27/month for up to 3 users. Contact us at
									support@founderphone.com for custom plans.
								</p>

								{requestForDowngrade && expirationDate && (
									<p>
										Your service will be discontinued and
										you'll lose access to this phone number
										on{' '}
										{formatForDisplayDate(expirationDate)}
									</p>
								)}

								<button
									className="btn--primaryGreen less-radius marT30"
									onClick={() => {
										setPopupStage('PAYMENT_FORM');
									}}
								>
									{haveCardOnFile ? 'Update' : 'Add'} Payment
									Details
								</button>

								{renderSubButton()}
							</div>
							<div className="col-xl-6 col-lg-12 col-md-12 col-sm-12">
								<div className="update-detail-summary-thumb-area"></div>
							</div>
						</div>
					</div>
					{/* <div className="customer-plan-summary">
						<div className="row">
							<div className="col-12">
								<h3 className="plan-main-title">Your Plan <span className="plan-price"> $<span className="plan-price-highlight">99</span>.00</span></h3>
							</div>
							<div className="col-12 marT30">
								<div className="row">
									<div className="col-lg-6 col-md-6 col-sm-6 col-12">
										<h4 className="plan-includes-title">Your Plan Includes:</h4>
									</div>
									<div className="col-lg-6 col-md-6 col-sm-6 col-12">
										<div className="plan-includes-item">
											<div className="plan-item-icon">
												<img src={UserIcon} alt="Users" />
											</div>
											<div className="plan-item-content">
												<h5 className="plan-item-title">2/5</h5>
												<span className="plan-item-description">Users</span>
											</div>
										</div>
									</div>
									<div className="col-lg-6 col-md-6 col-sm-6 col-12">
										<div className="plan-includes-item">
											<div className="plan-item-icon">
												<img src={UserIcon} alt="Users" />
											</div>
											<div className="plan-item-content">
												<h5 className="plan-item-title">500 / 1200</h5>
												<span className="plan-item-description">Contacts</span>
											</div>
										</div>
									</div>
									<div className="col-lg-6 col-md-6 col-sm-6 col-12">
										<div className="plan-includes-item">
											<div className="plan-item-icon">
												<img src={UserIcon} alt="Users" />
											</div>
											<div className="plan-item-content">
												<h5 className="plan-item-title">1200</h5>
												<span className="plan-item-description">Credits Left</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="plan-upgrade-area">
						<div className="row">
							<div className="col-12">
								<h3 className="plan-upgrade-main-title">Pop-up your Account!</h3>
							</div>
						</div>
					</div>
					<div className="plan-save">
						<div className="row">
							<div className="col-12">
								<button className="btn--primaryGreen marT30">Save </button>
							</div>
						</div>
					</div> */}
				</div>
				{/* <div className="col-md-3 col-xl-4 col-lg-3">
						<button className="right-sidebar-closebtn">
							<img className='image' src={openArrow} />
						</button>
						<div className="common-right-sidebar position-fixed-right">
							<div className="common-right-sidebar-inner">
								<div className="common-right-sidebar-top">
									<div className="tabs">
										<div className="tab-item active">
											Payment History
										</div>
									</div>
								</div>
								<div className="common-right-sidebar-bottom">
									<div className="tab-content active">
										<div className="sidebar-widget white-box">
											<div className="billing-widget">
												<div className="row">
													<div className="col-4">
														<h5 className="title">ID</h5>
														<span className="value">#35752</span>
													</div>
													<div className="col-4">
														<h5 className="title">Date</h5>
														<span className="value">4th apr , 2021</span>
													</div>
													<div className="col-4">
														<h5 className="title">Plan</h5>
														<span className="value">Free</span>
													</div>
													<div className="col-4">
														<h5 className="title">Via</h5>
														<span className="value">Visa</span>
													</div>
													<div className="col-4">
														<h5 className="title">Amount</h5>
														<span className="value">$12.00</span>
													</div>
												</div>
											</div>
										</div>
										<div className="sidebar-widget white-box">
											<div className="billing-widget">
												<div className="row">
													<div className="col-4">
														<h5 className="title">ID</h5>
														<span className="value">#35752</span>
													</div>
													<div className="col-4">
														<h5 className="title">Date</h5>
														<span className="value">4th apr , 2021</span>
													</div>
													<div className="col-4">
														<h5 className="title">Plan</h5>
														<span className="value">Free</span>
													</div>
													<div className="col-4">
														<h5 className="title">Via</h5>
														<span className="value">Visa</span>
													</div>
													<div className="col-4">
														<h5 className="title">Amount</h5>
														<span className="value">$12.00</span>
													</div>
												</div>
											</div>
										</div>
										<div className="sidebar-widget white-box">
											<div className="billing-widget">
												<div className="row">
													<div className="col-4">
														<h5 className="title">ID</h5>
														<span className="value">#35752</span>
													</div>
													<div className="col-4">
														<h5 className="title">Date</h5>
														<span className="value">4th apr , 2021</span>
													</div>
													<div className="col-4">
														<h5 className="title">Plan</h5>
														<span className="value">Free</span>
													</div>
													<div className="col-4">
														<h5 className="title">Via</h5>
														<span className="value">Visa</span>
													</div>
													<div className="col-4">
														<h5 className="title">Amount</h5>
														<span className="value">$12.00</span>
													</div>
												</div>
											</div>
										</div>
										<div className="sidebar-widget white-box">
											<div className="billing-widget">
												<div className="row">
													<div className="col-4">
														<h5 className="title">ID</h5>
														<span className="value">#35752</span>
													</div>
													<div className="col-4">
														<h5 className="title">Date</h5>
														<span className="value">4th apr , 2021</span>
													</div>
													<div className="col-4">
														<h5 className="title">Plan</h5>
														<span className="value">Free</span>
													</div>
													<div className="col-4">
														<h5 className="title">Via</h5>
														<span className="value">Visa</span>
													</div>
													<div className="col-4">
														<h5 className="title">Amount</h5>
														<span className="value">$12.00</span>
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
			<div
				className={`popup-mask ${popupStage !== 'INIT' ? 'open' : ''}`}
			>
				<div className="popup-content">
					<div
						className="close-popup"
						onClick={() => {
							setPopupStage('INIT');
						}}
					>
						<img src={closePopup} alt="" />
					</div>
					<div
						className={`send-payment-popup ${
							popupStage === 'PAYMENT_FORM' ? 'open' : ''
						}`}
					>
						<div className="popup-box">
							<StripeProvider apiKey={STRIPE_API_KEY}>
								<Elements>
									<CheckoutForm
										haveCardOnFile={haveCardOnFile}
										currentPlan={currentPlan}
										updateCallback={() => {
											loadData();
											setPopupStage('PAYMENT_SUCCESS');
										}}
									/>
								</Elements>
							</StripeProvider>
						</div>
					</div>
					<div
						className={`payment-complete-popup ${
							popupStage === 'PAYMENT_SUCCESS' ? 'open' : ''
						}`}
					>
						<div className="popup-box">
							<div className="payment-response">
								<div className="payment-response-top">
									<div className="alert-icon">
										<img
											src={paymentDone}
											alt="payment done"
										/>
									</div>
									<div className="alert-title">
										PAYMENT COMPLETE
									</div>
									<div className="alert-message">
										Thank you, your payment has been
										successful.
									</div>
								</div>
								{/* <div className="payment-response-bottom">
									<div className="row response-row">
										<div className="col-sm-6 col-md-6">
											<h5 className="response-title">Payment Date</h5>
										</div>
										<div className="col-sm-6 col-md-6">
											<span className="response-value">May 5 , 2021 , 3:23</span>
										</div>
									</div>
									<div className="row response-row">
										<div className="col-sm-6 col-md-6">
											<h5 className="response-title">Payment Type</h5>
										</div>
										<div className="col-sm-6 col-md-6">
											<span className="response-value">Visa</span>
										</div>
									</div>
									<div className="row response-row">
										<div className="col-sm-6 col-md-6">
											<h5 className="response-title">Cardholder Name</h5>
										</div>
										<div className="col-sm-6 col-md-6">
											<span className="response-value">Alexender William</span>
										</div>
									</div>
									<div className="row response-row">
										<div className="col-sm-6 col-md-6">
											<h5 className="response-title">Plan Type</h5>
										</div>
										<div className="col-sm-6 col-md-6">
											<span className="response-value">Custom</span>
										</div>
									</div>
								</div> */}
							</div>
						</div>
					</div>
					<div
						className={`payment-failed-popup ${
							popupStage === 'PAYMENT_FAIL' ? 'open' : ''
						}`}
					>
						<div className="popup-box">
							<div className="payment-response">
								<div className="payment-response-top">
									<div className="alert-icon">
										<img
											src={paymentFailed}
											alt="payment failed"
										/>
									</div>
									<div className="alert-title">
										PAYMENT FAILED
									</div>
									<div className="alert-message">
										Sorry , Bank failed to authenticate the
										customer. Don’t worry your money is safe
										it will be refunded automatically
									</div>
								</div>
								<div className="payment-response-bottom">
									<div className="row response-row">
										<div className="col-sm-6 col-md-6">
											<h5 className="response-title">
												Payment Date
											</h5>
										</div>
										<div className="col-sm-6 col-md-6">
											<span className="response-value">
												May 5 , 2021 , 3:23
											</span>
										</div>
									</div>
									<div className="row response-row">
										<div className="col-sm-6 col-md-6">
											<h5 className="response-title">
												Payment Type
											</h5>
										</div>
										<div className="col-sm-6 col-md-6">
											<span className="response-value">
												Visa
											</span>
										</div>
									</div>
									<div className="row response-row">
										<div className="col-sm-6 col-md-6">
											<h5 className="response-title">
												Cardholder Name
											</h5>
										</div>
										<div className="col-sm-6 col-md-6">
											<span className="response-value">
												Alexender William
											</span>
										</div>
									</div>
									<div className="row response-row">
										<div className="col-sm-6 col-md-6">
											<h5 className="response-title">
												Plan Type
											</h5>
										</div>
										<div className="col-sm-6 col-md-6">
											<span className="response-value">
												Custom
											</span>
										</div>
									</div>
								</div>
								<div className="payment-response-reason">
									<div className="row response-row">
										<div className="col-md-12">
											<h5 className="response-title">
												Why did it fail?
											</h5>
										</div>
										<div className="col-md-12">
											<span className="response-value">
												1. Your bank network might be
												down
											</span>
										</div>
										<div className="col-md-12">
											<button className="btn--primaryGreen fullwidth btn_respon marT30">
												Retry
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
	);
};
