import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import ReactGA from 'react-ga';
import * as Sentry from '@sentry/browser';
import mixpanel from 'mixpanel-browser';
import { Modal, Spinner } from 'react-bootstrap';

import { registerUser } from '../../Services/Api';
import { isValidEmail } from '../../Utils/UserUtils';

// import loginImg from './images/login_bg.png';
// import forgetPasswordImg from './images/forget.png';
// import googleImage from './images/Google.png';
// import FacebookImage from './images/Facebook.png';
import fpLogo from './images/FounderPhonelogo.png';

import './css/Login.scss';
import './css/signup.scss';
import './css/forget-password.scss';
import './css/reset-password.scss';
// import { Button } from '../Components/Buttons/Buttons';
import SVGIcon from './SVG/SvgIcons';

export const Login = (props) => {
	const [redirecting, setRedirecting] = useState(false);
	const [loading, setLoading] = useState(false);
	const [showErrorDialog, setShowErrorDialog] = useState(false);
	const [errorTitle, setErrorTitle] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [failedToConnect, setFailedToConnect] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showRoute, setShowRoute] = useState('LOGIN');

	useEffect(() => {
		ReactGA.pageview('Login');
		Sentry.captureMessage('Login');
		mixpanel.track('Login');

		var user = firebase.auth().currentUser;
		if (user) {
			setRedirecting(true);
			setLoading(true);
			registerUserAction(user.email);
		} else {
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const showRoutefn = (path) => {
		setShowRoute(path);
	};

	const registerUserAction = (email) => {
		Sentry.configureScope((scope) => {
			scope.setUser({ id: email });
		});
		mixpanel.identify(email);
		mixpanel.people.set({
			$email: email,
			$last_login: new Date(),
		});

		registerUser()
			.then(() => {
				props.history.push('/');
			})
			.catch((error) => {
				setLoading(false);

				if (error.response && error.response.data) {
					setErrorMessage(error.response.data);
					setErrorTitle('Failed to login');
					setShowErrorDialog(true);
				} else {
					setRedirecting(false);
					setFailedToConnect(true);
				}
			});
	};

	// const loginWithGoogle = () => {
	//     var provider = new firebase.auth.GoogleAuthProvider();
	//     firebase.auth().signInWithRedirect(provider);
	// };

	const handleEmailChange = (event) => {
		setEmail(event.target.value);
	};

	const handlePasswordChange = (event) => {
		setPassword(event.target.value);
	};

	const handleEnterKey = (event) => {
		if (event.key === 'Enter') {
			if (showRoute === 'LOGIN') handleLogin();
			else if (showRoute === 'SIGNUP') {
				handleSignUp();
			}
		}
	};

	const handleLogin = () => {
		if (email === '' && password === '') {
			setErrorMessage('Enter email and password to login');
			setErrorTitle('We need more information');
			setShowErrorDialog(true);
		} else if (email === '') {
			setErrorMessage('Enter email');
			setErrorTitle('We need more information');
			setShowErrorDialog(true);
		} else if (password === '') {
			setErrorMessage('Enter password');
			setErrorTitle('We need more information');
			setShowErrorDialog(true);
		} else {
			setLoading(true);
			firebase
				.auth()
				.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
				.then(() => {
					firebase
						.auth()
						.signInWithEmailAndPassword(email, password)
						.then(() => {
							registerUserAction(email);
						})
						.catch((error) => {
							let errorMessage = '';
							if (error.code === 'auth/user-not-found') {
								// Just sign them up instead
								handleSignUp();
								return;
							} else if (error.code === 'auth/invalid-email') {
								errorMessage =
									'Your email or password does not match an entry on our system. Please try again or register';
							} else if (error.code === 'auth/wrong-password') {
								errorMessage =
									'Your email or password does not match an entry on our system. Please try again or register';
							} else if (
								error.code === 'auth/network-request-failed'
							) {
								errorMessage =
									'Something is wrong with the network. Try again';
							} else {
								errorMessage = error.message;
							}
							setErrorMessage(errorMessage);
							setLoading(false);
							setErrorTitle('Something went Wrong');
							setShowErrorDialog(true);
						});
				})
				.catch((error) => {
					setErrorMessage(error.message);
					setLoading(false);
					setErrorTitle('Error');
					setShowErrorDialog(true);
				});
		}
	};

	const handleSignUp = () => {
		if (email === '' && password === '') {
			setErrorMessage('Enter email and password to sign up');
			setErrorTitle('We need more information');
			setShowErrorDialog(true);
		} else if (email === '') {
			setErrorMessage('Enter email');
			setErrorTitle('We need more information');
			setShowErrorDialog(true);
		} else if (password === '') {
			setErrorMessage('Enter password');
			setErrorTitle('We need more information');
			setShowErrorDialog(true);
		} else {
			setLoading(true);
			firebase
				.auth()
				.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
				.then(() => {
					firebase
						.auth()
						.createUserWithEmailAndPassword(email, password)
						.then(() => {
							firebase.auth().currentUser.sendEmailVerification();
							registerUserAction(email);
						})
						.catch((error) => {
							if (error.code && 'EMAIL_EXISTS') {
								setErrorMessage(
									'We already have an account with that email. Try logging in instead'
								);
							} else if (error.code === 'auth/invalid-email') {
								setErrorMessage(
									"That's not a valid email address"
								);
							} else if (error.code === 'auth/weak-password') {
								setErrorMessage(
									'Your password needs to be at least 6 characters'
								);
							}
							setLoading(false);
							setErrorTitle('Error');
							setShowErrorDialog(true);
						});
				});
		}
	};

	const forgotPassword = () => {
		if (!isValidEmail(email)) {
			return (
				setErrorMessage('Enter valid email to reset password'),
				setErrorTitle('We need more information'),
				setShowErrorDialog(true)
			);
		}

		firebase
			.auth()
			.sendPasswordResetEmail(email)
			.then(() => {
				setErrorMessage('A password reset email has been sent to you');
				setErrorTitle('Check your email');
				setShowErrorDialog(true);
				setTimeout(() => {
					props.history.push('/');
				}, 5000);
			})
			.catch((error) => {
				setErrorMessage(error.message);
				setLoading(false);
				setErrorTitle('Error');
				setShowErrorDialog(true);
			});
	};

	return (
		<div>
			{redirecting && <div>Loading...</div>}

			<div className="login">
				<div className="row">
					<div className="col-lg-6 col-md-12">
						<div className="login-profiles">
							<div className="logo">
								<img
									src={fpLogo}
									alt="hello"
									className="logo-img"
								/>
							</div>
							<div className="login_understand">
								<div className="login_understand_inner_wrapper">
									<h5 className="login_understand_inner_wrapper_heading">
										<SVGIcon
											name="checklist"
											width="30px"
											height="30"
										/>
										Understand Your Customer
									</h5>
									<h5 className="login_understand_inner_wrapper_heading">
										<SVGIcon
											name="checklist"
											width="30px"
											height="30"
										/>
										Increasing Brand Awareness
									</h5>
									<h5 className="login_understand_inner_wrapper_heading">
										<SVGIcon
											name="checklist"
											width="30px"
											height="30"
										/>
										Encourage Convesions
									</h5>
									<h5 className="login_understand_inner_wrapper_heading">
										<SVGIcon
											name="checklist"
											width="30px"
											height="30"
										/>
										Understand Your Customer
									</h5>
									<h5 className="login_understand_inner_wrapper_heading">
										<SVGIcon
											name="checklist"
											width="30px"
											height="30"
										/>
										Many More
									</h5>
								</div>
							</div>
						</div>
					</div>
					{showRoute === 'LOGIN' && (
						<div className="col-lg-6 col-md-12 offset-lg-6 offset-md-0 position-fixed">
							<div className="row">
								<div className="col-md-10 offset-md-1">
									<div className="login-details">
										<h3 className="login-details-heading">
											Log in to FounderPhone
										</h3>
										<p className="login-details-pera">
											Welcome back! Login with your data
											that you entered during
											registration.
										</p>
										{/* <div className="login-social-details">
                                            <div className="login-social-details-1">
                                                <div className="social">
                                                    <img src={googleImage} alt="Google" className='social-icon' />
                                                </div>
                                                <div className="social">
                                                    <h3><div className="login-social-details-heading"
                                                        onClick={loginWithGoogle}
                                                        type='button'>Log in with Google</div></h3>
                                                </div>
                                            </div>
                                            <div className="login-social-details-2">
                                                    <div className="social">
                                                        <img src={FacebookImage} alt="Facebook" className='social-icon' />
                                                    </div>
                                                    <div className="social">
                                                        <h3><a className="login-social-details-heading" href="#">Log in with Facebook</a></h3>
                                                    </div>
                                                 </div>
                                            <div className="both-line">
                                                <span className="line-bt-text"> or</span>
                                            </div>
                                        </div> */}
										<div className="login-info-details">
											<div className="row">
												<div className="col-lg-12">
													<label
														for="card-name"
														className="form-label label"
													>
														Your e-mail
														<input
															type="text"
															required
															name="email"
															autoComplete="email"
															autoFocus
															className="form-control"
															id="card-name"
															placeholder="sara@email.com"
															value={email}
															onChange={
																handleEmailChange
															}
															onKeyPress={
																handleEnterKey
															}
														/>
														<SVGIcon
															name="emailIcon"
															width="20px"
															height="18"
														/>
														<span className="side-border"></span>
													</label>
												</div>
												<div className="col-lg-12 col-md-12 col-sm-12 col-12">
													<label
														for="user-pass"
														className="form-label label2"
													>
														Password
														<input
															type="password"
															className="form-control"
															id="user-pass"
															required
															name="password"
															value={password}
															onChange={
																handlePasswordChange
															}
															onKeyPress={
																handleEnterKey
															}
														/>
														<SVGIcon
															name="passwordIcon"
															width="16"
															height="21"
														/>
														<span className="side-border"></span>
														{/* <span className="eye">
                                                            <SVGIcon name='eyeIcon'/>
                                                        </span> */}
													</label>
												</div>
												<div className="row">
													<div className="col-lg-6">
														{/* <input type="checkbox" id="checkbox" name="checkbox" value="check" />
                                                <label for="checkbox" className="checkbox-lable"> Remember me</label> */}
													</div>
													{/* <div className="col-lg-6">
                                                        <div className="forget-pass forget-pass1" onClick={() => showRoutefn("FORGOT_PASSWORD")}>forgot your password?</div>
                                                    </div> */}
												</div>
												<div className="registerd">
													<div className="row">
														<div className="col-lg-6">
															<p className="registerd-p">
																Don't have an
																account?
																<div
																	className="registerd-account"
																	onClick={() =>
																		showRoutefn(
																			'SIGNUP'
																		)
																	}
																	type="button"
																>
																	Create
																	Account
																</div>
															</p>
															<div
																className="registerd-p registerd-account"
																type="button"
																onClick={() =>
																	showRoutefn(
																		'FORGOT_PASSWORD'
																	)
																}
															>
																forgot your
																password?
															</div>
														</div>
														<div className="col-lg-6">
															{loading ? (
																<div className="loader">
																	<Spinner
																		animation="border"
																		role="status"
																	></Spinner>
																</div>
															) : (
																<button
																	className="btn--primaryGreen less-radius  forget-pass1"
																	onClick={
																		handleLogin
																	}
																>
																	{' '}
																	log in
																</button>
															)}
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
				<p>
					{' '}
					{failedToConnect
						? "Oops! We can't reach our servers right now. Check your network and try again"
						: ''}
				</p>
			</div>

			{showRoute === 'SIGNUP' && (
				<div className="signup">
					<div className="row">
						<div className="col-lg-6 col-md-12">
							<div className="signup-profiles">
								<div className="logo">
									<img
										src={fpLogo}
										alt="hello"
										className="logo-img"
									/>
								</div>
								<div className="signup_understand">
									<div className="signup_understand_inner_wrapper">
										<h5 className="signup_understand_inner_wrapper_heading">
											<SVGIcon
												name="checklist"
												width="30px"
												height="30"
											/>
											Understand Your Customer
										</h5>
										<h5 className="signup_understand_inner_wrapper_heading">
											<SVGIcon
												name="checklist"
												width="30px"
												height="30"
											/>
											Increasing Brand Awareness
										</h5>
										<h5 className="signup_understand_inner_wrapper_heading">
											<SVGIcon
												name="checklist"
												width="30px"
												height="30"
											/>
											Encourage Convesions
										</h5>
										<h5 className="signup_understand_inner_wrapper_heading">
											<SVGIcon
												name="checklist"
												width="30px"
												height="30"
											/>
											Understand Your Customer
										</h5>
										<h5 className="signup_understand_inner_wrapper_heading">
											<SVGIcon
												name="checklist"
												width="30px"
												height="30"
											/>
											Many More
										</h5>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-6 col-md-12 offset-lg-6 offset-md-0 position-fixed">
							<div className="row">
								<div className="col-md-10 offset-md-1">
									<div className="signup-details">
										<h3 className="signup-details-heading">
											Signup with FounderPhone
										</h3>
										<p className="signup-details-pera">
											Fill your email and password to get
											started.
										</p>
										{/* <div className="signup-social-details">
                                            <div className="row">
                                                <div className="col-lg-6 col-md-6">
                                                    <div className="signup-social-details-1">
                                                        <div className="social">
                                                            <img src={googleImage} alt="Google" className='social-icon' />
                                                        </div>
                                                        <div className="social">
                                                            <h3><div className="signup-social-details-heading" onClick={loginWithGoogle}>Signup with Google</div></h3>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6">
                                                    <div className="signup-social-details-1">
                                                        <div className="social">
                                                            <img src={FacebookImage} alt="Facebook" className='social-icon' />
                                                        </div>
                                                        <div className="social">
                                                            <h3><a className="signup-social-details-heading" href="#">Signup with Fcaebook</a></h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="both-line">
                                                <span className="line-bt-text"> or</span>
                                            </div>
                                        </div> */}
										<div className="Sign-info-details">
											<div className="row">
												{/* <div className="col-lg-6">
                                                    <label for="name" className="form-label label"> Frist name
                                                        <input type="text" className="form-control" id="name" placeholder="sara" />
                                                    </label>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                                                    <label for="last-name" className="form-label label">Last name
                                                        <input type="text" className="form-control" id="last-name" placeholder="Ray" />
                                                    </label>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                                                    <label for="number" className="form-label label"> Phone Number
                                                        <input type="text" className="form-control" id="number" placeholder="123456778899" />
                                                    </label>
                                                </div> */}
												<div className="col-lg-12">
													<label
														for="email"
														className="form-label label"
													>
														E-mail
														<input
															type="text"
															className="form-control"
															id="email"
															placeholder="sara@email.com"
															autoComplete="email"
															autoFocus
															value={email}
															onChange={
																handleEmailChange
															}
															onKeyPress={
																handleEnterKey
															}
														/>
													</label>
												</div>
												<div className="col-lg-12 col-md-12 col-sm-12 col-12">
													<label
														for="paddword1"
														className="form-label label"
													>
														Password
														<input
															type="password"
															className="form-control"
															id="paddword1"
															placeholder="Enter New Password"
															required
															name="password"
															value={password}
															onChange={
																handlePasswordChange
															}
															onKeyPress={
																handleEnterKey
															}
														/>
													</label>
												</div>
												{/* <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                                                    <label for="paddword2" className="form-label label">Confirm Password
                                                        <input type="text" className="form-control" id="paddword2" placeholder="Enter Confirm Password" />
                                                    </label>
                                                </div> */}
												<div className="registerd">
													<div className="row">
														<div className="col-lg-6">
															<p className="registerd-p">
																Already have an
																account?
																<div
																	className="registerd-login"
																	type="button"
																	onClick={() =>
																		showRoutefn(
																			'LOGIN'
																		)
																	}
																>
																	log in
																</div>
															</p>
														</div>
														<div className="col-lg-6">
															<button
																className="btn--primaryGreen less-radius  signup-pass1"
																onClick={
																	handleSignUp
																}
															>
																{' '}
																Create Account
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
				</div>
			)}

			{showRoute === 'FORGOT_PASSWORD' && (
				<div className="forget-password">
					<div className="row">
						<div className="col-lg-6 col-md-12">
							<div className="forget-password-profiles">
								<div className="logo">
									<img
										src={fpLogo}
										alt="hello"
										className="logo-img"
									/>
								</div>
								<div className="forget-password-understand">
									<div className="forget-password-understand-wrapper">
										<h5 className="forget-password-understand-wrapper-heading">
											<SVGIcon
												name="checklist"
												width="30px"
												height="30"
											/>
											Understand Your Customer
										</h5>
										<h5 className="forget-password-understand-wrapper-heading">
											<SVGIcon
												name="checklist"
												width="30px"
												height="30"
											/>
											Increasing Brand Awareness
										</h5>
										<h5 className="forget-password-understand-wrapper-heading">
											<SVGIcon
												name="checklist"
												width="30px"
												height="30"
											/>
											Encourage Convesions
										</h5>
										<h5 className="forget-password-understand-wrapper-heading">
											<SVGIcon
												name="checklist"
												width="30px"
												height="30"
											/>
											Understand Your Customer
										</h5>
										<h5 className="forget-password-understand-wrapper-heading">
											<SVGIcon
												name="checklist"
												width="30px"
												height="30"
											/>
											Many More
										</h5>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-6 col-md-12 offset-lg-6 offset-md-0 position-fixed">
							<div className="row">
								<div className="col-md-10 offset-md-1">
									<div className="forget-password-details">
										<h3 className="forget-password-details-heading">
											Forgot password?
										</h3>
										<p className="forget-password-details-pera">
											Send a link to your email to reset
											your password.
										</p>
										<div className="forget-password-info-details">
											<div className="row">
												<div className="col-lg-12">
													<label
														for="card-name"
														className="form-label label"
													>
														{' '}
														Your e-mail
														<input
															type="text"
															className="form-control"
															id="card-name"
															placeholder="sara@email.com"
															required
															name="email"
															autoComplete="email"
															autoFocus
															value={email}
															onChange={
																handleEmailChange
															}
															onKeyPress={
																handleEnterKey
															}
														/>
													</label>
												</div>
												<div className="registerd">
													<div className="row">
														<div className="col-lg-4">
															<p className="registerd-p">
																Already have an
																account?
																<div
																	className="registerd-login"
																	type="button"
																	onClick={() =>
																		showRoutefn(
																			'LOGIN'
																		)
																	}
																>
																	log in
																</div>
															</p>
														</div>
														<div className="col-lg-8">
															<button
																className="btn--primaryGreen less-radius  forget-pass1"
																onClick={
																	forgotPassword
																}
															>
																Send Reset Link
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
				</div>
			)}
			{/* Reset Password Page */}

			{/*
                <div className='reset-password'>
                    <div className="row">
                        <div className="col-lg-6 col-md-12">
                            <div className="reset-password-profiles">
                                <div className="logo">
                                    <img src={fpLogo} alt="hello" className="logo-img"/>
                                </div>
                                <div className="banner-left-thumbnail">
                                    <img src={forgetPasswordImg} className="banner-left-reset-bg" alt="reset Password"/>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 offset-lg-6 offset-md-0 position-fixed">
                            <div className="row">
                                <div className="col-md-10 offset-md-1">
                                    <div className="reset-password-details">
                                        <h3 className="reset-password-details-heading">Reset Password </h3>
                                        <p className="reset-password-details-pera">Please choose your new password.</p>
                                        <div className="reset-password-info-details">
                                            <div className="row">
                                                <div className="col-lg-12 marT30">
                                                    <label for="new-password" className="form-label label">Password
                                                    <input type="text" className="form-control" id="new-password"  placeholder="*****"/>
                                    <input type="text" className="form-control" id="new-password"  placeholder="*****"/>
                                                    <input type="text" className="form-control" id="new-password"  placeholder="*****"/>
                                                    </label>
                                                </div>
                                                <div className="col-lg-12 marT30">
                                                    <label for="new-password" className="form-label label">Confirm Password
                                                    <input type="text" className="form-control" id="new-password"  placeholder="*****"/>
                                    <input type="text" className="form-control" id="new-password"  placeholder="*****"/>
                                                    <input type="text" className="form-control" id="new-password"  placeholder="*****"/>
                                                    </label>
                                                </div>
                                                <div className="col-lg-12 text-end marT30">
                                                    <button className="btn--primaryGreen less-radius  reset-pass1">Save New Password</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                */}
			<Modal
				show={showErrorDialog}
				onHide={() => {
					setShowErrorDialog(false);
					setErrorMessage('');
					setErrorTitle('');
				}}
			>
				<Modal.Header>
					<Modal.Title>{errorTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h6>{errorMessage}</h6>
				</Modal.Body>
				<Modal.Footer>
					<button
						onClick={() => {
							setShowErrorDialog(false);
							setErrorMessage('');
							setErrorTitle('');
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
