import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import {
  ControlLabel,
  FormControl,
  Alert,
  FormGroup
} from '@freecodecamp/react-bootstrap';
import isAscii from 'validator/lib/isAscii';

import {
  validateUsername,
  usernameValidationSelector,
  submitNewUsername
} from '../../redux/settings';
import BlockSaveButton from '../helpers/form/BlockSaveButton';
import FullWidthRow from '../helpers/FullWidthRow';

const propTypes = {
  displayUsername: PropTypes.string,
  isValidUsername: PropTypes.bool,
  submitNewUsername: PropTypes.func.isRequired,
  username: PropTypes.string,
  validateUsername: PropTypes.func.isRequired,
  validating: PropTypes.bool
};

const mapStateToProps = createSelector(
  usernameValidationSelector,
  ({ isValidUsername, fetchState }) => ({
    isValidUsername,
    validating: fetchState.pending
  })
);

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      submitNewUsername,
      validateUsername
    },
    dispatch
  );

const invalidCharsRE = /[/\s?:@=&"'<>#%{}|\\^~[\]`,.;!*()$]/;
const invlaidCharError = {
  valid: false,
  error: 'Username contains invalid characters'
};
const valididationSuccess = { valid: true, error: null };
const usernameTooShort = { valid: false, error: 'Username is too short' };

class UsernameSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFormPristine: true,
      formValue: props.username,
      formDisplayValue: props.displayUsername,
      characterValidation: { valid: false, error: null },
      submitClicked: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateFormInput = this.validateFormInput.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const { username: prevUsername } = prevProps;
    const { formValue: prevFormValue } = prevState;
    const { username } = this.props;
    const { formValue } = this.state;
    if (prevUsername !== username && prevFormValue === formValue) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      return this.setState({
        isFormPristine: username === formValue,
        submitClicked: false
      });
    }
    return null;
  }

  handleSubmit(e) {
    e.preventDefault();
    const { submitNewUsername } = this.props;
    const {
      formDisplayValue,
      characterValidation: { valid }
    } = this.state;

    return this.setState({ submitClicked: true }, () =>
      valid ? submitNewUsername(formDisplayValue) : null
    );
  }

  handleChange(e) {
    e.preventDefault();
    const { username, validateUsername } = this.props;
    const newDisplayUsernameValue = e.target.value;
    const newValue = newDisplayUsernameValue.toLowerCase();
    return this.setState(
      {
        formDisplayValue: newDisplayUsernameValue,
        formValue: newValue,
        isFormPristine: username === newValue,
        characterValidation: this.validateFormInput(newValue)
      },
      () =>
        this.state.isFormPristine || this.state.characterValidation.error
          ? null
          : validateUsername(this.state.formValue)
    );
  }

  validateFormInput(formValue) {
    if (formValue.length < 3) {
      return usernameTooShort;
    }

    if (!isAscii(formValue)) {
      return invlaidCharError;
    }
    if (invalidCharsRE.test(formValue)) {
      return invlaidCharError;
    }
    return valididationSuccess;
  }

  renderAlerts(validating, error, isValidUsername) {
    if (!validating && error) {
      return (
        <FullWidthRow>
          <Alert bsStyle='danger'>{error}</Alert>
        </FullWidthRow>
      );
    }
    if (!validating && !isValidUsername) {
      return (
        <FullWidthRow>
          <Alert bsStyle='warning'>Username not available</Alert>
        </FullWidthRow>
      );
    }
    if (validating) {
      return (
        <FullWidthRow>
          <Alert bsStyle='info'>Validating username</Alert>
        </FullWidthRow>
      );
    }
    if (!validating && isValidUsername) {
      return (
        <FullWidthRow>
          <Alert bsStyle='success'>Username is available</Alert>
        </FullWidthRow>
      );
    }
    return null;
  }

  render() {
    const {
      isFormPristine,
      formDisplayValue,
      characterValidation: { valid, error },
      submitClicked
    } = this.state;
    const { isValidUsername, validating } = this.props;

    return (
      <Fragment>
        <form id='usernameSettings' onSubmit={this.handleSubmit}>
          <FullWidthRow>
            <FormGroup>
              <ControlLabel htmlFor='username-settings'>
                <strong>Username</strong>
              </ControlLabel>
              <FormControl
                name='username-settings'
                onChange={this.handleChange}
                value={formDisplayValue}
              />
            </FormGroup>
          </FullWidthRow>
          {!isFormPristine &&
            this.renderAlerts(validating, error, isValidUsername)}
          <FullWidthRow>
            <BlockSaveButton
              disabled={
                !(isValidUsername && valid && !isFormPristine) || submitClicked
              }
            />
          </FullWidthRow>
        </form>
      </Fragment>
    );
  }
}

UsernameSettings.displayName = 'UsernameSettings';
UsernameSettings.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UsernameSettings);
